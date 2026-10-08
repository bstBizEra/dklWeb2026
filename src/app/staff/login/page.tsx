import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "./actions";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false, follow: false } };

const errors: Record<string, string> = {
  invalid: "Check your email and password, then try again.",
  access: "Your account does not have active DK LAO staff access.",
  unavailable: "Staff sign-in is not configured yet.",
};

export default async function StaffLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const error = (await searchParams).error;
  return (
    <main id="main-content" className="staff-shell">
      <div className="staff-card dk-card">
        <p className="dk-eyebrow">DK LAO staff</p>
        <h1>Sign in</h1>
        <p>Use your assigned staff account to access inquiries and follow-ups.</p>
        {error && errors[error] ? <p role="alert" className="staff-error">{errors[error]}</p> : null}
        <form action={signIn} className="staff-form">
          <label htmlFor="staff-email">Email</label>
          <input id="staff-email" name="email" type="email" autoComplete="username" required />
          <label htmlFor="staff-password">Password</label>
          <input id="staff-password" name="password" type="password" autoComplete="current-password" required />
          <button type="submit" className="dk-button dk-button-primary">Sign in</button>
        </form>
        <Link href="/">Return to DK LAO</Link>
      </div>
    </main>
  );
}
