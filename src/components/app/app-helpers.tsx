"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, EllipsisVertical, Share, SquarePlus, X } from "lucide-react";

import { appStorageKeys } from "@/lib/data/mobile-app";
import { appLocaleOf } from "@/lib/i18n/app-locale";
import { appMessages } from "@/messages/app-en";

const useAppText = () => appMessages(appLocaleOf(usePathname() ?? "/app"));

// Small client pieces the /app layout and Home need.

// Registers the offline service worker in production. Development is left alone so hot reload works.
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/app-sw.js", { scope: "/app" }).catch(() => undefined);
  }, []);

  return null;
}

// Removes everything the app keeps on this phone: remembered contact details, an unsent draft, and the
// "install" card being closed. Nothing is stored anywhere else by the app itself.
export function ClearSavedDetails() {
  const [done, setDone] = useState(false);
  const t = useAppText().info;

  const clear = () => {
    try {
      for (const key of Object.values(appStorageKeys)) localStorage.removeItem(key);
    } catch {
      // Storage blocked: there was nothing saved to clear.
    }
    setDone(true);
  };

  return (
    <button
      type="button"
      onClick={clear}
      disabled={done}
      className="flex min-h-[44px] w-full items-center border-0 bg-transparent px-4 text-left text-[17px] text-ios-red active:bg-ios-fill disabled:text-ios-secondary android:min-h-14 android:text-[16px] android:tracking-[0.5px] android:text-md-error android:active:bg-md-on-surface/10 android:disabled:text-md-on-surface-variant"
    >
      <span role="status">{done ? t.cleared : t.clear}</span>
    </button>
  );
}

type InstallPromptEvent =Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type InstallWindow = Window & { __dklaoInstall?: InstallPromptEvent };

const hintKey = appStorageKeys.installHintDismissed;

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

// One-time card that turns the website into an installed app (own window, no address bar).
// iPhone has no install prompt, so it shows the Share > Add to Home Screen steps. Android Chrome offers a
// real install prompt (caught early in layout.tsx), so it shows an Install app button.
// Hidden once installed, after Close, or where neither applies.
export function InstallHint() {
  const [mode, setMode] = useState<"ios" | "android" | "menu" | null>(null);
  const t = useAppText().install;

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    // Arriving from the website's "Install" button (/app?install) shows the card even if it was closed before.
    const asked = new URLSearchParams(window.location.search).has("install");
    if (standalone || (readFlag(hintKey) && !asked)) return;

    const apple = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1);
    // Reading the browser only after mount keeps the server and first client render identical.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (apple) return setMode("ios");

    // Without Chrome's prompt (other browsers, or Chrome holding it back), a visitor who asked to install
    // gets the browser-menu steps instead of an empty page.
    const ready = () => setMode((window as InstallWindow).__dklaoInstall ? "android" : asked ? "menu" : null);
    const installed = () => setMode(null);
    ready();
    window.addEventListener("dklao-install-ready", ready);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("dklao-install-ready", ready);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  if (!mode) return null;

  const close = () => {
    setMode(null);
    try {
      localStorage.setItem(hintKey, "1");
    } catch {
      // Private mode: the card simply comes back next visit.
    }
  };

  const install = async () => {
    const prompt = (window as InstallWindow).__dklaoInstall;
    if (!prompt) return setMode(null);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    (window as InstallWindow).__dklaoInstall = undefined;
    if (outcome === "accepted") setMode(null);
  };

  return (
    <section
      aria-label={t.label}
      className="relative rounded-[14px] bg-ios-cell p-4 pr-11 android:rounded-[16px] android:bg-md-primary-container android:text-md-on-primary-container"
    >
      <p className="m-0 text-[15px] font-semibold android:text-[16px] android:font-medium">
        {mode === "ios" ? t.iosTitle : t.label}
      </p>
      {mode === "ios" ? (
        <p className="m-0 mt-1 text-[15px] leading-5 text-ios-secondary">
          {t.tap} <Share className="inline size-4 align-[-2px] text-ios-tint" aria-label={t.share} /> {t.then}{" "}
          <span className="whitespace-nowrap">
            <SquarePlus className="inline size-4 align-[-2px] text-ios-tint" aria-hidden="true" /> {t.addToHome}
          </span>
          {t.iosEnd}
        </p>
      ) : mode === "menu" ? (
        <p className="m-0 mt-1 text-[14px] leading-5 tracking-[0.25px]">
          {t.menuOpen} <EllipsisVertical className="inline size-4 align-[-3px]" aria-label={t.menu} /> {t.andTap}{" "}
          <strong>{t.installApp}</strong> {t.or} <strong>{t.addToHomeAndroid}</strong>.
        </p>
      ) : (
        <>
          <p className="m-0 mt-1 text-[14px] leading-5 tracking-[0.25px]">{t.androidBody}</p>
          <button
            type="button"
            onClick={install}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border-0 bg-md-primary px-6 text-[14px] font-medium tracking-[0.1px] text-md-on-primary active:opacity-90"
          >
            <Download className="size-[18px]" aria-hidden="true" />
            {t.installApp}
          </button>
        </>
      )}
      <button
        type="button"
        onClick={close}
        aria-label={t.close}
        className="absolute top-2 right-2 grid size-9 place-items-center rounded-full border-0 bg-transparent text-ios-secondary android:size-12 android:top-1 android:right-1 android:text-md-on-primary-container"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </section>
  );
}
