import type { ArticleChart } from "@/content/types";

const INK = "#1a1a1a";
const SMOKE = "#9a948a";
const CLAY = "#e4e0d8";
const MAG = "#ff2d92";

function fmt(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return String(Math.round(n * 100) / 100);
}

/** Caption frame shared by every chart. */
function Frame({ chart, children }: { chart: ArticleChart; children: React.ReactNode }) {
  const meta = [chart.source && `Source: ${chart.source}`, chart.units, chart.period].filter(Boolean).join("  ·  ");
  return (
    <figure className="my-[8px]" role="group" aria-label={chart.alt}>
      <figcaption className="mb-[14px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-smoke">Figure</p>
        <p className="mt-[6px] text-[17px] font-medium leading-[1.3] text-ink md:text-[18px]">{chart.title}</p>
        {chart.subtitle && <p className="mt-[3px] text-[14px] leading-[1.4] text-smoke">{chart.subtitle}</p>}
      </figcaption>
      <div className="rounded-[6px] border border-clay bg-white p-[18px] md:p-[22px]">{children}</div>
      {chart.note && <p className="mt-[10px] text-[13px] leading-[1.5] text-smoke">{chart.note}</p>}
      {meta && <p className="mt-[8px] font-mono text-[10px] uppercase tracking-[0.04em] text-smoke">{meta}</p>}
    </figure>
  );
}

function KeyNumber({ data }: { data: { value?: string; label?: string; sub?: string } }) {
  return (
    <div className="py-[12px] text-center">
      <p className="text-[48px] font-semibold leading-none tracking-[-1px] text-ink md:text-[64px]" style={{ color: MAG }}>
        {data?.value ?? ""}
      </p>
      {data?.label && <p className="mx-auto mt-[12px] max-w-[420px] text-[15px] leading-[1.4] text-ink">{data.label}</p>}
      {data?.sub && <p className="mt-[6px] text-[13px] text-smoke">{data.sub}</p>}
    </div>
  );
}

function Bars({ data }: { data: { bars?: { label: string; value: number; highlight?: boolean }[]; max?: number } }) {
  const bars = (Array.isArray(data?.bars) ? data.bars : []).slice(0, 12);
  const values = bars.map((b) => Number(b.value) || 0);
  const lo = Math.min(0, ...values);
  const hi = Math.max(0, data?.max ?? 0, ...values);
  const span = hi - lo || 1;
  const zero = ((0 - lo) / span) * 100;
  return (
    <div className="flex flex-col gap-[10px]">
      {bars.map((b, i) => {
        const v = Number(b.value) || 0;
        const left = ((Math.min(v, 0) - lo) / span) * 100;
        const w = (Math.abs(v) / span) * 100;
        // Fixed columns: label | bar track | value. Nothing can spill out.
        return (
          <div key={i} className="grid grid-cols-[minmax(56px,32%)_1fr_auto] items-center gap-[10px]">
            <span className="truncate text-right text-[12px] leading-[1.2] text-ink md:text-[13px]">{b.label}</span>
            <div className="relative h-[20px]">
              <div className="absolute top-0 h-full w-px bg-clay" style={{ left: `${zero}%` }} />
              <div
                className="absolute top-[2px] h-[16px] rounded-[2px]"
                style={{ left: `${left}%`, width: `${Math.max(Math.min(w, 100 - left), 0.5)}%`, background: b.highlight ? MAG : INK }}
              />
            </div>
            <span className="w-[52px] flex-none text-right font-mono text-[12px] tabular-nums text-smoke">{fmt(v)}</span>
          </div>
        );
      })}
    </div>
  );
}

function Line({ data }: { data: { series?: { name: string; points: { x: string; y: number }[] }[]; yLabel?: string } }) {
  const series = Array.isArray(data?.series) ? data.series : [];
  const all = series.flatMap((s) => (s.points || []).map((p) => Number(p.y) || 0));
  if (!all.length) return null;
  const W = 640;
  const H = 240;
  const padL = 44;
  const padB = 28;
  const padT = 10;
  const padR = 12;
  const yMin = Math.min(...all);
  const yMax = Math.max(...all);
  const ySpan = yMax - yMin || 1;
  const n = Math.max(...series.map((s) => (s.points || []).length), 1);
  const x = (i: number) => padL + (i / Math.max(n - 1, 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - yMin) / ySpan) * (H - padT - padB);
  const colors = [INK, MAG, SMOKE];
  const labels = series[0]?.points?.map((p) => p.x) ?? [];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        {[0, 0.5, 1].map((t) => {
          const v = yMin + t * ySpan;
          const yy = y(v);
          return (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={CLAY} strokeWidth={1} />
              <text x={padL - 8} y={yy + 4} textAnchor="end" fontSize="11" fill={SMOKE}>{fmt(v)}</text>
            </g>
          );
        })}
        {series.map((s, si) => {
          const pts = (s.points || []).map((p, i) => `${x(i)},${y(Number(p.y) || 0)}`).join(" ");
          return <polyline key={si} points={pts} fill="none" stroke={colors[si % colors.length]} strokeWidth={2} />;
        })}
        {labels.map((lab, i) => {
          const step = Math.ceil((labels.length || 1) / 6);
          if (i % step !== 0 && i !== labels.length - 1) return null;
          const anchor = i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle";
          return (
            <text key={i} x={x(i)} y={H - 8} textAnchor={anchor} fontSize="11" fill={SMOKE}>{lab}</text>
          );
        })}
      </svg>
      {series.length > 1 && (
        <div className="mt-[8px] flex flex-wrap gap-[14px]">
          {series.map((s, si) => (
            <span key={si} className="flex items-center gap-[6px] text-[12px] text-smoke">
              <span className="inline-block h-[3px] w-[14px]" style={{ background: colors[si % colors.length] }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Timeline({ data }: { data: { events?: { date: string; title: string; detail?: string }[] } }) {
  const events = Array.isArray(data?.events) ? data.events : [];
  return (
    <ol className="relative ml-[6px] border-l border-clay pl-[22px]">
      {events.map((e, i) => (
        <li key={i} className="relative pb-[18px] last:pb-0">
          <span className="absolute -left-[28px] top-[5px] h-[8px] w-[8px] rounded-full" style={{ background: MAG }} />
          <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">{e.date}</p>
          <p className="mt-[3px] text-[15px] leading-[1.35] text-ink">{e.title}</p>
          {e.detail && <p className="mt-[3px] text-[13px] leading-[1.45] text-smoke">{e.detail}</p>}
        </li>
      ))}
    </ol>
  );
}

function Range({ data }: { data: { items?: { label: string; low: number; mid: number; high: number }[] } }) {
  const items = (Array.isArray(data?.items) ? data.items : []).slice(0, 10);
  const all = items.flatMap((it) => [Number(it.low) || 0, Number(it.high) || 0, Number(it.mid) || 0]);
  const lo = Math.min(...all, 0);
  const hi = Math.max(...all, 0);
  const span = hi - lo || 1;
  return (
    <div className="flex flex-col gap-[12px]">
      {items.map((it, i) => {
        const l = ((Number(it.low) - lo) / span) * 100;
        const h = ((Number(it.high) - lo) / span) * 100;
        const m = ((Number(it.mid) - lo) / span) * 100;
        return (
          <div key={i} className="grid grid-cols-[minmax(56px,30%)_1fr_auto] items-center gap-[10px]">
            <span className="truncate text-right text-[12px] leading-[1.2] text-ink md:text-[13px]">{it.label}</span>
            <div className="relative h-[20px]">
              <div className="absolute top-[9px] h-[2px] rounded bg-clay" style={{ left: `${Math.max(l, 0)}%`, width: `${Math.max(Math.min(h - l, 100 - l), 0.5)}%` }} />
              <div className="absolute top-[5px] h-[10px] w-[10px] rounded-full" style={{ left: `calc(${Math.min(Math.max(m, 1), 99)}% - 5px)`, background: MAG }} />
            </div>
            <span className="flex-none text-right font-mono text-[11px] tabular-nums text-smoke">{fmt(Number(it.low))} to {fmt(Number(it.high))}</span>
          </div>
        );
      })}
    </div>
  );
}

function Table({ data }: { data: { columns?: string[]; rows?: string[][] } }) {
  const cols = Array.isArray(data?.columns) ? data.columns : [];
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} className="border-b border-ink py-[8px] pr-[16px] text-left font-mono text-[11px] uppercase tracking-[0.04em] text-smoke">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-clay">
              {r.map((cell, j) => (
                <td key={j} className="py-[8px] pr-[16px] text-ink">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ArticleChartView({ chart }: { chart: ArticleChart }) {
  let body: React.ReactNode = null;
  try {
    if (chart.kind === "keynumber") body = <KeyNumber data={chart.data} />;
    else if (chart.kind === "bar" || chart.kind === "comparison") body = <Bars data={chart.data} />;
    else if (chart.kind === "line") body = <Line data={chart.data} />;
    else if (chart.kind === "timeline") body = <Timeline data={chart.data} />;
    else if (chart.kind === "range") body = <Range data={chart.data} />;
    else if (chart.kind === "table") body = <Table data={chart.data} />;
  } catch {
    body = null;
  }
  if (!body) return null;
  return <Frame chart={chart}>{body}</Frame>;
}
