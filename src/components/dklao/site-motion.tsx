"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Content that rises into place the first time it scrolls into view. The footer has its own motion
// (footer-motion.tsx) and is left out. A parent and its child are never both animated.
export const revealTargets = [
  ".dk-section-header",
  ".dk-card",
  ".service-card",
  ".page-card",
  ".page-stats > div",
  ".page-chips li",
  ".page-steps li",
  ".page-list li",
  ".page-faq [data-slot=accordion-item]",
  ".page-table",
  ".home-proof__grid > div",
  ".trusted-by__title",
  ".trusted-by__groups > div",
  ".about-snapshot__card",
  ".about-vision__card",
  ".about-solution-card",
  ".about-promise__steps li",
  ".about-story__collage img",
  ".rental-highlight__panel",
  ".clean-warehouse__feature",
  ".quote-form",
].join(",");

// Large photos that drift slightly against the scroll, for depth.
const parallaxTargets = ".about-story__collage img, .quote-section__asset img";

// One site-wide motion layer, mounted once in the layout. Timing follows the 12 principles adapted for
// the web: entrances ease out, staggers stay at 40ms, nothing user-triggered runs longer than 300ms (CSS),
// and visitors who ask for reduced motion get the page at rest.
export function SiteMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Header: a deeper surface and shadow once the page leaves the top.
      ScrollTrigger.create({
        start: 48,
        end: 99999, // stays on all the way down; "max" would switch it off at the very bottom
        toggleClass: { targets: ".site-header", className: "is-scrolled" },
      });

      // Reveal: only what starts below the fold is hidden, so nothing visible on load flickers.
      const all = gsap.utils.toArray<HTMLElement>(revealTargets).filter((el) => !el.closest(".industrial-footer"));
      const targets = all.filter(
        (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92 && !all.some((other) => other !== el && other.contains(el)),
      );

      gsap.set(targets, { opacity: 0, y: 28 });
      ScrollTrigger.batch(targets, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => {
          // Reached by Tab: whatever holds the focus is shown at once instead of fading in under it.
          const focused = batch.filter((el) => el.contains(document.activeElement));

          gsap.set(focused, { opacity: 1, y: 0, overwrite: true });
          gsap.to(
            batch.filter((el) => !focused.includes(el)),
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.04, overwrite: true },
          );
        },
      });

      for (const image of gsap.utils.toArray<HTMLElement>(parallaxTargets)) {
        gsap.fromTo(
          image,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: "none", // scroll-linked position, not timed motion
            scrollTrigger: { trigger: image, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      }
    });

    // Images and fonts settle after load and move content; re-measure so the triggers stay accurate.
    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 150);
    });

    observer.observe(document.body);

    // Keyboard users tab to content before its reveal (or the footer slide-in) has played. Whatever holds
    // the focused element at part opacity is shown at once, so nothing receives focus while hard to see.
    const reveal = (target: HTMLElement) => {
      for (let node: HTMLElement | null = target; node && node !== document.body; node = node.parentElement) {
        if (node.style.opacity !== "" && Number(node.style.opacity) < 1) {
          gsap.to(node, { opacity: 1, x: 0, y: 0, duration: 0.15, ease: "power3.out", overwrite: "auto" });
        }
      }
    };
    const showFocused = (event: FocusEvent) => reveal(event.target as HTMLElement);

    document.addEventListener("focusin", showFocused);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("focusin", showFocused);
      mm.revert();
    };
  });

  return null;
}
