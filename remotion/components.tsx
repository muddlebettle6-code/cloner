// Cumulant reel components v2 — minimal, centered, BIG text only. No small subtext.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, continueRender, delayRender } from "remotion";
import { C, F, E } from "./theme";
import { NEUE_WOFF2, MONO_WOFF2 } from "./fonts";

// ---- fonts ---------------------------------------------------------------- //
export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const a = new FontFace("Neue", `url(${NEUE_WOFF2})`);
    const b = new FontFace("Mono", `url(${MONO_WOFF2})`);
    Promise.all([a.load(), b.load()]).then(([n, m]) => { document.fonts.add(n); document.fonts.add(m); continueRender(handle); }).catch(() => continueRender(handle));
  }, [handle]);
  return null;
};

// ---- motion helpers ------------------------------------------------------- //
export const rev = (frame: number, start: number, dur = 16, ease = E.smoothOut) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const counter = (frame: number, to: number, start: number, dur: number, ease = E.chartEase) =>
  interpolate(frame, [start, start + dur], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// ---- background (centered depth, never flat) ------------------------------ //
const NOISE = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='5' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>`);

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const drift = interpolate(f % 300, [0, 150, 300], [0, 1, 0], { easing: E.slowDrift });
  const gy = 44 + drift * 4;
  const gs = 0.98 + drift * 0.06;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 0%, #0d0a0f 0%, ${C.black} 60%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 44% at 50% ${gy}%, ${C.magGlow} 0%, transparent 60%)`, opacity: 0.22, filter: "blur(50px)", transform: `scale(${gs})` }} />
      <AbsoluteFill style={{ background: `radial-gradient(110% 60% at 50% ${gy}%, ${C.magSoft} 0%, transparent 55%)` }} />
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
        {Array.from({ length: 13 }).map((_, i) => <line key={`v${i}`} x1={i * 90} y1={0} x2={i * 90} y2={1920} stroke={C.hair} strokeWidth={1} />)}
        {Array.from({ length: 22 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 90} x2={1080} y2={i * 90} stroke={C.hair} strokeWidth={1} />)}
      </svg>
      <AbsoluteFill style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: "200px 200px", opacity: 0.045, mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: "radial-gradient(125% 100% at 50% 48%, transparent 38%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---- scene wrapper with varied transitions -------------------------------- //
export const SceneWrap: React.FC<{ frames: number; trans: "flash" | "scale" | "blur"; children: React.ReactNode }> = ({ frames, trans, children }) => {
  const f = useCurrentFrame();
  const inDur = trans === "flash" ? 6 : 12;
  const inP = interpolate(f, [0, inDur], [0, 1], { extrapolateRight: "clamp", easing: E.smoothOut });
  const outP = interpolate(f, [frames - 9, frames], [1, 0], { extrapolateLeft: "clamp", easing: E.smoothIn });
  const op = Math.min(inP, outP);
  let blur = (1 - outP) * 12, scale = 1;
  if (trans === "blur") blur += (1 - inP) * 16;
  if (trans === "scale") { scale = interpolate(inP, [0, 1], [1.12, 1]) * interpolate(outP, [0, 1], [0.98, 1]); blur += (1 - inP) * 6; }
  return (
    <>
      <AbsoluteFill style={{ opacity: op, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `scale(${scale})` }}>{children}</AbsoluteFill>
      {trans === "flash" && <AbsoluteFill style={{ background: C.mag, opacity: interpolate(f, [0, 6], [0.45, 0], { extrapolateRight: "clamp" }), mixBlendMode: "screen" }} />}
    </>
  );
};

// ---- big centered kinetic text (beats swap in sync with the voice) -------- //
const sizeFor = (t: string) => { const n = t.length; return n > 44 ? 92 : n > 30 ? 112 : n > 18 ? 132 : 150; };
const emphParts = (t: string, e?: string) => (e ? t.split(new RegExp(`(${e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`)) : [t]);

export const BigText: React.FC<{ beats: { t: string; e?: string }[]; sceneFrames: number; centerY?: number }> = ({ beats, sceneFrames, centerY = 960 }) => {
  const f = useCurrentFrame();
  const each = sceneFrames / beats.length;
  return (
    <>
      {beats.map((b, i) => {
        const start = i * each;
        if (f < start - 2 || f > start + each + 4) return null;
        const local = f - start;
        const inP = interpolate(local, [0, 11], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E.cinematicScale });
        const outP = i < beats.length - 1 ? 1 - interpolate(local, [each - 9, each], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: E.smoothIn }) : 1;
        const op = Math.min(inP, outP);
        const scale = interpolate(inP, [0, 1], [0.82, 1]);
        const y = (1 - inP) * 46;
        const size = sizeFor(b.t);
        return (
          <div key={i} style={{ position: "absolute", left: 70, right: 70, top: centerY, transform: `translateY(-50%) translateY(${y}px) scale(${scale})`, opacity: op, textAlign: "center" }}>
            <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: size, lineHeight: 1.02, letterSpacing: "-0.035em", color: C.white, textShadow: "0 4px 40px rgba(0,0,0,0.85)" }}>
              {emphParts(b.t, b.e).map((p, k) => <span key={k} style={{ color: p === b.e && b.e ? C.mag : C.white }}>{p}</span>)}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---- big centered count-up number ----------------------------------------- //
export const BigNumber: React.FC<{ to: number; prefix?: string; decimals?: number; caption?: string; start?: number; centerY?: number }> = ({ to, prefix = "", decimals = 0, caption, start = 6, centerY = 760 }) => {
  const f = useCurrentFrame();
  const v = counter(f, to, start, 26, E.chartEase);
  const sc = interpolate(rev(f, start, 22, E.softOvershoot), [0, 1], [0.7, 1]);
  const cap = rev(f, start + 20, 14);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: centerY, transform: "translateY(-50%)", textAlign: "center" }}>
      <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: 420, lineHeight: 0.84, letterSpacing: "-0.05em", color: C.mag, transform: `scale(${sc})`, textShadow: `0 0 80px ${C.magGlow}` }}>
        {prefix}{Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals)}
      </div>
      {caption && <div style={{ marginTop: 30, opacity: cap, fontFamily: F.display, fontSize: 64, letterSpacing: "-0.01em", color: C.white }}>{caption}</div>}
    </div>
  );
};

// ---- big centered bar chart (no small text) ------------------------------- //
export const BarChartBig: React.FC<{ bars: { label: string; value: number; hi?: boolean }[]; start?: number }> = ({ bars, start = 4 }) => {
  const f = useCurrentFrame();
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 880, display: "flex", flexDirection: "column", gap: 54 }}>
      {bars.map((b, i) => {
        const st = start + i * 9;
        const grow = rev(f, st, 24, E.chartEase);
        const w = (b.value / max) * 100 * grow;
        const o = rev(f, st, 12);
        return (
          <div key={i} style={{ opacity: o }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
              <span style={{ fontFamily: F.display, fontSize: 64, letterSpacing: "-0.02em", color: b.hi ? C.mag : C.white }}>{b.label}</span>
              <span style={{ fontFamily: F.display, fontSize: 72, letterSpacing: "-0.03em", color: b.hi ? C.mag : C.white }}>{Math.round(b.value * grow)}</span>
            </div>
            <div style={{ position: "relative", height: 30, background: C.hair, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, width: `${w}%`, background: b.hi ? C.mag : "rgba(255,255,255,0.9)", borderRadius: 4, boxShadow: b.hi ? `0 0 40px ${C.magGlow}` : "none" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Cumulant mark + outro ------------------------------------------------ //
export const Mark: React.FC<{ size?: number; draw?: number }> = ({ size = 220, draw = 1 }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 30 24" fill="none">
    <path d="M2.5 18.6H27.5" stroke={C.white} strokeOpacity={0.4} strokeWidth={1.2} strokeLinecap="round" />
    <path d="M3.5 18.6C8.6 18.6 10 5.6 15 5.6C20 5.6 21.4 18.6 26.5 18.6" stroke={C.white} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <circle cx={23.4} cy={15} r={2} fill={C.mag} opacity={draw > 0.85 ? 1 : 0} />
  </svg>
);

export const LogoOutro: React.FC<{ wordmark: string; tagline: string }> = ({ wordmark, tagline }) => {
  const f = useCurrentFrame();
  const draw = rev(f, 4, 30, E.smoothOut);
  const wmS = interpolate(rev(f, 30, 16, E.softOvershoot), [0, 1], [0.8, 1]);
  const tg = rev(f, 46, 16);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Mark size={260} draw={draw} />
      <div style={{ marginTop: 30, opacity: rev(f, 30, 16), transform: `scale(${wmS})`, fontFamily: F.display, fontSize: 104, letterSpacing: "-0.03em", color: C.white }}>{wordmark}<span style={{ color: C.mag }}>.</span></div>
      <div style={{ marginTop: 26, opacity: tg, fontFamily: F.display, fontSize: 40, letterSpacing: "-0.005em", color: C.soft }}>{tagline}</div>
    </AbsoluteFill>
  );
};
