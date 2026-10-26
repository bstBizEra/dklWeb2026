"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { sceneMedia } from "@/lib/motion/scene-config";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type SceneConditions = { motion: boolean; desktop: boolean; phone: boolean };

// Runs a scene's setup inside the shared matchMedia conditions, scoped to the scene's own element so its
// selectors never reach another section. Reduced motion skips the setup entirely, leaving the section at
// rest. GSAP reverts every tween and ScrollTrigger the setup made when a condition changes (a resize past
// the breakpoint, the reduced-motion setting switched on) or the component unmounts.
export function useScene(
  scope: RefObject<HTMLElement | null>,
  setup: (conditions: SceneConditions, root: HTMLElement) => void | (() => void),
) {
  useGSAP(
    () => {
      const root = scope.current;

      if (!root) return;

      const mm = gsap.matchMedia(root);

      mm.add(sceneMedia, (context) => {
        const conditions = context.conditions as SceneConditions;

        if (!conditions.motion) return;

        return setup(conditions, root);
      });

      return () => mm.revert();
    },
    { scope },
  );
}
