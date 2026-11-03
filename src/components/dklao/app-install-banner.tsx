"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Smartphone, X } from "lucide-react";

import type { Messages } from "@/messages";

export const siteInstallBannerKey = "dklao-site-app-banner-dismissed";

// Phones only: invites website visitors to install the DK LAO app. It opens /app, where the install card
// offers Chrome's Install button on Android and the Add to Home Screen steps on iPhone. Hidden on wider
// screens, inside the installed app, and after Close (remembered on this phone).
export function AppInstallBanner({ labels: t }: { labels: Messages["appBanner"] }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(siteInstallBannerKey) === "1";
    } catch {
      // Storage blocked: show the banner; Close still hides it for this visit.
    }
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    // Reading the browser only after mount keeps the server and first client render identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(!dismissed && !standalone);
  }, []);

  if (!show) return null;

  const close = () => {
    setShow(false);
    try {
      localStorage.setItem(siteInstallBannerKey, "1");
    } catch {
      // Private mode: it comes back next visit.
    }
  };

  return (
    <aside
      aria-label={t.label}
      className="fixed inset-x-3 bottom-3 z-50 hidden items-center gap-3 rounded-card border border-white/10 bg-navy-950 p-3 pr-2 text-white shadow-cta max-[780px]:flex"
    >
      <Smartphone className="size-6 shrink-0 text-action-red-text" aria-hidden="true" />
      <p className="m-0 flex-1 text-[14px] leading-5">
        <strong className="block font-extrabold">{t.title}</strong>
        {t.copy}
      </p>
      <Link
        href={t.appHref}
        className="inline-flex min-h-11 items-center rounded-button bg-action-red px-4 text-[14px] font-extrabold text-white"
      >
        {t.install}
      </Link>
      <button
        type="button"
        onClick={close}
        aria-label={t.close}
        className="grid size-11 shrink-0 place-items-center rounded-full border-0 bg-transparent text-white/70"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </aside>
  );
}
