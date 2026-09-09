import { serializeJsonLd } from "@/lib/seo/json-ld";

/** Renders structured data. Keep one <JsonLd /> per page type; site-wide graph lives in the layout. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Serialised with "<" escaped, so the payload cannot close the script element.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
