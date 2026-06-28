// Scenes (v5) — one frame per sentence. Every beat = a visual (3D / chart / table /
// number / waves) + one white caption. A data-driven Beat renderer composes them.
import React from "react";
import { AbsoluteFill } from "remotion";
import { reel } from "./data";
import { SceneWrap, Caption, BigNumber, BigStatement, Waves } from "./components";
import { BarChart, Table, LineChart } from "./charts";
import { Object3D } from "./objects3d";

const Beat: React.FC<{ i: number }> = ({ i }) => {
  const s = reel.scenes[i];
  return (
    <SceneWrap frames={s.frames} trans={s.trans}>
      {s.waves && <Waves start={2} />}
      {s.object && <AbsoluteFill style={{ opacity: s.num ? 0.6 : 1 }}><Object3D kind={s.object} /></AbsoluteFill>}
      {s.chart && <BarChart bars={s.chart} start={6} centerY={960} />}
      {s.table && <Table rows={s.table} start={5} centerY={960} />}
      {s.line && <LineChart start={5} centerY={960} />}
      {s.lines && <BigStatement lines={s.lines} start={5} centerY={960} />}
      {s.num && <BigNumber value={s.num} start={8} centerY={960} />}
      <Caption text={s.cap} e={s.e} start={4} />
    </SceneWrap>
  );
};

export const SCENES = reel.scenes.map((_, i) => {
  const Comp: React.FC = () => <Beat i={i} />;
  return Comp;
});
