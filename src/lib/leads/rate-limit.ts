// Per-address request limiting for the quote form. A sliding window held in memory: it stops a single
// address from flooding the form, and it costs nothing to run. On serverless hosting each instance keeps
// its own count, so treat it as a first line of defence and put a shared store (or the host's firewall)
// behind it before a real launch. Nothing here stores an address beyond the window.

import { BlockList, isIP } from "node:net";

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };
export type RateLimiter = { check: (key: string, now?: number) => RateLimitResult };
export type RateLimitConfig = { limit: number; windowMs: number };

const defaults: RateLimitConfig = { limit: 5, windowMs: 10 * 60 * 1000 };
const maxKeys = 5000;

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// LEAD_RATE_LIMIT requests per LEAD_RATE_WINDOW_SECONDS per address. Defaults: 5 per 10 minutes.
export function rateLimitConfig(env: Record<string, string | undefined> = process.env): RateLimitConfig {
  return {
    limit: positiveInt(env.LEAD_RATE_LIMIT, defaults.limit),
    windowMs: positiveInt(env.LEAD_RATE_WINDOW_SECONDS, defaults.windowMs / 1000) * 1000,
  };
}

export function createRateLimiter(config: RateLimitConfig = defaults): RateLimiter {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    for (const [key, times] of hits) {
      const fresh = times.filter((time) => now - time < config.windowMs);
      if (fresh.length === 0) hits.delete(key);
      else if (fresh.length !== times.length) hits.set(key, fresh);
    }
  }

  return {
    check(key, now = Date.now()) {
      if (hits.size >= maxKeys) {
        prune(now);
        // Still full of live keys: drop the oldest ones rather than grow without bound.
        for (const oldest of hits.keys()) {
          if (hits.size < maxKeys) break;
          hits.delete(oldest);
        }
      }

      const times = (hits.get(key) ?? []).filter((time) => now - time < config.windowMs);

      if (times.length >= config.limit) {
        hits.set(key, times);
        return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((times[0] + config.windowMs - now) / 1000)) };
      }

      times.push(now);
      hits.set(key, times);
      return { allowed: true, remaining: config.limit - times.length, retryAfterSeconds: 0 };
    },
  };
}

// Cloudflare's published address ranges (cloudflare.com/ips), the same list Apache trusts on the server
// (RemoteIPTrustedProxy). Update both together if Cloudflare changes them.
const cloudflareRanges = [
  "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "141.101.64.0/18", "108.162.192.0/18",
  "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
  "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
  "2400:cb00::/32", "2606:4700::/32", "2803:f800::/32", "2405:b500::/32", "2405:8100::/32", "2a06:98c0::/29", "2c0f:f248::/32",
];
const cloudflare = new BlockList();
for (const range of cloudflareRanges) {
  const [address, prefix] = range.split("/");
  cloudflare.addSubnet(address, Number(prefix), isIP(address) === 6 ? "ipv6" : "ipv4");
}

const validIp = (value: string | null): string | undefined => {
  const ip = value?.trim();
  return ip && isIP(ip) ? ip : undefined;
};

// The visitor's address. X-Forwarded-For and X-Vercel-Forwarded-For are never trusted: visitors can set
// them, so a different made-up value on each request would dodge the limit. On the cPanel server nginx
// overwrites X-Real-IP with the address that actually connected; when that address is Cloudflare, the
// visitor is in CF-Connecting-IP, which only Cloudflare can vouch for. Requests without a usable address
// (for example local development with no proxy) share one bucket, so they are limited too.
export function clientKey(request: Request): string {
  const connected = validIp(request.headers.get("x-real-ip"));
  if (!connected) return "unknown";

  const viaCloudflare = cloudflare.check(connected, isIP(connected) === 6 ? "ipv6" : "ipv4");
  return (viaCloudflare && validIp(request.headers.get("cf-connecting-ip"))) || connected;
}
