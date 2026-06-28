// Structured story data (v2): minimal, big-text-only, centered, faster. Each scene
// shows one or two big centered beats synced to the deep VO. Content from the article.

export type Beat = { t: string; e?: string }; // e = the word emphasized in magenta
export type Scene = {
  id: string;
  frames: number;
  vo: number;
  kind: "text" | "object" | "number" | "chart" | "outro";
  object?: "globe" | "barrel" | "coin";
  trans: "flash" | "scale" | "blur"; // entrance transition style
  beats: Beat[];
};

export const reel = {
  title: "The Oil War Premium Round-Tripped in 17 Weeks. The Barrels Did Not.",
  url: "cumulant.org/articles/oil-premium-roundtripped-barrels-did-not",

  scenes: [
    { id: "s1", frames: 181, vo: 5.928, kind: "object", object: "globe", trans: "scale",
      beats: [{ t: "The worst oil scare in years just vanished.", e: "vanished" }, { t: "But the barrels never came back.", e: "never came back" }] },
    { id: "s2", frames: 232, vo: 7.608, kind: "object", object: "barrel", trans: "flash",
      beats: [{ t: "A US strike shut the Strait of Hormuz.", e: "Hormuz" }, { t: "A fifth of the world's oil.", e: "fifth" }] },
    { id: "s3", frames: 168, vo: 5.472, kind: "number", object: "coin", trans: "scale",
      beats: [{ t: "Right back where it started.", e: "started" }] },
    { id: "s4", frames: 196, vo: 6.432, kind: "chart", trans: "blur",
      beats: [{ t: "Price recovered. Oil didn't.", e: "didn't" }] },
    { id: "s5", frames: 160, vo: 5.208, kind: "text", trans: "flash",
      beats: [{ t: "A ceasefire calmed the fear.", e: "fear" }, { t: "The shortage never ended.", e: "never ended" }] },
    { id: "s6", frames: 131, vo: 4.248, kind: "text", trans: "scale",
      beats: [{ t: "A calm price on a fragile supply", e: "" }, { t: "can snap back fast.", e: "snap back fast" }] },
    { id: "s7", frames: 155, vo: 5.064, kind: "outro", trans: "blur", beats: [] },
  ] as Scene[],

  number: { value: 72, prefix: "$", decimals: 0, caption: "BRENT, A BARREL" },
  evidence: {
    bars: [
      { label: "PRICE", value: 100, hi: true },
      { label: "EXPORTS", value: 75 },
      { label: "HORMUZ", value: 35 },
    ],
  },
  outro: { wordmark: "Cumulant", tagline: "Beyond the Norm. Beneath the Headlines." },
};

export const TOTAL_FRAMES = reel.scenes.reduce((a, s) => a + s.frames, 0);
export const sceneStarts: number[] = (() => { const o: number[] = []; let f = 0; for (const s of reel.scenes) { o.push(f); f += s.frames; } return o; })();
