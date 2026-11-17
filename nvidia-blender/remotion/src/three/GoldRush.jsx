// Scene 4: the AI gold rush. Big Tech capital streams (light pulses, not dollar bills) flow into
// a central NVIDIA GPU cluster while a network of data-center blocks expands around it.
import React, { useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { C, W, H, ramp, lerp } from '../theme';
import { CamRig, projector, StudioEnv, GpuModel } from './kit';
import { Title, G, Source } from '../ui';

const SOURCES = [['Microsoft', -3.2, -2.2], ['Alphabet', 3.2, -2.2], ['Amazon', -3.4, 2.4], ['Meta', 3.4, 2.4]];
const curve = (x, z) => new THREE.QuadraticBezierCurve3(new THREE.Vector3(x, 0.35, z), new THREE.Vector3(x * 0.45, 2.2, z * 0.45), new THREE.Vector3(0, 0.55, 0));

export const GoldRush = ({ start, end }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const lt = t - start, d = end - start;
  const az = 0.5 + lt * 0.09;
  const rad = lerp(14.5, 12.5, lt / d);
  const cam = [Math.sin(az) * rad, lerp(7.5, 9.0, lt / d), Math.cos(az) * rad];
  const look = [0, -0.7, 0];            // aim a little low so the network sits between title and captions
  const P = projector(cam, look, 38);
  const curves = useMemo(() => SOURCES.map(([, x, z]) => curve(x, z)), []);
  const grow = ramp(f, start + 0.4, d - 1.2);
  // expanding ring network of data-center blocks (deterministic layout)
  const blocks = useMemo(() => {
    const out = [];
    for (let ring = 1; ring <= 5; ring++) {
      const n = 6 + ring * 5;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + ring * 0.37;
        const r = 1.6 + ring * 0.75;
        out.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, ring, h: 0.18 + ((k * 37 + ring * 11) % 7) * 0.03 });
      }
    }
    return out;
  }, []);
  const capex = Math.round(700 * ramp(f, start + 1.2, 2.6));
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 55%, #11161a, ${C.bg} 72%)` }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={38} />
        <StudioEnv />
        <fog attach="fog" args={[C.bg, 12, 24]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[2, 6, 3]} intensity={1.6} />
        <pointLight position={[0, 1.6, 0]} color={C.green} intensity={8} distance={7} />
        <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[9, 64]} /><meshStandardMaterial color="#0a0c0e" metalness={0.5} roughness={0.45} /></mesh>
        {/* central cluster pedestal + the hero GPU */}
        <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[1.05, 1.15, 0.24, 64]} /><meshStandardMaterial color="#1b1f24" metalness={0.9} roughness={0.25} /></mesh>
        <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.98, 1.04, 64]} /><meshBasicMaterial color={C.green} /></mesh>
        <GpuModel scale={0.13} position={[0, 0.3, 0]} rotation={[0, lt * 0.15, 0]} />
        {/* data-center network */}
        {blocks.map((b, i) => {
          const on = ramp(f, start + 0.3 + (b.ring - 1) * ((d - 1.5) / 5) + (i % 7) * 0.03, 0.4);
          if (on <= 0) return null;
          return (
            <group key={i} position={[b.x, 0, b.z]}>
              <mesh position={[0, (b.h * on) / 2, 0]}><boxGeometry args={[0.32, b.h * on + 0.001, 0.22]} /><meshStandardMaterial color="#1a1d21" metalness={0.7} roughness={0.35} /></mesh>
              <mesh position={[0, b.h * on + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.26, 0.04]} /><meshBasicMaterial color={C.green} transparent opacity={on} /></mesh>
            </group>
          );
        })}
        {/* capital streams: pulses travelling along each curve */}
        {curves.map((cv, s) => (
          <group key={s}>
            <mesh><tubeGeometry args={[cv, 40, 0.012, 6, false]} /><meshBasicMaterial color={C.gold} transparent opacity={0.25 * grow} /></mesh>
            {[...Array(9)].map((_, k) => {
              const u = ((lt * 0.55 + k / 9 + s * 0.13) % 1);
              const p = cv.getPoint(u);
              return <mesh key={k} position={p} scale={grow > 0 ? 1 : 0}><sphereGeometry args={[0.045 + 0.02 * Math.sin(k), 12, 12]} /><meshBasicMaterial color={u > 0.85 ? C.green : C.gold} /></mesh>;
            })}
            <mesh position={[SOURCES[s][1], 0.22, SOURCES[s][2]]}><boxGeometry args={[0.55, 0.44, 0.55]} /><meshStandardMaterial color="#2a2f35" metalness={0.9} roughness={0.25} emissive={C.gold} emissiveIntensity={0.12} /></mesh>
          </group>
        ))}
      </ThreeCanvas>
      {SOURCES.map(([n, x, z]) => {
        const [sx, sy] = P([x, 0.6, z]);
        if (sy > 1180 || sy < 600) return null;
        return <div key={n} style={{ position: 'absolute', left: sx, top: sy, transform: 'translate(-50%,-100%)', font: "700 30px Inter", color: '#F5F5F5', opacity: grow, textShadow: '0 3px 12px #000' }}>{n}</div>;
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', font: "800 110px 'Inter Display',Inter", color: C.green, textShadow: '0 0 40px rgba(118,185,0,.35)' }}>
        ${capex}B<span style={{ fontSize: 80 }}>+</span>
      </div>
      <Title at={start + 0.1} sub="Big Tech’s 2026 AI spending plans (est.)">The AI <G>gold rush</G></Title>
      <Source at={start + 1.4}>Microsoft · Alphabet · Amazon · Meta capex plans, ~$720–745B combined (est.)</Source>
    </div>
  );
};
