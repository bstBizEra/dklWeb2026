// JSON for a <script type="application/ld+json"> tag. "<" is escaped so page copy can never close the tag.
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
