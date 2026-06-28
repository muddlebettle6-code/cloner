// Reel composition (DST) — female VO + varied synced SFX, NO music. Visual-only ending.
import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile } from "remotion";
import { Background, Fonts } from "./components";
import { SCENES } from "./scenes";
import { reel, sceneStarts } from "./data";
import { FPS, C } from "./theme";

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.3, dur = 28 }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}><Audio src={staticFile(`audio/${src}.mp3`)} volume={vol} /></Sequence>
);

// starts: s1 0, s2 191, s3 327, s4 501, s5 647, s6 729, s7 885, s8 1088, s9 1277,
//         s10 1433, s11 1551, s12 1798, s13 1861, s14 2074, s15 2251
// transition sounds vary: zoom->swish, push->snap, slide->swoosh_dn, wipe->glitch, fade->shimmer
const CUES: { src: string; at: number; vol?: number }[] = [
  { src: "riser", at: 0, vol: 0.3 }, { src: "impact", at: 14, vol: 0.34 }, { src: "clink", at: 42, vol: 0.26 }, // s1 100% + gate
  { src: "boom", at: 187, vol: 0.46 }, { src: "impact", at: 191, vol: 0.36 }, // pause -> DROP
  { src: "snap", at: 191, vol: 0.3 }, { src: "clink", at: 199, vol: 0.24 },   // s2 laptop (push)
  { src: "shimmer", at: 327, vol: 0.26 }, { src: "coin", at: 335, vol: 0.3 }, // s3 money (fade)
  { src: "swoosh_dn", at: 501, vol: 0.3 },                                    // s4 laptop (slide)
  { src: "glitch", at: 647, vol: 0.3 }, { src: "clink", at: 655, vol: 0.24 }, // s5 cart (wipe)
  { src: "shimmer", at: 729, vol: 0.26 },                                     // s6 cart (fade)
  { src: "snap", at: 885, vol: 0.3 }, { src: "tick", at: 893, vol: 0.28 }, { src: "impact", at: 905, vol: 0.34 }, // s7 2.7x reveal (push)
  { src: "swoosh_dn", at: 1088, vol: 0.3 }, { src: "clink", at: 1096, vol: 0.24 }, // s8 cart (slide)
  { src: "swish", at: 1277, vol: 0.3 }, { src: "impact", at: 1291, vol: 0.34 },    // s9 100% (zoom)
  { src: "snap", at: 1433, vol: 0.3 },                                        // s10 gate (push)
  { src: "glitch", at: 1551, vol: 0.3 }, { src: "coin", at: 1559, vol: 0.3 }, // s11 money (wipe)
  { src: "shimmer", at: 1798, vol: 0.26 }, { src: "tick", at: 1806, vol: 0.28 }, { src: "tick", at: 1814, vol: 0.28 }, // s12 23/77 (fade)
  { src: "swoosh_dn", at: 1861, vol: 0.3 }, { src: "down", at: 1876, vol: 0.34 }, // s13 $0 (slide)
  { src: "swish", at: 2074, vol: 0.3 }, { src: "coin", at: 2082, vol: 0.3 },  // s14 money (zoom)
  { src: "shimmer", at: 2251, vol: 0.28 }, { src: "ding", at: 2258, vol: 0.3 }, // s15 logo (fade)
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
      {reel.scenes.map((s, i) => s.follow ? null : (
        <Sequence key={`vo${i}`} from={sceneStarts[i] + 1} durationInFrames={Math.ceil(s.vo * FPS) + 4}>
          <Audio src={staticFile(`audio/${s.id}.mp3`)} />
        </Sequence>
      ))}
      {CUES.map((c, i) => <Sfx key={i} {...c} />)}
    </AbsoluteFill>
  );
};
