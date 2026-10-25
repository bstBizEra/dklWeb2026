"use client";

import { useState } from "react";
import { LoaderCircle, Navigation } from "lucide-react";

import { locationMessage, whatsappWithText, type Coordinates } from "@/lib/data/mobile-app";

// "Send my site location": reads the phone's position only on tap, then opens the iOS share sheet
// (WhatsApp, Messenger, SMS...) or, where there is no share sheet, a WhatsApp chat with the service team.
export function ShareLocation({ whatsappHref }: { whatsappHref?: string }) {
  const [note, setNote] = useState<string>();
  const [busy, setBusy] = useState(false);

  const send = async (coords: Coordinates) => {
    const text = locationMessage(coords);

    if (navigator.share) {
      try {
        await navigator.share({ title: "Site location for DK LAO", text });
        setNote("Location ready to send. Choose WhatsApp or Messenger and pick DK LAO.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return setNote(undefined);
      }
    }
    if (whatsappHref) window.open(whatsappWithText(whatsappHref, text), "_blank", "noopener,noreferrer");
  };

  const locate = () => {
    if (!("geolocation" in navigator)) return setNote("This phone cannot share its location here.");
    setBusy(true);
    setNote("Finding your location…");
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
            ? "Location is off for this app. Allow it in Settings > Privacy > Location Services."
            : "Could not find your location. Try again, or send your address in a message.",
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
        Send my site location
      </button>
      <p role="status" className="m-0 px-4 text-[13px] leading-[18px] text-ios-secondary android:text-[12px] android:leading-4 android:tracking-[0.4px] android:text-md-on-surface-variant">
        {note ?? "For on-site service: the team sees exactly where your machine is."}
      </p>
    </div>
  );
}
