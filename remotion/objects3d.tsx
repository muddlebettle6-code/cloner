// 3D objects (v10) — DST "who really pays" set. Border gate (tariff), laptop (Big
// Tech), shopping cart (the shopper), coin stack. drei env + camera drift.
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { E } from "./theme";

const easeIn = (frame: number, dur = 18) => E.softOvershoot(Math.min(1, frame / dur));
const MAG = "#ff2d92";

// border / customs barrier — a striped arm that lowers shut (the tariff)
const Gate: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.6 + easeIn(frame) * 0.32;
  const close = interpolate0(frame); // arm lowers
  return (
    <group scale={s} rotation={[0.1, -0.25 + frame * 0.005, 0]} position={[-0.2, -0.4, 0]}>
      <mesh position={[-1.25, 0.45, 0]}><cylinderGeometry args={[0.12, 0.15, 2.1, 18]} /><meshStandardMaterial color="#2a2c33" metalness={0.75} roughness={0.28} /></mesh>
      <mesh position={[-1.25, -0.65, 0]}><boxGeometry args={[0.55, 0.22, 0.55]} /><meshStandardMaterial color="#1a1c22" metalness={0.6} roughness={0.4} /></mesh>
      <group position={[-1.25, 1.05, 0]} rotation={[0, 0, close]}>
        {[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} position={[0.32 + i * 0.42, 0, 0]}><boxGeometry args={[0.4, 0.17, 0.17]} /><meshStandardMaterial color={i % 2 ? "#f4f1ea" : MAG} emissive={i % 2 ? "#000" : MAG} emissiveIntensity={i % 2 ? 0 : 0.5} metalness={0.4} roughness={0.4} /></mesh>)}
      </group>
    </group>
  );
};
const interpolate0 = (f: number) => -0.25 - Math.min(0.6, Math.max(0, (f - 24) / 60)) * 0.55;

// a laptop (Big Tech) — glowing magenta screen
const Laptop: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.66 + easeIn(frame) * 0.34;
  return (
    <group scale={s} rotation={[0.05, -0.4 + frame * 0.006, 0]} position={[0, -0.1 + Math.sin(frame / 28) * 0.05, frame * 0.003]}>
      <RoundedBox args={[2.2, 0.12, 1.5]} radius={0.04} smoothness={3} position={[0, -0.5, 0.25]}><meshStandardMaterial color="#1c1e25" metalness={0.82} roughness={0.24} /></RoundedBox>
      <mesh position={[0, -0.43, 0.35]}><boxGeometry args={[1.85, 0.02, 1.0]} /><meshStandardMaterial color="#121319" metalness={0.5} roughness={0.5} /></mesh>
      <group position={[0, -0.5, -0.45]} rotation={[-0.46, 0, 0]}>
        <RoundedBox args={[2.2, 1.45, 0.08]} radius={0.05} smoothness={3} position={[0, 0.72, 0]}><meshStandardMaterial color="#0a0b0e" metalness={0.6} roughness={0.2} /></RoundedBox>
        <mesh position={[0, 0.72, 0.05]}><boxGeometry args={[2.0, 1.25, 0.01]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.7} /></mesh>
      </group>
    </group>
  );
};

// a shopping cart (the shopper who actually pays)
const Cart: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.62 + easeIn(frame) * 0.34;
  return (
    <group scale={s} rotation={[0.16, -0.4 + frame * 0.007, 0]} position={[0, -0.25 + Math.sin(frame / 26) * 0.05, frame * 0.003]}>
      <mesh position={[0, 0.32, 0]}><boxGeometry args={[1.7, 1.0, 1.15]} /><meshStandardMaterial color="#3a3c44" metalness={0.6} roughness={0.4} wireframe /></mesh>
      <mesh position={[0, -0.16, 0]} rotation={[0, 0, 0]}><boxGeometry args={[1.6, 0.06, 1.05]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.35} metalness={0.5} roughness={0.4} /></mesh>
      <mesh position={[-0.9, 0.65, 0]} rotation={[0, 0, 0.35]}><cylinderGeometry args={[0.055, 0.055, 1.1, 14]} /><meshStandardMaterial color="#42454d" metalness={0.85} roughness={0.28} /></mesh>
      {[[0.62, 0.45], [0.62, -0.45], [-0.62, 0.45], [-0.62, -0.45]].map((w, i) => <mesh key={i} position={[w[0], -0.6, w[1]]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.08, 18]} /><meshStandardMaterial color="#16171c" metalness={0.5} roughness={0.5} /></mesh>)}
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

export const Object3D: React.FC<{ kind: "gate" | "laptop" | "cart" | "money"; frames?: number; level?: number }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const camX = Math.sin(frame / 70) * 0.45;
  const camY = 0.3 + Math.sin(frame / 95) * 0.22;
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
      {kind === "gate" && <Gate frame={frame} />}
      {kind === "laptop" && <Laptop frame={frame} />}
      {kind === "cart" && <Cart frame={frame} />}
      {kind === "money" && <MoneyStack frame={frame} />}
    </ThreeCanvas>
  );
};
