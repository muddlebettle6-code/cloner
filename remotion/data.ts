// Story data (v3) — 0x100x language: pure black, a running top caption + a big focal
// statement / number / 3D object per beat, flowy transitions, no end card.
// Topic: the AI memory shock (article facts only). Faster, ~29.4s.

export type Line = { t: string; e?: string };
export type Scene = {
  id: string;
  frames: number;
  vo: number;
  kind: "object" | "statement" | "number" | "chart";
  object?: "chip" | "phone" | "bars";
  trans: "zoom" | "push" | "whoosh"; // entrance transition style
  cap: string;           // running top caption (the connective idea)
  lines?: Line[];        // big centered statement
  num?: { value: string; sub: string }; // big number beat
};

export const reel = {
  title: "The AI memory shock is regressive: where memory is most of the machine, the price jumps most",
  url: "cumulant.org/articles/ai-memory-shock-regressive-device-prices",

  scenes: [
    { id: "s1", frames: 116, vo: 3.744, kind: "object", object: "chip", trans: "zoom",
      cap: "The chip inside everything", lines: [{ t: "The AI boom just hit" }, { t: "your wallet.", e: "wallet" }] },
    { id: "s2", frames: 150, vo: 4.896, kind: "object", object: "phone", trans: "push",
      cap: "June 25, 2026", lines: [{ t: "Apple and Microsoft raised prices." }, { t: "They blamed memory.", e: "memory" }] },
    { id: "s3", frames: 184, vo: 6.024, kind: "number", trans: "whoosh",
      cap: "AI data centers are eating the supply", num: { value: "+92%", sub: "WHOLESALE MEMORY, ONE QUARTER" } },
    { id: "s4", frames: 145, vo: 4.728, kind: "chart", trans: "zoom",
      cap: "The cheapest gadgets jumped the most", lines: [] },
    { id: "s5", frames: 167, vo: 5.448, kind: "number", trans: "push",
      cap: "Inside your next computer", num: { value: "23%", sub: "OF THE COST IS MEMORY — UP FROM 16%" } },
    { id: "s6", frames: 119, vo: 3.84, kind: "statement", trans: "whoosh",
      cap: "The catch", lines: [{ t: "Chip prices always fall back." }, { t: "Your receipts won't.", e: "won't" }] },
  ] as Scene[],

  evidence: {
    bars: [
      { label: "APPLE TV", value: 54, hi: true },
      { label: "XBOX SERIES S", value: 33 },
      { label: "IPAD", value: 29 },
    ],
    unit: "%",
  },
};

export const TOTAL_FRAMES = reel.scenes.reduce((a, s) => a + s.frames, 0);
export const sceneStarts: number[] = (() => { const o: number[] = []; let f = 0; for (const s of reel.scenes) { o.push(f); f += s.frames; } return o; })();
