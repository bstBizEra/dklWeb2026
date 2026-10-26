"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, Link2, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";

// Share buttons rebuilt from Framer's "Sleek Social Share" (round icon buttons that lift on hover, a name
// tooltip, a "Copied" state on the copy button), in DK LAO colours: navy buttons that turn brand blue.
// Networks used in Laos: Facebook, WhatsApp, LINE and X. Plain share links, no third-party scripts.
// Phones with the Web Share API get one "Share" button that opens the system share sheet instead.

type Network = { id: string; name: string; icon: string; href: (url: string, text: string) => string };

const e = encodeURIComponent;

export const networks: Network[] = [
  {
    id: "facebook",
    name: "Facebook",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`,
    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    href: (url, text) => `https://wa.me/?text=${e(`${text} ${url}`)}`,
    icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488",
  },
  {
    id: "line",
    name: "LINE",
    href: (url) => `https://social-plugins.line.me/lineit/share?url=${e(url)}`,
    icon: "M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314",
  },
  {
    id: "x",
    name: "X",
    href: (url, text) => `https://x.com/intent/tweet?text=${e(text)}&url=${e(url)}`,
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
];

// Framer's "scale" hover (lift and grow, press to shrink) as CSS transitions; reduced motion keeps only the colour change.
const buttonClass =
  "group relative grid size-11 place-items-center rounded-full bg-navy-900 text-white shadow-card transition-[transform,background-color,box-shadow] duration-[260ms] ease-premium hover:-translate-y-[3px] hover:scale-[1.08] hover:bg-brand-blue hover:shadow-blue-glow focus-visible:-translate-y-[3px] focus-visible:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue active:scale-[0.94] motion-reduce:transition-colors motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 motion-reduce:focus-visible:translate-y-0 motion-reduce:active:scale-100";

// The visible name over the button. Screen readers get the button's own label instead.
function Tip({ children }: { children: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 rounded-sm bg-navy-950 px-2.5 py-1.5 text-[12px] font-[750] whitespace-nowrap text-white opacity-0 transition-[opacity,transform] duration-[160ms] ease-premium group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-opacity"
    >
      {children}
    </span>
  );
}

type SocialShareProps = {
  // Absolute URL of the page to share.
  url: string;
  // Text that goes with the link on WhatsApp and X, and in the system share sheet.
  title: string;
  className?: string;
};

// Only on touch phones: desktop share sheets are less familiar than the network buttons. The server
// render (and the first client render) shows the buttons.
const canShareNatively = () => typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches;
const noSubscribe = () => () => {};

export function SocialShare({ url, title, className }: SocialShareProps) {
  const phone = useSyncExternalStore(noSubscribe, canShareNatively, () => false);
  const [sheetFailed, setSheetFailed] = useState(false);
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const native = phone && !sheetFailed;

  useEffect(() => () => clearTimeout(timer.current), []);

  async function shareNative() {
    try {
      await navigator.share({ title, url });
    } catch (error) {
      // Closing the sheet is an AbortError; anything else means the sheet failed, so show the buttons.
      if ((error as Error).name !== "AbortError") setSheetFailed(true);
    }
  }

  async function copyLink() {
    // A blocked clipboard (no permission, insecure page) says so instead of doing nothing.
    const result = await Promise.resolve()
      .then(() => navigator.clipboard.writeText(url))
      .then(() => "copied" as const, () => "failed" as const);
    setCopy(result);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopy("idle"), 2000);
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-3", className)}>
      <p className="m-0 text-[15px] font-[850] text-navy-950">Share this page</p>
      {native ? (
        <button type="button" onClick={shareNative} className={cn(buttonClass, "w-auto gap-2 px-5 text-[15px] font-[850] grid-flow-col")}>
          <Share2 size={18} aria-hidden="true" />
          Share
        </button>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
          {networks.map((network) => (
            <li key={network.id}>
              <a
                href={network.href(url, title)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Share on ${network.name} (opens in a new tab)`}
                className={buttonClass}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={network.icon} />
                </svg>
                <Tip>{network.name}</Tip>
              </a>
            </li>
          ))}
          <li>
            <button type="button" onClick={copyLink} aria-label="Copy link" className={buttonClass}>
              {copy === "copied" ? <Check size={20} aria-hidden="true" /> : <Link2 size={20} aria-hidden="true" />}
              <Tip>{copy === "copied" ? "Copied!" : copy === "failed" ? "Copy failed" : "Copy link"}</Tip>
            </button>
          </li>
        </ul>
      )}
      <span role="status" className="sr-only">
        {copy === "copied" ? "Link copied" : copy === "failed" ? "Could not copy the link. Copy it from the address bar." : ""}
      </span>
    </div>
  );
}
