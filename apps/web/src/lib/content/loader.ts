import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import matter from "gray-matter";
import type { MDXComponents } from "mdx/types";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Locale } from "@/i18n/routing";
import { pageFrontmatterSchema, type PageFrontmatter } from "./schema";

export type ContentPage = {
  locale: Locale;
  slug: string;
  /** Repo-relative path, for error messages and tooling. */
  file: string;
  frontmatter: PageFrontmatter;
  /** MDX body without the frontmatter block. */
  body: string;
};

export class ContentError extends Error {
  constructor(
    public readonly file: string,
    message: string,
  ) {
    super(`${file}: ${message}`);
    this.name = "ContentError";
  }
}

type Options = { contentDir?: string };

/**
 * content/ lives at the repository root, outside apps/web. `next build`/`next start` run with
 * apps/web as cwd; tooling may run from the root — accept both.
 */
export function resolveContentDir(): string {
  const candidates = [
    path.join(process.cwd(), "content"),
    path.join(process.cwd(), "..", "..", "content"),
  ];
  const found = candidates.find((candidate) => existsSync(path.join(candidate, "cs")));
  if (!found) {
    throw new Error(`content directory not found (tried: ${candidates.join(", ")})`);
  }
  return found;
}

function parse(locale: Locale, slug: string, file: string, raw: string): ContentPage {
  // gray-matter is the single frontmatter parser (loader and Node scripts alike).
  const { data, content } = matter(raw);
  const result = pageFrontmatterSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new ContentError(file, `invalid frontmatter — ${issues}`);
  }
  return { locale, slug, file, frontmatter: result.data, body: content };
}

/** Reads and validates one page (`content/<locale>/<slug>.mdx`). */
export async function readPage(
  locale: Locale,
  slug: string,
  options: Options = {},
): Promise<ContentPage> {
  const dir = options.contentDir ?? resolveContentDir();
  const absolute = path.join(dir, locale, `${slug}.mdx`);
  const file = path.relative(path.dirname(dir), absolute).split(path.sep).join("/");
  let raw: string;
  try {
    raw = await fs.readFile(absolute, "utf8");
  } catch (error) {
    // Only a missing file is "not found"; permission or disk errors must surface as themselves.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new ContentError(file, "page not found");
    }
    throw error;
  }
  return parse(locale, slug, file, raw);
}

/** All top-level pages of a locale, published only unless `includeDrafts` is set. */
export async function listPages(
  locale: Locale,
  options: Options & { includeDrafts?: boolean } = {},
): Promise<ContentPage[]> {
  const dir = options.contentDir ?? resolveContentDir();
  const entries = await fs.readdir(path.join(dir, locale), { withFileTypes: true });
  const slugs = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.replace(/\.mdx$/, ""))
    .sort();
  const pages = await Promise.all(slugs.map((slug) => readPage(locale, slug, { contentDir: dir })));
  return options.includeDrafts
    ? pages
    : pages.filter((page) => page.frontmatter.status === "published");
}

export type LoadedPage = ContentPage & { content: ReactNode };

/** Reads, validates and compiles a page to React (Server Components). */
export async function loadPage(
  locale: Locale,
  slug: string,
  components: MDXComponents = {},
  options: Options = {},
): Promise<LoadedPage> {
  const page = await readPage(locale, slug, options);
  const { content } = await compileMDX({
    source: page.body,
    components,
    options: { parseFrontmatter: false },
  });
  return { ...page, content };
}
