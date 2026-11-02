"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { refreshWhenIdle } from "./refresh-when-idle";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Each footer layer flows in once the page is scrolled down to it: the left half slides in from the left
// and the right half from the right. Scrolling back up past the layer plays the same motion in reverse.
// Selectors are scoped to the footer. Nothing fades: the layers are readable the whole way in, so a visitor
// or an audit meeting them mid-travel still sees the phone numbers. Ask for reduced motion and they stand still.
const layers: { trigger: string; start: string; left: string[]; right: string[] }[] = [
  {
    trigger: ".industrial-footer__contact",
    start: "top 90%",
    left: [".industrial-footer__lead h2", ".industrial-footer__chips a:nth-child(odd)", ".industrial-footer__find p"],
    right: [
      ".industrial-footer__actions",
      ".industrial-footer__chips a:nth-child(even)",
      ".industrial-footer__photo",
      ".industrial-footer__social",
    ],
  },
  {
    trigger: ".industrial-footer__links",
    start: "top 90%",
    left: [".industrial-footer__links > div:nth-child(-n + 3)"],
    right: [".industrial-footer__links > div:nth-child(n + 4)"],
  },
  {
    trigger: ".industrial-footer__meta",
    // The copyright line sits at the very bottom of the page, so it starts as soon as it enters the viewport.
    start: "top bottom",
    left: [".industrial-footer__copyright"],
    right: [".industrial-footer__credit"],
  },
];

export function FooterMotion({ children }: { children: ReactNode }) {
  const footer = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Each layer's timeline, so a keyboard user tabbing into a layer can see it at once (see onFocus below).
      let timelines: { layer: string; timeline: gsap.core.Timeline }[] = [];

      // Full motion slides from the sides. When the system asks for reduced motion (Windows: Settings, Accessibility,
      // Visual effects, Animation effects off) the travel is zero, so the layers simply sit where they belong.
      mm.add({ full: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" }, (context) => {
        const distance = context.conditions?.reduced ? 0 : 90;

        timelines = [];
        for (const layer of layers) {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: layer.trigger,
              start: layer.start,
              toggleActions: "play none none reverse",
            },
          });
          // Travel only, never a fade. A fading layer is text that is on screen but not readable yet, and these
          // layers carry the phone numbers: scrolling past the chips showed them at half opacity for a few
          // hundred milliseconds, and anything measuring the page in that moment sees links with no visible name.
          // fromTo, not from: a from() tween reads its end state off the page, and a refresh that lands mid-tween
          // made it read a half-hidden state, leaving content shifted off-screen for good.
          const from = (selectors: string[], x: number) =>
            timeline.fromTo(
              selectors.join(","),
              { x },
              { x: 0, duration: distance ? 0.7 : 0.5, ease: "power3.out", stagger: 0.04 },
              0,
            );

          from(layer.left, -distance);
          from(layer.right, distance);
          timelines.push({ layer: layer.trigger, timeline });
        }
      });

      // Tab reaches footer links before their layer has slid in: jump that layer to its end so the focused
      // link is never focused while faded or off to the side.
      const onFocus = (event: FocusEvent) => {
        for (const { layer, timeline } of timelines) {
          if (footer.current?.querySelector(layer)?.contains(event.target as Node)) timeline.progress(1);
        }
      };

      footer.current?.addEventListener("focusin", onFocus);

      // Images above the footer settle after load and move it; re-measure so the last layer keeps its trigger,
      // but not during a smooth scroll, which a refresh would cancel.
      const stopRefreshing = refreshWhenIdle(() => ScrollTrigger.refresh());

      return () => {
        stopRefreshing();
        footer.current?.removeEventListener("focusin", onFocus);
        mm.revert();
      };
    },
    { scope: footer },
  );

  return (
    <footer className="industrial-footer overflow-x-clip bg-navy-950 text-white" ref={footer}>
      {children}
    </footer>
  );
}
