// Story data (v10) — DST "who really pays" (most recent article). DARK mode, human
// female script. One frame per sentence; subtitle from CAPTIONS[id]. Visual-only ending.

export type Bar = { label: string; value: number; disp?: string; hi?: boolean };
export type Scene = {
  id: string; frames: number; vo: number;
  object?: "gate" | "laptop" | "cart" | "money";
  num?: string; chart?: Bar[]; follow?: boolean;
  trans: "zoom" | "push" | "slide" | "wipe" | "fade";
};

const PASS: Bar[] = [{ label: "THE TAX", value: 100, disp: "1×" }, { label: "WHAT YOU PAY", value: 270, disp: "2.7×", hi: true }];
const REMIT: Bar[] = [{ label: "US FIRMS", value: 23, disp: "23%", hi: true }, { label: "EVERYONE ELSE", value: 77, disp: "77%" }];

export const reel = {
  title: "Who really pays a digital services tax, and who would pay the tariff against it",
  url: "cumulant.org/articles/dst-tariff-incidence-who-pays",

  scenes: [
    { id: "s1", frames: 191, vo: 5.76, object: "gate", num: "100%", trans: "zoom" },
    { id: "s2", frames: 136, vo: 4.392, object: "laptop", trans: "push" },
    { id: "s3", frames: 174, vo: 5.64, object: "money", trans: "fade" },
    { id: "s4", frames: 146, vo: 4.728, object: "laptop", trans: "slide" },
    { id: "s5", frames: 82, vo: 2.568, object: "cart", trans: "wipe" },
    { id: "s6", frames: 156, vo: 5.064, object: "cart", trans: "fade" },
    { id: "s7", frames: 203, vo: 6.624, chart: PASS, trans: "push" },
    { id: "s8", frames: 189, vo: 6.144, object: "cart", trans: "slide" },
    { id: "s9", frames: 156, vo: 5.064, object: "gate", num: "100%", trans: "zoom" },
    { id: "s10", frames: 118, vo: 3.792, object: "gate", trans: "push" },
    { id: "s11", frames: 247, vo: 8.088, object: "money", trans: "wipe" },
    { id: "s12", frames: 63, vo: 1.944, chart: REMIT, trans: "fade" },
    { id: "s13", frames: 213, vo: 6.936, num: "$0", trans: "slide" },
    { id: "s14", frames: 177, vo: 5.76, object: "money", trans: "zoom" },
    { id: "s15", frames: 90, vo: 0, follow: true, trans: "fade" },
  ] as Scene[],
};

export const TOTAL_FRAMES = reel.scenes.reduce((a, s) => a + s.frames, 0);
export const sceneStarts: number[] = (() => { const o: number[] = []; let f = 0; for (const s of reel.scenes) { o.push(f); f += s.frames; } return o; })();
