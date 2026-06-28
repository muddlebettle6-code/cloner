// 3D objects (v9) — oil/inflation set. Oil barrel, thermometer (rising mercury),
// flame (flickers + extinguishes), gas pump, coin stack. drei env + camera drift.
import React from "react";
import { DoubleSide } from "three";
import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { E } from "./theme";

const easeIn = (frame: number, dur = 18) => E.softOvershoot(Math.min(1, frame / dur));
const MAG = "#ff2d92";

const Barrel: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.5 + easeIn(frame) * 0.3;
  return (
    <group scale={s} rotation={[0.16, -0.3 + frame * 0.012, 0]} position={[0, Math.sin(frame / 26) * 0.07, frame * 0.003]}>
      <mesh><cylinderGeometry args={[1.0, 1.0, 2.5, 64]} /><meshStandardMaterial color="#16161c" metalness={0.72} roughness={0.3} /></mesh>
      {[1.25, -1.25].map((y, i) => <mesh key={i} position={[0, y, 0]}><cylinderGeometry args={[1.03, 1.0, 0.15, 64]} /><meshStandardMaterial color="#1e1e26" metalness={0.78} roughness={0.26} /></mesh>)}
      {[0.8, 0, -0.8].map((y, i) => <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.02, 0.045, 12, 64]} /><meshStandardMaterial color="#3a3a46" metalness={0.8} roughness={0.26} /></mesh>)}
      <mesh position={[0.78, 0.1, 0.7]}><boxGeometry args={[0.7, 0.5, 0.02]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.5} /></mesh>
    </group>
  );
};

const Thermometer: React.FC<{ frame: number; level: number }> = ({ frame, level }) => {
  const s = 0.72 + easeIn(frame) * 0.34;
  const fill = level * E.chartEase(Math.min(1, frame / 28));
  const tubeH = 2.2;
  return (
    <group scale={s} rotation={[0, Math.sin(frame / 44) * 0.2, 0.04]} position={[0, -0.1, 0]}>
      <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.26, 0.26, tubeH, 36, 1, true]} /><meshPhysicalMaterial color="#ffffff" roughness={0.06} transmission={0.8} transparent opacity={0.32} thickness={0.4} side={DoubleSide} /></mesh>
      <mesh position={[0, 0.45, 0]}><sphereGeometry args={[0.26, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshPhysicalMaterial color="#ffffff" roughness={0.06} transmission={0.8} transparent opacity={0.32} /></mesh>
      <mesh position={[0, -0.95, 0]}><sphereGeometry args={[0.42, 32, 32]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.75} roughness={0.3} /></mesh>
      <mesh position={[0, -0.95 + (fill * tubeH) / 2, 0]}><cylinderGeometry args={[0.14, 0.14, Math.max(0.001, fill * tubeH), 24]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.85} /></mesh>
      {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[0.32, -0.3 + i * 0.42, 0]}><boxGeometry args={[0.14, 0.025, 0.02]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.55} /></mesh>)}
    </group>
  );
};

const Flame: React.FC<{ frame: number; outAt: number }> = ({ frame, outAt }) => {
  const t = frame - outAt; const lit = t < 0;
  const flick = 1 + 0.22 * Math.sin(frame / 2.0) + 0.1 * Math.sin(frame / 0.9) + 0.05 * Math.sin(frame / 3.7);
  const sway = Math.sin(frame / 2.6) * 0.07;
  const grow = 0.58 + easeIn(frame) * 0.4;
  const ext = lit ? 1 : Math.max(0, 1 - t / 7);
  const op = lit ? 1 : Math.max(0, 1 - t / 7);
  return (
    <group position={[0, -0.6, 0]}>
      {op > 0.01 && (
        <group position={[sway, 0, 0]} rotation={[0, 0, sway * 0.5]}>
          {/* outer magenta tongue */}
          <mesh scale={[grow * ext, grow * ext * flick * 1.7, grow * ext]} position={[0, 0.9, 0]}><coneGeometry args={[0.64, 1.9, 40]} /><meshStandardMaterial color="#ff2d92" emissive="#ff2d92" emissiveIntensity={1.5} transparent opacity={op * 0.7} /></mesh>
          {/* warm orange mid */}
          <mesh scale={[grow * ext * 0.74, grow * ext * flick * 1.45, grow * ext * 0.74]} position={[-sway * 0.5, 0.82, 0.05]}><coneGeometry args={[0.58, 1.7, 32]} /><meshStandardMaterial color="#ff6a33" emissive="#ff6a33" emissiveIntensity={1.7} transparent opacity={op * 0.85} /></mesh>
          {/* white-hot core */}
          <mesh scale={[grow * ext * 0.42, grow * ext * flick * 1.1, grow * ext * 0.42]} position={[0, 0.7, 0.1]}><coneGeometry args={[0.5, 1.4, 24]} /><meshStandardMaterial color="#fff" emissive="#ffe7b0" emissiveIntensity={2} transparent opacity={op * 0.95} /></mesh>
        </group>
      )}
      {t >= 0 && Array.from({ length: 9 }).map((_, i) => {
        const so = Math.max(0, 1 - t / 22); if (so <= 0.01) return null;
        return <mesh key={i} position={[Math.sin(i * 1.3) * 0.22 * (t * 0.04 + 1), 1.1 + t * 0.05 + i * 0.07, Math.cos(i * 1.7) * 0.15]} scale={0.1 + t * 0.007}><sphereGeometry args={[1, 12, 12]} /><meshStandardMaterial color="#5a5a62" transparent opacity={so * 0.4} /></mesh>;
      })}
    </group>
  );
};

const GasPump: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.58 + easeIn(frame) * 0.32;
  return (
    <group scale={s} rotation={[0.1, -0.35 + frame * 0.006, 0]} position={[0, -0.3, frame * 0.003]}>
      <RoundedBox args={[1.35, 2.3, 0.95]} radius={0.09} smoothness={3}><meshStandardMaterial color="#1c1e26" metalness={0.6} roughness={0.34} /></RoundedBox>
      <RoundedBox args={[0.95, 0.72, 0.05]} radius={0.05} smoothness={3} position={[0, 0.55, 0.49]}><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.8} /></RoundedBox>
      <mesh position={[0.6, -0.2, 0.42]} rotation={[0, 0, 0.35]}><boxGeometry args={[0.14, 0.6, 0.14]} /><meshStandardMaterial color="#2a2c34" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 1.18, 0]}><boxGeometry args={[1.0, 0.12, 0.7]} /><meshStandardMaterial color="#14151a" metalness={0.6} roughness={0.4} /></mesh>
    </group>
  );
};

const MoneyStack: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.5 + easeIn(frame) * 0.32;
  return (
    <group scale={s} rotation={[0.32, -0.35 + frame * 0.008, 0]} position={[0, -0.2 + Math.sin(frame / 28) * 0.05, 0]}>
      {[-1.25, 0, 1.25].map((x, si) => Array.from({ length: 5 + si }).map((_, i) => (
        <mesh key={`${si}-${i}`} position={[x, -0.9 + i * 0.17, 0]}><cylinderGeometry args={[0.56, 0.56, 0.15, 44]} /><meshStandardMaterial color={i % 2 ? "#e0bb55" : "#c9a23f"} metalness={0.95} roughness={0.22} /></mesh>
      )))}
    </group>
  );
};

export const Object3D: React.FC<{ kind: "barrel" | "thermometer" | "flame" | "gaspump" | "money"; frames?: number; level?: number }> = ({ kind, frames, level = 0.82 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const camX = Math.sin(frame / 70) * 0.45;
  const camY = 0.3 + Math.sin(frame / 95) * 0.22;
  const outAt = Math.round((frames ?? 110) * 0.62);
  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }} camera={{ position: [camX, camY, 8], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.32} />
      <pointLight position={[5, 7, 8]} intensity={150} color="#ffffff" decay={2} />
      <pointLight position={[-6, 0, 3]} intensity={200} color={MAG} decay={2} />
      <Environment resolution={160}>
        <Lightformer form="rect" intensity={3.5} color="#ffffff" position={[4, 5, 6]} scale={[8, 8, 1]} />
        <Lightformer form="rect" intensity={3} color={MAG} position={[-5, -1, 3]} scale={[5, 9, 1]} />
        <Lightformer form="circle" intensity={2} color="#9fd0ff" position={[2, -3, -5]} scale={[5, 5, 1]} />
      </Environment>
      {kind === "barrel" && <Barrel frame={frame} />}
      {kind === "thermometer" && <Thermometer frame={frame} level={level} />}
      {kind === "flame" && <Flame frame={frame} outAt={outAt} />}
      {kind === "gaspump" && <GasPump frame={frame} />}
      {kind === "money" && <MoneyStack frame={frame} />}
    </ThreeCanvas>
  );
};
