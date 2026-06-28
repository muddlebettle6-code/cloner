// 3D objects (v4) — LIGHT mode: bright environment reflections + soft dark contact
// shadows on the cream page. Satellite, cell tower, phone. Deterministic motion.
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer, ContactShadows, RoundedBox } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { E } from "./theme";

const easeIn = (frame: number, dur = 18) => E.softOvershoot(Math.min(1, frame / dur));
const MAG = "#ff2d92";

const Satellite: React.FC<{ frame: number }> = ({ frame }) => {
  const s = (0.55 + easeIn(frame) * 0.35) * 0.62;
  const bob = Math.sin(frame / 26) * 0.08;
  return (
    <group scale={s} rotation={[0.32, -0.4 + frame * 0.01, 0.12]} position={[0, bob, frame * 0.004]}>
      <RoundedBox args={[1.0, 1.15, 0.55]} radius={0.06} smoothness={3}><meshStandardMaterial color="#23252c" metalness={0.85} roughness={0.28} /></RoundedBox>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.95, 0, 0]}>
          <mesh><boxGeometry args={[2.7, 0.92, 0.05]} /><meshStandardMaterial color="#12243f" metalness={0.45} roughness={0.35} emissive="#0b1a33" emissiveIntensity={0.25} /></mesh>
          {[-0.9, -0.45, 0, 0.45, 0.9].map((gx, i) => <mesh key={i} position={[gx, 0, 0.03]}><boxGeometry args={[0.02, 0.9, 0.01]} /><meshStandardMaterial color="#1c3357" metalness={0.5} roughness={0.3} /></mesh>)}
          <mesh position={[-side * 1.45, 0, 0]}><boxGeometry args={[0.62, 0.07, 0.07]} /><meshStandardMaterial color="#3a3c44" metalness={0.9} roughness={0.22} /></mesh>
        </group>
      ))}
      <mesh position={[0, -0.42, 0.32]}><boxGeometry args={[0.74, 0.74, 0.06]} /><meshStandardMaterial color="#15171c" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0, 0.78, 0.12]}><cylinderGeometry args={[0.022, 0.022, 0.5, 10]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.7} /></mesh>
    </group>
  );
};

const Tower: React.FC<{ frame: number }> = ({ frame }) => {
  const s = (0.5 + easeIn(frame) * 0.3) * 0.95;
  return (
    <group scale={s} rotation={[0.05, -0.3 + frame * 0.008, 0]} position={[0, -0.3, frame * 0.003]}>
      <mesh><cylinderGeometry args={[0.09, 0.2, 3.4, 14]} /><meshStandardMaterial color="#34363c" metalness={0.88} roughness={0.3} /></mesh>
      {[-1.1, -0.4, 0.3, 1.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.025, 0.34 - 0.05 * i, 8]} /><meshStandardMaterial color="#4a4c52" metalness={0.8} roughness={0.3} /></mesh>
      ))}
      {[0, 120, 240].map((a, i) => { const r = (a * Math.PI) / 180; return (
        <mesh key={i} position={[Math.cos(r) * 0.34, 1.62, Math.sin(r) * 0.34]} rotation={[0, -r, 0]}><boxGeometry args={[0.13, 0.52, 0.3]} /><meshStandardMaterial color="#22242a" metalness={0.6} roughness={0.34} /></mesh>
      ); })}
      <mesh position={[0, 1.95, 0]}><sphereGeometry args={[0.085, 16, 16]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={1.1} /></mesh>
    </group>
  );
};

const Phone: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.5 + easeIn(frame) * 0.32;
  const bob = Math.sin(frame / 24) * 0.08;
  return (
    <group scale={s} position={[0, bob, frame * 0.004]} rotation={[0.12, -0.5 + frame * 0.008, 0.02]}>
      <RoundedBox args={[1.5, 3.0, 0.22]} radius={0.22} smoothness={6}><meshStandardMaterial color="#2a2c32" metalness={0.85} roughness={0.22} /></RoundedBox>
      <RoundedBox args={[1.32, 2.78, 0.04]} radius={0.16} smoothness={5} position={[0, 0, 0.12]}><meshStandardMaterial color="#0c0d10" metalness={0.4} roughness={0.18} emissive={MAG} emissiveIntensity={0.14} /></RoundedBox>
    </group>
  );
};

export const Object3D: React.FC<{ kind: "satellite" | "tower" | "phone" }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }} camera={{ position: [0, 0.4, 8], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 7, 8]} intensity={150} color="#ffffff" decay={2} />
      <pointLight position={[-6, 1, 3]} intensity={120} color={MAG} decay={2} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={4} color="#ffffff" position={[4, 5, 6]} scale={[8, 8, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffffff" position={[-5, 2, 4]} scale={[6, 8, 1]} />
        <Lightformer form="circle" intensity={2.5} color={MAG} position={[-4, -2, 3]} scale={[4, 4, 1]} />
      </Environment>
      <ContactShadows position={[0, -1.55, 0]} opacity={0.34} blur={2.6} scale={9} far={4} color="#17140f" />
      {kind === "satellite" && <Satellite frame={frame} />}
      {kind === "tower" && <Tower frame={frame} />}
      {kind === "phone" && <Phone frame={frame} />}
    </ThreeCanvas>
  );
};
