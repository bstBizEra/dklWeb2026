/**
 * Scroll scenes (src/components/dklao/scenes): the homepage's authored scroll story. Checked against the
 * same principles as site motion, plus the scene rules: shared matchMedia conditions, nothing moves with
 * reduced motion, no pinning on phones, transforms and opacity only, and the generic reveal leaves scene
 * sections alone.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { sceneMedia, scenePins, sceneTiming } from "@/lib/motion/scene-config";

const read = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8").replace(/\r\n/g, "\n");
const useScene = read("src", "components", "dklao", "scenes", "use-scene.ts");
const liftOff = read("src", "components", "dklao", "scenes", "lift-off.tsx");
const hero = read("src", "components", "dklao", "main-hero.tsx");
const site = read("src", "components", "dklao", "site-motion.tsx");

describe("scene system", () => {
  it("runs every scene inside one matchMedia with a reduced-motion guard, and reverts it", () => {
    expect(sceneMedia.motion).toBe("(prefers-reduced-motion: no-preference)");
    expect(useScene).toContain("gsap.matchMedia(root)");
    expect(useScene).toContain("if (!conditions.motion) return;");
    expect(useScene).toContain("mm.revert()");
    expect(useScene.startsWith('"use client"')).toBe(true);
  });

  it("splits desktop and phone at the site's 780px breakpoint and never leaves a screen in neither", () => {
    expect(sceneMedia.desktop).toContain("(min-width: 781px)");
    expect(sceneMedia.phone).toContain("(max-width: 780px)");
    expect(sceneMedia.desktop).toContain("(min-height: 640px)");
    expect(sceneMedia.phone).toContain("(max-height: 639px)");
  });

  it("keeps timings on the motion tokens and pinned scroll at 6 screens or less", () => {
    expect(sceneTiming.stagger).toBeLessThanOrEqual(0.05);
    expect(sceneTiming.slow).toBe(0.6);
    const total = Object.values(scenePins).reduce((sum, value) => sum + value, 0);

    expect(total).toBeLessThanOrEqual(6);
  });

  it("stops the site-wide reveal and focus fix from touching scene sections", () => {
    expect(site).toContain('!el.closest("[data-scene]")');
    expect(site).toContain('if (target.closest("[data-scene]")) return;');
  });
});

describe("scene 01: Lift-off", () => {
  it("marks the hero as the lift-off scene", () => {
    expect(liftOff).toContain('data-scene="lift-off"');
    expect(hero).toContain("<LiftOffScene");
  });

  it("pins only on desktop, scrubbed, for the configured length", () => {
    const phoneBranch = liftOff.slice(liftOff.indexOf("if (!desktop)"), liftOff.indexOf("return;", liftOff.indexOf("if (!desktop)")));

    expect(phoneBranch).not.toContain("pin:");
    expect(liftOff).toContain("pin: true");
    expect(liftOff).toContain('scenePins["lift-off"]');
    expect(liftOff).toContain("scrub: sceneTiming.scrub");
    expect(liftOff).toContain("invalidateOnRefresh: true");
  });

  it("uses linear easing only because every tween is scroll-linked, and animates no layout properties", () => {
    for (const [, ease] of liftOff.matchAll(/ease:\s*"([^"]+)"/g)) expect(["power3.out", "none"]).toContain(ease);
    const tweens = [...liftOff.matchAll(/\.(?:to|from|fromTo|set)\(([\s\S]*?)\)\s*[;\n.]/g)].map((match) => match[1]).join("\n");

    expect(tweens).toContain("yPercent");
    expect(tweens).not.toMatch(/\b(top|left|width|height|margin|padding):/);
    expect(liftOff).not.toContain("autoAlpha");
  });

  it("fills the screen below the header only while pinned, so no blank page shows under the hero", () => {
    expect(liftOff).toContain('root.dataset.pinned = "true"');
    expect(liftOff).toContain("delete root.dataset.pinned");
    expect(hero).toContain("data-[pinned=true]:min-h-[calc(100svh-78px)]");
  });

  it("names its beats with timeline labels", () => {
    for (const label of ["grid", "handoff"]) expect(liftOff).toContain(`addLabel("${label}"`);
  });

  it("moves wrappers, not the image or copy that carry CSS load animations", () => {
    for (const part of ["copy", "stage", "racking", "truck", "grid", "dim", "stripe"]) {
      expect(hero).toContain(`data-lift="${part}"`);
    }
    // The truck and the racking keep their CSS load animations on an inner layer; GSAP moves the wrapper.
    // On one element, the CSS animation (held by its fill mode) would override GSAP's inline transform.
    expect(hero).toMatch(/data-lift="truck"[^>]*>\s*(?:\{\/\*[\s\S]*?\*\/\}\s*)?<div[^>]*animate-\[hero-drive-in/);
    expect(hero).toMatch(/data-lift="racking"[^>]*>\s*<span[^>]*animate-\[hero-depth-in/);
    for (const [, attrs] of hero.matchAll(/<\w+\s+data-lift="[^"]+"([^>]*)>/g)) expect(attrs).not.toContain("animate-[");
  });

  it("carries the pallet on the forks without lifting it, and shows no lift gauge (owner decision)", () => {
    expect(hero).toMatch(/data-lift="truck"[\s\S]*?<PalletLoad \/>/);
    for (const gone of ["carriage", "gauge", "clip-path"]) {
      expect(hero).not.toContain(gone);
      expect(liftOff).not.toContain(gone);
    }
  });

  it("drives the truck in on load only when motion is allowed", () => {
    for (const name of ["hero-drive-in", "hero-shadow-in", "hero-depth-in"]) {
      expect(hero).toMatch(new RegExp(`animate-\\[${name}[^"]*motion-reduce:animate-none`));
    }
  });

  it("keeps the hero complete without the scene: dim clear, copy and buttons visible", () => {
    expect(hero).toMatch(/data-lift="dim"[^>]*opacity-0/);
    expect(hero).not.toMatch(/data-lift="copy"[^>]*opacity-0/);
    expect(hero).toContain("priority");
  });

  it("brings keyboard users back to the visible headline and buttons", () => {
    expect(liftOff).toContain('root.addEventListener("focusin"');
    expect(liftOff).toContain("window.scrollTo({ top: trigger.start })");
    expect(liftOff).toContain('root.removeEventListener("focusin"');
  });

  it("writes every load-animation class out in full so Tailwind generates it", () => {
    expect(hero).not.toMatch(/animate-\[[^\]]*\$\{/);
    for (const delay of ["80ms", "160ms", "240ms"]) {
      expect(hero).toContain(`animate-[dk-rise_720ms_var(--dk-motion-ease-premium)_${delay}_both]`);
    }
  });
});
