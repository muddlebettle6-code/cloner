// Reel composition v4 — LIGHT bg + 15 sentence-beats + piano music + varied, quiet SFX.
import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile } from "remotion";
import { Background, Fonts } from "./components";
import { SCENES } from "./scenes";
import { reel, sceneStarts } from "./data";
import { FPS, C } from "./theme";

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.3, dur = 28 }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}><Audio src={staticFile(`audio/${src}.mp3`)} volume={vol} /></Sequence>
);

// one sound per cut — varied so the same swoosh never repeats; all kept low.
const CUES: { src: string; at: number; vol?: number }[] = [
  { src: "riser", at: 0, vol: 0.28 }, { src: "impact", at: 8, vol: 0.34 },
  { src: "pop", at: 166, vol: 0.3 },
  { src: "whoosh_rev", at: 201, vol: 0.24 },
  { src: "whoosh", at: 331, vol: 0.28 }, { src: "clink", at: 341, vol: 0.22 },
  { src: "whoosh", at: 502, vol: 0.3 },               // wipe
  { src: "pop", at: 599, vol: 0.3 },
  { src: "tick", at: 701, vol: 0.3 },
  { src: "riser", at: 778, vol: 0.28 }, { src: "ding", at: 792, vol: 0.34 },
  { src: "whoosh", at: 983, vol: 0.3 }, { src: "clink", at: 993, vol: 0.22 }, // wipe + tower
  { src: "pop", at: 1134, vol: 0.3 },
  { src: "impact", at: 1264, vol: 0.3 },
  { src: "whoosh", at: 1336, vol: 0.3 },              // wipe
  { src: "whoosh_rev", at: 1495, vol: 0.26 }, { src: "clink", at: 1505, vol: 0.22 },
  { src: "tick", at: 1633, vol: 0.3 },
  { src: "subdrop", at: 1694, vol: 0.34 },            // final
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

      {/* original piano music bed (looped to cover the reel) */}
      <Audio src={staticFile("audio/music.mp3")} volume={0.4} loop />

      {CUES.map((c, i) => <Sfx key={i} {...c} />)}
    </AbsoluteFill>
  );
};
