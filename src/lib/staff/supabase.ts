import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function staffDatabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      process.env.STAFF_ORGANIZATION_ID,
  );
}

export async function createStaffClient() {
  if (!staffDatabaseConfigured()) throw new Error("Staff database is not configured");

  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components cannot write cookies; src/proxy.ts refreshes them.
          }
        },
      },
    },
  );
}
