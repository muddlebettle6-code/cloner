// The 7 scenes (foreground content). A persistent Background lives in the
// composition, so the environment is continuous and the content cross-dissolves.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, E, SAFE } from "./theme";
import { reel } from "./data";
import { Headline, Captions, DataCounter, BarChart, Flow, LogoOutro, TopicLabel, SourceLabel, useReveal, rev } from "./components";
import { Barrel3D } from "./Barrel3D";

// fade + blur in at the start and out at the end -> seamless dissolve between scenes
export const SceneWrap: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: E.smoothOut });
  const outP = interpolate(f, [frames - 12, frames], [1, 0], { extrapolateLeft: "clamp", easing: E.smoothIn });
  const op = Math.min(inP, outP);
  const blur = (1 - inP) * 14 + (1 - outP) * 14;
  const scale = interpolate(inP, [0, 1], [1.04, 1]) * interpolate(outP, [0, 1], [0.99, 1]);
  return <AbsoluteFill style={{ opacity: op, filter: `blur(${blur}px)`, transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};

const Caps: React.FC<{ i: number }> = ({ i }) => <Captions items={reel.scenes[i].captions} sceneFrames={reel.scenes[i].frames} />;

export const SceneHook: React.FC = () => (
  <SceneWrap frames={reel.scenes[0].frames}>
    <TopicLabel text={reel.topic} date={reel.date} />
    <Headline lines={[{ t: "A fifth of the" }, { t: "world's oil is" }, { t: "still missing.", mag: true }]} size={118} top={700} start={8} />
    <Caps i={0} />
  </SceneWrap>
);

export const SceneContext: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <SceneWrap frames={reel.scenes[1].frames}>
      {/* fake soft contact shadow under the barrel */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, height: 120, opacity: rev(f, 10, 20) * 0.7, background: "radial-gradient(50% 100% at 50% 0%, rgba(0,0,0,0.7), transparent 70%)" }} />
      <Barrel3D />
      <div style={{ position: "absolute", left: SAFE.side, top: 470, ...useReveal(18, 16, 24) }}>
        <div style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: "0.16em", color: C.mag }}>{reel.context.note1}</div>
        <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.08em", color: C.soft, marginTop: 8 }}>{reel.context.note2.toUpperCase()}</div>
      </div>
      <div style={{ position: "absolute", right: SAFE.right, top: 1120, textAlign: "right", ...useReveal(40, 16, 24) }}>
        <div style={{ fontFamily: F.display, fontSize: 96, letterSpacing: "-0.03em", color: C.mag, textShadow: `0 0 40px ${C.magGlow}` }}>{reel.context.spike}</div>
        <div style={{ fontFamily: F.mono, fontSize: 24, letterSpacing: "0.1em", color: C.soft }}>FROM THE STRIKE</div>
      </div>
      <Caps i={1} />
    </SceneWrap>
  );
};

export const SceneNumber: React.FC = () => (
  <SceneWrap frames={reel.scenes[2].frames}>
    <TopicLabel text="THE NUMBER" start={4} />
    <DataCounter to={reel.number.value} prefix={reel.number.prefix} decimals={reel.number.decimals} label={reel.number.label} note={reel.number.note} start={10} />
    <SourceLabel text={reel.number.source} start={40} />
    <Caps i={2} />
  </SceneWrap>
);

export const SceneEvidence: React.FC = () => (
  <SceneWrap frames={reel.scenes[3].frames}>
    <TopicLabel text="THE EVIDENCE" start={4} />
    <BarChart title={reel.evidence.title} units={reel.evidence.units} bars={reel.evidence.bars} start={8} />
    <SourceLabel text={reel.evidence.source} start={42} />
    <Caps i={3} />
  </SceneWrap>
);

export const SceneWhy: React.FC = () => (
  <SceneWrap frames={reel.scenes[4].frames}>
    <TopicLabel text="WHY IT MOVED" start={4} />
    <Flow steps={[reel.why.cause, reel.why.mid, reel.why.effect]} contrast={reel.why.contrast} start={10} />
    <Caps i={4} />
  </SceneWrap>
);

export const SceneNext: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <SceneWrap frames={reel.scenes[5].frames}>
      <TopicLabel text="WHAT TO WATCH" start={4} />
      <Headline lines={[{ t: "A calm price on a" }, { t: "fragile supply can" }, { t: "snap back fast.", mag: true }]} size={104} top={700} start={8} />
      <div style={{ position: "absolute", left: SAFE.side, top: 1120, ...useReveal(34, 16, 24) }}>
        <div style={{ fontFamily: F.mono, fontSize: 28, letterSpacing: "0.08em", color: C.soft }}>{reel.next.line1.toUpperCase()}</div>
        <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 22px", border: `1px solid ${C.mag}`, borderRadius: 10, background: C.magDark }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: C.mag, opacity: 0.5 + 0.5 * Math.sin(f / 6) }} />
          <span style={{ fontFamily: F.mono, fontSize: 26, letterSpacing: "0.12em", color: C.mag }}>{reel.next.watch}</span>
        </div>
      </div>
      <Caps i={5} />
    </SceneWrap>
  );
};

export const SceneOutro: React.FC = () => (
  <SceneWrap frames={reel.scenes[6].frames}>
    <LogoOutro wordmark={reel.outro.wordmark} tagline={reel.outro.tagline} />
  </SceneWrap>
);

export const SCENES = [SceneHook, SceneContext, SceneNumber, SceneEvidence, SceneWhy, SceneNext, SceneOutro];
