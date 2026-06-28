// Detailed 3D objects (v3) with drei environment reflections + contact shadows.
// Chip, phone, 3D bars. Deterministic (motion driven by Remotion frame, no random/clock).
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer, ContactShadows, RoundedBox } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { E } from "./theme";

const easeIn = (frame: number, dur = 18) => E.softOvershoot(Math.min(1, frame / dur));
const MAG = "#ff2d92";
const GOLD = "#c9a44c";

// memory module (RAM stick): dark PCB + gold contacts + chips + magenta label
const Chip: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.42 + easeIn(frame) * 0.22;
  const bob = Math.sin(frame / 26) * 0.06;
  return (
    <group scale={s} position={[0, bob, frame * 0.004]} rotation={[0.18, -0.5 + frame * 0.006, 0.04]}>
      <RoundedBox args={[3.3, 1.15, 0.09]} radius={0.04} smoothness={3}><meshStandardMaterial color="#0e1412" metalness={0.5} roughness={0.45} /></RoundedBox>
      {/* gold contact pins along the bottom edge */}
      {Array.from({ length: 22 }).map((_, i) => (
        <mesh key={i} position={[-1.5 + i * 0.143, -0.62, 0.05]}><boxGeometry args={[0.09, 0.18, 0.02]} /><meshStandardMaterial color={GOLD} metalness={1} roughness={0.22} /></mesh>
      ))}
      {/* memory chips */}
      {Array.from({ length: 6 }).map((_, i) => (
        <RoundedBox key={i} args={[0.42, 0.6, 0.06]} radius={0.02} smoothness={2} position={[-1.35 + i * 0.52, 0.12, 0.08]}><meshStandardMaterial color="#0a0a0c" metalness={0.6} roughness={0.35} /></RoundedBox>
      ))}
      {/* magenta label stripe */}
      <mesh position={[1.05, 0.12, 0.085]}><boxGeometry args={[0.9, 0.34, 0.02]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.5} metalness={0.3} roughness={0.4} /></mesh>
    </group>
  );
};

// phone: rounded glossy body + dark screen with a magenta sheen
const Phone: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.62 + easeIn(frame) * 0.42;
  const bob = Math.sin(frame / 24) * 0.08;
  return (
    <group scale={s} position={[0, bob, frame * 0.004]} rotation={[0.12, -0.6 + frame * 0.0075, 0.02]}>
      <RoundedBox args={[1.55, 3.1, 0.22]} radius={0.22} smoothness={6}><meshStandardMaterial color="#111114" metalness={0.85} roughness={0.22} /></RoundedBox>
      <RoundedBox args={[1.36, 2.86, 0.04]} radius={0.16} smoothness={5} position={[0, 0, 0.12]}><meshStandardMaterial color="#050507" metalness={0.4} roughness={0.18} emissive={MAG} emissiveIntensity={0.12} /></RoundedBox>
      <mesh position={[0, 1.18, 0.16]}><circleGeometry args={[0.07, 24]} /><meshStandardMaterial color="#0a0a0c" metalness={0.6} roughness={0.3} /></mesh>
    </group>
  );
};

// 3D bars (the regressive chart) — grow from 0, tallest magenta
const Bars3D: React.FC<{ frame: number; values: number[] }> = ({ frame, values }) => {
  const max = Math.max(...values);
  return (
    <group position={[0, -0.4, frame * 0.003]} rotation={[0.05, -0.35 + frame * 0.004, 0]} scale={0.82}>
      {values.map((v, i) => {
        const g = E.chartEase(Math.min(1, Math.max(0, (frame - 6 - i * 5) / 26)));
        const h = (v / max) * 2.6 * g + 0.001;
        return (
          <mesh key={i} position={[(i - 1) * 1.05, h / 2 - 0.9, 0]}>
            <boxGeometry args={[0.7, h, 0.7]} />
            <meshStandardMaterial color={i === 0 ? MAG : "#e8e8ee"} metalness={0.6} roughness={0.28} emissive={i === 0 ? MAG : "#000"} emissiveIntensity={i === 0 ? 0.3 : 0} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Object3D: React.FC<{ kind: "chip" | "phone" | "bars"; values?: number[] }> = ({ kind, values = [54, 33, 29] }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }} camera={{ position: [0, 0.4, 8], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.35} />
      <pointLight position={[5, 6, 7]} intensity={130} color="#ffffff" decay={2} />
      <pointLight position={[-6, -1, -3]} intensity={210} color={MAG} decay={2} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[3, 4, 5]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={3} color={MAG} position={[-5, -1, 2]} scale={[5, 8, 1]} />
        <Lightformer form="circle" intensity={1.5} color="#ffffff" position={[0, 2, -6]} scale={[5, 5, 1]} />
      </Environment>
      <ContactShadows position={[0, -1.55, 0]} opacity={0.5} blur={2.4} scale={9} far={4} color="#000000" />
      {kind === "chip" && <Chip frame={frame} />}
      {kind === "phone" && <Phone frame={frame} />}
      {kind === "bars" && <Bars3D frame={frame} values={values} />}
    </ThreeCanvas>
  );
};
