import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware replacements for next/navigation and next/link. Always import these instead of
// the Next.js originals so links and redirects respect the locale and the pathnames map.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
