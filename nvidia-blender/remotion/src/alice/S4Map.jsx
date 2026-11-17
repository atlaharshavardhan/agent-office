// Alice Short · Scene 4 (5 s, 150 frames): dark 3D map of Southeast/East Asia. A GPU travels from Singapore
// toward China and stops at a red "U.S. EXPORT CONTROLS" barrier with a question mark. Cards: who is probing,
// then "NO CHARGES FILED". Country outlines: Natural Earth 1:50m (public domain).
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { C, W, H, FONT, BODY, SAFE, ramp, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { CamRig, projector, StudioEnv, GpuModel } from '../three/kit';
import ASIA from './asia.json';
import { Chunks } from './Chunks';

const K = 0.13;
const ll = (lon, lat) => [(lon - 110) * K, 0, -(lat - 16) * K];
const SG = ll(103.82, 1.35), CN = ll(113.3, 23.1), BAR = ll(109.6, 17.2);
const DUR = 5.0;

const Land = () => {
  const geos = useMemo(() => ASIA.map((c) => {
    const shapes = c.p.map((ring) => new THREE.Shape(ring.map(([x, y]) => new THREE.Vector2((x - 110) * K, (y - 16) * K))));
    const g = new THREE.ExtrudeGeometry(shapes, { depth: c.iso === 'CHN' ? 0.09 : 0.05, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return { iso: c.iso, g, e: new THREE.EdgesGeometry(g, 30) };
  }), []);
  return geos.map(({ iso, g, e }) => {
    const cn = iso === 'CHN', sg = iso === 'SGP' || iso === 'MYS';
    return (
      <group key={iso}>
        <mesh geometry={g} receiveShadow castShadow>
          <meshStandardMaterial color={cn ? '#2a1214' : sg ? '#16200f' : '#17191d'} metalness={0.2} roughness={0.75} />
        </mesh>
        <lineSegments geometry={e}><lineBasicMaterial color={cn ? C.red : sg ? C.green : '#3a3f46'} transparent opacity={cn || sg ? 0.8 : 0.45} /></lineSegments>
      </group>
    );
  });
};

export const AliceS4 = () => {
  const f = useCurrentFrame(), t = f / 30;
  const az = lerp(-0.12, 0.08, clamp(t / DUR));
  const cam = [Math.sin(az) * 5.0 + 0.1, 7.0 - 0.5 * clamp(t / DUR), Math.cos(az) * 5.0 + 3.6];
  const look = [-0.1, 0, 1.45];
  const P = projector(cam, look, 42);
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(new THREE.Vector3(SG[0], 0.12, SG[2]),
    new THREE.Vector3((SG[0] + CN[0]) / 2 - 0.3, 1.1, (SG[2] + CN[2]) / 2), new THREE.Vector3(CN[0], 0.15, CN[2])), []);
  const stopU = 0.62;                                   // where the route meets the barrier
  const travel = ramp(f, 0.5, 1.6) * stopU;
  const gp = curve.getPoint(travel);
  const route = ramp(f, 0.3, 0.6);
  const barrier = ramp(f, 1.6, 0.4);
  const q = ramp(f, 2.2, 0.3);
  const bp = curve.getPoint(stopU);
  const lbl = (p, txt, col, a, size = 34) => {
    const [x, y] = P(p);
    return <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: a, font: `800 ${size}px ${BODY}`, color: col, textShadow: '0 2px 12px #000, 0 0 2px #000', whiteSpace: 'nowrap', letterSpacing: 2 }}>{txt}</div>;
  };
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  const noCharge = ramp(f, 3.4, 0.3);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #0d1014, #040506 75%)' }}>
      <FontFace />
      <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={42} />
        <StudioEnv />
        <ambientLight intensity={0.35} />
        <directionalLight position={[-3, 8, 4]} intensity={1.6} castShadow />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#05070a" roughness={0.9} /></mesh>
        <Land />
        {/* route: dashed glow up to the barrier, faint beyond it */}
        <mesh><tubeGeometry args={[curve, 80, 0.014, 6, false]} /><meshBasicMaterial color={C.green} transparent opacity={0.25 * route} /></mesh>
        {[...Array(28)].map((_, k) => {
          const u = (k / 28) * stopU; if (u > travel) return null;
          return <mesh key={k} position={curve.getPoint(u)}><sphereGeometry args={[0.022, 10, 10]} /><meshBasicMaterial color={C.green} /></mesh>;
        })}
        {/* Singapore pulse */}
        <mesh position={[SG[0], 0.08, SG[2]]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.08 + 0.12 * pulse, 0.11 + 0.12 * pulse, 40]} /><meshBasicMaterial color={C.green} transparent opacity={0.9 - 0.6 * pulse} /></mesh>
        <mesh position={[SG[0], 0.08, SG[2]]}><sphereGeometry args={[0.05, 16, 16]} /><meshBasicMaterial color={C.green} /></mesh>
        {/* the chip in transit */}
        <GpuModel scale={0.04} position={[gp.x, gp.y + 0.08, gp.z]} rotation={[0.3, t * 0.8, 0]} />
        <pointLight position={[gp.x, gp.y + 0.4, gp.z]} color={C.green} intensity={2.5} distance={1.5} />
        {/* export-control barrier, perpendicular to the route */}
        <group position={[bp.x, 0, bp.z]} rotation={[0, Math.atan2(CN[0] - SG[0], CN[2] - SG[2]) + Math.PI / 2, 0]} scale={[1, barrier, 1]}>
          <mesh position={[0, 0.375, 0]}><boxGeometry args={[1.4, 0.75, 0.02]} /><meshBasicMaterial color={C.red} transparent opacity={0.22} side={THREE.DoubleSide} /></mesh>
          {[...Array(8)].map((_, k) => <mesh key={k} position={[-0.7 + k * 0.2, 0.375, 0]}><boxGeometry args={[0.012, 0.75, 0.012]} /><meshBasicMaterial color={C.red} /></mesh>)}
          <mesh position={[0, 0.75, 0]}><boxGeometry args={[1.4, 0.02, 0.02]} /><meshBasicMaterial color={C.red} /></mesh>
        </group>
      </ThreeCanvas>
      {lbl([SG[0] - 0.75, 0, SG[2] - 0.05], 'SINGAPORE', C.green, route, 36)}
      {lbl([CN[0] + 1.0, 0.1, CN[2] - 0.8], 'CHINA', C.red, route, 44)}
      {lbl([bp.x, 0.95 * barrier, bp.z], 'EXPORT CONTROLS', C.red, barrier, 32)}
      {lbl([gp.x + 0.35, gp.y + 0.35, gp.z], '?', C.red, q, 110)}
      {/* one idea at a time: question, then the answer replaces it */}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 220, textAlign: 'center', opacity: 1 - noCharge }}>
        <div style={{ font: `800 96px/1 ${FONT}`, letterSpacing: -2.5, color: '#fff', textShadow: '0 6px 30px #000' }}>DID THE CHIPS</div>
        <div style={{ font: `800 96px/1 ${FONT}`, letterSpacing: -2.5, color: C.red, textShadow: '0 6px 30px #000' }}>REACH CHINA?</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 250, textAlign: 'center', opacity: noCharge, transform: `scale(${0.9 + 0.1 * noCharge})` }}>
        <span style={{ font: `800 84px ${FONT}`, color: '#101214', background: '#F5F5F5', padding: '10px 34px', borderRadius: 16 }}>NO CHARGES</span>
      </div>
      <Chunks t0={0.1} t1={4.6} chunks={[['U.S. investigators'], ['are probing'], ['whether the chips'], ['reached China', C.red], ['despite export limits'], ['No charges filed']]} />
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(245,245,245,.62)', textShadow: '0 1px 6px #000' }}>Illustrative route · not affiliated with NVIDIA</div>
    </AbsoluteFill>
  );
};
