// 3D objects (v8) — AI-bubble set. Glossy iridescent bubble, AI chip, data center,
// coin stack. drei environment reflections, slow cinematic camera drift.
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { E } from "./theme";

const easeIn = (frame: number, dur = 18) => E.softOvershoot(Math.min(1, frame / dur));
const MAG = "#ff2d92";

// the hero: a glossy iridescent bubble (breathing, drifting)
const Bubble: React.FC<{ frame: number }> = ({ frame }) => {
  const s = (0.62 + easeIn(frame) * 0.42) * (1 + 0.025 * Math.sin(frame / 22));
  return (
    <group scale={s} rotation={[0.2, frame * 0.005, 0]} position={[0, Math.sin(frame / 30) * 0.12, 0]}>
      <mesh>
        <sphereGeometry args={[1.3, 96, 96]} />
        <meshPhysicalMaterial color="#ff5fae" roughness={0.03} metalness={0.15} clearcoat={1} clearcoatRoughness={0.04} iridescence={1} iridescenceIOR={1.4} transparent opacity={0.82} envMapIntensity={2.4} />
      </mesh>
      <mesh position={[0.42, 0.5, 0.55]} scale={0.9}><sphereGeometry args={[0.22, 32, 32]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.55} /></mesh>
      {[[-2.0, -1.0, -1, 0.4], [2.1, 0.9, -1.5, 0.32], [-1.6, 1.4, -1, 0.28]].map((b, i) => (
        <mesh key={i} position={[b[0], b[1], b[2]]} scale={b[3]}><sphereGeometry args={[1, 48, 48]} /><meshPhysicalMaterial color="#ff5fae" roughness={0.05} clearcoat={1} iridescence={1} transparent opacity={0.55} envMapIntensity={2} /></mesh>
      ))}
    </group>
  );
};

// an AI chip (dark package + glowing magenta die + gold pins)
const Chip: React.FC<{ frame: number }> = ({ frame }) => {
  const s = 0.62 + easeIn(frame) * 0.34;
  return (
    <group scale={s} rotation={[0.5, -0.3 + frame * 0.008, 0]} position={[0, Math.sin(frame / 26) * 0.07, frame * 0.003]}>
      <RoundedBox args={[2.0, 2.0, 0.2]} radius={0.05} smoothness={3}><meshStandardMaterial color="#14141a" metalness={0.65} roughness={0.38} /></RoundedBox>
      <RoundedBox args={[1.05, 1.05, 0.07]} radius={0.03} smoothness={3} position={[0, 0, 0.13]}><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.85} metalness={0.3} roughness={0.3} /></RoundedBox>
      {[0, 1, 2, 3].map((side) => Array.from({ length: 9 }).map((_, i) => {
        const off = -0.8 + i * 0.2; const ed = 1.06;
        const pos = side === 0 ? [off, ed, 0.02] : side === 1 ? [off, -ed, 0.02] : side === 2 ? [ed, off, 0.02] : [-ed, off, 0.02];
        return <mesh key={`${side}-${i}`} position={pos as [number, number, number]}><boxGeometry args={[0.1, 0.12, 0.04]} /><meshStandardMaterial color="#c9a44c" metalness={1} roughness={0.25} /></mesh>;
      }))}
    </group>
  );
};

// a data center — rows of server racks with magenta indicator lights
const DataCenter: React.FC<{ frame: number }> = ({ frame }) => {
  const s = (0.5 + easeIn(frame) * 0.28);
  return (
    <group scale={s} rotation={[0.12, -0.4 + frame * 0.006, 0]} position={[0, -0.2, frame * 0.003]}>
      {[-1.7, -0.85, 0, 0.85, 1.7].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <RoundedBox args={[0.62, 2.5, 0.78]} radius={0.03} smoothness={2}><meshStandardMaterial color="#1a1c23" metalness={0.7} roughness={0.32} /></RoundedBox>
          {Array.from({ length: 6 }).map((_, k) => (
            <mesh key={k} position={[0.16, 1.0 - k * 0.38, 0.4]}><boxGeometry args={[0.18, 0.05, 0.02]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.6 + 0.4 * Math.sin(frame / 5 + i + k)} /></mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

const MoneyStack: React.FC<{ frame: number }> = ({ frame }) => {
  const s = (0.5 + easeIn(frame) * 0.32);
  return (
    <group scale={s} rotation={[0.32, -0.35 + frame * 0.008, 0]} position={[0, -0.2 + Math.sin(frame / 28) * 0.05, 0]}>
      {[-1.25, 0, 1.25].map((x, si) => Array.from({ length: 5 + si }).map((_, i) => (
        <mesh key={`${si}-${i}`} position={[x, -0.9 + i * 0.17, 0]}><cylinderGeometry args={[0.56, 0.56, 0.15, 44]} /><meshStandardMaterial color={i % 2 ? "#e0bb55" : "#c9a23f"} metalness={0.95} roughness={0.22} /></mesh>
      )))}
    </group>
  );
};

export const Object3D: React.FC<{ kind: "bubble" | "chip" | "datacenter" | "money" }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const camX = Math.sin(frame / 70) * 0.45;       // slow cinematic drift
  const camY = 0.3 + Math.sin(frame / 95) * 0.22;
  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }} camera={{ position: [camX, camY, 8], fov: 32 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 7, 8]} intensity={150} color="#ffffff" decay={2} />
      <pointLight position={[-6, 0, 3]} intensity={200} color={MAG} decay={2} />
      <Environment resolution={160}>
        <Lightformer form="rect" intensity={3.5} color="#ffffff" position={[4, 5, 6]} scale={[8, 8, 1]} />
        <Lightformer form="rect" intensity={3} color={MAG} position={[-5, -1, 3]} scale={[5, 9, 1]} />
        <Lightformer form="circle" intensity={2} color="#9fd0ff" position={[2, -3, -5]} scale={[5, 5, 1]} />
      </Environment>
      {kind === "bubble" && <Bubble frame={frame} />}
      {kind === "chip" && <Chip frame={frame} />}
      {kind === "datacenter" && <DataCenter frame={frame} />}
      {kind === "money" && <MoneyStack frame={frame} />}
    </ThreeCanvas>
  );
};
