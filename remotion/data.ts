// Story data (v8) — the AI bubble explainer. DARK mode, plain language, one frame per
// sentence; the bubble is the recurring motif. Subtitle text comes from CAPTIONS[id].

export type Bar = { label: string; value: number; disp?: string; hi?: boolean };
export type Scene = {
  id: string; frames: number; vo: number;
  object?: "bubble" | "bubbleburst" | "chip" | "datacenter" | "money";
  chart?: Bar[]; line?: boolean; flow?: boolean; follow?: boolean;
  trans: "zoom" | "push" | "slide" | "wipe" | "fade";
};

const SPEND: Bar[] = [{ label: "SPENDING ON AI", value: 100, disp: "HUGE", hi: true }, { label: "PROFIT FROM AI", value: 7, disp: "TINY" }];

export const reel = {
  title: "Is AI a bubble — and how could it burst?",
  url: "cumulant.org",

  scenes: [
    { id: "s1", frames: 152, vo: 4.344, object: "bubble", trans: "zoom" },
    { id: "s2", frames: 179, vo: 5.832, object: "datacenter", trans: "wipe" },
    { id: "s3", frames: 184, vo: 5.976, object: "chip", trans: "zoom" },
    { id: "s4", frames: 133, vo: 4.296, flow: true, trans: "push" },
    { id: "s5", frames: 147, vo: 4.752, flow: true, trans: "fade" },
    { id: "s6", frames: 137, vo: 4.416, object: "bubble", trans: "slide" },
    { id: "s7", frames: 204, vo: 6.648, chart: SPEND, trans: "wipe" },
    { id: "s8", frames: 148, vo: 4.776, object: "bubble", trans: "zoom" },
    { id: "s9", frames: 138, vo: 4.464, line: true, trans: "push" },
    { id: "s10", frames: 172, vo: 5.568, object: "bubbleburst", trans: "fade" },
    { id: "s12", frames: 156, vo: 5.064, object: "money", trans: "wipe" },
    { id: "s13", frames: 159, vo: 5.16, object: "bubble", trans: "slide" },
    { id: "s14", frames: 129, vo: 4.152, line: true, trans: "push" },
    { id: "s15", frames: 73, vo: 2.28, object: "bubble", trans: "zoom" },
    { id: "s16", frames: 130, vo: 3.84, follow: true, trans: "fade" },
  ] as Scene[],
};

export const TOTAL_FRAMES = reel.scenes.reduce((a, s) => a + s.frames, 0);
export const sceneStarts: number[] = (() => { const o: number[] = []; let f = 0; for (const s of reel.scenes) { o.push(f); f += s.frames; } return o; })();
