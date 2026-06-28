// Story data (v7) — DARK mode, PLAIN language (FB/IG-friendly). One frame per
// sentence (16 beats), each with a visual; subtitle text comes from CAPTIONS[id].

export type Bar = { label: string; value: number; disp?: string; hi?: boolean };
export type Row = { name: string; note: string; hi?: boolean };
export type Scene = {
  id: string; frames: number; vo: number;
  object?: "money" | "satellite" | "beam" | "tower" | "phone";
  num?: string; chart?: Bar[]; table?: Row[]; line?: boolean; waves?: boolean; follow?: boolean;
  trans: "zoom" | "push" | "slide" | "wipe" | "fade";
};

const COST: Bar[] = [{ label: "THE AIRWAVES", value: 22, disp: "$19.6B" }, { label: "THE NETWORK", value: 100, disp: "$30B+", hi: true }];
const CARRIERS: Row[] = [{ name: "Verizon", note: "#1" }, { name: "AT&T", note: "#2" }, { name: "T-Mobile", note: "#3" }, { name: "SpaceX", note: "the 4th", hi: true }];

export const reel = {
  title: "SpaceX Paid $19.6 Billion for the Airwaves Dish Couldn't Turn Into a Network",
  url: "cumulant.org/articles/spacex-19-billion-echostar-spectrum-towers-not-airwaves",

  scenes: [
    { id: "s1", frames: 160, vo: 4.608, object: "money", num: "$19.6B", trans: "zoom" },
    { id: "s2", frames: 66, vo: 2.064, waves: true, trans: "fade" },
    { id: "s3", frames: 128, vo: 4.104, waves: true, trans: "slide" },
    { id: "s4", frames: 170, vo: 5.52, object: "satellite", trans: "zoom" },
    { id: "s5", frames: 140, vo: 4.512, table: CARRIERS, trans: "wipe" },
    { id: "s6", frames: 107, vo: 3.432, chart: COST, trans: "push" },
    { id: "s7", frames: 72, vo: 2.256, chart: COST, trans: "fade" },
    { id: "s8", frames: 216, vo: 7.056, object: "beam", trans: "zoom" },
    { id: "s9", frames: 129, vo: 4.152, object: "tower", trans: "wipe" },
    { id: "s10", frames: 151, vo: 4.872, line: true, trans: "slide" },
    { id: "s11", frames: 66, vo: 2.064, object: "money", num: "$19.6B", trans: "push" },
    { id: "s12", frames: 137, vo: 4.416, table: CARRIERS, trans: "wipe" },
    { id: "s13", frames: 135, vo: 4.344, object: "phone", trans: "zoom" },
    { id: "s14", frames: 79, vo: 2.472, object: "tower", trans: "slide" },
    { id: "s15", frames: 120, vo: 3.84, object: "satellite", trans: "push" },
    { id: "s16", frames: 136, vo: 4.056, follow: true, trans: "fade" },
  ] as Scene[],
};

export const TOTAL_FRAMES = reel.scenes.reduce((a, s) => a + s.frames, 0);
export const sceneStarts: number[] = (() => { const o: number[] = []; let f = 0; for (const s of reel.scenes) { o.push(f); f += s.frames; } return o; })();
