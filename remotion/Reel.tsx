// Reel composition v6 — dark + grid, verbatim subtitles, dramatic music with a drop,
// SFX synced to the animations.
import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile } from "remotion";
import { Background, Fonts } from "./components";
import { SCENES } from "./scenes";
import { reel, sceneStarts } from "./data";
import { FPS, C } from "./theme";

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.3, dur = 28 }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}><Audio src={staticFile(`audio/${src}.mp3`)} volume={vol} /></Sequence>
);

// a different low sound per cut + a DROP after the hook pause + hits on the animations
const CUES: { src: string; at: number; vol?: number }[] = [
  { src: "riser", at: 0, vol: 0.24 }, { src: "impact", at: 10, vol: 0.3 },
  { src: "subdrop", at: 181, vol: 0.44 }, { src: "impact", at: 185, vol: 0.4 }, // the DROP
  { src: "whoosh", at: 185, vol: 0.26 },
  { src: "pop", at: 224, vol: 0.28 }, { src: "pop", at: 231, vol: 0.28 }, { src: "pop", at: 238, vol: 0.28 },
  { src: "whoosh", at: 350, vol: 0.28 }, { src: "clink", at: 359, vol: 0.22 },
  { src: "whoosh", at: 521, vol: 0.3 }, { src: "pop", at: 527, vol: 0.28 }, { src: "pop", at: 533, vol: 0.28 }, { src: "pop", at: 539, vol: 0.28 }, { src: "pop", at: 545, vol: 0.3 },
  { src: "whoosh", at: 618, vol: 0.28 }, { src: "tick", at: 626, vol: 0.3 }, { src: "tick", at: 634, vol: 0.3 },
  { src: "tick", at: 720, vol: 0.28 },
  { src: "whoosh", at: 797, vol: 0.3 }, { src: "ding", at: 812, vol: 0.34 },
  { src: "whoosh", at: 1002, vol: 0.3 }, { src: "clink", at: 1011, vol: 0.22 },
  { src: "subdrop", at: 1185, vol: 0.36 }, // the line crashes
  { src: "whoosh", at: 1283, vol: 0.28 }, { src: "impact", at: 1293, vol: 0.34 },
  { src: "whoosh", at: 1355, vol: 0.3 }, { src: "pop", at: 1361, vol: 0.28 }, { src: "pop", at: 1367, vol: 0.28 }, { src: "pop", at: 1373, vol: 0.28 }, { src: "pop", at: 1379, vol: 0.3 },
  { src: "whoosh", at: 1514, vol: 0.28 }, { src: "clink", at: 1523, vol: 0.22 },
  { src: "whoosh", at: 1652, vol: 0.28 },
  { src: "impact", at: 1734, vol: 0.3 },
  { src: "ding", at: 1866, vol: 0.32 },
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

      {/* deep onyx VO, one clip per sentence */}
      {reel.scenes.map((s, i) => (
        <Sequence key={`vo${i}`} from={sceneStarts[i] + 1} durationInFrames={Math.ceil(s.vo * FPS) + 4}>
          <Audio src={staticFile(`audio/${s.id}.mp3`)} />
        </Sequence>
      ))}

      {/* dramatic original piano + strings + drop */}
      <Audio src={staticFile("audio/music.mp3")} volume={0.4} />

      {CUES.map((c, i) => <Sfx key={i} {...c} />)}
    </AbsoluteFill>
  );
};
