import { createRateLimiter, rateLimitConfig, type RateLimiter } from "@/lib/leads/rate-limit";

// One limiter per server instance, created on first use so the environment is read at request time.
let limiter: RateLimiter | undefined;

export function leadLimiter(): RateLimiter {
  limiter ??= createRateLimiter(rateLimitConfig());
  return limiter;
}

export function resetLeadLimiter(): void {
  limiter = undefined;
}

// A real visitor never sees or fills this field. A bot that fills every input does.
export const honeypotField = "homepageUrl";

export function isBotSubmission(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const value = (body as Record<string, unknown>)[honeypotField];
  return typeof value === "string" && value.trim().length > 0;
}

// The trap field is for detection only: it never goes on to storage or notification.
export function withoutHoneypot<T extends object>(data: T): Omit<T, typeof honeypotField> {
  const copy = { ...data } as Record<string, unknown>;
  delete copy[honeypotField];
  return copy as Omit<T, typeof honeypotField>;
}

export const maxBodyBytes = 20_000;
