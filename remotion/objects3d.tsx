// 3D objects (v5) — DARK mode: magenta rim + white key on near-black, drei env
// reflections. Coin stack, satellite, beam, cell tower, phone (cleaned up).
import React from "react";
import { DoubleSide } from "three";
import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { E } from "./theme";

const easeIn = (frame: number, dur = 18) => E.softOvershoot(Math.min(1, frame / dur));
const MAG = "#ff2d92";

const MoneyStack: React.FC<{ frame: number }> = ({ frame }) => {
  const s = (0.5 + easeIn(frame) * 0.32);
  return (
    <group scale={s} rotation={[0.32, -0.35 + frame * 0.008, 0]} position={[0, -0.2 + Math.sin(frame / 28) * 0.05, frame * 0.003]}>
      {[-1.25, 0, 1.25].map((x, si) => {
        const n = 5 + si; const grow = E.softOvershoot(Math.min(1, (frame - si * 4) / 22));
        return Array.from({ length: n }).map((_, i) => (
          <mesh key={`${si}-${i}`} position={[x, -0.9 + i * 0.17 * grow, 0]} visible={i / n <= grow + 0.05}>
            <cylinderGeometry args={[0.56, 0.56, 0.15, 44]} />
            <meshStandardMaterial color={i === n - 1 && si === 1 ? MAG : i % 2 ? "#e0bb55" : "#c9a23f"} metalness={0.95} roughness={0.22} emissive={i === n - 1 && si === 1 ? MAG : "#000"} emissiveIntensity={0.3} />
          </mesh>
        ));
      })}
    </group>
  );
};

const Satellite: React.FC<{ frame: number }> = ({ frame }) => {
  const s = (0.55 + easeIn(frame) * 0.35) * 0.6;
  return (
    <group scale={s} rotation={[0.3, -0.4 + frame * 0.01, 0.12]} position={[0, Math.sin(frame / 26) * 0.08, frame * 0.004]}>
      <RoundedBox args={[1.0, 1.15, 0.55]} radius={0.06} smoothness={3}><meshStandardMaterial color="#2a2d36" metalness={0.85} roughness={0.26} /></RoundedBox>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.95, 0, 0]}>
          <mesh><boxGeometry args={[2.7, 0.92, 0.05]} /><meshStandardMaterial color="#15294a" metalness={0.5} roughness={0.32} emissive="#0c1d3a" emissiveIntensity={0.4} /></mesh>
          {[-0.9, -0.45, 0, 0.45, 0.9].map((gx, i) => <mesh key={i} position={[gx, 0, 0.03]}><boxGeometry args={[0.02, 0.9, 0.01]} /><meshStandardMaterial color="#244067" metalness={0.5} roughness={0.3} /></mesh>)}
          <mesh position={[-side * 1.45, 0, 0]}><boxGeometry args={[0.62, 0.07, 0.07]} /><meshStandardMaterial color="#42454d" metalness={0.9} roughness={0.2} /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.78, 0.12]}><cylinderGeometry args={[0.022, 0.022, 0.5, 10]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.9} /></mesh>
    </group>
  );
};

const Beam: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.6 + easeIn(frame) * 0.35; const spin = frame * 0.01;
  return (
    <group scale={s} position={[0, 0.1, 0]}>
      <group position={[0, 1.5, 0]} rotation={[0.3, spin, 0.1]} scale={0.42}>
        <RoundedBox args={[0.9, 1.0, 0.5]} radius={0.06}><meshStandardMaterial color="#2a2d36" metalness={0.85} roughness={0.26} /></RoundedBox>
        {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 1.7, 0, 0]}><boxGeometry args={[2.2, 0.8, 0.05]} /><meshStandardMaterial color="#15294a" metalness={0.5} roughness={0.32} emissive="#0c1d3a" emissiveIntensity={0.4} /></mesh>)}
      </group>
      <mesh position={[0, 0.1, 0]}><coneGeometry args={[1.7, 2.5, 40, 1, true]} /><meshBasicMaterial color={MAG} transparent opacity={0.14} side={DoubleSide} /></mesh>
      <mesh position={[0, -1.15, 0]} rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[1.45, 1.72, 48]} /><meshBasicMaterial color={MAG} transparent opacity={interpolate0(frame)} side={DoubleSide} /></mesh>
    </group>
  );
};
const interpolate0 = (f: number) => 0.3 + Math.sin(f / 8) * 0.15;

const Tower: React.FC<{ frame: number }> = ({ frame }) => {
  const s = (0.5 + easeIn(frame) * 0.3) * 0.95;
  return (
    <group scale={s} rotation={[0.05, -0.3 + frame * 0.008, 0]} position={[0, -0.3, frame * 0.003]}>
      <mesh><cylinderGeometry args={[0.09, 0.2, 3.4, 14]} /><meshStandardMaterial color="#3a3d44" metalness={0.88} roughness={0.28} /></mesh>
      {[-1.1, -0.4, 0.3, 1.0].map((y, i) => <mesh key={i} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.025, 0.34 - 0.05 * i, 8]} /><meshStandardMaterial color="#54575e" metalness={0.8} roughness={0.3} /></mesh>)}
      {[0, 120, 240].map((a, i) => { const r = (a * Math.PI) / 180; return <mesh key={i} position={[Math.cos(r) * 0.34, 1.62, Math.sin(r) * 0.34]} rotation={[0, -r, 0]}><boxGeometry args={[0.13, 0.52, 0.3]} /><meshStandardMaterial color="#26282e" metalness={0.6} roughness={0.34} /></mesh>; })}
      <mesh position={[0, 1.95, 0]}><sphereGeometry args={[0.085, 16, 16]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={1.3} /></mesh>
    </group>
  );
};

const Phone: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.52 + easeIn(frame) * 0.3;
  return (
    <group scale={s} position={[0, Math.sin(frame / 24) * 0.07, frame * 0.004]} rotation={[0.1, -0.45 + frame * 0.007, 0.015]}>
      <RoundedBox args={[1.46, 3.0, 0.2]} radius={0.27} smoothness={8}><meshStandardMaterial color="#1b1d23" metalness={0.92} roughness={0.16} /></RoundedBox>
      <RoundedBox args={[1.32, 2.84, 0.02]} radius={0.2} smoothness={6} position={[0, 0, 0.11]}><meshStandardMaterial color="#08080b" metalness={0.5} roughness={0.1} /></RoundedBox>
      {/* on-screen: a small magenta bar chart trending DOWN (a lower bill) */}
      {[0.95, 0.72, 0.5, 0.32].map((h, i) => <mesh key={i} position={[-0.42 + i * 0.28, -0.55 + h * 0.4, 0.13]}><boxGeometry args={[0.16, h * 0.8, 0.012]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.7} /></mesh>)}
      <mesh position={[0, 1.32, 0.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.05, 0.05, 0.02, 16]} /><meshStandardMaterial color="#0a0a0d" metalness={0.6} roughness={0.3} /></mesh>
    </group>
  );
};

export const Object3D: React.FC<{ kind: "money" | "satellite" | "beam" | "tower" | "phone" }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }} camera={{ position: [0, 0.3, 8], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 7, 8]} intensity={150} color="#ffffff" decay={2} />
      <pointLight position={[-6, 0, 3]} intensity={200} color={MAG} decay={2} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[4, 5, 6]} scale={[7, 7, 1]} />
        <Lightformer form="rect" intensity={3} color={MAG} position={[-5, -1, 3]} scale={[5, 8, 1]} />
        <Lightformer form="circle" intensity={1.5} color="#ffffff" position={[0, 2, -6]} scale={[5, 5, 1]} />
      </Environment>
      {kind === "money" && <MoneyStack frame={frame} />}
      {kind === "satellite" && <Satellite frame={frame} />}
      {kind === "beam" && <Beam frame={frame} />}
      {kind === "tower" && <Tower frame={frame} />}
      {kind === "phone" && <Phone frame={frame} />}
    </ThreeCanvas>
  );
};
