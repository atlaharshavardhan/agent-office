// Scene 2: the scale of the loss as 3D valuation columns.
// NVIDIA's column rises to $5.77T, its top $2.0T turns red and slides off beside Meta (~$1.59T),
// then dissolves into a wireframe: market value, not cash.
import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { C, W, H, ramp, lerp, clamp } from '../theme';
import { CamRig, projector, StudioEnv } from './kit';
import { Title, R } from '../ui';

const U = 0.55;                   // world units per $1T
export const Columns = ({ start, cashAt }) => {
  const f = useCurrentFrame();
  const lt = f / 30 - start;
  const rise = ramp(f, start + 0.1, 0.7);
  const tint = ramp(f, start + 0.75, 0.35);
  const slide = ramp(f, start + 1.0, 0.7);
  const meta = ramp(f, start + 0.9, 0.7);
  const dissolve = ramp(f, cashAt, 0.8);
  const az = -0.32 + lt * 0.05;
  const cam = [0.7 + Math.sin(az) * 15.5, 3.4 + lt * 0.08, Math.cos(az) * 15.5];
  const look = [0.7, 1.15, 0];
  const P = projector(cam, look, 34);
  const nvH = 5.77 * U * rise, keepH = 3.77 * U, lostH = 2.0 * U;
  const lostX = lerp(-1.1, 1.2, slide), lostY = lerp(keepH + lostH / 2, lostH / 2, slide);
  const shards = [];
  if (dissolve > 0) {
    for (let i = 0; i < 40; i++) {
      const r = Math.sin(i * 12.9898) * 43758.5453 % 1;
      shards.push(<mesh key={i} position={[1.2 + (r - 0.5) * 0.9 + dissolve * (r - 0.5) * 1.5, lostH * ((i % 10) / 10) + dissolve * (0.6 + r),
        (((i * 7) % 10) / 10 - 0.5) * 0.9]} rotation={[r * 6 * dissolve, r * 4, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.02]} /><meshStandardMaterial color={C.red} emissive={C.red} emissiveIntensity={0.6} transparent opacity={1 - dissolve} />
      </mesh>);
    }
  }
  const lbl = (p, txt, color, a, size = 40) => {
    const [x, y] = P(p);
    return <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)', font: `800 ${size}px 'Inter Display',Inter`, color, opacity: a, textShadow: '0 4px 18px #000', whiteSpace: 'nowrap' }}>{txt}</div>;
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 60%, #1a1e22, ${C.bg} 70%)` }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={34} />
        <StudioEnv />
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 8, 5]} intensity={2.2} />
        <pointLight position={[1.2, 1.2, 1.5]} color={C.red} intensity={dissolve > 0 ? 6 * (1 - dissolve) + 1 : tint * 4} distance={6} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[30, 30]} /><meshStandardMaterial color="#0b0d0f" metalness={0.6} roughness={0.35} />
        </mesh>
        {/* grid lines on the floor */}
        {[...Array(13)].map((_, i) => (
          <mesh key={i} position={[-3 + i * 0.5, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.01, 12]} /><meshBasicMaterial color="#20252b" /></mesh>
        ))}
        {/* NVIDIA: kept value (green glass) */}
        <mesh position={[-1.1, Math.min(nvH, keepH) / 2, 0]}>
          <boxGeometry args={[1.1, Math.max(0.001, Math.min(nvH, keepH)), 1.1]} />
          <meshPhysicalMaterial color={C.green} metalness={0.2} roughness={0.15} clearcoat={1} emissive={C.green} emissiveIntensity={0.18} transparent opacity={0.92} />
        </mesh>
        {/* NVIDIA: the lost $2.0T (turns red, slides off, dissolves) */}
        {nvH > keepH && (
          <mesh position={[lostX, slide > 0 ? lostY : keepH + (nvH - keepH) / 2, 0]}>
            <boxGeometry args={[1.1, slide > 0 ? lostH : nvH - keepH, 1.1]} />
            <meshPhysicalMaterial color={new THREE.Color(C.green).lerp(new THREE.Color(C.red), tint)} metalness={0.2} roughness={0.2} clearcoat={1}
              emissive={C.red} emissiveIntensity={0.25 * tint} transparent opacity={1 - dissolve * 0.85} wireframe={dissolve > 0.55} />
          </mesh>
        )}
        {/* Meta (~$1.59T) */}
        <mesh position={[2.55, (1.59 * U * meta) / 2, 0]}>
          <boxGeometry args={[1.1, Math.max(0.001, 1.59 * U * meta), 1.1]} />
          <meshStandardMaterial color={C.silver} metalness={0.95} roughness={0.28} />
        </mesh>
        {shards}
      </ThreeCanvas>
      {lbl([-1.1, nvH + 0.15, 0], <span>$5.77T <span style={{ font: "600 26px Inter", color: '#ccc' }}>peak</span></span>, C.green, rise * (1 - slide))}
      {lbl([-1.1, keepH + 0.15, 0], '$3.76T', C.green, slide)}
      {lbl([lostX, (slide > 0 ? lostH : 5.77 * U) + 0.15, 0], '−$2.0T', C.red, tint * (1 - dissolve * 0.3), 46)}
      {lbl([2.55, 1.59 * U * meta + 0.15, 0], <span>Meta <span style={{ font: "600 28px Inter" }}>~$1.59T</span></span>, C.silver, meta)}
      {lbl([0.6, -0.15, 0.9], <span style={{ font: "700 30px Inter", letterSpacing: 3 }}>MARKET VALUE · NOT CASH</span>, '#F5F5F5', dissolve, 30)}
      <Title at={start + 0.15} sub="NVIDIA’s lost value vs. all of Meta">Bigger than <R>all of Meta</R></Title>
    </div>
  );
};
