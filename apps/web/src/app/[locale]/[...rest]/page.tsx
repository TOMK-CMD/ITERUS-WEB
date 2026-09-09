import { notFound } from "next/navigation";

// Any path that no route matched inside a valid locale renders the localized not-found page.
export default function CatchAllPage() {
  notFound();
}
