// Story data (v4) — LIGHT mode, one frame per sentence (~15 beats). Each beat has a
// focal visual + a synced subtitle (the spoken sentence). Transitions vary; related
// beats shift subtly, new ideas cut to a fresh visual. Topic: SpaceX spectrum.

export type Line = { t: string; e?: string };
export type Scene = {
  id: string;
  frames: number;
  vo: number;
  kind: "number" | "statement" | "question" | "word" | "object";
  object?: "satellite" | "tower" | "phone";
  num?: { v: string; sub: string };
  lines?: Line[];
  waves?: boolean;
  trans: "zoom" | "push" | "slide" | "wipe" | "fade";
  sub: string; // subtitle = the spoken sentence
};

export const reel = {
  title: "SpaceX Paid $19.6 Billion for the Airwaves Dish Couldn't Turn Into a Network",
  url: "cumulant.org/articles/spacex-19-billion-echostar-spectrum-towers-not-airwaves",

  scenes: [
    { id: "s1", frames: 166, vo: 5.376, kind: "number", num: { v: "$19.6B", sub: "FOR AIRWAVES YOU CAN'T SEE" }, trans: "zoom", sub: "SpaceX just paid $19.6 billion for something you can't even see." },
    { id: "s2", frames: 35, vo: 1.008, kind: "word", lines: [{ t: "Airwaves.", e: "Airwaves" }], waves: true, trans: "fade", sub: "Airwaves." },
    { id: "s3", frames: 130, vo: 4.2, kind: "statement", lines: [{ t: "The right to broadcast" }, { t: "wireless signals.", e: "wireless signals" }], waves: true, trans: "slide", sub: "These are spectrum licenses. The right to broadcast wireless signals." },
    { id: "s4", frames: 171, vo: 5.544, kind: "object", object: "satellite", trans: "zoom", sub: "And SpaceX hinted it could sell you a phone plan, straight from Starlink." },
    { id: "s5", frames: 97, vo: 3.096, kind: "question", lines: [{ t: "A fourth phone" }, { t: "company?", e: "fourth" }], trans: "wipe", sub: "A fourth phone company, finally?" },
    { id: "s6", frames: 102, vo: 3.264, kind: "statement", lines: [{ t: "Here's what" }, { t: "we found.", e: "found" }], trans: "push", sub: "Here's what we found when we dug into the numbers." },
    { id: "s7", frames: 77, vo: 2.424, kind: "statement", lines: [{ t: "The airwaves were" }, { t: "the easy part.", e: "easy" }], trans: "fade", sub: "Buying the airwaves was the easy part." },
    { id: "s8", frames: 205, vo: 6.672, kind: "number", num: { v: "2-4", sub: "MEGABITS, SHARED ACROSS HUNDREDS OF MILES" }, trans: "zoom", sub: "One Starlink beam shares just 2 to 4 megabits, across an area hundreds of miles wide." },
    { id: "s9", frames: 151, vo: 4.872, kind: "object", object: "tower", trans: "wipe", sub: "To turn that into real coverage, you need thousands of cell towers on the ground." },
    { id: "s10", frames: 130, vo: 4.176, kind: "statement", lines: [{ t: "It bankrupted" }, { t: "Dish.", e: "Dish" }], trans: "slide", sub: "And that is exactly what bankrupted the last company that tried. Dish." },
    { id: "s11", frames: 72, vo: 2.256, kind: "question", lines: [{ t: "So why pay" }, { t: "$19.6 billion?", e: "$19.6 billion" }], trans: "push", sub: "So why pay $19.6 billion?" },
    { id: "s12", frames: 159, vo: 5.16, kind: "statement", lines: [{ t: "Leverage over" }, { t: "the carriers.", e: "Leverage" }], trans: "wipe", sub: "It may be leverage, to squeeze a cheaper deal out of the carriers it's now threatening." },
    { id: "s13", frames: 138, vo: 4.44, kind: "object", object: "phone", trans: "zoom", sub: "But a real fourth competitor could mean a lower phone bill for you." },
    { id: "s14", frames: 61, vo: 1.896, kind: "statement", lines: [{ t: "The airwaves" }, { t: "were easy.", e: "easy" }], trans: "fade", sub: "The airwaves were easy." },
    { id: "s15", frames: 82, vo: 2.568, kind: "statement", lines: [{ t: "The towers are" }, { t: "the whole game.", e: "whole game" }], trans: "slide", sub: "The towers are the whole game." },
  ] as Scene[],
};

export const TOTAL_FRAMES = reel.scenes.reduce((a, s) => a + s.frames, 0);
export const sceneStarts: number[] = (() => { const o: number[] = []; let f = 0; for (const s of reel.scenes) { o.push(f); f += s.frames; } return o; })();
