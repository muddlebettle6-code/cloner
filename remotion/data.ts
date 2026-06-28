// Story data (v5) — DARK mode. One frame per sentence (15 beats). EVERY beat has a
// visual (3D object / chart / table / big number / waves) + a short white caption.
// Transitions vary; related beats build on the same visual. Topic: SpaceX spectrum.

export type Line = { t: string; e?: string };
export type Bar = { label: string; value: number; disp?: string; hi?: boolean };
export type Row = { name: string; note: string; hi?: boolean };
export type Scene = {
  id: string; frames: number; vo: number;
  cap?: string; e?: string;                // (legacy label; subtitle text now comes from CAPTIONS[id])
  object?: "money" | "satellite" | "beam" | "tower" | "phone";
  num?: string;                            // big centered number
  chart?: Bar[]; table?: Row[]; line?: boolean; waves?: boolean; lines?: Line[]; follow?: boolean;
  trans: "zoom" | "push" | "slide" | "wipe" | "fade";
};

const COST: Bar[] = [{ label: "AIRWAVES", value: 22, disp: "$19.6B" }, { label: "THE NETWORK", value: 100, disp: "$30B+", hi: true }];
const BANDS: Row[] = [{ name: "AWS-4", note: "2.0 GHz" }, { name: "H-block", note: "1.9 GHz" }, { name: "AWS-3", note: "1.7 GHz" }];
const CARRIERS: Row[] = [{ name: "Verizon", note: "#1" }, { name: "AT&T", note: "#2" }, { name: "T-Mobile", note: "#3" }, { name: "SpaceX", note: "the 4th", hi: true }];

export const reel = {
  title: "SpaceX Paid $19.6 Billion for the Airwaves Dish Couldn't Turn Into a Network",
  url: "cumulant.org/articles/spacex-19-billion-echostar-spectrum-towers-not-airwaves",

  scenes: [
    { id: "s1", frames: 185, vo: 5.376, cap: "SpaceX just paid", object: "money", num: "$19.6B", trans: "zoom" },
    { id: "s2", frames: 35, vo: 1.008, cap: "For airwaves you can't see", e: "airwaves", waves: true, lines: [{ t: "Airwaves.", e: "Airwaves" }], trans: "fade" },
    { id: "s3", frames: 130, vo: 4.2, cap: "Spectrum licenses", table: BANDS, trans: "slide" },
    { id: "s4", frames: 171, vo: 5.544, cap: "Sold straight from Starlink", e: "Starlink", object: "satellite", trans: "zoom" },
    { id: "s5", frames: 97, vo: 3.096, cap: "A fourth carrier, finally?", e: "fourth", table: CARRIERS, trans: "wipe" },
    { id: "s6", frames: 102, vo: 3.264, cap: "So we ran the numbers", e: "numbers", chart: COST, trans: "push" },
    { id: "s7", frames: 77, vo: 2.424, cap: "The airwaves were the easy part", e: "easy", chart: COST, trans: "fade" },
    { id: "s8", frames: 205, vo: 6.672, cap: "One beam, hundreds of miles", object: "beam", num: "2-4", trans: "zoom" },
    { id: "s9", frames: 151, vo: 4.872, cap: "You need thousands of towers", e: "thousands", object: "tower", trans: "wipe" },
    { id: "s10", frames: 130, vo: 4.176, cap: "It bankrupted Dish", e: "Dish", line: true, trans: "slide" },
    { id: "s11", frames: 72, vo: 2.256, cap: "So why pay that much?", object: "money", num: "$19.6B", trans: "push" },
    { id: "s12", frames: 159, vo: 5.16, cap: "Leverage over the carriers", e: "Leverage", table: CARRIERS, trans: "wipe" },
    { id: "s13", frames: 138, vo: 4.44, cap: "A lower phone bill for you", e: "lower", object: "phone", trans: "zoom" },
    { id: "s15", frames: 82, vo: 2.568, cap: "The towers are everything", e: "everything", object: "tower", trans: "slide" },
    { id: "s16", frames: 130, vo: 4.128, cap: "A network, or a bluff?", object: "money", trans: "push" },
    { id: "s17", frames: 136, vo: 4.2, cap: "Follow Cumulant", follow: true, trans: "fade" },
  ] as Scene[],
};

export const TOTAL_FRAMES = reel.scenes.reduce((a, s) => a + s.frames, 0);
export const sceneStarts: number[] = (() => { const o: number[] = []; let f = 0; for (const s of reel.scenes) { o.push(f); f += s.frames; } return o; })();
