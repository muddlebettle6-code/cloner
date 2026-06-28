// Reel composition v7 — plain language, lower music, more animation-matched SFX
// (coin chime on the stacks, descending sweep when the graph drops, pause + drop).
import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile } from "remotion";
import { Background, Fonts } from "./components";
import { SCENES } from "./scenes";
import { reel, sceneStarts } from "./data";
import { FPS, C } from "./theme";

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.3, dur = 28 }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}><Audio src={staticFile(`audio/${src}.mp3`)} volume={vol} /></Sequence>
);

// starts: s1 0, s2 160, s3 226, s4 354, s5 524, s6 664, s7 771, s8 843, s9 1059,
//         s10 1188, s11 1339, s12 1405, s13 1542, s14 1677, s15 1756, s16 1876
const CUES: { src: string; at: number; vol?: number }[] = [
  { src: "riser", at: 0, vol: 0.22 }, { src: "coin", at: 8, vol: 0.34 }, { src: "impact", at: 13, vol: 0.28 },
  { src: "subdrop", at: 156, vol: 0.42 }, { src: "impact", at: 160, vol: 0.36 }, // pause -> DROP
  { src: "whoosh", at: 160, vol: 0.24 },
  { src: "tick", at: 226, vol: 0.24 },
  { src: "whoosh", at: 354, vol: 0.26 }, { src: "clink", at: 362, vol: 0.2 },
  { src: "whoosh", at: 524, vol: 0.28 }, { src: "pop", at: 530, vol: 0.26 }, { src: "pop", at: 536, vol: 0.26 }, { src: "pop", at: 542, vol: 0.26 }, { src: "pop", at: 548, vol: 0.28 },
  { src: "whoosh", at: 664, vol: 0.26 }, { src: "tick", at: 672, vol: 0.28 }, { src: "tick", at: 680, vol: 0.28 },
  { src: "tick", at: 771, vol: 0.26 },
  { src: "whoosh", at: 843, vol: 0.28 }, { src: "tick", at: 862, vol: 0.24 },
  { src: "whoosh", at: 1059, vol: 0.28 }, { src: "clink", at: 1067, vol: 0.2 },
  { src: "down", at: 1213, vol: 0.42 }, { src: "subdrop", at: 1216, vol: 0.3 }, // the graph drops
  { src: "coin", at: 1345, vol: 0.32 }, { src: "impact", at: 1349, vol: 0.28 },
  { src: "whoosh", at: 1405, vol: 0.28 }, { src: "pop", at: 1411, vol: 0.26 }, { src: "pop", at: 1417, vol: 0.26 }, { src: "pop", at: 1423, vol: 0.26 }, { src: "pop", at: 1429, vol: 0.28 },
  { src: "whoosh", at: 1542, vol: 0.26 }, { src: "clink", at: 1550, vol: 0.2 },
  { src: "whoosh", at: 1677, vol: 0.26 },
  { src: "whoosh", at: 1756, vol: 0.26 }, { src: "clink", at: 1764, vol: 0.2 },
  { src: "ding", at: 1878, vol: 0.3 },
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
      {/* dramatic original track — lower in the mix now */}
      <Audio src={staticFile("audio/music.mp3")} volume={0.26} />
      {CUES.map((c, i) => <Sfx key={i} {...c} />)}
    </AbsoluteFill>
  );
};
