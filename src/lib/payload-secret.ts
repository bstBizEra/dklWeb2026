// The secret that signs CMS login sessions. A missing or short secret would let the app start and fail
// later in confusing ways (or sign sessions with a guessable key), so a running production server with a
// database refuses to start without a proper one. Not checked:
//   - during `next build` (NEXT_PHASE): the preview server builds without the site's settings loaded;
//   - without DATABASE_URL: the site then runs from built-in content and the CMS is not used;
//   - in development and tests.
export const minSecretLength = 32;

export function payloadSecret(env: Record<string, string | undefined> = process.env): string {
  const secret = env.PAYLOAD_SECRET?.trim() ?? "";
  const enforced =
    env.NODE_ENV === "production" && env.NEXT_PHASE !== "phase-production-build" && Boolean(env.DATABASE_URL?.trim());

  if (enforced && secret.length < minSecretLength) {
    throw new Error(
      `PAYLOAD_SECRET must be at least ${minSecretLength} characters when DATABASE_URL is set ` +
        `(${secret ? `it has ${secret.length}` : "it is not set"}). Set it in the server's environment settings; ` +
        `see .env.example for how to generate one.`,
    );
  }

  return secret;
}
