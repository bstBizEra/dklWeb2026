import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Flags beside "ລາວ" / "EN" in the language toggles. Decoration only (the text names the language), and
// inline SVG because Windows shows flag emoji as the letters "LA" and "GB".
// shortcut: the Union Jack's red diagonals are centred, not counterchanged; invisible at toggle size,
// draw the official layout if a flag is ever shown large.
export function Flag({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/15", className)}
    >
      {locale === "lo" ? (
        <>
          <rect width="30" height="20" fill="#CE1126" />
          <rect y="5" width="30" height="10" fill="#002868" />
          <circle cx="15" cy="10" r="4" fill="#fff" />
        </>
      ) : (
        <>
          <rect width="30" height="20" fill="#012169" />
          <path d="M0 0L30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
          <path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.5" />
          <path d="M15 0V20M0 10H30" stroke="#fff" strokeWidth="6" />
          <path d="M15 0V20M0 10H30" stroke="#C8102E" strokeWidth="3.5" />
        </>
      )}
    </svg>
  );
}
