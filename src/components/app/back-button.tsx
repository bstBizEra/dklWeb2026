"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft } from "lucide-react";

// Back to the screen this one was opened from. It pops history like a native app (so the phone's own
// Back stays in step); opened directly, with nothing to go back to, it replaces the page with `href`.
// iPhone: "‹ Home" in the tint colour. Android: Material top app bar arrow.
export function BackButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={(event) => {
        event.preventDefault();
        if (window.history.length > 1) router.back();
        else router.replace(href);
      }}
      aria-label={`${label}, back`}
      className="-ml-2 inline-flex min-h-11 items-center gap-0.5 pr-3 text-[17px] whitespace-nowrap text-ios-tint no-underline android:-ml-3 android:size-12 android:justify-center android:rounded-full android:p-0 android:text-md-on-surface android:active:bg-md-on-surface/10"
    >
      <ChevronLeft className="size-7 android:hidden" strokeWidth={2.4} aria-hidden="true" />
      <ArrowLeft className="hidden size-6 android:block" aria-hidden="true" />
      <span className="android:sr-only">{label}</span>
    </Link>
  );
}
