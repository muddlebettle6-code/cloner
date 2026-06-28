// 3D objects (deterministic, white key + magenta rim on black). Globe, barrel, coin.
import React from "react";
import { BackSide } from "three";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { E } from "./theme";

const easeIn = (frame: number, dur = 20) => E.softOvershoot(Math.min(1, frame / dur));

const Globe: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.5 + easeIn(frame, 22) * 0.42;
  return (
    <group rotation={[0.32, frame * 0.011, 0]} scale={s} position={[0, 0.95, 0]}>
      <mesh><sphereGeometry args={[1.0, 64, 64]} /><meshStandardMaterial color="#0a0a12" metalness={0.45} roughness={0.55} /></mesh>
      <mesh><sphereGeometry args={[1.005, 26, 26]} /><meshBasicMaterial color="#ff2d92" wireframe transparent opacity={0.34} /></mesh>
      <mesh scale={1.16}><sphereGeometry args={[1.005, 40, 40]} /><meshBasicMaterial color="#ff2d92" transparent opacity={0.05} side={BackSide} /></mesh>
    </group>
  );
};

const Barrel: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.4 + easeIn(frame, 22) * 0.26;
  return (
    <group rotation={[0.16, frame * 0.013, 0]} scale={s} position={[0, 0.8, 0]}>
      <mesh><cylinderGeometry args={[1.05, 1.05, 2.6, 64]} /><meshStandardMaterial color="#15151b" metalness={0.66} roughness={0.32} /></mesh>
      <mesh position={[0, 1.3, 0]}><cylinderGeometry args={[1.07, 1.02, 0.16, 64]} /><meshStandardMaterial color="#1e1e26" metalness={0.72} roughness={0.28} /></mesh>
      <mesh position={[0, -1.3, 0]}><cylinderGeometry args={[1.02, 1.07, 0.16, 64]} /><meshStandardMaterial color="#1e1e26" metalness={0.72} roughness={0.28} /></mesh>
      {[0.82, 0, -0.82].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.06, 0.05, 12, 64]} /><meshStandardMaterial color="#3a3a46" metalness={0.78} roughness={0.26} /></mesh>
      ))}
    </group>
  );
};

const Coin: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.55 + easeIn(frame, 20) * 0.42;
  return (
    <group rotation={[0, frame * 0.055, 0]} scale={s} position={[0, 0.95, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.05, 1.05, 0.16, 72]} /><meshStandardMaterial color="#17171e" metalness={0.82} roughness={0.24} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.05, 0.06, 10, 72]} /><meshStandardMaterial color="#ff2d92" metalness={0.7} roughness={0.3} emissive="#ff2d92" emissiveIntensity={0.25} /></mesh>
      <mesh position={[0, 0, 0.09]}><torusGeometry args={[0.68, 0.04, 10, 64]} /><meshStandardMaterial color="#3a3a46" metalness={0.8} roughness={0.25} /></mesh>
      <mesh position={[0, 0, -0.09]}><torusGeometry args={[0.68, 0.04, 10, 64]} /><meshStandardMaterial color="#3a3a46" metalness={0.8} roughness={0.25} /></mesh>
    </group>
  );
};

export const Object3D: React.FC<{ kind: "globe" | "barrel" | "coin" }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }} camera={{ position: [0, 0, 8.6], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.24} />
      <pointLight position={[5, 6, 7]} intensity={140} color="#ffffff" decay={2} />
      <pointLight position={[-6, -1.5, -3.5]} intensity={240} color="#ff2d92" decay={2} />
      <pointLight position={[0, 0.5, 8]} intensity={45} color="#ffffff" decay={2} />
      {kind === "globe" && <Globe frame={frame} />}
      {kind === "barrel" && <Barrel frame={frame} />}
      {kind === "coin" && <Coin frame={frame} />}
    </ThreeCanvas>
  );
};
