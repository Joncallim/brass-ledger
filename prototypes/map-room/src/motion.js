// Motion tokens from the Figma motion spec (page 07, board B1), in Phaser terms.
export const EASE = {
  arrive: "Expo.easeOut", // papers, slips, portraits, markers entering
  travel: "Cubic.easeInOut", // things moving between two places on screen
  leave: "Quad.easeIn", // things leaving for good
  impact: "Quart.easeIn", // the stamp, once
  fade: "Sine.easeInOut", // light and alpha only
};
export const T = { press: 100, ui: 240, paper: 480, reveal: 800, scene: 1100 };
export const STAGGER = { marker: 80, slip: 120, line: 90 };
export const TYPE_RATE = 40; // characters per second

export const reducedMotion = {
  on: typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches,
};

// One tween helper so every move obeys reduced motion: travel is dropped, only a
// 150 ms fade remains, and the end state is always the same.
export function move(scene, targets, props, { dur = T.paper, ease = EASE.arrive, delay = 0, onComplete } = {}) {
  if (reducedMotion.on) {
    const kept = {};
    for (const k of ["alpha"]) if (k in props) kept[k] = props[k];
    const list = Array.isArray(targets) ? targets : [targets];
    for (const t of list) for (const [k, v] of Object.entries(props)) if (k !== "alpha") t[k] = Array.isArray(v) ? v[1] : v;
    if (!Object.keys(kept).length) {
      onComplete?.();
      return null;
    }
    return scene.tweens.add({ targets, ...kept, duration: 150, delay: 0, onComplete });
  }
  return scene.tweens.add({ targets, ...props, duration: dur, ease, delay, onComplete });
}

// Cosmetic randomness is seeded by campaign and turn, so replays look identical.
export { seeded } from "./chart/random.js";
