import config from "@payload-config";
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST } from "@payloadcms/next/routes";

import { authThrottle } from "@/lib/auth/throttle";

const restPost = REST_POST(config);

export const GET = REST_GET(config);
// Login and forgot-password are limited per address first (lib/auth/throttle.ts).
export const POST: typeof restPost = (request, args) => Promise.resolve(authThrottle(request) ?? restPost(request, args));
export const DELETE = REST_DELETE(config);
export const PATCH = REST_PATCH(config);
export const OPTIONS = REST_OPTIONS(config);
