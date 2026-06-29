// Story data (housing) — "The sticker that won't move vs the hidden discount."
// DARK mode, warm-female human script, retention-structured, ~44s. Loop: opening
// sticker price flips to the real price at the close. Subtitles from CAPTIONS[id].

export type Tag = { front: string; back?: string; backLabel?: string; flipAt?: number };
export type Scene = {
  id: string; frames: number; vo: number;
  object?: "house" | "houseSold" | "supply";
  tag?: Tag; num?: string;
  dial?: boolean; divergence?: boolean; split?: boolean; cresting?: boolean; follow?: boolean;
  trans: "zoom" | "push" | "slide" | "wipe" | "fade";
};

export const reel = {
  title: "The New-Home Price That Won't Move: builders are cutting 13% without touching the sticker",
  url: "cumulant.org/articles/flat-new-home-price-hidden-buydown-discount",

  scenes: [
    { id: "s1", frames: 178, vo: 5.64, object: "house", tag: { front: "$371,000" }, trans: "fade" },
    { id: "s3", frames: 147, vo: 4.80, object: "supply", trans: "slide" },
    { id: "s4", frames: 121, vo: 3.91, dial: true, trans: "push" },
    { id: "s5", frames: 129, vo: 4.18, num: "$48,000", trans: "fade" },
    { id: "s6", frames: 147, vo: 4.80, divergence: true, trans: "slide" },
    { id: "s7", frames: 163, vo: 5.33, split: true, trans: "push" },
    { id: "s8", frames: 125, vo: 4.06, cresting: true, trans: "fade" },
    { id: "s9", frames: 178, vo: 5.81, object: "houseSold", tag: { front: "$371,000", back: "$323,000", backLabel: "WHAT THEY PAID", flipAt: 105 }, trans: "slide" },
  ] as Scene[],
};

export const TOTAL_FRAMES = reel.scenes.reduce((a, s) => a + s.frames, 0);
export const sceneStarts: number[] = (() => { const o: number[] = []; let f = 0; for (const s of reel.scenes) { o.push(f); f += s.frames; } return o; })();
