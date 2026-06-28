// Scenes (v3) — 0x100x language: running top caption + a big focal element, pure
// black, detailed 3D objects with motion, flowy transitions. No end card.
import React from "react";
import { AbsoluteFill } from "remotion";
import { reel } from "./data";
import { TopCaption, BigStatement, BigNumber, BarLabels, SceneWrap } from "./components";
import { Object3D } from "./objects3d";

const S = reel.scenes;

const Scrim: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 820, background: "linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)" }} />
);

export const Scene1: React.FC = () => (
  <SceneWrap frames={S[0].frames} trans={S[0].trans}>
    <Object3D kind="chip" /><Scrim />
    <TopCaption text={S[0].cap} />
    <BigStatement lines={S[0].lines!} start={8} centerY={1470} />
  </SceneWrap>
);

export const Scene2: React.FC = () => (
  <SceneWrap frames={S[1].frames} trans={S[1].trans}>
    <Object3D kind="phone" /><Scrim />
    <TopCaption text={S[1].cap} />
    <BigStatement lines={S[1].lines!} start={8} centerY={1470} />
  </SceneWrap>
);

export const Scene3: React.FC = () => (
  <SceneWrap frames={S[2].frames} trans={S[2].trans}>
    <TopCaption text={S[2].cap} />
    <BigNumber value={S[2].num!.value} sub={S[2].num!.sub} start={8} centerY={960} />
  </SceneWrap>
);

export const Scene4: React.FC = () => (
  <SceneWrap frames={S[3].frames} trans={S[3].trans}>
    <Object3D kind="bars" values={reel.evidence.bars.map((b) => b.value)} />
    <TopCaption text={S[3].cap} />
    <BarLabels bars={reel.evidence.bars} unit={reel.evidence.unit} start={14} />
  </SceneWrap>
);

export const Scene5: React.FC = () => (
  <SceneWrap frames={S[4].frames} trans={S[4].trans}>
    <TopCaption text={S[4].cap} />
    <BigNumber value={S[4].num!.value} sub={S[4].num!.sub} start={8} centerY={960} />
  </SceneWrap>
);

export const Scene6: React.FC = () => (
  <SceneWrap frames={S[5].frames} trans={S[5].trans}>
    <TopCaption text={S[5].cap} />
    <BigStatement lines={S[5].lines!} start={6} centerY={960} />
  </SceneWrap>
);

export const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6];
