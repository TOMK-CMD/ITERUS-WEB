"use client";

import { Button } from "@iterus/ui/components/button";
import { Input } from "@iterus/ui/components/input";
import { Textarea } from "@iterus/ui/components/textarea";
import { useLocale, useTranslations } from "next-intl";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Turnstile = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

type Status = "idle" | "sending" | "success" | "error";
type ErrorCode =
  | "invalid_input"
  | "rate_limited"
  | "not_configured"
  | "turnstile_failed"
  | "mail_failed"
  | "network";

type Props = { siteKey: string | null };

/**
 * Contact form. Validation that matters happens in POST /api/contact; this component only
 * collects input, runs the Turnstile widget and shows the outcome. Without a site key it
 * explains that the form is not configured instead of pretending to work.
 */
export function ContactForm({ siteKey }: Props) {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<ErrorCode | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    const turnstile = window.turnstile;
    const container = widgetRef.current;
    if (!turnstile || !container || !siteKey || widgetIdRef.current) return;
    widgetIdRef.current = turnstile.render(container, {
      sitekey: siteKey,
      theme: "dark",
      callback: (value) => setToken(value),
      "expired-callback": () => setToken(null),
      "error-callback": () => setToken(null),
    });
  }, [siteKey]);

  // The script may already be loaded from a previous client-side navigation. Remove the widget
  // on unmount so a remount does not leave a zombie iframe behind.
  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!siteKey || !token) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          company: data.get("contact_extra") ?? "",
          turnstileToken: token,
          locale,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: ErrorCode;
      } | null;
      if (response.ok && payload?.ok) {
        setStatus("success");
        form.reset();
        return;
      }
      setError(payload?.error ?? "network");
    } catch {
      setError("network");
    }
    setStatus("error");
    setToken(null);
    window.turnstile?.reset(widgetIdRef.current ?? undefined);
  }

  if (!siteKey) {
    return (
      <p role="status" className="border-border bg-card rounded-lg border px-4 py-3 text-sm">
        {t("notConfigured")}
      </p>
    );
  }

  if (status === "success") {
    return (
      <p role="status" className="border-border bg-card rounded-lg border px-4 py-3">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Script src={TURNSTILE_SCRIPT} strategy="afterInteractive" onLoad={renderWidget} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-name" className="text-sm font-medium">
          {t("name")}
        </label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-email" className="text-sm font-medium">
          {t("email")}
        </label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={200}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium">
          {t("message")}
        </label>
        <Textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
        />
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill every field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        {/* Non-semantic field name on purpose: browsers autofill "company"/"organization" even
            when autoComplete="off", which would silently drop real submissions. */}
        <label htmlFor="contact-extra">Leave this field empty</label>
        <input
          id="contact-extra"
          name="contact_extra"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div ref={widgetRef} className="min-h-16" />

      <p className="text-muted-foreground text-sm">
        {t("privacyNote")}{" "}
        <Link href="/privacy" className="hover:text-foreground underline underline-offset-4">
          {t("privacyLink")}
        </Link>
      </p>

      {status === "error" && error ? (
        <p role="alert" className="text-destructive text-sm">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={status === "sending" || !token}>
          {status === "sending" ? t("sending") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
