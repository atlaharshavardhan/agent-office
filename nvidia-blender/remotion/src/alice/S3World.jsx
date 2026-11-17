// Alice Short · Scene 3: the chip journey on a dark, Pacific-centred 3D world map.
// NVIDIA (USA) -> made in Taiwan -> Megaspeed data centers (SE Asia), $4.6B+ counter (Bloomberg estimate);
// then rented computing power streams to Alibaba (China). Outlines: Natural Earth 1:110m (public domain).
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { C, W, H, FONT, BODY, SAFE, ramp, clamp, lerp } from '../theme';
import { FontFace } from '../ui';
import { CamRig, projector, StudioEnv, GpuModel } from '../three/kit';
import { NvLogo, FlagUS, FlagCN, MegaspeedLogo } from './Logos';
import WORLD from './world.json';

const K = 0.05;
const ll = (lon, lat) => new THREE.Vector3((lon - 175) * K, 0, -(lat - 20) * K);
const NV = ll(238, 37.4), TW = ll(121, 24), MY = ll(101.7, 3.1), HZ = ll(120.2, 30.3);
const arc = (a, b, h) => new THREE.QuadraticBezierCurve3(a.clone().setY(0.06), a.clone().lerp(b, 0.5).setY(h), b.clone().setY(0.06));
const ease = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

const Land = () => {
  const geos = useMemo(() => WORLD.map((c) => {
    const shapes = c.p.map((ring) => new THREE.Shape(ring.map(([x, y]) => new THREE.Vector2((x - 175) * K, (y - 20) * K))));
    const g = new THREE.ExtrudeGeometry(shapes, { depth: 0.04, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
    return { iso: c.iso, g, e: new THREE.EdgesGeometry(g, 30) };
  }), []);
  return geos.map(({ iso, g, e }, k) => {
    const hot = { USA: C.green, TWN: '#9FB4FF', MYS: '#76B900', SGP: '#76B900', CHN: C.red }[iso];
    return (
      <group key={iso + k}>
        <mesh geometry={g}><meshStandardMaterial color={iso === 'CHN' ? '#2a1214' : hot ? '#15200f' : '#16181c'} roughness={0.8} metalness={0.15} /></mesh>
        <lineSegments geometry={e}><lineBasicMaterial color={hot || '#353a41'} transparent opacity={hot ? 0.75 : 0.4} /></lineSegments>
      </group>
    );
  });
};

export const AliceS3W = ({ d = 6.26 }) => {
  const f = useCurrentFrame(), t = f / 30;
  const zoom = ease((t - 2.5) / 1.4);
  const cx = lerp(-0.4, -2.6, zoom), cz = lerp(0.4, 0.35, zoom);
  const cam = [cx, lerp(19, 6.5, zoom), cz + lerp(7.5, 3.4, zoom)];
  const look = [cx, 0, cz - 0.5];
  const P = projector(cam, look, 40);
  const c1 = useMemo(() => arc(NV, TW, 2.6), []), c2 = useMemo(() => arc(TW, MY, 0.9), []), c3 = useMemo(() => arc(MY, HZ, 1.1), []);
  const a1 = ramp(f, 0.1, 0.4), r1 = ease((t - 0.35) / 1.0), r2 = ease((t - 1.25) / 0.9);
  const ali = ramp(f, d * 0.63, 0.35), rent = ramp(f, d * 0.65, 0.4);
  const money = lerp(0, 4.6, ease((t - 0.4) / 2.4));

  const dots = (curve, upto, n, col, size, speed = 0.6, phase = 0, id = 'd') => [...Array(n)].map((_, k) => {
    const u = ((t * speed + k / n + phase) % 1) * upto; if (upto <= 0.02) return null;
    return <mesh key={id + k} position={curve.getPoint(u)}><sphereGeometry args={[size, 10, 10]} /><meshBasicMaterial color={col} /></mesh>;
  });
  const trail = (curve, upto, col, id = 't') => [...Array(40)].map((_, k) => { const u = k / 40; if (u > upto) return null;
    return <mesh key={id + k} position={curve.getPoint(u)}><sphereGeometry args={[0.03, 6, 6]} /><meshBasicMaterial color={col} transparent opacity={0.55} /></mesh>; });
  const lbl = (p, node, a, dy = 0, ax = -50) => { const [x, y] = P(p); return <div style={{ position: 'absolute', left: Math.max(70, Math.min(x, 1000)), top: y + dy, transform: `translate(${x > 780 ? -100 : ax}%,-50%)`, opacity: a }}>{node}</div>; };
  const box = (child, col) => <div style={{ background: 'rgba(10,11,13,.86)', border: `2px solid ${col}`, borderRadius: 14, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,.6)' }}>{child}</div>;
  const chipPos = c1.getPoint(clamp(r1));
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #0d1014, #030405 75%)' }}>
      <FontFace />
      <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={40} />
        <StudioEnv />
        <ambientLight intensity={0.5} />
        <directionalLight position={[-3, 8, 4]} intensity={1.4} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}><planeGeometry args={[60, 30]} /><meshStandardMaterial color="#05070a" roughness={0.9} /></mesh>
        <Land />
        {trail(c1, r1, C.green, 'ta')}{trail(c2, r2, C.green, 'tb')}
        {dots(c1, r1 >= 1 ? 1 : 0, 6, '#B6F046', 0.07, 0.5, 0, 'da')}
        {dots(c2, r2 >= 1 ? 1 : 0, 5, '#B6F046', 0.06, 0.7, 0, 'db')}
        {r1 > 0 && r1 < 1 && <GpuModel scale={0.05} position={[chipPos.x, chipPos.y + 0.1, chipPos.z]} rotation={[0.3, t, 0]} />}
        {r2 > 0 && r2 < 1 && (() => { const p = c2.getPoint(r2); return <GpuModel scale={0.04} position={[p.x, p.y + 0.08, p.z]} rotation={[0.3, t, 0]} />; })()}
        {/* rented computing power: fast thin pulses, no chips move */}
        {rent > 0 && [...Array(40)].map((_, k) => <mesh key={'r' + k} position={c3.getPoint(k / 40)}><sphereGeometry args={[0.018, 6, 6]} /><meshBasicMaterial color="#FF9A3C" transparent opacity={0.4 * rent} /></mesh>)}
        {dots(c3, rent > 0 ? 1 : 0, 12, '#FFB15C', 0.04, 1.4, 0, 'dc')}
        {[NV, TW, MY, HZ].map((p, k) => <mesh key={'n' + k} position={[p.x, 0.06, p.z]}><sphereGeometry args={[0.09, 16, 16]} /><meshBasicMaterial color={k === 3 ? '#FF7A1A' : C.green} /></mesh>)}
      </ThreeCanvas>
      {lbl(NV, box(<><NvLogo h={40} /><FlagUS h={30} /></>, C.green), a1, -70)}
      {lbl(TW, box(<span style={{ font: `800 32px ${BODY}`, color: '#C9D6FF' }}>Made in Taiwan</span>, '#9FB4FF'), ramp(f, 1.0, 0.3) * (1 - ali), -50)}
      {lbl(MY, box(<><MegaspeedLogo h={38} sub={false} /><span style={{ font: `700 26px ${BODY}`, color: '#ddd' }}>data centers</span></>, C.green), ramp(f, 1.9, 0.3), -64, -15)}
      {lbl(HZ, box(<><FlagCN h={34} /><span style={{ font: `900 42px ${FONT}`, color: '#FF7A1A' }}>ALIBABA</span></>, '#FF7A1A'), ali, -58)}
      {lbl(c3.getPoint(0.5), <span style={{ font: `800 30px ${BODY}`, color: '#FFB15C', textShadow: '0 2px 10px #000' }}>rents computing power</span>, rent, -30)}
      {/* headline: the money, then the client */}
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 220, textAlign: 'center', opacity: 1 - ali }}>
        <div style={{ font: `800 170px/0.95 ${FONT}`, letterSpacing: -5, color: C.green, textShadow: '0 0 50px rgba(118,185,0,.35), 0 6px 30px #000' }}>${money.toFixed(1)}B{money > 4.55 ? '+' : ''}</div>
        <div style={{ font: `800 42px ${FONT}`, color: '#fff', textShadow: '0 4px 20px #000' }}>of NVIDIA hardware</div>
        <div style={{ font: `700 30px ${BODY}`, color: 'rgba(255,255,255,.8)', marginTop: 6 }}>Bloomberg estimate</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, right: SAFE.r, top: 230, textAlign: 'center', opacity: ali }}>
        <div style={{ font: `700 32px ${BODY}`, color: 'rgba(255,255,255,.8)', letterSpacing: 3 }}>LARGEST CLIENT, REPORTS SAY</div>
        <div style={{ font: `800 120px/1.05 ${FONT}`, color: '#FF7A1A', textShadow: '0 6px 30px #000' }}>ALIBABA</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.l, top: 1528, font: `600 22px ${BODY}`, color: 'rgba(245,245,245,.62)', textShadow: '0 1px 6px #000' }}>Illustrative route · not affiliated with NVIDIA, Megaspeed or Alibaba</div>
    </AbsoluteFill>
  );
};
