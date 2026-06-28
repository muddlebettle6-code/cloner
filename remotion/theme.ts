// Cumulant reel design tokens — LIGHT mode (Cumulant site aesthetic):
// soft warm-white page, ink text, magenta accent. Easing-driven motion system.
import { Easing } from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// --- color (light: cream page, ink text, magenta accent) ---
export const C = {
  bg: "#f5f3ee",      // soft warm white (page)
  bg2: "#e9e4d9",     // darker cream for gradients/depth
  ink: "#17140f",     // primary text
  soft: "rgba(23,20,15,0.58)",
  faint: "rgba(23,20,15,0.30)",
  hair: "rgba(23,20,15,0.10)",
  mag: "#ff2d92",
  magDeep: "#d11668",
  magSoft: "rgba(255,45,146,0.10)",
  magGlow: "rgba(255,45,146,0.28)",
  white: "#ffffff",
  black: "#0a0a0a",
  shadow: "rgba(23,20,15,0.18)",
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
