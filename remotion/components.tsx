// Cumulant reel components v5 — DARK + grid. ONE white text style (no gray subtext).
// Top caption + a centered focal (3D / chart / table / big number). Flowy transitions.
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
const emph = (t: string, e?: string) => (e ? t.split(new RegExp(`(${e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i")) : [t]);

// ---- dark background: near-black + subtle grid + magenta glow + grain ------- //
const GRAIN = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='4'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>`);

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const d = interpolate(f % 360, [0, 180, 360], [0, 1, 0], { easing: E.slowDrift });
  const shift = (f * 0.15) % 80;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 30%, ${C.bg2} 0%, ${C.bg} 60%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(52% 36% at 50% ${42 + d * 4}%, ${C.magGlow} 0%, transparent 62%)`, opacity: 0.16, filter: "blur(60px)" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 15 }).map((_, i) => <line key={`v${i}`} x1={i * 80 - shift} y1={0} x2={i * 80 - shift} y2={1920} stroke={C.hair} strokeWidth={1} />)}
        {Array.from({ length: 25 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 80} x2={1080} y2={i * 80} stroke={C.hair} strokeWidth={1} />)}
      </svg>
      <AbsoluteFill style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: "200px 200px", opacity: 0.04, mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: "radial-gradient(130% 100% at 50% 48%, transparent 42%, rgba(0,0,0,0.62) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---- flowy transitions: entrance varies; full-change beats fly through ------ //
export const SceneWrap: React.FC<{ frames: number; trans: "zoom" | "push" | "slide" | "wipe" | "fade"; children: React.ReactNode }> = ({ frames, trans, children }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 13], [0, 1], { extrapolateRight: "clamp", easing: E.smoothOut });
  const outP = interpolate(f, [frames - 10, frames], [1, 0], { extrapolateLeft: "clamp", easing: E.smoothIn });
  let scale = 1, x = 0, blur = 0;
  if (trans === "zoom") { scale = interpolate(inP, [0, 1], [1.3, 1]); blur += (1 - inP) * 11; }
  if (trans === "push") { scale = interpolate(inP, [0, 1], [0.76, 1]); blur += (1 - inP) * 9; }
  if (trans === "slide") x = interpolate(inP, [0, 1], [300, 0]);
  if (trans === "fade") blur += (1 - inP) * 6;
  const strong = trans === "zoom" || trans === "wipe" || trans === "push";
  if (strong) { scale *= interpolate(outP, [0, 1], [1.32, 1]); blur += (1 - outP) * 15; } else { x += interpolate(outP, [0, 1], [-200, 0]); blur += (1 - outP) * 7; }
  return (
    <>
      <AbsoluteFill style={{ opacity: Math.min(inP, outP), filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `translateX(${x}px) scale(${scale})` }}>{children}</AbsoluteFill>
      {trans === "wipe" && <AbsoluteFill style={{ background: C.mag, transform: `translateX(${interpolate(inP, [0, 1], [-1080, 1180], { easing: E.cinematicScale })}px)` }} />}
    </>
  );
};

// ---- top caption (the only running text — white, clean) -------------------- //
export const Caption: React.FC<{ text: string; e?: string; start?: number }> = ({ text, e, start = 4 }) => {
  const f = useCurrentFrame();
  const p = rev(f, start, 12, E.smoothOut);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 296, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
      <span style={{ fontFamily: F.display, fontSize: 50, letterSpacing: "-0.015em", color: C.white }}>
        {emph(text, e).map((s, k) => <span key={k} style={{ color: s.toLowerCase() === (e || "").toLowerCase() && e ? C.mag : C.white }}>{s}</span>)}
      </span>
    </div>
  );
};

// ---- huge CENTERED number -------------------------------------------------- //
export const BigNumber: React.FC<{ value: string; start?: number; centerY?: number }> = ({ value, start = 6, centerY = 960 }) => {
  const f = useCurrentFrame();
  const sc = interpolate(rev(f, start, 18, E.softOvershoot), [0, 1], [0.6, 1]);
  const size = value.length > 5 ? 262 : value.length > 3 ? 360 : 460;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: centerY, transform: "translateY(-50%)", textAlign: "center" }}>
      <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: size, lineHeight: 0.82, letterSpacing: "-0.05em", color: C.mag, transform: `scale(${sc})`, textShadow: `0 0 90px ${C.magGlow}` }}>{value}</div>
    </div>
  );
};

// ---- big CENTERED statement (white + magenta emphasis) --------------------- //
export const BigStatement: React.FC<{ lines: { t: string; e?: string }[]; start?: number; centerY?: number }> = ({ lines, start = 5, centerY = 960 }) => {
  const f = useCurrentFrame();
  const n = Math.max(...lines.map((l) => l.t.length));
  const size = n > 22 ? 130 : n > 14 ? 152 : 170;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: centerY, transform: "translateY(-50%)", textAlign: "center" }}>
      {lines.map((ln, i) => {
        const p = rev(f, start + i * 6, 15, E.cinematicScale);
        return (
          <div key={i} style={{ overflow: "hidden" }}>
            <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: size, lineHeight: 1.03, letterSpacing: "-0.035em", color: C.white, opacity: p, transform: `translateY(${(1 - p) * 60}px)` }}>
              {emph(ln.t, ln.e).map((s, k) => <span key={k} style={{ color: s.toLowerCase() === (ln.e || "").toLowerCase() && ln.e ? C.mag : C.white }}>{s}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- spectrum waves (the airwaves) ----------------------------------------- //
export const Waves: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const f = useCurrentFrame();
  const p = rev(f, start, 18);
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: p * 0.85 }}>
      {Array.from({ length: 6 }).map((_, i) => {
        const amp = 30 + i * 14; const yb = 900 + i * 14; const ph = f * 0.1 + i;
        const pts = Array.from({ length: 55 }).map((_, k) => `${k * 20},${yb + Math.sin(k * 0.42 + ph) * amp}`).join(" ");
        return <polyline key={i} points={pts} fill="none" stroke={C.mag} strokeOpacity={0.55 - i * 0.07} strokeWidth={4} />;
      })}
    </svg>
  );
};
