// Cumulant reel components v3 — 0x100x language: pure black, running top caption,
// big focal statement / number, flowy zoom-through transitions. No grid, no end card.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, continueRender, delayRender } from "remotion";
import { C, F, E } from "./theme";
import { NEUE_WOFF2, MONO_WOFF2 } from "./fonts";

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const a = new FontFace("Neue", `url(${NEUE_WOFF2})`);
    const b = new FontFace("Mono", `url(${MONO_WOFF2})`);
    Promise.all([a.load(), b.load()]).then(([n, m]) => { document.fonts.add(n); document.fonts.add(m); continueRender(handle); }).catch(() => continueRender(handle));
  }, [handle]);
  return null;
};

export const rev = (frame: number, start: number, dur = 14, ease = E.smoothOut) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// ---- background: pure black + a single soft magenta glow (no grid) -------- //
const NOISE = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>`);

export const Background: React.FC<{ glowY?: number }> = ({ glowY = 46 }) => {
  const f = useCurrentFrame();
  const d = interpolate(f % 360, [0, 180, 360], [0, 1, 0], { easing: E.slowDrift });
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(58% 40% at 50% ${glowY + d * 3}%, ${C.magGlow} 0%, transparent 62%)`, opacity: 0.2, filter: "blur(60px)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% ${glowY}%, ${C.magSoft} 0%, transparent 58%)`, opacity: 0.7 }} />
      <AbsoluteFill style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: "200px 200px", opacity: 0.04, mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: "radial-gradient(130% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.72) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---- flowy transitions: fly THROUGH (exit zooms past), entrance varies ----- //
export const SceneWrap: React.FC<{ frames: number; trans: "zoom" | "push" | "whoosh"; children: React.ReactNode }> = ({ frames, trans, children }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 13], [0, 1], { extrapolateRight: "clamp", easing: E.smoothOut });
  const outP = interpolate(f, [frames - 12, frames], [1, 0], { extrapolateLeft: "clamp", easing: E.smoothIn });
  let scale = 1, x = 0, blur = 0;
  if (trans === "zoom") scale = interpolate(inP, [0, 1], [1.32, 1]);
  if (trans === "push") scale = interpolate(inP, [0, 1], [0.74, 1]);
  if (trans === "whoosh") x = interpolate(inP, [0, 1], [320, 0]);
  blur += (1 - inP) * 13;
  // exit: fly forward through the camera
  scale *= interpolate(outP, [0, 1], [1.4, 1]);
  blur += (1 - outP) * 16;
  return <AbsoluteFill style={{ opacity: Math.min(inP, outP), filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `translateX(${x}px) scale(${scale})` }}>{children}</AbsoluteFill>;
};

// ---- running top caption (the connective narration) ----------------------- //
export const TopCaption: React.FC<{ text: string; start?: number }> = ({ text, start = 4 }) => {
  const f = useCurrentFrame();
  const p = rev(f, start, 12, E.smoothOut);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 300, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
      <span style={{ fontFamily: F.display, fontSize: 44, letterSpacing: "-0.01em", color: C.soft }}>{text}</span>
    </div>
  );
};

// ---- big centered statement (the focal text) ------------------------------ //
const emph = (t: string, e?: string) => (e ? t.split(new RegExp(`(${e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`)) : [t]);
const sizeFor = (lines: { t: string }[]) => { const n = Math.max(...lines.map((l) => l.t.length)); return n > 26 ? 118 : n > 16 ? 140 : 158; };

export const BigStatement: React.FC<{ lines: { t: string; e?: string }[]; start?: number; centerY?: number }> = ({ lines, start = 6, centerY = 960 }) => {
  const f = useCurrentFrame();
  const size = sizeFor(lines);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: centerY, transform: "translateY(-50%)", textAlign: "center" }}>
      {lines.map((ln, i) => {
        const p = rev(f, start + i * 6, 16, E.cinematicScale);
        return (
          <div key={i} style={{ overflow: "hidden" }}>
            <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.035em", color: C.white, opacity: p, transform: `translateY(${(1 - p) * 60}px)`, textShadow: "0 4px 50px rgba(0,0,0,0.9)" }}>
              {emph(ln.t, ln.e).map((s, k) => <span key={k} style={{ color: s === ln.e && ln.e ? C.mag : C.white }}>{s}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- huge number beat ----------------------------------------------------- //
export const BigNumber: React.FC<{ value: string; sub: string; start?: number; centerY?: number }> = ({ value, sub, start = 6, centerY = 940 }) => {
  const f = useCurrentFrame();
  const sc = interpolate(rev(f, start, 20, E.softOvershoot), [0, 1], [0.62, 1]);
  const subP = rev(f, start + 16, 14);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: centerY, transform: "translateY(-50%)", textAlign: "center" }}>
      <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: 440, lineHeight: 0.82, letterSpacing: "-0.05em", color: C.mag, transform: `scale(${sc})`, textShadow: `0 0 90px ${C.magGlow}` }}>{value}</div>
      <div style={{ marginTop: 36, opacity: subP, fontFamily: F.display, fontSize: 50, letterSpacing: "-0.01em", color: C.white }}>{sub}</div>
    </div>
  );
};

// ---- 2D labels for the 3D bars (APPLE TV +54%, etc.) ---------------------- //
export const BarLabels: React.FC<{ bars: { label: string; value: number }[]; unit: string; start?: number }> = ({ bars, unit, start = 10 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1360, display: "flex", justifyContent: "space-between" }}>
      {bars.map((b, i) => {
        const p = rev(f, start + i * 6, 14, E.softOvershoot);
        return (
          <div key={i} style={{ flex: 1, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>
            <div style={{ fontFamily: F.display, fontSize: 84, letterSpacing: "-0.03em", color: i === 0 ? C.mag : C.white }}>+{b.value}{unit}</div>
            <div style={{ marginTop: 6, fontFamily: F.display, fontSize: 34, color: C.soft }}>{b.label}</div>
          </div>
        );
      })}
    </div>
  );
};
