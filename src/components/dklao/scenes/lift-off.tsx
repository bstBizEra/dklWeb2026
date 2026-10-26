"use client";

import { useRef, type ComponentProps } from "react";
import gsap from "gsap";

import { sceneDebug, scenePins, sceneTiming } from "@/lib/motion/scene-config";

import { useScene } from "./use-scene";

// Scene 01, "Lift-off": the homepage's opening shot. The forklift has driven in with a pallet of cartons
// (a CSS load animation in main-hero.tsx). The hero then holds the screen for a short scroll while the
// racking and the blueprint grid drift behind at their own slower speeds, which gives the depth; then the
// truck rolls forward, the copy rises away, the hero darkens and the brand stripe thickens into the proof
// band below. Scroll-linked: scrolling back up reverses it.
//
// The parts it moves are marked with data-lift in main-hero.tsx. They are wrappers, never the elements
// that carry CSS load animations, because a CSS animation would override GSAP's inline transform.
export function LiftOffScene({ children, ...props }: ComponentProps<"section">) {
  const ref = useRef<HTMLElement>(null);

  useScene(ref, ({ desktop }, root) => {
    const part = (name: string) => root.querySelectorAll<HTMLElement>(`[data-lift="${name}"]`);

    // Phones and short screens: no pin, only a gentle drift of the racking behind the truck.
    if (!desktop) {
      gsap.fromTo(
        part("racking"),
        { yPercent: -3 },
        {
          yPercent: 3,
          ease: "none", // scroll-linked position, not timed motion
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: sceneTiming.scrub },
        },
      );
      return;
    }

    const header = document.querySelector<HTMLElement>(".site-header");

    // While pinned, the hero fills the screen below the header, so no empty page shows beneath it.
    // Removed again when the scene stops (reduced motion switched on, or a resize down to phone width).
    root.dataset.pinned = "true";

    const timeline = gsap.timeline({
      defaults: { ease: "none" }, // scrubbed: the scrollbar is the playhead
      scrollTrigger: {
        trigger: root,
        // Pin as soon as the hero meets the sticky header, which is where it starts on load.
        start: () => `top top+=${header?.offsetHeight ?? 0}`,
        end: () => `+=${Math.round(window.innerHeight * scenePins["lift-off"])}`,
        pin: true,
        scrub: sceneTiming.scrub,
        invalidateOnRefresh: true,
        markers: sceneDebug,
      },
    });

    timeline
      .addLabel("grid", 0)
      // Depth: the grid and the racking drift at different speeds, both slower than the truck.
      .to(part("grid"), { yPercent: -4, duration: 0.8 }, "grid")
      .to(part("racking"), { yPercent: -7, xPercent: 3, duration: 0.8 }, "grid")
      .addLabel("handoff", 0.6)
      // The truck rolls forward, towards the viewer, as the scene hands over to the page.
      .to(part("truck"), { xPercent: -9, scale: 1.08, duration: 0.4 }, "handoff")
      .to(part("copy"), { opacity: 0, y: -40, duration: 0.4 }, "handoff")
      .to(part("dim"), { opacity: 1, duration: 0.4 }, "handoff")
      .to(part("stripe"), { scaleY: 2.5, duration: 0.4 }, "handoff");

    // Keyboard users who tab back into the hero after the copy has risen away are taken to the start of
    // the scene, where the headline and both buttons are fully visible.
    const trigger = timeline.scrollTrigger;
    const showCopy = (event: FocusEvent) => {
      if (trigger && trigger.progress > 0.55 && part("copy")[0]?.contains(event.target as Node)) {
        window.scrollTo({ top: trigger.start });
      }
    };

    root.addEventListener("focusin", showCopy);

    return () => {
      root.removeEventListener("focusin", showCopy);
      delete root.dataset.pinned;
    };
  });

  return (
    <section ref={ref} data-scene="lift-off" {...props}>
      {children}
    </section>
  );
}
