// Scenes (v6) — every beat = a visual + a VERBATIM, time-synced subtitle (the exact
// spoken sentence). Last beat is a clean follow-card ending.
import React from "react";
import { AbsoluteFill } from "remotion";
import { reel } from "./data";
import { SceneWrap, Subtitle, BigNumber, BigStatement, Waves, FollowCard } from "./components";
import { BarChart, Table, LineChart } from "./charts";
import { Object3D } from "./objects3d";

const Beat: React.FC<{ i: number }> = ({ i }) => {
  const s = reel.scenes[i];
  if (s.follow) return <SceneWrap frames={s.frames} trans={s.trans}><FollowCard /></SceneWrap>;
  return (
    <SceneWrap frames={s.frames} trans={s.trans}>
      {s.waves && <Waves start={2} />}
      {s.object && <AbsoluteFill style={{ opacity: s.num ? 0.55 : 1 }}><Object3D kind={s.object} /></AbsoluteFill>}
      {s.chart && <BarChart bars={s.chart} start={6} centerY={900} />}
      {s.table && <Table rows={s.table} start={5} centerY={870} />}
      {s.line && <LineChart start={5} centerY={870} />}
      {s.lines && <BigStatement lines={s.lines} start={5} centerY={900} />}
      {s.num && <BigNumber value={s.num} start={8} centerY={900} />}
      <Subtitle id={s.id} />
    </SceneWrap>
  );
};

export const SCENES = reel.scenes.map((_, i) => {
  const Comp: React.FC = () => <Beat i={i} />;
  return Comp;
});
