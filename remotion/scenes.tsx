// Scenes (housing) — house + flipping price tag, supply pile-up, rate dial, $48k,
// divergence line, 2008 split, cresting bars. Verbatim subtitle on every beat.
import React from "react";
import { AbsoluteFill } from "remotion";
import { reel } from "./data";
import { SceneWrap, Subtitle, BigNumber } from "./components";
import { Object3D } from "./objects3d";
import { PriceTag, DivergenceLine, RateDial, CrestingBars, Split2008 } from "./housing_viz";

const Beat: React.FC<{ i: number }> = ({ i }) => {
  const s = reel.scenes[i];
  return (
    <SceneWrap frames={s.frames} trans={s.trans}>
      {s.object && <AbsoluteFill style={{ opacity: s.tag ? 0.92 : 1 }}><Object3D kind={s.object} /></AbsoluteFill>}
      {s.tag && <PriceTag {...s.tag} start={1} centerY={1095} />}
      {s.dial && <RateDial start={1} centerY={990} />}
      {s.divergence && <DivergenceLine start={1} centerY={980} />}
      {s.split && <Split2008 start={2} centerY={1010} />}
      {s.cresting && <CrestingBars start={1} centerY={1030} />}
      {s.num && <BigNumber value={s.num} start={2} centerY={980} />}
      <Subtitle id={s.id} />
    </SceneWrap>
  );
};

export const SCENES = reel.scenes.map((_, i) => {
  const Comp: React.FC = () => <Beat i={i} />;
  return Comp;
});
