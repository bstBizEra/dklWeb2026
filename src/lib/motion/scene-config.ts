// Scroll scenes: the homepage told as one story, in which a DK LAO forklift lifts the offer into view,
// carries it down the page and sets it down at the quote form. Each section that becomes a scene gets a
// component in src/components/dklao/scenes/ and carries data-scene="<name>"; the site-wide reveal in
// site-motion.tsx then leaves everything inside it alone, so nothing is animated twice.
//
// Every scene runs inside the same gsap.matchMedia() conditions (see use-scene.ts): nothing moves when
// the visitor asks for reduced motion, the full choreography plays on wide and tall enough screens, and
// phones (or short screens) get a lighter version that never pins. The page stays complete without
// JavaScript; motion only ever changes how content arrives, never whether it is there.

export const sceneMedia = {
  motion: "(prefers-reduced-motion: no-preference)",
  // Pinning needs the whole hero and the header on screen at once.
  desktop: "(min-width: 781px) and (min-height: 640px)",
  phone: "(max-width: 780px), (max-height: 639px)",
} as const;

// Seconds. Durations follow TOKEN.md (--dk-motion-duration-fast/base/slow: 160/260/600ms); timed motion
// eases out with "power3.out", the nearest GSAP ease to --dk-motion-ease-premium. Scrubbed (scroll-linked)
// timelines use "none" so the scrollbar alone sets the pace, softened by `scrub`.
export const sceneTiming = {
  fast: 0.16,
  base: 0.26,
  slow: 0.6,
  stagger: 0.04,
  scrub: 0.6,
} as const;

// How long each pinned scene holds the screen, in viewport heights. Keep the homepage total at 6 or less.
export const scenePins = {
  "lift-off": 1.2,
} as const;

export type SceneName = keyof typeof scenePins;

// NEXT_PUBLIC_MOTION_DEBUG=1 shows ScrollTrigger's start and end markers while tuning a scene.
export const sceneDebug = process.env.NEXT_PUBLIC_MOTION_DEBUG === "1";
