// Reel composition v2 — persistent background + scene series + motion-matched audio.
import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile } from "remotion";
import { Background, Fonts } from "./components";
import { SCENES } from "./scenes";
import { reel, sceneStarts } from "./data";
import { FPS, C } from "./theme";

const Sfx: React.FC<{ src: string; at: number; vol?: number; dur?: number }> = ({ src, at, vol = 0.5, dur = 34 }) => (
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

      {/* voiceover (deep onyx) */}
      {reel.scenes.map((s, i) => (
        <Sequence key={`vo${i}`} from={sceneStarts[i] + 2} durationInFrames={Math.ceil(s.vo * FPS) + 4}>
          <Audio src={staticFile(`audio/${s.id}.mp3`)} />
        </Sequence>
      ))}

      {/* music bed — pulsing, present but voice stays dominant */}
      <Audio src={staticFile("audio/music.mp3")} volume={0.34} />

      {/* sfx matched to motion + 3D objects */}
      {/* s1 globe scales in */}
      <Sfx src="swoosh_up" at={0} vol={0.5} />
      <Sfx src="boom" at={5} vol={0.42} />
      {/* s2 barrel — flash cut + metal */}
      <Sfx src="flash" at={181} vol={0.5} />
      <Sfx src="boom" at={186} vol={0.5} />
      <Sfx src="clink" at={191} vol={0.4} />
      {/* s3 coin + number lands */}
      <Sfx src="swoosh_up" at={413} vol={0.5} />
      <Sfx src="clink" at={419} vol={0.32} />
      <Sfx src="ding" at={447} vol={0.55} />
      {/* s4 chart — riser + bar ticks */}
      <Sfx src="riser" at={581} vol={0.45} />
      <Sfx src="tick" at={597} vol={0.5} />
      <Sfx src="tick" at={606} vol={0.5} />
      <Sfx src="tick" at={615} vol={0.5} />
      {/* s5 why — flash cut + subdrop on the consequence */}
      <Sfx src="flash" at={777} vol={0.5} />
      <Sfx src="subdrop" at={853} vol={0.5} />
      {/* s6 next — swoosh + impact on "snap back fast" */}
      <Sfx src="swoosh_dn" at={937} vol={0.5} />
      <Sfx src="boom" at={1001} vol={0.5} />
      {/* s7 outro */}
      <Sfx src="whoosh" at={1068} vol={0.4} />
    </AbsoluteFill>
  );
};
