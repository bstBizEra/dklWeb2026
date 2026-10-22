// Planning documents mark unconfirmed copy as [[...]] or [CONFIRM]. That text must never reach the public site.
const marker = /\[\[|\]\]|\[\s*confirm|confirm\s*\]/i;

export function hasConfirmMarker(value: string | null | undefined): boolean {
  return Boolean(value) && marker.test(value as string);
}

// Payload field validator: refuse to save placeholder text into the CMS.
export const noConfirmMarker = (value: unknown): true | string =>
  typeof value === "string" && hasConfirmMarker(value)
    ? "Remove the [CONFIRM] marker. Unconfirmed facts stay hidden by leaving the item bound to a fact."
    : true;
