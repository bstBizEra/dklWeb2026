import type { Payload } from "payload";

// The CMS is optional: without DATABASE_URL the site runs from its built-in content.
export const cmsEnabled = (): boolean => Boolean(process.env.DATABASE_URL);

export async function getCms(): Promise<Payload> {
  const [{ getPayload }, { default: config }] = await Promise.all([import("payload"), import("@payload-config")]);
  return getPayload({ config });
}
