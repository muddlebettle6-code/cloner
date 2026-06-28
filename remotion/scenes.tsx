// Scenes (v4) — one frame per sentence. A data-driven Beat renderer picks the focal
// (number / statement / question / object) + a synced subtitle on visual beats.
import React from "react";
import { reel } from "./data";
import { SceneWrap, Subtitle, BigStatement, BigNumber, Waves } from "./components";
import { Object3D } from "./objects3d";

const Beat: React.FC<{ i: number }> = ({ i }) => {
  const s = reel.scenes[i];
  const textKind = s.kind === "statement" || s.kind === "question" || s.kind === "word";
  return (
    <SceneWrap frames={s.frames} trans={s.trans}>
      {s.waves && <Waves start={2} />}
      {s.kind === "number" && <BigNumber value={s.num!.v} sub={s.num!.sub} start={6} centerY={760} />}
      {textKind && <BigStatement lines={s.lines!} start={5} centerY={910} />}
      {s.kind === "object" && <Object3D kind={s.object!} />}
      {!textKind && <Subtitle text={s.sub} sceneFrames={s.frames} centerY={1500} />}
    </SceneWrap>
  );
};

export const SCENES = reel.scenes.map((_, i) => {
  const Comp: React.FC = () => <Beat i={i} />;
  return Comp;
});
