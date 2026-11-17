// V2 scene 5, reason 2: the "circular financing" mechanism as three physical structures.
// 1) NVIDIA invests money in an AI company  2) the AI company buys NVIDIA GPUs with it
// 3) the GPUs go into data-centre infrastructure, the payment returns to NVIDIA as sales.
import React, { useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { C, W, H, ramp, lerp } from '../theme';
import { CamRig, projector, StudioEnv, GpuModel } from '../three/kit';
import { BigTitle } from './kit';

const NV = new THREE.Vector3(-1.6, 0, 0.6), AI = new THREE.Vector3(1.7, 0, 0.4), DC = new THREE.Vector3(0.1, 0, -2.0);
const arc = (a, b, hgt) => new THREE.QuadraticBezierCurve3(a.clone().setY(1.2), a.clone().lerp(b, 0.5).setY(hgt), b.clone().setY(1.0));

export const MoneyLoop3D = ({ start, end }) => {
  const f = useCurrentFrame();
  const lt = f / 30 - start, d = end - start;
  const s1 = ramp(f, start + 0.15, 0.5), s2 = ramp(f, start + 0.95, 0.5), s3 = ramp(f, start + 1.75, 0.5);
  const az = lerp(-0.35, 0.25, lt / d);
  const cam = [Math.sin(az) * 12, 6.8, Math.cos(az) * 12];
  const look = [0.35, 0.6, -0.4];
  const P = projector(cam, look, 40);
  const c1 = useMemo(() => arc(NV, AI, 2.6), []), c2 = useMemo(() => arc(AI, NV, 3.4), []), c3 = useMemo(() => arc(NV, DC, 2.4), []);
  const flow = (curve, n, on, color, kind) => [...Array(n)].map((_, k) => {
    const u = (lt * 0.7 + k / n) % 1;
    if (on <= 0) return null;
    const p = curve.getPoint(u);
    return kind === 'chip'
      ? <mesh key={k} position={p} rotation={[0.4, lt + k, 0]}><boxGeometry args={[0.16, 0.03, 0.12]} /><meshStandardMaterial color="#2b2f35" metalness={0.9} roughness={0.25} emissive={C.green} emissiveIntensity={0.6} /></mesh>
      : <mesh key={k} position={p} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.02, 20]} /><meshStandardMaterial color={color} metalness={1} roughness={0.25} emissive={color} emissiveIntensity={0.35} /></mesh>;
  });
  const lbl = (p, txt, col, a, size = 34) => {
    const [x, y] = P(p);
    return <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: a, font: `800 ${size}px Inter`, color: col, textShadow: '0 3px 14px #000', whiteSpace: 'nowrap', background: 'rgba(8,9,11,.6)', padding: '4px 12px', borderRadius: 10 }}>{txt}</div>;
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 45%, #1b1f24, ${C.bg} 75%)` }}>
      <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={40} />
        <StudioEnv />
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 8, 5]} intensity={2.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
          shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#121417" metalness={0.4} roughness={0.5} /></mesh>
        {/* NVIDIA: green-glass tower with the GPU on top */}
        <mesh position={[NV.x, 0.8, NV.z]} castShadow><boxGeometry args={[1.0, 1.6, 1.0]} />
          <meshPhysicalMaterial color={C.green} metalness={0.3} roughness={0.15} clearcoat={1} emissive={C.green} emissiveIntensity={0.15} /></mesh>
        <GpuModel scale={0.075} position={[NV.x, 1.62, NV.z]} rotation={[0, lt * 0.3, 0]} />
        {/* AI company campus: white office blocks */}
        {[[0, 0, 1.1], [0.55, 0.3, 0.8], [-0.5, 0.35, 0.65]].map(([dx, dz, h], k) => (
          <mesh key={k} position={[AI.x + dx, h / 2, AI.z + dz]} castShadow><boxGeometry args={[0.5, h, 0.5]} />
            <meshStandardMaterial color="#e9ecef" metalness={0.2} roughness={0.35} /></mesh>
        ))}
        {/* GPU infrastructure: rows of racks */}
        {[...Array(4)].map((_, r) => [...Array(6)].map((__, i) => (
          <group key={`${r}-${i}`} position={[DC.x - 1.25 + i * 0.5, 0, DC.z - 0.5 + r * 0.42]}>
            <mesh position={[0, 0.32, 0]} castShadow><boxGeometry args={[0.32, 0.64, 0.28]} /><meshStandardMaterial color="#1a1d21" metalness={0.7} roughness={0.35} /></mesh>
            <mesh position={[0, 0.32, 0.141]}><planeGeometry args={[0.2, 0.5]} /><meshBasicMaterial color={s3 > 0 ? C.green : '#0c0e10'} transparent opacity={0.25 + 0.5 * s3} /></mesh>
          </group>
        )))}
        {/* flows */}
        <mesh><tubeGeometry args={[c1, 40, 0.012, 6, false]} /><meshBasicMaterial color={C.gold} transparent opacity={0.4 * s1} /></mesh>
        <mesh><tubeGeometry args={[c2, 40, 0.012, 6, false]} /><meshBasicMaterial color={C.green} transparent opacity={0.4 * s2} /></mesh>
        <mesh><tubeGeometry args={[c3, 40, 0.012, 6, false]} /><meshBasicMaterial color={C.green} transparent opacity={0.4 * s3} /></mesh>
        {flow(c1, 8, s1, C.gold, 'coin')}
        {flow(c2, 8, s2, C.gold, 'coin')}
        {flow(c3, 7, s3, C.green, 'chip')}
      </ThreeCanvas>
      {lbl([NV.x, -0.15, NV.z + 0.4], 'NVIDIA', C.green, s1, 40)}
      {lbl([AI.x, -0.15, AI.z + 0.7], 'AI companies', '#F5F5F5', s1, 40)}
      {lbl([DC.x, -0.1, DC.z + 1.1], 'GPU data centers', '#F5F5F5', s3, 36)}
      {lbl(c1.getPoint(0.5).toArray(), '① invests $', C.gold, s1)}
      {lbl(c2.getPoint(0.4).toArray(), '② buys NVIDIA chips', C.green, s2)}
      {lbl(c3.getPoint(0.72).toArray(), '③ chips ship out', C.green, s3)}
      <BigTitle at={start + 0.05} lines={[['The money loop']]} sub="Is the demand real, or partly funded by NVIDIA?" size={96} />
    </div>
  );
};
