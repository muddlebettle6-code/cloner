// Reusable Cumulant reel components + motion utilities. Frame-based, easing-driven.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, continueRender, delayRender, Easing } from "remotion";
import { C, F, E, SAFE } from "./theme";
import { NEUE_WOFF2, MONO_WOFF2 } from "./fonts";

// ---- fonts (deterministic load before render) ----------------------------- //
export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const neue = new FontFace("Neue", `url(${NEUE_WOFF2})`);
    const mono = new FontFace("Mono", `url(${MONO_WOFF2})`);
    Promise.all([neue.load(), mono.load()]).then(([n, m]) => { document.fonts.add(n); document.fonts.add(m); continueRender(handle); }).catch(() => continueRender(handle));
  }, [handle]);
  return null;
};

// ---- motion helpers ------------------------------------------------------- //
export const rev = (frame: number, start: number, dur = 18, ease = E.smoothOut) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const useReveal = (start: number, dur = 18, rise = 46, ease = E.smoothOut) => {
  const f = useCurrentFrame();
  const p = rev(f, start, dur, ease);
  return { opacity: p, transform: `translateY(${(1 - p) * rise}px)` } as React.CSSProperties;
};

export const counter = (frame: number, to: number, start: number, dur: number, ease = E.chartEase) =>
  interpolate(frame, [start, start + dur], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

// ---- background system (depth, never flat black) -------------------------- //
const NOISE = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>`);

export const Background: React.FC<{ glowX?: number; glowY?: number }> = ({ glowX = 50, glowY = 38 }) => {
  const f = useCurrentFrame();
  const drift = interpolate(f % 240, [0, 120, 240], [0, 1, 0], { easing: E.slowDrift });
  const gx = glowX + drift * 4 - 2;
  const gy = glowY + drift * 3;
  const gs = 0.96 + drift * 0.08;
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ background: `radial-gradient(120% 70% at ${gx}% ${gy}%, ${C.magSoft} 0%, rgba(255,45,146,0.05) 28%, transparent 60%)`, transform: `scale(${gs})` }} />
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at ${gx}% ${gy}%, ${C.magGlow} 0%, transparent 55%)`, opacity: 0.18, filter: "blur(40px)", transform: `scale(${gs})` }} />
      {/* fine editorial grid */}
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        {Array.from({ length: 13 }).map((_, i) => <line key={`v${i}`} x1={i * 90} y1={0} x2={i * 90} y2={1920} stroke={C.hair} strokeWidth={1} />)}
        {Array.from({ length: 22 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * 90} x2={1080} y2={i * 90} stroke={C.hair} strokeWidth={1} />)}
      </svg>
      <AbsoluteFill style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: "220px 220px", opacity: 0.05, mixBlendMode: "overlay" }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 100% at 50% 45%, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---- chrome: topic label + source label ----------------------------------- //
export const TopicLabel: React.FC<{ text: string; date?: string; start?: number }> = ({ text, date, start = 4 }) => {
  const s = useReveal(start, 16, 0);
  return (
    <div style={{ position: "absolute", top: SAFE.top, left: SAFE.side, display: "flex", alignItems: "center", gap: 16, ...s }}>
      <div style={{ width: 10, height: 10, background: C.mag, borderRadius: 2 }} />
      <span style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.22em", color: C.soft }}>{text}</span>
      {date && <span style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.18em", color: C.gray }}>· {date}</span>}
    </div>
  );
};

export const SourceLabel: React.FC<{ text: string; start?: number }> = ({ text, start = 24 }) => {
  const o = rev(useCurrentFrame(), start, 18);
  return (
    <div style={{ position: "absolute", bottom: SAFE.bottom - 18, left: SAFE.side, opacity: o * 0.62, fontFamily: F.mono, fontSize: 21, letterSpacing: "0.12em", color: C.soft }}>
      SOURCE · {text}
    </div>
  );
};

// ---- animated headline (mask reveal, line by line) ------------------------ //
export const Headline: React.FC<{ lines: { t: string; mag?: boolean }[]; size?: number; start?: number; top?: number; lh?: number }> = ({ lines, size = 116, start = 6, top = 720, lh = 1.02 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: SAFE.side, right: SAFE.right, top }}>
      {lines.map((ln, i) => {
        const st = start + i * 7;
        const p = rev(f, st, 22, E.cinematicScale);
        const yClip = interpolate(p, [0, 1], [105, 0]);
        return (
          <div key={i} style={{ overflow: "hidden", paddingBottom: 6 }}>
            <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: size, lineHeight: lh, letterSpacing: "-0.03em", color: ln.mag ? C.mag : C.white, transform: `translateY(${yClip}%)`, opacity: p }}>
              {ln.t}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- synced captions (white, one magenta emphasis), bottom-safe ----------- //
export const Captions: React.FC<{ items: { t: string; e?: string }[]; sceneFrames: number }> = ({ items, sceneFrames }) => {
  const f = useCurrentFrame();
  const totalW = items.reduce((a, c) => a + c.t.length, 0) || 1;
  let acc = 0; const segs = items.map((c) => { const start = (acc / totalW) * (sceneFrames - 14); acc += c.t.length; const end = (acc / totalW) * (sceneFrames - 14); return { ...c, start: start + 2, end }; });
  return (
    <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, bottom: SAFE.bottom - 96, textAlign: "center" }}>
      {segs.map((c, i) => {
        const inP = rev(f, c.start, 8, E.fastReveal);
        const outP = i < segs.length - 1 ? 1 - rev(f, c.end - 2, 8) : 1;
        const op = Math.min(inP, outP);
        if (op <= 0.01) return null;
        const parts = c.e ? c.t.split(new RegExp(`(${c.e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`)) : [c.t];
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, bottom: 0, opacity: op, transform: `translateY(${(1 - inP) * 18}px)`, fontFamily: F.display, fontSize: 46, lineHeight: 1.15, color: C.white, textShadow: "0 2px 30px rgba(0,0,0,0.8)" }}>
            {parts.map((p, k) => <span key={k} style={{ color: p === c.e ? C.mag : C.white }}>{p}</span>)}
          </div>
        );
      })}
    </div>
  );
};

// ---- data counter (count-up hero number) ---------------------------------- //
export const DataCounter: React.FC<{ to: number; prefix?: string; decimals?: number; label: string; note?: string; start?: number }> = ({ to, prefix = "", decimals = 0, label, note, start = 8 }) => {
  const f = useCurrentFrame();
  const v = counter(f, to, start, 34, E.chartEase);
  const sc = interpolate(rev(f, start, 26, E.cinematicScale), [0, 1], [0.9, 1]);
  const labO = rev(f, start + 22, 16);
  return (
    <div style={{ position: "absolute", left: SAFE.side, right: SAFE.right, top: 760 }}>
      <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: 300, lineHeight: 0.86, letterSpacing: "-0.05em", color: C.mag, transform: `scale(${sc})`, transformOrigin: "left center", textShadow: `0 0 60px ${C.magGlow}` }}>
        {prefix}{v.toFixed(decimals)}
      </div>
      <div style={{ marginTop: 26, opacity: labO, fontFamily: F.mono, fontSize: 30, letterSpacing: "0.14em", color: C.white }}>{label}</div>
      {note && <div style={{ marginTop: 12, opacity: labO * 0.7, fontFamily: F.display, fontSize: 34, color: C.soft }}>{note}</div>}
    </div>
  );
};

// ---- animated bar chart (Vox-style, one magenta value) -------------------- //
export const BarChart: React.FC<{ title: string; units: string; bars: { label: string; value: number; hi?: boolean }[]; start?: number }> = ({ title, units, bars, start = 6 }) => {
  const f = useCurrentFrame();
  const max = Math.max(...bars.map((b) => b.value), 1);
  return (
    <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top: 560 }}>
      <div style={{ ...useReveal(start, 18), fontFamily: F.display, fontSize: 58, lineHeight: 1.06, letterSpacing: "-0.02em", color: C.white, maxWidth: 820 }}>{title}</div>
      <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 44 }}>
        {bars.map((b, i) => {
          const st = start + 14 + i * 8;
          const grow = rev(f, st, 26, E.chartEase);
          const w = (b.value / max) * 100 * grow;
          const labO = rev(f, st, 12);
          return (
            <div key={i}>
              <div style={{ opacity: labO, fontFamily: F.mono, fontSize: 27, letterSpacing: "0.06em", color: C.soft, marginBottom: 14 }}>{b.label.toUpperCase()}</div>
              <div style={{ position: "relative", height: 66, background: C.hair, borderRadius: 6, overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, width: `${w}%`, background: b.hi ? C.mag : "rgba(255,255,255,0.88)", borderRadius: 6, boxShadow: b.hi ? `0 0 36px ${C.magGlow}` : "none" }} />
                <div style={{ position: "absolute", right: 22, top: "50%", transform: "translateY(-50%)", opacity: labO, fontFamily: F.mono, fontSize: 34, color: b.hi ? C.white : C.black }}>{Math.round(b.value * grow)}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 40, opacity: rev(f, start + 30, 16) * 0.7, fontFamily: F.mono, fontSize: 23, letterSpacing: "0.1em", color: C.gray }}>{units}</div>
    </div>
  );
};

// ---- cause -> effect chain (Vox-style flow) ------------------------------- //
export const Flow: React.FC<{ steps: string[]; contrast: string; start?: number }> = ({ steps, contrast, start = 6 }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top: 720 }}>
      {steps.map((s, i) => {
        const st = start + i * 14;
        const r = useReveal(st, 18, 40, E.smoothOut);
        const arrowP = i > 0 ? rev(f, st - 6, 12) : 0;
        return (
          <div key={i}>
            {i > 0 && <div style={{ height: 56, width: 3, marginLeft: 14, background: C.mag, transformOrigin: "top", transform: `scaleY(${arrowP})`, opacity: 0.8 }} />}
            <div style={{ ...r, display: "inline-flex", alignItems: "center", gap: 20, padding: "20px 30px", border: `1px solid ${i === steps.length - 1 ? C.mag : C.faint}`, borderRadius: 12, background: i === steps.length - 1 ? C.magDark : "rgba(255,255,255,0.03)" }}>
              <div style={{ width: 9, height: 9, borderRadius: 5, background: i === steps.length - 1 ? C.mag : C.soft }} />
              <span style={{ fontFamily: F.display, fontSize: 46, letterSpacing: "-0.01em", color: i === steps.length - 1 ? C.mag : C.white }}>{s}</span>
            </div>
          </div>
        );
      })}
      <div style={{ ...useReveal(start + steps.length * 14 + 6, 16), marginTop: 44, fontFamily: F.mono, fontSize: 28, letterSpacing: "0.08em", color: C.gray }}>{contrast.toUpperCase()}</div>
    </div>
  );
};

// ---- the Cumulant mark (distribution curve), with line-draw --------------- //
export const Mark: React.FC<{ size?: number; draw?: number }> = ({ size = 200, draw = 1 }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 30 24" fill="none">
    <path d="M2.5 18.6H27.5" stroke={C.white} strokeOpacity={0.4} strokeWidth={1.2} strokeLinecap="round" />
    <path d="M3.5 18.6C8.6 18.6 10 5.6 15 5.6C20 5.6 21.4 18.6 26.5 18.6" stroke={C.white} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <circle cx={23.4} cy={15} r={2} fill={C.mag} opacity={draw > 0.8 ? 1 : 0} />
  </svg>
);

// ---- logo outro lockup ---------------------------------------------------- //
export const LogoOutro: React.FC<{ wordmark: string; tagline: string }> = ({ wordmark, tagline }) => {
  const f = useCurrentFrame();
  const draw = rev(f, 6, 34, E.smoothOut);
  const wm = useReveal(34, 18, 28);
  const tg = useReveal(48, 18, 22);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Mark size={240} draw={draw} />
      <div style={{ ...wm, marginTop: 26, fontFamily: F.display, fontSize: 84, letterSpacing: "-0.02em", color: C.white }}>{wordmark}<span style={{ color: C.mag }}>.</span></div>
      <div style={{ ...tg, marginTop: 26, fontFamily: F.mono, fontSize: 30, letterSpacing: "0.14em", color: C.soft }}>{tagline.toUpperCase()}</div>
    </AbsoluteFill>
  );
};
