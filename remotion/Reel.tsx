// The reel composition: persistent background (continuous environment) + the
// scene series + the full audio mix (voice dominant, music low, restrained sfx).
import React from "react";
import { AbsoluteFill, Series, Sequence, Audio, staticFile } from "remotion";
import { Background, Fonts } from "./components";
import { SCENES } from "./scenes";
import { reel, sceneStarts } from "./data";
import { FPS, C } from "./theme";

export const Reel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Fonts />
      <Background />

      <Series>
        {SCENES.map((S, i) => (
          <Series.Sequence key={i} durationInFrames={reel.scenes[i].frames}>
            <S />
          </Series.Sequence>
        ))}
      </Series>

      {/* voiceover — each scene's clip at its start */}
      {reel.scenes.map((s, i) => (
        <Sequence key={`vo${i}`} from={sceneStarts[i] + 2} durationInFrames={Math.ceil(s.vo * FPS) + 4}>
          <Audio src={staticFile(`audio/${s.id}.mp3`)} />
        </Sequence>
      ))}

      {/* music bed — low and controlled, voice stays dominant */}
      <Audio src={staticFile("audio/music.mp3")} volume={0.2} />

      {/* restrained sfx: soft whoosh on each cut, impact when the number lands, riser into the chart */}
      {sceneStarts.slice(1).map((st, i) => (
        <Sequence key={`wh${i}`} from={Math.max(0, st - 5)} durationInFrames={20}>
          <Audio src={staticFile("audio/whoosh.mp3")} volume={0.45} />
        </Sequence>
      ))}
      <Sequence from={sceneStarts[2] + 40} durationInFrames={24}>
        <Audio src={staticFile("audio/impact.mp3")} volume={0.6} />
      </Sequence>
      <Sequence from={sceneStarts[3] - 2} durationInFrames={40}>
        <Audio src={staticFile("audio/riser.mp3")} volume={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};
