// V4 representative frames: opening (H1 + V2) and Scene 5 remote-computing mechanism.
import React, { useMemo } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { W, H, FONT, BODY, SAFE, ramp, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { CamRig, projector, StudioEnv, GpuModel } from '../three/kit';
import { MegaspeedLogo, NvLogo, FlagCN } from '../alice/Logos';
import { V } from './brand';

const Packets = ({ curve, n, t, speed, color, size = 0.05, back = false }) => [...Array(n)].map((_, k) => {
  let u = (t * speed + k / n) % 1; if (back) u = 1 - u;
  return <mesh key={k} position={curve.getPoint(u)}><boxGeometry args={[size * 1.6, size, size]} /><meshBasicMaterial color={color} /></mesh>;
});

// ---------- Opening: physical GPU blocked at the line, digital stream passes over it
export const V4Open = () => {
  const f = useCurrentFrame(), t = f / 30 + 1.2;
  const cam = [2.2 + Math.sin(t * 0.3) * 0.1, 2.3, 5.6], look = [-0.15, 0.05, 0];
  const P = projector(cam, look, 38);
  const arc = useMemo(() => new THREE.QuadraticBezierCurve3(new THREE.Vector3(-1.5, 0.35, 0), new THREE.Vector3(0.1, 1.9, -0.1), new THREE.Vector3(1.6, 0.35, 0)), []);
  const [bx, by] = P([0.25, 1.2, 0.9]); const [gx, gy] = P([-0.6, 0.0, 0.1]); const [dx, dy] = P([1.45, 0.75, 0]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, #142131, ${V.bg} 70%)` }}>
      <FontFace />
      <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={38} />
        <StudioEnv />
        <ambientLight intensity={0.35} />
        <directionalLight position={[-3, 6, 4]} intensity={2.2} castShadow />
        <pointLight position={[-0.8, 1.2, 1.2]} color={V.green} intensity={6} distance={4} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#0c1218" metalness={0.5} roughness={0.35} /></mesh>
        {/* export line: glass barrier */}
        <mesh position={[0.25, 0.55, 0]}><boxGeometry args={[0.04, 1.1, 1.8]} /><meshPhysicalMaterial color={V.red} transparent opacity={0.28} roughness={0.1} /></mesh>
        <mesh position={[0.25, 1.11, 0]}><boxGeometry args={[0.06, 0.03, 1.8]} /><meshBasicMaterial color={V.red} /></mesh>
        <mesh position={[0.25, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.06, 1.8]} /><meshBasicMaterial color={V.red} /></mesh>
        {/* the physical chip, stopped */}
        <GpuModel scale={0.055} position={[-0.6, 0.3, 0.1]} rotation={[0.35, 0.4, 0]} />
        {/* digital computing passes over */}
        <mesh><tubeGeometry args={[arc, 80, 0.012, 8, false]} /><meshBasicMaterial color={V.blue} transparent opacity={0.45} /></mesh>
        <Packets curve={arc} n={14} t={t} speed={0.35} color={V.blue} size={0.045} />
      </ThreeCanvas>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 210, textAlign: 'center' }}>
        <div style={{ font: `800 112px/1 ${FONT}`, letterSpacing: -3, color: V.text, textShadow: '0 6px 30px #000' }}>WHO IS</div>
        <div style={{ font: `800 112px/1 ${FONT}`, letterSpacing: -3, color: V.text, textShadow: '0 6px 30px #000' }}>ALICE HUANG?</div>
      </div>
      {/* identity card: verified role, silhouette (no likeness) */}
      <div style={{ position: 'absolute', left: SAFE.l, top: 1050, display: 'flex', gap: 16, alignItems: 'center', background: 'rgba(17,24,32,.92)', border: '1px solid #26313d', borderRadius: 16, padding: '14px 18px' }}>
        <div style={{ width: 92, height: 110, borderRadius: 10, background: '#05070a', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 60px ${FONT}`, color: V.red }}>?</div>
        <div>
          <div style={{ font: `800 40px ${FONT}`, color: V.text }}>Alice Huang</div>
          <div style={{ font: `600 26px ${BODY}`, color: V.sub, marginTop: 4 }}>Ex-CEO ·</div>
          <div style={{ marginTop: 6 }}><MegaspeedLogo h={30} sub={false} /></div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: bx, top: by - 40, transform: 'translateX(-50%)', font: `800 28px ${BODY}`, color: V.red, letterSpacing: 2, whiteSpace: 'nowrap', textShadow: '0 2px 8px #000' }}>EXPORT CONTROLS</div>
      <div style={{ position: 'absolute', left: gx, top: gy + 10, transform: 'translateX(-50%)', font: `800 26px ${BODY}`, color: V.green, whiteSpace: 'nowrap', textShadow: '0 2px 8px #000' }}>physical chip ✗</div>
      <div style={{ position: 'absolute', left: dx, top: dy - 70, transform: 'translateX(-60%)', font: `800 26px ${BODY}`, color: V.blue, whiteSpace: 'nowrap', textShadow: '0 2px 8px #000' }}>computing power ✓</div>
      <div style={{ position: 'absolute', right: 200, top: 1080 }}><NvLogo h={40} /></div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1300, textAlign: 'center', font: `800 60px ${BODY}`, color: V.text, textShadow: '0 4px 18px #000' }}>Who is Alice Huang?</div>
    </AbsoluteFill>
  );
};

// ---------- Scene 5: the chips stay, the computing power travels
const Rack = ({ x, z, lit = 1 }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 1.0, 0]} castShadow><boxGeometry args={[0.62, 2.0, 0.9]} /><meshStandardMaterial color="#14181e" metalness={0.75} roughness={0.32} /></mesh>
    {[...Array(9)].map((_, k) => (
      <group key={k} position={[0, 0.2 + k * 0.2, 0.452]}>
        <mesh><boxGeometry args={[0.56, 0.16, 0.01]} /><meshStandardMaterial color="#1d232b" metalness={0.8} roughness={0.25} /></mesh>
        <mesh position={[-0.2, 0, 0.007]}><boxGeometry args={[0.06, 0.02, 0.005]} /><meshBasicMaterial color={V.green} /></mesh>
        <mesh position={[0.12, 0, 0.007]}><boxGeometry args={[0.24, 0.006, 0.005]} /><meshBasicMaterial color={V.green} transparent opacity={0.35 * lit} /></mesh>
      </group>
    ))}
  </group>
);
export const V4Remote = () => {
  const f = useCurrentFrame(), t = f / 30 + 2;
  const cam = [4.2, 3.0, 7.2], look = [0.2, 0.8, -0.6];
  const P = projector(cam, look, 46);
  const req = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(1.7, 1.05, 1.15), new THREE.Vector3(1.3, 2.0, 0.3), new THREE.Vector3(0.2, 2.4, -0.6), new THREE.Vector3(-0.55, 1.35, -0.85)]), []);
  const res = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(-0.55, 1.15, -0.85), new THREE.Vector3(0.3, 1.9, -0.3), new THREE.Vector3(1.2, 1.6, 0.6), new THREE.Vector3(1.7, 0.95, 1.15)]), []);
  const lbl = (p, node) => { const [x, y] = P(p); return <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)' }}>{node}</div>; };
  const tag = (txt, col, sub) => (
    <div style={{ background: 'rgba(17,24,32,.92)', border: `2px solid ${col}`, borderRadius: 12, padding: '8px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
      <div style={{ font: `800 28px ${BODY}`, color: col }}>{txt}</div>{sub && <div style={{ font: `600 20px ${BODY}`, color: V.sub }}>{sub}</div>}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 40% 40%, #12202c, ${V.bg} 72%)` }}>
      <FontFace />
      <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={46} />
        <StudioEnv />
        <ambientLight intensity={0.3} />
        <directionalLight position={[-2, 6, 4]} intensity={1.8} castShadow />
        <pointLight position={[-0.6, 1.6, 0.6]} color={V.green} intensity={5} distance={3.5} />
        <pointLight position={[1.7, 1.4, 1.9]} color={V.blue} intensity={4} distance={3} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#0b1016" metalness={0.55} roughness={0.3} /></mesh>
        {/* overseas data hall: rows of racks */}
        {[-2.4, -1.6, -0.8, 0.0].map((z, r) => [-2.2, -1.5, -0.8].map((x, c) => <Rack key={`${r}${c}`} x={x} z={z - 1.2} />))}
        {/* hero rack with an opened server tray and the GPU processing the job */}
        <Rack x={-0.55} z={-0.85} />
        <mesh position={[-0.55, 1.25, -0.25]}><boxGeometry args={[0.56, 0.05, 0.5]} /><meshStandardMaterial color="#22282f" metalness={0.8} roughness={0.25} /></mesh>
        <GpuModel scale={0.05} position={[-0.55, 1.3, -0.22]} rotation={[0, 0.2, 0]} />
        <pointLight position={[-0.55, 1.5, -0.1]} color={V.green} intensity={3 + Math.sin(t * 8)} distance={1.2} />
        {/* remote customer workstation */}
        <mesh position={[1.7, 0.72, 1.3]} castShadow><boxGeometry args={[1.0, 0.04, 0.55]} /><meshStandardMaterial color="#1a1f26" metalness={0.4} roughness={0.4} /></mesh>
        <mesh position={[1.7, 0.36, 1.3]}><boxGeometry args={[0.06, 0.7, 0.06]} /><meshStandardMaterial color="#1a1f26" /></mesh>
        <mesh position={[1.7, 1.02, 1.12]} rotation={[0, -0.6, 0]}><boxGeometry args={[0.62, 0.38, 0.02]} /><meshStandardMaterial color="#0a0d12" metalness={0.6} roughness={0.3} /></mesh>
        <mesh position={[1.71, 1.02, 1.14]} rotation={[0, -0.6, 0]}><planeGeometry args={[0.58, 0.34]} /><meshBasicMaterial color={V.blue} transparent opacity={0.85} /></mesh>
        {/* request (blue out) and results (blue back) */}
        <mesh><tubeGeometry args={[req, 80, 0.008, 6, false]} /><meshBasicMaterial color={V.blue} transparent opacity={0.4} /></mesh>
        <mesh><tubeGeometry args={[res, 80, 0.008, 6, false]} /><meshBasicMaterial color={'#9ADBFF'} transparent opacity={0.35} /></mesh>
        <Packets curve={req} n={9} t={t} speed={0.45} color={V.blue} size={0.035} />
        <Packets curve={res} n={9} t={t} speed={0.45} color={'#BFE8FF'} size={0.03} />
      </ThreeCanvas>
      {lbl([-1.1, 0.25, 0.2], tag('GPUs stay here', V.green, 'Data center · Southeast Asia'))}
      {lbl([1.75, 1.55, 1.2], tag('Remote customer', V.blue, 'e.g. in China'))}
      {lbl([0.55, 1.75, 0.0], <div style={{ font: `800 26px ${BODY}`, color: V.blue, textShadow: '0 2px 10px #000' }}>AI job →  ← results</div>)}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 210, textAlign: 'center' }}>
        <div style={{ font: `800 92px/1.02 ${FONT}`, letterSpacing: -2.5, color: V.green, textShadow: '0 6px 30px #000' }}>THE CHIPS STAY.</div>
        <div style={{ font: `800 92px/1.02 ${FONT}`, letterSpacing: -2.5, color: V.blue, textShadow: '0 6px 30px #000' }}>THE COMPUTING</div>
        <div style={{ font: `800 92px/1.02 ${FONT}`, letterSpacing: -2.5, color: V.blue, textShadow: '0 6px 30px #000' }}>POWER TRAVELS.</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1300, textAlign: 'center', font: `800 60px ${BODY}`, color: V.text, textShadow: '0 4px 18px #000' }}>rent computing power</div>
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(244,246,248,.6)' }}>Illustration · renting compute abroad was not banned at the time</div>
    </AbsoluteFill>
  );
};
