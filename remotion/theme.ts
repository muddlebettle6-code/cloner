// Cumulant reel design tokens + motion system. Black / magenta / white identity.
// Centralized so nothing is a scattered magic number.
import { Easing } from "remotion";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// --- color (deep-black environment, magenta accent, white contrast) ---
export const C = {
  black: "#050506",
  ink: "#0b0b0f",
  nearBlack: "#0e0d12",
  white: "#ffffff",
  soft: "rgba(255,255,255,0.72)",
  gray: "rgba(255,255,255,0.40)",
  faint: "rgba(255,255,255,0.16)",
  hair: "rgba(255,255,255,0.08)",
  mag: "#ff2d92",
  magDeep: "#9c1456",
  magDark: "#250a18",
  magGlow: "rgba(255,45,146,0.55)",
  magSoft: "rgba(255,45,146,0.16)",
};

// --- type (approved Cumulant fonts only) ---
export const F = {
  display: "'Neue', 'Helvetica Neue', Arial, sans-serif", // major statements
  mono: "'Mono', ui-monospace, monospace", // data, labels, source, coordinates
};

// safe margins for the IG interface (keep important content inside)
export const SAFE = { top: 150, bottom: 360, side: 84, right: 150 };

// --- easing presets (the "graph editor": variable-speed, never linear) ---
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
