// Reel composition v3 — black bg + scene series + motion-matched audio (present music).
import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile } from "remotion";
import { Background, Fonts } from "./components";
import { SCENES } from "./scenes";
import { reel, sceneStarts } from "./data";
import { FPS, C } from "./theme";

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.5, dur = 30 }) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}><Audio src={staticFile(`audio/${src}.mp3`)} volume={vol} /></Sequence>
);

export const Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Fonts />
      <Background />

      <Series>
        {SCENES.map((Sc, i) => (
          <Series.Sequence key={i} durationInFrames={reel.scenes[i].frames}><Sc /></Series.Sequence>
        ))}
      </Series>

      {/* deep onyx VO */}
      {reel.scenes.map((s, i) => (
        <Sequence key={`vo${i}`} from={sceneStarts[i] + 2} durationInFrames={Math.ceil(s.vo * FPS) + 4}>
          <Audio src={staticFile(`audio/${s.id}.mp3`)} />
        </Sequence>
      ))}

      {/* present, pulsing music bed */}
      <Audio src={staticFile("audio/music.mp3")} volume={0.46} />

      {/* sfx matched to motion + objects (s starts: 0,116,266,450,595,762) */}
      <Sfx src="whoosh_rev" at={0} vol={0.5} />
      <Sfx src="impact" at={7} vol={0.4} />
      <Sfx src="whoosh" at={116} vol={0.5} />
      <Sfx src="pop" at={132} vol={0.5} />
      <Sfx src="whoosh" at={266} vol={0.5} />
      <Sfx src="riser" at={266} vol={0.4} />
      <Sfx src="impact" at={278} vol={0.6} />
      <Sfx src="whoosh" at={450} vol={0.5} />
      <Sfx src="pop" at={466} vol={0.5} />
      <Sfx src="pop" at={472} vol={0.5} />
      <Sfx src="pop" at={478} vol={0.5} />
      <Sfx src="whoosh_rev" at={595} vol={0.5} />
      <Sfx src="impact" at={607} vol={0.6} />
      <Sfx src="whoosh" at={762} vol={0.5} />
      <Sfx src="subdrop" at={772} vol={0.55} />
    </AbsoluteFill>
  );
};
