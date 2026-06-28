// The 7 scenes (v2) — minimal, centered, big text only; 3D objects upper, text below.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "./theme";
import { reel } from "./data";
import { BigText, BigNumber, BarChartBig, LogoOutro, SceneWrap } from "./components";
import { Object3D } from "./objects3d";

const S = reel.scenes;

// soft contact shadow under a raised 3D object + a bottom scrim for text legibility
const ObjectStage: React.FC<{ kind: "globe" | "barrel" | "coin"; dim?: number }> = ({ kind, dim = 1 }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 980, height: 150, background: "radial-gradient(50% 100% at 50% 0%, rgba(0,0,0,0.65), transparent 72%)" }} />
    <AbsoluteFill style={{ opacity: dim }}><Object3D kind={kind} /></AbsoluteFill>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)" }} />
  </>
);

export const SceneHook: React.FC = () => (
  <SceneWrap frames={S[0].frames} trans={S[0].trans}>
    <ObjectStage kind="globe" />
    <BigText beats={S[0].beats} sceneFrames={S[0].frames} centerY={1410} />
  </SceneWrap>
);

export const SceneContext: React.FC = () => (
  <SceneWrap frames={S[1].frames} trans={S[1].trans}>
    <ObjectStage kind="barrel" />
    <BigText beats={S[1].beats} sceneFrames={S[1].frames} centerY={1410} />
  </SceneWrap>
);

export const SceneNumber: React.FC = () => (
  <SceneWrap frames={S[2].frames} trans={S[2].trans}>
    <ObjectStage kind="coin" dim={0.85} />
    <BigNumber to={reel.number.value} prefix={reel.number.prefix} decimals={reel.number.decimals} caption={reel.number.caption} start={8} centerY={1240} />
  </SceneWrap>
);

export const SceneEvidence: React.FC = () => (
  <SceneWrap frames={S[3].frames} trans={S[3].trans}>
    <BigText beats={S[3].beats} sceneFrames={S[3].frames} centerY={680} />
    <BarChartBig bars={reel.evidence.bars} start={14} />
  </SceneWrap>
);

export const SceneWhy: React.FC = () => (
  <SceneWrap frames={S[4].frames} trans={S[4].trans}>
    <BigText beats={S[4].beats} sceneFrames={S[4].frames} centerY={960} />
  </SceneWrap>
);

export const SceneNext: React.FC = () => (
  <SceneWrap frames={S[5].frames} trans={S[5].trans}>
    <BigText beats={S[5].beats} sceneFrames={S[5].frames} centerY={960} />
  </SceneWrap>
);

export const SceneOutro: React.FC = () => (
  <SceneWrap frames={S[6].frames} trans={S[6].trans}>
    <LogoOutro wordmark={reel.outro.wordmark} tagline={reel.outro.tagline} />
  </SceneWrap>
);

export const SCENES = [SceneHook, SceneContext, SceneNumber, SceneEvidence, SceneWhy, SceneNext, SceneOutro];
