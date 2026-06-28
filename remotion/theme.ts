// Cumulant reel design tokens — DARK mode. Near-black page + subtle grid, white text
// (ONE type, no gray subtext), magenta accent. Easing-driven motion system.
import { Easing } from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// --- color (dark) ---
export const C = {
  bg: "#070708",      // near-black page
  bg2: "#0e0e12",
  ink: "#ffffff",     // text is white (single text colour)
  soft: "#ffffff",    // never gray — keep all text white
  faint: "rgba(255,255,255,0.34)",
  hair: "rgba(255,255,255,0.07)",  // grid lines
  mag: "#ff2d92",
  magDeep: "#c01567",
  magSoft: "rgba(255,45,146,0.14)",
  magGlow: "rgba(255,45,146,0.5)",
  white: "#ffffff",
  black: "#070708",
  shadow: "rgba(0,0,0,0.5)",
};

export const F = {
  display: "'Neue', 'Helvetica Neue', Arial, sans-serif",
  mono: "'Mono', ui-monospace, monospace",
};

export const SAFE = { top: 150, bottom: 360, side: 84, right: 150 };

export const E = {
  smoothOut: Easing.bezier(0.16, 1, 0.3, 1),
  smoothIn: Easing.bezier(0.7, 0, 0.84, 0),
  smoothInOut: Easing.bezier(0.65, 0, 0.35, 1),
  cinematicScale: Easing.bezier(0.22, 1, 0.36, 1),
  softOvershoot: Easing.bezier(0.34, 1.28, 0.64, 1),
  fastReveal: Easing.bezier(0.12, 0.8, 0.2, 1),
  slowDrift: Easing.bezier(0.4, 0, 0.6, 1),
  cameraEase: Easing.bezier(0.45, 0, 0.2, 1),
  chartEase: Easing.bezier(0.25, 1, 0.3, 1),
};
