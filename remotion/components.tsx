// Cumulant reel components v4 — LIGHT mode. Cream page, ink text, magenta accent.
// One frame per sentence + a synced subtitle. Varied transitions (zoom/push/slide/wipe/fade).
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

// ---- light background: cream + soft gradient + faint magenta wash + grain ---- //
const GRAIN = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>`);

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const d = interpolate(f % 360, [0, 180, 360], [0, 1, 0], { easing: E.slowDrift });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 28%, #faf8f3 0%, ${C.bg} 52%, ${C.bg2} 125%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(46% 30% at 50% ${30 + d * 4}%, ${C.magSoft} 0%, transparent 60%)`, opacity: 0.9 }} />
      <AbsoluteFill style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: "200px 200px", opacity: 0.025, mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(135% 100% at 50% 46%, transparent 55%, rgba(23,20,15,0.10) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---- transitions: entrance varies; "full"-change exits fly through ---------- //
export const SceneWrap: React.FC<{ frames: number; trans: "zoom" | "push" | "slide" | "wipe" | "fade"; children: React.ReactNode }> = ({ frames, trans, children }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: E.smoothOut });
  const outP = interpolate(f, [frames - 9, frames], [1, 0], { extrapolateLeft: "clamp", easing: E.smoothIn });
  let scale = 1, x = 0, blur = 0;
  if (trans === "zoom") { scale = interpolate(inP, [0, 1], [1.28, 1]); blur += (1 - inP) * 10; }
  if (trans === "push") { scale = interpolate(inP, [0, 1], [0.78, 1]); blur += (1 - inP) * 8; }
  if (trans === "slide") x = interpolate(inP, [0, 1], [260, 0]);
  if (trans === "fade") blur += (1 - inP) * 6;
  const strong = trans === "zoom" || trans === "wipe" || trans === "push";
  if (strong) { scale *= interpolate(outP, [0, 1], [1.3, 1]); blur += (1 - outP) * 14; } else { x += interpolate(outP, [0, 1], [-180, 0]); blur += (1 - outP) * 6; }
  return (
    <>
      <AbsoluteFill style={{ opacity: Math.min(inP, outP), filter: blur > 0.3 ? `blur(${blur}px)` : undefined, transform: `translateX(${x}px) scale(${scale})` }}>{children}</AbsoluteFill>
      {trans === "wipe" && <AbsoluteFill style={{ background: C.mag, transform: `translateX(${interpolate(inP, [0, 1], [-1080, 1180], { easing: E.cinematicScale })}px)` }} />}
    </>
  );
};

// ---- subtitle: spoken sentence, synced word-group reveal, ink + magenta key -- //
export const Subtitle: React.FC<{ text: string; e?: string; sceneFrames: number; centerY?: number }> = ({ text, e, sceneFrames, centerY = 1500 }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const groups: string[] = []; for (let i = 0; i < words.length; i += 3) groups.push(words.slice(i, i + 3).join(" "));
  const span = Math.max(12, sceneFrames * 0.55);
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top: centerY, transform: "translateY(-50%)", textAlign: "center" }}>
      <div style={{ fontFamily: F.display, fontSize: 50, lineHeight: 1.22, letterSpacing: "-0.01em", color: C.ink }}>
        {groups.map((g, i) => {
          const p = rev(f, (i / groups.length) * span + 2, 9, E.fastReveal);
          if (p <= 0.01) return null;
          return <span key={i} style={{ opacity: p }}>{emph(g, e).map((s, k) => <span key={k} style={{ color: s.toLowerCase() === (e || "").toLowerCase() && e ? C.mag : C.ink }}>{s}</span>)} </span>;
        })}
      </div>
    </div>
  );
};

// ---- big focal statement (punchy, ink + magenta emphasis) ------------------ //
const sizeFor = (lines: { t: string }[]) => { const n = Math.max(...lines.map((l) => l.t.length)); return n > 22 ? 128 : n > 14 ? 150 : 168; };
export const BigStatement: React.FC<{ lines: { t: string; e?: string }[]; start?: number; centerY?: number }> = ({ lines, start = 5, centerY = 780 }) => {
  const f = useCurrentFrame();
  const size = sizeFor(lines);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: centerY, transform: "translateY(-50%)", textAlign: "center" }}>
      {lines.map((ln, i) => {
        const p = rev(f, start + i * 6, 15, E.cinematicScale);
        return (
          <div key={i} style={{ overflow: "hidden" }}>
            <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: size, lineHeight: 1.02, letterSpacing: "-0.035em", color: C.ink, opacity: p, transform: `translateY(${(1 - p) * 60}px)` }}>
              {emph(ln.t, ln.e).map((s, k) => <span key={k} style={{ color: s.toLowerCase() === (ln.e || "").toLowerCase() && ln.e ? C.mag : C.ink }}>{s}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- huge number ----------------------------------------------------------- //
export const BigNumber: React.FC<{ value: string; sub: string; start?: number; centerY?: number }> = ({ value, sub, start = 6, centerY = 760 }) => {
  const f = useCurrentFrame();
  const sc = interpolate(rev(f, start, 18, E.softOvershoot), [0, 1], [0.64, 1]);
  const subP = rev(f, start + 14, 14);
  const size = value.length > 5 ? 296 : value.length > 3 ? 360 : 430;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: centerY, transform: "translateY(-50%)", textAlign: "center" }}>
      <div style={{ fontFamily: F.display, fontWeight: 400, fontSize: size, lineHeight: 0.82, letterSpacing: "-0.05em", color: C.mag, transform: `scale(${sc})`, textShadow: `0 16px 60px ${C.magGlow}` }}>{value}</div>
      <div style={{ marginTop: 30, opacity: subP, fontFamily: F.display, fontSize: 46, letterSpacing: "-0.01em", color: C.soft }}>{sub}</div>
    </div>
  );
};

// ---- spectrum waves (for the airwaves beats) ------------------------------- //
export const Waves: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const f = useCurrentFrame();
  const p = rev(f, start, 18);
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, opacity: p * 0.6 }}>
      {Array.from({ length: 5 }).map((_, i) => {
        const amp = 26 + i * 10; const yb = 640 + i * 18; const ph = f * 0.08 + i;
        const pts = Array.from({ length: 37 }).map((_, k) => `${k * 30},${yb + Math.sin(k * 0.5 + ph) * amp}`).join(" ");
        return <polyline key={i} points={pts} fill="none" stroke={C.mag} strokeOpacity={0.5 - i * 0.07} strokeWidth={3} />;
      })}
    </svg>
  );
};
