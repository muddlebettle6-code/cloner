// Scenes (v8) — AI bubble. Every beat = a visual (3D object / circular flow / bar /
// line) + a smooth verbatim subtitle. Follow-card ending.
import React from "react";
import { reel } from "./data";
import { SceneWrap, Subtitle, FollowCard } from "./components";
import { BarChart, LineChart, CircleFlow } from "./charts";
import { Object3D } from "./objects3d";

const Beat: React.FC<{ i: number }> = ({ i }) => {
  const s = reel.scenes[i];
  if (s.follow) return <SceneWrap frames={s.frames} trans={s.trans}><FollowCard /></SceneWrap>;
  return (
    <SceneWrap frames={s.frames} trans={s.trans}>
      {s.object && <Object3D kind={s.object} frames={s.frames} />}
      {s.flow && <CircleFlow start={4} centerY={920} />}
      {s.chart && <BarChart bars={s.chart} start={6} centerY={920} />}
      {s.line && <LineChart start={5} centerY={900} />}
      <Subtitle id={s.id} />
    </SceneWrap>
  );
};

export const SCENES = reel.scenes.map((_, i) => {
  const Comp: React.FC = () => <Beat i={i} />;
  return Comp;
});
