// Reel composition (housing) — warm female VO + story-matched SFX, NO music.
// SFX: paper for the tag, mechanical for the dial, soft thuds for supply, a crack
// for the "cracking" line, a stamp for the flip reveal. Varied, never one whoosh.
import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile } from "remotion";
import { Background, Fonts } from "./components";
import { SCENES } from "./scenes";
import { reel, sceneStarts } from "./data";
import { FPS, C } from "./theme";

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.3, dur = 28 }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}><Audio src={staticFile(`audio/${src}.mp3`)} volume={vol} /></Sequence>
);

// starts: s1 0, s3 178, s4 325, s5 446, s6 575, s7 722, s8 885, s9 1010 (flip @1115)
const CUES: { src: string; at: number; vol?: number }[] = [
  { src: "impact", at: 2, vol: 0.24 }, { src: "paper", at: 7, vol: 0.34 }, { src: "riser", at: 168, vol: 0.22 },  // s1 house + sticker, hook pause->drop
  { src: "swoosh_dn", at: 178, vol: 0.24 }, { src: "impact", at: 184, vol: 0.16 }, { src: "impact", at: 189, vol: 0.16 }, { src: "impact", at: 194, vol: 0.16 }, // s3 houses pile
  { src: "swish", at: 325, vol: 0.24 }, { src: "clink", at: 333, vol: 0.2 }, { src: "tick", at: 343, vol: 0.18 }, // s4 dial sweep
  { src: "shimmer", at: 446, vol: 0.22 }, { src: "impact", at: 458, vol: 0.34 },                                 // s5 $48k lands
  { src: "swoosh_dn", at: 575, vol: 0.24 }, { src: "crack", at: 600, vol: 0.36 },                                // s6 line cracks down
  { src: "snap", at: 722, vol: 0.26 }, { src: "clink", at: 732, vol: 0.2 }, { src: "clink", at: 742, vol: 0.2 }, // s7 2008 vs 2026 bars
  { src: "shimmer", at: 885, vol: 0.22 }, { src: "tick", at: 891, vol: 0.22 }, { src: "tick", at: 897, vol: 0.22 }, { src: "tick", at: 903, vol: 0.22 }, { src: "down", at: 912, vol: 0.28 }, // s8 cresting shrinks
  { src: "swoosh_dn", at: 1010, vol: 0.24 }, { src: "paper", at: 1108, vol: 0.32 }, { src: "stamp", at: 1116, vol: 0.42 }, // s9 flip reveal + stamp
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
      {CUES.map((c, i) => <Sfx key={i} {...c} />)}
    </AbsoluteFill>
  );
};
