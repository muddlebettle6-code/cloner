// The required 3D scene: a crude-oil barrel, deterministic, white key + magenta
// rim light on black, slow rotation. Built from three primitives (no external model).
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { E } from "./theme";

const Barrel: React.FC<{ frame: number }> = ({ frame }) => {
  const ry = frame * 0.012; // slow continuous spin
  const tilt = 0.16;
  const rise = Math.min(1, frame / 24);
  const y = (1 - E.cinematicScale(rise)) * -1.2; // ease up into frame
  const bandColor = "#3a3a44";
  return (
    <group rotation={[tilt, ry, 0]} position={[0, y + 0.15, 0]} scale={0.82}>
      {/* body */}
      <mesh>
        <cylinderGeometry args={[1.02, 1.02, 2.55, 64]} />
        <meshStandardMaterial color="#15151b" metalness={0.62} roughness={0.34} />
      </mesh>
      {/* rim chamfers / lids */}
      <mesh position={[0, 1.28, 0]}>
        <cylinderGeometry args={[1.04, 1.0, 0.16, 64]} />
        <meshStandardMaterial color="#1c1c24" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -1.28, 0]}>
        <cylinderGeometry args={[1.0, 1.04, 0.16, 64]} />
        <meshStandardMaterial color="#1c1c24" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* ribs */}
      {[0.78, 0, -0.78].map((yy, i) => (
        <mesh key={i} position={[0, yy, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.03, 0.045, 12, 64]} />
          <meshStandardMaterial color={bandColor} metalness={0.75} roughness={0.28} />
        </mesh>
      ))}
    </group>
  );
};

export const Barrel3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} style={{ position: "absolute", inset: 0 }} camera={{ position: [0, 0, 8.4], fov: 34 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.22} />
      <pointLight position={[4.5, 6, 6]} intensity={120} color="#ffffff" decay={2} />
      <pointLight position={[-5.5, -1.5, -3.5]} intensity={220} color="#ff2d92" decay={2} />
      <pointLight position={[0, 0.5, 7]} intensity={40} color="#ffffff" decay={2} />
      <Barrel frame={frame} />
    </ThreeCanvas>
  );
};
