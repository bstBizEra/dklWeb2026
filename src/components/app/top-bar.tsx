"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { BackButton } from "@/components/app/back-button";
import { cn } from "@/lib/utils";

// Header of every app screen. At the top of a screen it is fully transparent: just the DK LAO primary logo
// (or a back button on screens opened from another one). Once the screen scrolls, it turns into
// see-through glass (blurred, translucent) with a hairline edge and shows the screen title in the middle,
// as iOS navigation bars and Material center-aligned top app bars do.
export function TopBar({ title, back, brand }: { title: string; back?: { href: string; label: string }; brand?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b-[0.5px] border-transparent pt-[env(safe-area-inset-top)] transition-[background-color,border-color,backdrop-filter] duration-200 motion-reduce:transition-none",
        scrolled &&
          "border-ios-separator bg-ios-bar backdrop-blur-xl backdrop-saturate-[1.8] android:border-transparent android:bg-md-surface-container/80",
      )}
    >
      <div className="mx-auto grid h-14 max-w-[640px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4">
        <div className="min-w-0 justify-self-start">
          {back ? (
            <BackButton href={back.href} label={back.label} />
          ) : (
            <Image
              src="/images/logo/Logo-H_Text.svg"
              width={295}
              height={63}
              alt="DK LAO"
              priority
              draggable={false}
              className={cn("block w-auto", brand ? "h-9" : "h-7")}
            />
          )}
        </div>
        <p
          aria-hidden="true"
          className={cn(
            "m-0 truncate text-[17px] font-semibold opacity-0 transition-opacity duration-200 android:text-[20px] android:font-normal motion-reduce:transition-none",
            scrolled && !brand && "opacity-100",
          )}
        >
          {title}
        </p>
        <span />
      </div>
    </div>
  );
}
