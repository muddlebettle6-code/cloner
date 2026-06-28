// Charts, tables, graphs (dark mode). All text white; magenta = the key value.
import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { C, F, E } from "./theme";
import { rev } from "./components";

// animated bar chart
export const BarChart: React.FC<{ bars: { label: string; value: number; disp?: string; hi?: boolean }[]; start?: number; centerY?: number }> = ({ bars, start = 4, centerY = 960 }) => {
  const f = useCurrentFrame();
  const max = Math.max(...bars.map((b) => b.value));
  const top = centerY - bars.length * 60;
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top, display: "flex", flexDirection: "column", gap: 50 }}>
      {bars.map((b, i) => {
        const st = start + i * 8; const grow = rev(f, st, 24, E.chartEase); const o = rev(f, st, 12);
        return (
          <div key={i} style={{ opacity: o }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
              <span style={{ fontFamily: F.display, fontSize: 56, letterSpacing: "-0.02em", color: b.hi ? C.mag : C.white }}>{b.label}</span>
              <span style={{ fontFamily: F.display, fontSize: 64, letterSpacing: "-0.03em", color: b.hi ? C.mag : C.white }}>{b.disp ?? Math.round(b.value * grow)}</span>
            </div>
            <div style={{ height: 34, background: C.hair, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(b.value / max) * 100 * grow}%`, background: b.hi ? C.mag : C.white, borderRadius: 6, boxShadow: b.hi ? `0 0 44px ${C.magGlow}` : "none" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// comparison table (e.g., the carriers); the challenger row is magenta
export const Table: React.FC<{ rows: { name: string; note: string; hi?: boolean }[]; start?: number; centerY?: number }> = ({ rows, start = 4, centerY = 960 }) => {
  const f = useCurrentFrame();
  const top = centerY - rows.length * 62;
  return (
    <div style={{ position: "absolute", left: 110, right: 110, top, display: "flex", flexDirection: "column", gap: 26 }}>
      {rows.map((r, i) => {
        const p = rev(f, start + i * 7, 16, E.softOvershoot);
        return (
          <div key={i} style={{ opacity: p, transform: `translateX(${(1 - p) * (r.hi ? 70 : -70)}px)`, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "30px 44px", borderRadius: 20, border: `2px solid ${r.hi ? C.mag : C.hair}`, background: r.hi ? C.magSoft : "rgba(255,255,255,0.03)" }}>
            <span style={{ fontFamily: F.display, fontSize: 70, letterSpacing: "-0.025em", color: r.hi ? C.mag : C.white }}>{r.name}</span>
            <span style={{ fontFamily: F.display, fontSize: 44, color: r.hi ? C.mag : C.white }}>{r.note}</span>
          </div>
        );
      })}
    </div>
  );
};

// circular money flow — nodes in a ring, a flowing dashed loop (money in circles)
export const CircleFlow: React.FC<{ start?: number; centerY?: number }> = ({ start = 4, centerY = 960 }) => {
  const f = useCurrentFrame();
  const p = rev(f, start, 22, E.smoothOut);
  const cx = 540, cy = 440, R = 250;
  const labels = ["AI Co.", "$", "Chips", "$"];
  return (
    <svg width="1080" height="880" viewBox="0 0 1080 880" style={{ position: "absolute", left: "50%", top: centerY, transform: "translate(-50%,-50%)" }}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.mag} strokeWidth={7} strokeDasharray="34 26" strokeDashoffset={-f * 2.4} opacity={p * 0.85} style={{ filter: `drop-shadow(0 0 16px ${C.magGlow})` }} />
      {labels.map((lb, i) => {
        const a = (i / labels.length) * 2 * Math.PI - Math.PI / 2;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        const np = rev(f, start + i * 5, 16, E.softOvershoot);
        return (
          <g key={i} opacity={np} transform={`translate(${x},${y}) scale(${0.6 + np * 0.4})`}>
            <circle r={64} fill={C.bg2} stroke={lb === "$" ? C.mag : C.white} strokeWidth={3} />
            <text y={20} fontFamily={F.display} fontSize={lb === "$" ? 64 : 40} fill={lb === "$" ? C.mag : C.white} textAnchor="middle">{lb}</text>
          </g>
        );
      })}
    </svg>
  );
};

// declining line chart (the collapse) — draws up then crashes down
export const LineChart: React.FC<{ start?: number; centerY?: number }> = ({ start = 4, centerY = 960 }) => {
  const f = useCurrentFrame();
  const p = rev(f, start, 40, E.smoothOut);
  const pts = "60,300 230,250 400,150 560,120 700,230 840,430 960,540";
  const arr = pts.split(" ").map((s) => s.split(",").map(Number));
  const drawn = arr.slice(0, Math.max(2, Math.ceil(p * arr.length)));
  const endPt = drawn[drawn.length - 1];
  const dotP = rev(f, start + 30, 10, E.softOvershoot);
  return (
    <svg width="1020" height="640" viewBox="0 0 1020 640" style={{ position: "absolute", left: "50%", top: centerY, transform: "translate(-50%,-50%)" }}>
      <line x1="40" y1="560" x2="980" y2="560" stroke={C.hair} strokeWidth="2" />
      <polyline points={drawn.map((d) => d.join(",")).join(" ")} fill="none" stroke={C.mag} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 18px ${C.magGlow})` }} />
      {p > 0.7 && <circle cx={endPt[0]} cy={endPt[1]} r={18 * dotP} fill={C.mag} />}
      {p > 0.85 && <text x={endPt[0] - 10} y={endPt[1] + 70} fontFamily={F.display} fontSize="64" fill={C.mag} textAnchor="middle">↓</text>}
    </svg>
  );
};
