// Story data (v9) — the oil-spike / May-4.1%-inflation story. DARK mode, human
// conversational script (female VO). One frame per sentence; subtitle from CAPTIONS[id].
// Ends on a VISUAL-ONLY logo (no spoken outro).

export type Bar = { label: string; value: number; disp?: string; hi?: boolean };
export type Scene = {
  id: string; frames: number; vo: number;
  object?: "barrel" | "thermometer" | "flame" | "gaspump" | "money";
  level?: number;            // thermometer mercury level
  num?: string; chart?: Bar[]; line?: boolean; follow?: boolean;
  trans: "zoom" | "push" | "slide" | "wipe" | "fade";
};

const READINGS: Bar[] = [{ label: "HEADLINE", value: 4.1, disp: "4.1%", hi: true }, { label: "CORE", value: 3.4, disp: "3.4%" }, { label: "CALM MIDDLE", value: 2.4, disp: "2.4%" }];

export const reel = {
  title: "The Oil Spike Behind May's 4.1% Inflation Has Already Round-Tripped. The Fed Turned Hawkish Anyway.",
  url: "cumulant.org/articles/may-pce-4-1-percent-oil-roundtrip-fed-hawkish",

  scenes: [
    { id: "s1", frames: 213, vo: 6.48, object: "thermometer", level: 0.9, trans: "zoom" },
    { id: "s2", frames: 121, vo: 3.888, object: "barrel", trans: "push" },
    { id: "s3", frames: 125, vo: 4.032, object: "barrel", trans: "fade" },
    { id: "s4", frames: 142, vo: 4.584, object: "barrel", num: "$120", trans: "slide" },
    { id: "s5", frames: 179, vo: 5.808, line: true, trans: "wipe" },
    { id: "s6", frames: 192, vo: 6.24, object: "gaspump", trans: "zoom" },
    { id: "s7", frames: 125, vo: 4.032, chart: READINGS, trans: "push" },
    { id: "s8", frames: 165, vo: 5.352, line: true, trans: "slide" },
    { id: "s9", frames: 171, vo: 5.544, object: "thermometer", level: 0.45, num: "2.4%", trans: "fade" },
    { id: "s10", frames: 79, vo: 2.472, object: "thermometer", level: 0.42, trans: "zoom" },
    { id: "s11", frames: 233, vo: 7.608, object: "money", trans: "wipe" },
    { id: "s12", frames: 112, vo: 3.6, object: "flame", trans: "push" },
    { id: "s13", frames: 213, vo: 6.936, object: "money", trans: "slide" },
    { id: "s14", frames: 208, vo: 6.792, object: "thermometer", level: 0.6, trans: "zoom" },
    { id: "s15", frames: 90, vo: 0, follow: true, trans: "fade" },
  ] as Scene[],
};

export const TOTAL_FRAMES = reel.scenes.reduce((a, s) => a + s.frames, 0);
export const sceneStarts: number[] = (() => { const o: number[] = []; let f = 0; for (const s of reel.scenes) { o.push(f); f += s.frames; } return o; })();
