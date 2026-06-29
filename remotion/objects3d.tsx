// 3D objects (v11 / housing) — a house (white, pops on black), a row of houses for
// "supply piling up", a SOLD rider. New for this story. drei env + camera behaviour.
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { E } from "./theme";

const easeIn = (frame: number, dur = 10) => E.softOvershoot(Math.min(1, frame / dur));
const MAG = "#ff2d92";

const HouseMesh: React.FC<{ lit?: boolean; sold?: boolean }> = ({ lit = true, sold = false }) => (
  <group>
    {/* body — light, so it reads as the focal subject on black */}
    <RoundedBox args={[2.2, 1.5, 1.8]} radius={0.04} smoothness={3} position={[0, -0.05, 0]}><meshStandardMaterial color="#ece8df" metalness={0.05} roughness={0.62} /></RoundedBox>
    {/* gable roof — two slanted charcoal planes */}
    <mesh position={[-0.62, 0.95, 0]} rotation={[0, 0, 0.62]}><boxGeometry args={[1.55, 0.12, 1.96]} /><meshStandardMaterial color="#2a2a30" metalness={0.3} roughness={0.5} /></mesh>
    <mesh position={[0.62, 0.95, 0]} rotation={[0, 0, -0.62]}><boxGeometry args={[1.55, 0.12, 1.96]} /><meshStandardMaterial color="#2a2a30" metalness={0.3} roughness={0.5} /></mesh>
    {/* door */}
    <mesh position={[0, -0.35, 0.92]}><boxGeometry args={[0.42, 0.8, 0.04]} /><meshStandardMaterial color="#1d1d22" metalness={0.3} roughness={0.5} /></mesh>
    {/* windows — magenta-lit */}
    {[[-0.68, 0.18], [0.68, 0.18]].map((w, i) => (
      <mesh key={i} position={[w[0], w[1], 0.92]}><boxGeometry args={[0.42, 0.42, 0.03]} /><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={lit ? 0.7 : 0.0} metalness={0.2} roughness={0.3} /></mesh>
    ))}
    {/* chimney */}
    <mesh position={[0.55, 1.35, -0.4]}><boxGeometry args={[0.22, 0.5, 0.22]} /><meshStandardMaterial color="#23232a" metalness={0.3} roughness={0.5} /></mesh>
    {sold && (
      <group position={[-0.7, -0.95, 0.95]} rotation={[0, 0, -0.06]}>
        <mesh position={[0, 0.5, 0]}><boxGeometry args={[0.05, 1.0, 0.05]} /><meshStandardMaterial color="#3a3a42" metalness={0.6} roughness={0.4} /></mesh>
        <RoundedBox args={[1.0, 0.42, 0.05]} radius={0.04} position={[0.45, 0.85, 0]}><meshStandardMaterial color={MAG} emissive={MAG} emissiveIntensity={0.5} metalness={0.3} roughness={0.4} /></RoundedBox>
      </group>
    )}
  </group>
);

const House: React.FC<{ frame: number; sold?: boolean }> = ({ frame, sold }) => {
  const s = 0.7 + easeIn(frame) * 0.38;
  return (
    <group scale={s} rotation={[0.12, -0.45 + frame * 0.004, 0]} position={[0, Math.sin(frame / 30) * 0.04, frame * 0.004]}>
      <HouseMesh sold={sold} />
    </group>
  );
};

// supply piling up: a receding row of houses
const HouseRow: React.FC<{ frame: number }> = ({ frame }) => {
  const positions: [number, number][] = [[0, 0], [-2.4, -0.5], [2.4, -0.5], [-4.6, -1.0], [4.6, -1.0]];
  return (
    <group rotation={[0.18, -0.2 + frame * 0.003, 0]} position={[0, -0.2, 0]}>
      {positions.map((p, i) => {
        const pop = E.softOvershoot(Math.min(1, Math.max(0, (frame - 1 - i * 3) / 12)));
        return (
          <group key={i} position={[p[0], p[1], -i * 1.2]} scale={(0.55 + i * 0.04) * pop}><HouseMesh lit={i === 0} /></group>
        );
      })}
    </group>
  );
};

export const Object3D: React.FC<{ kind: "house" | "houseSold" | "supply"; frames?: number; level?: number }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // camera PUSH-IN over the scene (real camera behaviour, not just object drift)
  const z = interpolate(frame, [0, 90], [9.2, 7.6], { extrapolateRight: "clamp", easing: E.slowDrift });
  const camY = 0.5 + Math.sin(frame / 80) * 0.12;
  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }} camera={{ position: [0, camY, z], fov: 34 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.42} />
      <pointLight position={[5, 7, 8]} intensity={150} color="#ffffff" decay={2} />
      <pointLight position={[-6, 1, 3]} intensity={150} color={MAG} decay={2} />
      <Environment resolution={160}>
        <Lightformer form="rect" intensity={3.5} color="#ffffff" position={[4, 6, 6]} scale={[9, 9, 1]} />
        <Lightformer form="rect" intensity={2.6} color={MAG} position={[-5, -1, 3]} scale={[5, 9, 1]} />
        <Lightformer form="circle" intensity={2} color="#cfe0ff" position={[2, -3, -5]} scale={[5, 5, 1]} />
      </Environment>
      {kind === "house" && <House frame={frame} />}
      {kind === "houseSold" && <House frame={frame} sold />}
      {kind === "supply" && <HouseRow frame={frame} />}
    </ThreeCanvas>
  );
};
