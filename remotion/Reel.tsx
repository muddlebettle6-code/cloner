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
const CUES: { src: string; at: number; vol?: number }[] = [
  { src: "riser", at: 0, vol: 0.3 }, { src: "ding", at: 9, vol: 0.32 },
  { src: "subdrop", at: 148, vol: 0.44 }, { src: "impact", at: 152, vol: 0.4 }, // pause -> DROP
  { src: "whoosh", at: 152, vol: 0.3 }, { src: "tick", at: 168, vol: 0.26 },
  { src: "whoosh", at: 331, vol: 0.3 }, { src: "clink", at: 339, vol: 0.26 },
  { src: "whoosh", at: 515, vol: 0.3 }, { src: "pop", at: 521, vol: 0.28 }, { src: "pop", at: 527, vol: 0.28 }, { src: "pop", at: 533, vol: 0.28 }, { src: "pop", at: 539, vol: 0.28 },
  { src: "tick", at: 648, vol: 0.26 },
  { src: "whoosh", at: 795, vol: 0.3 }, { src: "riser", at: 800, vol: 0.22 },
  { src: "whoosh", at: 932, vol: 0.3 }, { src: "tick", at: 940, vol: 0.28 }, { src: "tick", at: 948, vol: 0.28 },
  { src: "whoosh", at: 1136, vol: 0.3 }, { src: "ding", at: 1144, vol: 0.3 },
  { src: "whoosh", at: 1284, vol: 0.3 }, { src: "down", at: 1302, vol: 0.4 }, // dot-com crash
  { src: "down", at: 1452, vol: 0.4 }, { src: "subdrop", at: 1456, vol: 0.3 },
  { src: "whoosh", at: 1594, vol: 0.3 }, { src: "coin", at: 1602, vol: 0.34 },
  { src: "whoosh", at: 1750, vol: 0.3 }, { src: "down", at: 1760, vol: 0.26 }, // slow deflate
  { src: "whoosh", at: 1909, vol: 0.28 }, { src: "tick", at: 1917, vol: 0.26 },
  { src: "whoosh", at: 2038, vol: 0.3 }, { src: "ding", at: 2046, vol: 0.3 },
  { src: "ding", at: 2113, vol: 0.3 },
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
