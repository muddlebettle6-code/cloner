// Structured story data for the test reel. Content is separated from presentation
// so Cumulant agents can later supply this object and the system renders the video.
// Facts taken ONLY from the source article; nothing invented.

export type Caption = { t: string; e?: string }; // e = the one word/number emphasized in magenta
export type Scene = {
  id: string;
  role: "hook" | "context" | "number" | "evidence" | "why" | "next" | "outro";
  frames: number; // = ceil(vo*30)+6
  vo: number; // voiceover seconds
  captions: Caption[];
};

export const reel = {
  title: "The Oil War Premium Round-Tripped in 17 Weeks. The Barrels Did Not.",
  url: "cumulant.org/articles/oil-premium-roundtripped-barrels-did-not",
  topic: "ENERGY · CRUDE OIL",
  date: "26 JUNE 2026",
  sources: ["OilPrice.com", "Al Jazeera", "CNBC", "Euronews"],

  scenes: [
    { id: "s1", role: "hook", frames: 166, vo: 5.328, captions: [{ t: "On paper, the oil crisis is over" }, { t: "The shortage is not", e: "not" }] },
    { id: "s2", role: "context", frames: 229, vo: 7.416, captions: [{ t: "A US strike shut the Strait of Hormuz" }, { t: "the world's top oil chokepoint" }, { t: "Oil spiked", e: "spiked" }] },
    { id: "s3", role: "number", frames: 196, vo: 6.312, captions: [{ t: "By late June, Brent crude round-tripped" }, { t: "back to about $72", e: "$72" }] },
    { id: "s4", role: "evidence", frames: 190, vo: 6.12, captions: [{ t: "The price recovered faster than the oil" }, { t: "Exports run near 75% of normal", e: "75%" }] },
    { id: "s5", role: "why", frames: 205, vo: 6.624, captions: [{ t: "A ceasefire cut the odds of another blockade" }, { t: "not because the oil returned", e: "not" }] },
    { id: "s6", role: "next", frames: 196, vo: 6.312, captions: [{ t: "A calm price on a fragile supply" }, { t: "can snap back fast", e: "fast" }] },
    { id: "s7", role: "outro", frames: 148, vo: 4.728, captions: [] },
  ] as Scene[],

  // the hero stat (count-up)
  number: { value: 71.99, prefix: "$", decimals: 2, label: "BRENT CLOSE · 26 JUN 2026", note: "round-trip from a $126 peak", source: "OILPRICE · AL JAZEERA" },

  // the evidence bar chart (price recovered, barrels did not)
  evidence: {
    title: "Price recovered. The barrels did not.",
    units: "% OF PRE-WAR NORMAL",
    bars: [
      { label: "Brent price", value: 100, hi: true },
      { label: "Gulf exports", value: 75 },
      { label: "Hormuz flow", value: 35 },
    ],
    source: "OILPRICE · CNBC",
  },

  // the context object scene
  context: { object: "Crude barrel", note1: "STRAIT OF HORMUZ", note2: "~20% of seaborne oil", spike: "+75% peak" },

  // the cause -> effect chain
  why: { cause: "18 JUN CEASEFIRE", mid: "BLOCKADE ODDS FELL", effect: "PRICE FELL", contrast: "Supply never confirmed back" },

  // what to watch
  next: { line1: "Oil → gasoline · inflation · rates", watch: "WATCH: HORMUZ FLOWS" },

  outro: { wordmark: "Cumulant", tagline: "Beyond the Norm. Beneath the Headlines." },
};

export const TOTAL_FRAMES = reel.scenes.reduce((a, s) => a + s.frames, 0); // 1330 ≈ 44.3s

// cumulative start frame of each scene (for audio placement)
export const sceneStarts: number[] = (() => {
  const out: number[] = []; let f = 0;
  for (const s of reel.scenes) { out.push(f); f += s.frames; }
  return out;
})();
