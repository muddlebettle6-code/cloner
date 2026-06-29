// Housing-story visuals (new). Price tag (flips to reveal the hidden price), live
// divergence line, mortgage-rate dial, cresting-discount bars, 2008-vs-2026 split.
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { C, F, E } from "./theme";
import { rev } from "./components";

// ---- price tag that flips to reveal the real (lower) price ----------------- //
export const PriceTag: React.FC<{ front: string; back?: string; backLabel?: string; flipAt?: number; start?: number; centerY?: number }> = ({ front, back, backLabel = "REAL PRICE", flipAt, start = 4, centerY = 940 }) => {
  const f = useCurrentFrame();
  const inP = rev(f, start, 9, E.softOvershoot);
  const sway = Math.sin(f / 34) * 2;
  const flip = flipAt != null ? rev(f, flipAt, 18, E.cinematicScale) : 0;
  const rot = flip * 180;
  const face = (mag: boolean): React.CSSProperties => ({ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 28, background: mag ? C.mag : "#efe9dc", border: `3px solid ${mag ? C.mag : "rgba(0,0,0,0.12)"}`, boxShadow: `0 30px 80px rgba(0,0,0,0.5)${mag ? `, 0 0 60px ${C.magGlow}` : ""}`, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" });
  return (
    <div style={{ position: "absolute", left: "50%", top: centerY, transform: `translate(-50%,-50%) rotate(${sway}deg) scale(${0.72 + inP * 0.28})`, opacity: inP, perspective: 1600 }}>
      <div style={{ position: "absolute", left: "50%", bottom: "calc(100% - 6px)", width: 5, height: 150, background: "rgba(255,255,255,0.28)", transform: "translateX(-50%)" }} />
      <div style={{ position: "relative", width: 500, height: 320, transformStyle: "preserve-3d", transform: `rotateY(${rot}deg)` }}>
        <div style={{ width: 24, height: 24, borderRadius: 12, background: C.black, border: "3px solid rgba(0,0,0,0.2)", position: "absolute", top: 22, left: "50%", marginLeft: -12, zIndex: 2 }} />
        <div style={face(false)}>
          <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: "0.14em", color: "rgba(0,0,0,0.5)" }}>STICKER</div>
          <div style={{ fontFamily: F.display, fontSize: 116, letterSpacing: "-0.04em", color: "#15120d", lineHeight: 1 }}>{front}</div>
        </div>
        {back && (
          <div style={{ ...face(true), transform: "rotateY(180deg)" }}>
            <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: "0.14em", color: "rgba(255,255,255,0.8)" }}>{backLabel}</div>
            <div style={{ fontFamily: F.display, fontSize: 116, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1 }}>{back}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- divergence line: headline flat vs effective falling -13% (draws live) -- //
export const DivergenceLine: React.FC<{ start?: number; centerY?: number }> = ({ start = 4, centerY = 960 }) => {
  const f = useCurrentFrame();
  const p = rev(f, start, 38, E.smoothOut);
  const X0 = 70, X1 = 1010, n = 40;
  const headY = 230, effEnd = 470; // effective drops to -13%
  const head: [number, number][] = [], eff: [number, number][] = [];
  for (let i = 0; i <= n; i++) { const t = i / n; const x = X0 + (X1 - X0) * t; head.push([x, headY]); eff.push([x, t < 0.4 ? headY : headY + (effEnd - headY) * E.smoothInOut((t - 0.4) / 0.6)]); }
  const k = Math.max(1, Math.ceil(p * n));
  const hd = head.slice(0, k), ed = eff.slice(0, k);
  const area = `M ${hd.map((d) => d.join(",")).join(" L ")} L ${ed.slice().reverse().map((d) => d.join(",")).join(" L ")} Z`;
  return (
    <svg width="1080" height="640" viewBox="0 0 1080 640" style={{ position: "absolute", left: "50%", top: centerY, transform: "translate(-50%,-50%)" }}>
      <path d={area} fill={C.mag} opacity={p * 0.14} />
      <polyline points={hd.map((d) => d.join(",")).join(" ")} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
      <polyline points={ed.map((d) => d.join(",")).join(" ")} fill="none" stroke={C.mag} strokeWidth={9} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 16px ${C.magGlow})` }} />
      <text x={X1 - 6} y={headY - 26} fontFamily={F.display} fontSize={40} fill="#fff" textAnchor="end" opacity={rev(f, start + 6, 12)}>HEADLINE: flat</text>
      {p > 0.7 && <text x={ed[ed.length - 1][0]} y={ed[ed.length - 1][1] + 64} fontFamily={F.display} fontSize={56} fill={C.mag} textAnchor="end">EFFECTIVE: −13%</text>}
    </svg>
  );
};

// ---- mortgage-rate dial: needle sweeps down (the buydown) ------------------- //
export const RateDial: React.FC<{ from?: number; to?: number; start?: number; centerY?: number }> = ({ from = 6.9, to = 4.9, start = 4, centerY = 920 }) => {
  const f = useCurrentFrame();
  const p = rev(f, start + 1, 20, E.chartEase);
  const val = from + (to - from) * p;
  const a0 = -200, a1 = 20; // sweep range (deg)
  const ang = a0 + (a1 - a0) * (1 - (val - to) / (from - to)); // higher rate = left
  const cx = 540, cy = 470, R = 250;
  const rad = (d: number) => (d * Math.PI) / 180;
  const arc = (s: number, e: number) => `M ${cx + R * Math.cos(rad(s))} ${cy + R * Math.sin(rad(s))} A ${R} ${R} 0 ${e - s > 180 ? 1 : 0} 1 ${cx + R * Math.cos(rad(e))} ${cy + R * Math.sin(rad(e))}`;
  return (
    <svg width="1080" height="640" viewBox="0 0 1080 640" style={{ position: "absolute", left: "50%", top: centerY, transform: "translate(-50%,-50%)" }}>
      <path d={arc(a0, a1)} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={26} strokeLinecap="round" />
      <path d={arc(a0, ang)} fill="none" stroke={C.mag} strokeWidth={26} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 18px ${C.magGlow})` }} opacity={rev(f, start, 12)} />
      <line x1={cx} y1={cy} x2={cx + (R - 30) * Math.cos(rad(ang))} y2={cy + (R - 30) * Math.sin(rad(ang))} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={18} fill="#fff" />
      <text x={cx} y={cy + 158} fontFamily={F.display} fontSize={132} fill={C.mag} textAnchor="middle" letterSpacing="-0.04em">{val.toFixed(1)}%</text>
      <text x={cx} y={cy + 222} fontFamily={F.mono} fontSize={30} fill={C.soft} textAnchor="middle" letterSpacing="0.12em">YOUR MORTGAGE RATE</text>
    </svg>
  );
};

// ---- cresting-discount bars (14.5 -> 14.1 -> 12.9, the deals fading) -------- //
export const CrestingBars: React.FC<{ start?: number; centerY?: number }> = ({ start = 4, centerY = 980 }) => {
  const f = useCurrentFrame();
  const data = [{ l: "3 q's ago", v: 14.5 }, { l: "2 q's ago", v: 14.1 }, { l: "now", v: 12.9, hi: true }];
  const max = 16;
  return (
    <div style={{ position: "absolute", left: 130, right: 130, top: centerY - 260, height: 520, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
      {data.map((d, i) => {
        const g = rev(f, start + i * 5, 15, E.chartEase); const h = (d.v / max) * 100 * g;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ fontFamily: F.display, fontSize: 64, color: d.hi ? C.mag : "#fff", marginBottom: 12, opacity: rev(f, start + i * 5, 11) }}>{(d.v * g).toFixed(1)}%</div>
            <div style={{ width: "70%", height: `${h}%`, background: d.hi ? C.mag : "rgba(255,255,255,0.85)", borderRadius: "8px 8px 0 0", boxShadow: d.hi ? `0 0 40px ${C.magGlow}` : "none" }} />
            <div style={{ fontFamily: F.mono, fontSize: 28, color: C.soft, marginTop: 16, opacity: rev(f, start + i * 5, 11) }}>{d.l.toUpperCase()}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---- 2008 vs 2026: same stress, opposite optics ---------------------------- //
export const Split2008: React.FC<{ start?: number; centerY?: number }> = ({ start = 4, centerY = 960 }) => {
  const f = useCurrentFrame();
  const col = (label: string, sticker: number, hidden: number | null, x: number, st: number) => {
    const p = rev(f, st, 11, E.softOvershoot);
    return (
      <div style={{ position: "absolute", left: x, top: 0, width: 430, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
        <div style={{ fontFamily: F.display, fontSize: 56, color: "#fff", marginBottom: 30 }}>{label}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 30, alignItems: "flex-end", height: 280 }}>
          <div style={{ textAlign: "center" }}><div style={{ width: 120, height: Math.abs(sticker) * 16 * rev(f, st + 4, 13), background: "rgba(255,255,255,0.85)", borderRadius: 6, marginBottom: 12 }} /><div style={{ fontFamily: F.display, fontSize: 44, color: "#fff" }}>{sticker}%</div><div style={{ fontFamily: F.mono, fontSize: 24, color: C.soft }}>STICKER</div></div>
          {hidden != null && <div style={{ textAlign: "center" }}><div style={{ width: 120, height: Math.abs(hidden) * 16 * rev(f, st + 7, 13), background: C.mag, borderRadius: 6, marginBottom: 12, boxShadow: `0 0 36px ${C.magGlow}` }} /><div style={{ fontFamily: F.display, fontSize: 44, color: C.mag }}>{hidden}%</div><div style={{ fontFamily: F.mono, fontSize: 24, color: C.soft }}>REAL</div></div>}
        </div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: centerY - 220, height: 440 }}>
      {col("2008", -10, null, 70, start)}
      {col("2026", 0, -13, 580, start + 6)}
    </div>
  );
};
