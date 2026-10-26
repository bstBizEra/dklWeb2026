"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LoaderCircle, Navigation } from "lucide-react";

import { pinLink, whatsappWithText, type Coordinates } from "@/lib/data/mobile-app";
import { appLocaleOf } from "@/lib/i18n/app-locale";
import { appMessages, fill } from "@/messages/app-en";

// "Send my site location": reads the phone's position only on tap, then opens the iOS share sheet
// (WhatsApp, Messenger, SMS...) or, where there is no share sheet, a WhatsApp chat with the service team.
export function ShareLocation({ whatsappHref }: { whatsappHref?: string }) {
  const [note, setNote] = useState<string>();
  const [busy, setBusy] = useState(false);
  const t = appMessages(appLocaleOf(usePathname() ?? "/app")).location;

  const send = async (coords: Coordinates) => {
    const accuracy = coords.accuracy ? fill(t.accuracy, { m: Math.round(coords.accuracy) }) : "";
    const text = fill(t.message, { accuracy, pin: pinLink(coords) });

    if (navigator.share) {
      try {
        await navigator.share({ title: t.shareTitle, text });
        setNote(t.ready);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return setNote(undefined);
      }
    }
    if (whatsappHref) window.open(whatsappWithText(whatsappHref, text), "_blank", "noopener,noreferrer");
  };

  const locate = () => {
    if (!("geolocation" in navigator)) return setNote(t.unsupported);
    setBusy(true);
    setNote(t.finding);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setBusy(false);
        setNote(undefined);
        void send({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy });
      },
      (error) => {
        setBusy(false);
        setNote(
          error.code === error.PERMISSION_DENIED
            ? t.denied
            : t.failed,
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  return (
    <div className="grid gap-1.5">
      <button
        type="button"
        onClick={locate}
        aria-disabled={busy}
        className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[14px] border-0 bg-ios-fill-blue text-[17px] font-semibold text-white active:opacity-80 android:min-h-12 android:rounded-full android:text-[15px] android:font-medium android:tracking-[0.1px]"
      >
        {busy ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <Navigation className="size-5" aria-hidden="true" />}
        {t.send}
      </button>
      <p role="status" className="m-0 px-4 text-[13px] leading-[18px] text-ios-secondary android:text-[12px] android:leading-4 android:tracking-[0.4px] android:text-md-on-surface-variant">
        {note ?? t.sendHint}
      </p>
    </div>
  );
}
