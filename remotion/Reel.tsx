// Reel composition v8 — AI bubble. NO music (per request) — deep VO + synced SFX only.
import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile } from "remotion";
import { Background, Fonts } from "./components";
import { SCENES } from "./scenes";
import { reel, sceneStarts } from "./data";
import { FPS, C } from "./theme";

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.3, dur = 28 }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}><Audio src={staticFile(`audio/${src}.mp3`)} volume={vol} /></Sequence>
);

// starts: s1 0, s2 152, s3 331, s4 515, s5 648, s6 795, s7 932, s8 1136, s9 1284,
//         s10 1422, s12 1594, s13 1750, s14 1909, s15 2038, s16 2111
// transition sounds vary by type: zoom->swish, push->snap, slide->swoosh_dn, wipe->glitch, fade->shimmer
const CUES: { src: string; at: number; vol?: number }[] = [
  { src: "riser", at: 0, vol: 0.3 }, { src: "shimmer", at: 6, vol: 0.3 },                       // s1 bubble appears
  { src: "boom", at: 148, vol: 0.46 }, { src: "impact", at: 152, vol: 0.36 }, { src: "glitch", at: 152, vol: 0.3 }, // pause -> DROP (s2 wipe)
  { src: "swish", at: 331, vol: 0.32 }, { src: "clink", at: 339, vol: 0.26 },                   // s3 chip (zoom)
  { src: "snap", at: 515, vol: 0.32 }, { src: "pop", at: 521, vol: 0.26 }, { src: "pop", at: 527, vol: 0.26 }, { src: "pop", at: 533, vol: 0.26 }, { src: "pop", at: 539, vol: 0.26 }, // s4 flow (push)
  { src: "shimmer", at: 648, vol: 0.26 },                                                       // s5 (fade)
  { src: "swoosh_dn", at: 795, vol: 0.3 }, { src: "riser", at: 800, vol: 0.22 },                // s6 bubble inflates (slide)
  { src: "glitch", at: 932, vol: 0.3 }, { src: "tick", at: 940, vol: 0.28 }, { src: "tick", at: 948, vol: 0.28 }, // s7 bar (wipe)
  { src: "swish", at: 1136, vol: 0.3 }, { src: "ding", at: 1144, vol: 0.3 },                    // s8 bubble (zoom)
  { src: "snap", at: 1284, vol: 0.3 }, { src: "down", at: 1302, vol: 0.4 },                     // s9 dot-com line (push)
  { src: "shimmer", at: 1422, vol: 0.26 },                                                      // s10 enter (fade)
  { src: "bubblepop", at: 1563, vol: 0.5 }, { src: "boom", at: 1565, vol: 0.34 },               // THE BURST (on "crashed")
  { src: "glitch", at: 1594, vol: 0.3 }, { src: "coin", at: 1602, vol: 0.34 },                  // s12 money (wipe)
  { src: "swoosh_dn", at: 1750, vol: 0.3 }, { src: "down", at: 1760, vol: 0.24 },               // s13 deflate (slide)
  { src: "snap", at: 1909, vol: 0.28 }, { src: "tick", at: 1917, vol: 0.26 },                   // s14 (push)
  { src: "swish", at: 2038, vol: 0.3 }, { src: "ding", at: 2046, vol: 0.3 },                    // s15 question (zoom)
  { src: "shimmer", at: 2111, vol: 0.28 }, { src: "ding", at: 2118, vol: 0.3 },                 // s16 follow (fade)
];

export const Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Fonts />
      <Background />
      <Series>
        {SCENES.map((Sc, i) => (
          <Series.Sequence key={i} durationInFrames={reel.scenes[i].frames}><Sc /></Series.Sequence>
        ))}
      </Series>
      {reel.scenes.map((s, i) => (
        <Sequence key={`vo${i}`} from={sceneStarts[i] + 1} durationInFrames={Math.ceil(s.vo * FPS) + 4}>
          <Audio src={staticFile(`audio/${s.id}.mp3`)} />
        </Sequence>
      ))}
      {/* NO music bed — VO + SFX only */}
      {CUES.map((c, i) => <Sfx key={i} {...c} />)}
    </AbsoluteFill>
  );
};
