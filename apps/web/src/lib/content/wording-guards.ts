/**
 * CLAUDE.md: never state or deny that the founder is a programmer. One list, used by the
 * founder-story guard (facts.test.ts) and the every-page guard (content-pages.test.ts), so the two
 * cannot drift apart. Subject-aware phrases only — "programujeme indikátory" is a legitimate
 * service claim and must stay allowed.
 */
export const FOUNDER_WORDING_FORBIDDEN: readonly RegExp[] = [
  /neum(ěl|ím)\s+programovat/i,
  /nejsem\s+program(átor|ovač)/i,
  /jsem\s+program(átor|ovač)/i,
  /programátorsk[éá]\s+schopnosti/i,
  /(not|never)\s+(been\s+)?a\s+(programmer|developer|coder)/i,
  /\bI(?:'m| am)\s+a\s+(programmer|developer|coder)\b/i,
];
