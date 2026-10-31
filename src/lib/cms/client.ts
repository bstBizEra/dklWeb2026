import type { Payload } from "payload";

// The CMS is optional: without DATABASE_URL the site runs from its built-in content.
export const cmsEnabled = (): boolean => Boolean(process.env.DATABASE_URL);

type PoolLike = { on: (event: "error", listener: (error: Error & { code?: string }) => void) => unknown };
const watchedPools = new WeakSet<object>();

// When the database goes away, idle pooled connections report an error on the pool. Payload adds no
// listener, so Node treated it as an uncaught exception. Here it becomes one log line per connection
// (the code only, never the connection string); the pool drops the broken connection by itself.
export function watchPool(pool: PoolLike | undefined, log: (line: string) => void = console.warn): void {
  if (!pool || watchedPools.has(pool)) return;
  watchedPools.add(pool);
  pool.on("error", (error) => log(`[cms] database connection lost (${error.code ?? error.name}); it will reconnect on the next query`));
}

export async function getCms(): Promise<Payload> {
  const [{ getPayload }, { default: config }] = await Promise.all([import("payload"), import("@payload-config")]);
  const payload = await getPayload({ config });
  watchPool((payload.db as unknown as { pool?: PoolLike }).pool);
  return payload;
}
