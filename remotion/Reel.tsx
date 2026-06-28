// Reel composition v9 — oil/inflation. Female VO + varied synced SFX, NO music.
// Visual-only logo ending (no VO on the last beat).
import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile } from "remotion";
import { Background, Fonts } from "./components";
import { SCENES } from "./scenes";
import { reel, sceneStarts } from "./data";
import { FPS, C } from "./theme";

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.3, dur = 28 }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}><Audio src={staticFile(`audio/${src}.mp3`)} volume={vol} /></Sequence>
);

// starts: s1 0, s2 213, s3 334, s4 459, s5 601, s6 780, s7 972, s8 1097, s9 1262,
//         s10 1433, s11 1512, s12 1745 (flame out ~1814), s13 1857, s14 2070, s15 2278
// transition sounds vary: zoom->swish, push->snap, slide->swoosh_dn, wipe->glitch, fade->shimmer
const CUES: { src: string; at: number; vol?: number }[] = [
  { src: "riser", at: 0, vol: 0.3 }, { src: "ding", at: 30, vol: 0.3 },                          // s1 mercury rises
  { src: "boom", at: 209, vol: 0.46 }, { src: "impact", at: 213, vol: 0.36 },                    // pause -> DROP
  { src: "snap", at: 213, vol: 0.3 }, { src: "clink", at: 221, vol: 0.24 },                      // s2 barrel (push)
  { src: "shimmer", at: 334, vol: 0.26 },                                                        // s3 (fade)
  { src: "swoosh_dn", at: 459, vol: 0.3 }, { src: "impact", at: 467, vol: 0.32 },                // s4 $120 (slide)
  { src: "glitch", at: 601, vol: 0.3 }, { src: "riser", at: 610, vol: 0.24 },                    // s5 spike line (wipe)
  { src: "swish", at: 780, vol: 0.3 }, { src: "clink", at: 788, vol: 0.24 },                     // s6 gas pump (zoom)
  { src: "snap", at: 972, vol: 0.3 }, { src: "tick", at: 980, vol: 0.28 }, { src: "tick", at: 988, vol: 0.28 }, { src: "tick", at: 996, vol: 0.28 }, // s7 bars (push)
  { src: "swoosh_dn", at: 1097, vol: 0.3 }, { src: "down", at: 1132, vol: 0.4 },                 // s8 round-trip back down (slide)
  { src: "shimmer", at: 1262, vol: 0.26 }, { src: "down", at: 1276, vol: 0.26 },                 // s9 cooling (fade)
  { src: "swish", at: 1433, vol: 0.3 },                                                          // s10 (zoom)
  { src: "glitch", at: 1512, vol: 0.3 }, { src: "coin", at: 1520, vol: 0.32 },                   // s11 money (wipe)
  { src: "snap", at: 1745, vol: 0.3 },                                                           // s12 flame (push)
  { src: "swoosh_dn", at: 1812, vol: 0.34 }, { src: "down", at: 1814, vol: 0.3 },                // THE FLAME GOES OUT
  { src: "swoosh_dn", at: 1857, vol: 0.3 }, { src: "coin", at: 1865, vol: 0.3 },                 // s13 money (slide)
  { src: "swish", at: 2070, vol: 0.3 }, { src: "ding", at: 2078, vol: 0.3 },                     // s14 (zoom)
  { src: "shimmer", at: 2278, vol: 0.28 }, { src: "ding", at: 2286, vol: 0.3 },                  // s15 logo (fade)
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
      {/* female VO — skip the silent visual-only ending */}
      {reel.scenes.map((s, i) => s.follow ? null : (
        <Sequence key={`vo${i}`} from={sceneStarts[i] + 1} durationInFrames={Math.ceil(s.vo * FPS) + 4}>
          <Audio src={staticFile(`audio/${s.id}.mp3`)} />
        </Sequence>
      ))}
      {/* NO music — VO + SFX only */}
      {CUES.map((c, i) => <Sfx key={i} {...c} />)}
    </AbsoluteFill>
  );
};
