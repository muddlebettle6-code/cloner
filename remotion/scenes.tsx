// Scenes (v9) — oil/inflation. Every beat = a visual (3D object / chart / line /
// number) + a smooth verbatim subtitle. Visual-only logo ending.
import React from "react";
import { AbsoluteFill } from "remotion";
import { reel } from "./data";
import { SceneWrap, Subtitle, BigNumber, FollowCard } from "./components";
import { BarChart, LineChart } from "./charts";
import { Object3D } from "./objects3d";

const Beat: React.FC<{ i: number }> = ({ i }) => {
  const s = reel.scenes[i];
  if (s.follow) return <SceneWrap frames={s.frames} trans={s.trans}><FollowCard /></SceneWrap>;
  return (
    <SceneWrap frames={s.frames} trans={s.trans}>
      {s.object && <AbsoluteFill style={{ opacity: s.num ? 0.55 : 1 }}><Object3D kind={s.object} frames={s.frames} level={s.level} /></AbsoluteFill>}
      {s.chart && <BarChart bars={s.chart} start={6} centerY={920} />}
      {s.line && <LineChart start={5} centerY={900} />}
      {s.num && <BigNumber value={s.num} start={8} centerY={920} />}
      <Subtitle id={s.id} />
    </SceneWrap>
  );
};

export const SCENES = reel.scenes.map((_, i) => {
  const Comp: React.FC = () => <Beat i={i} />;
  return Comp;
});
