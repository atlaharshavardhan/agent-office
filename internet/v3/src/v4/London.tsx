import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { F, vfov, tr, clampX, EDGE } from './frame';
import { FONT } from '../lib/palette';
import { winTex } from './Packets';
import { Her } from './Flight';

/* V4, 16:9: London, her new home. The river and its landmarks, then a street of brick terraced houses with bay windows,
   iron railings, a wet road and a red bus, then her at the bay window of her flat. Nothing here is reused from the Hyderabad street. */

export const LONDON_FRAMES = 420;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const T1 = 4.6, SX = 400;      // cut to the street, which is built far off to the side

const canvas = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep?: [number, number]) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
const brickTex = (base: string, dark: string) => canvas(256, 256, (g) => { g.fillStyle = dark; g.fillRect(0, 0, 256, 256); for (let r = 0; r < 16; r++) for (let c = -1; c < 8; c++) { const k = hash(r * 17 + c * 3); g.fillStyle = k > 0.8 ? '#8a4a52' : k < 0.15 ? '#5f3350' : base; g.fillRect(c * 32 + (r % 2 ? 16 : 0) + 1.5, r * 16 + 1.5, 29, 13); } }, [2, 3]);

/* ---------- the river and its landmarks ---------- */
const Landmarks: React.FC<{ t: number }> = ({ t }) => { const tex = useMemo(() => [0, 1, 2].map(winTex), []);
  const clock = useMemo(() => canvas(256, 256, (g) => { g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#3a2f5a'; g.lineWidth = 8; g.stroke(); for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; g.beginPath(); g.moveTo(128 + Math.cos(a) * 96, 128 + Math.sin(a) * 96); g.lineTo(128 + Math.cos(a) * 112, 128 + Math.sin(a) * 112); g.stroke(); } g.lineWidth = 10; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 50); g.moveTo(128, 128); g.lineTo(178, 150); g.stroke(); }), []);
  const stone = '#4a4390', gold = '#ffd08a';
  return <group>
    {/* the Thames and the embankment */}
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 30]}><planeGeometry args={[500, 120]} /><meshStandardMaterial color="#1b2a8a" roughness={0.2} metalness={0.5} emissive="#0c1654" emissiveIntensity={0.6} /></mesh>
    <mesh position={[0, 1, -14]}><boxGeometry args={[500, 2, 12]} /><meshStandardMaterial color="#2a2f7a" roughness={0.9} /></mesh>
    {Array.from({ length: 30 }).map((_, i) => <mesh key={i} position={[-150 + i * 10 + Math.sin(t + i) * 0.8, 0.06, 6 + (i % 5) * 8]} rotation-x={-Math.PI / 2}><planeGeometry args={[5 + hash(i) * 5, 0.3]} /><meshBasicMaterial color={i % 3 ? '#ffd08a' : '#9fe6ff'} transparent opacity={0.35 + 0.2 * Math.sin(t * 2.5 + i)} /></mesh>)}
    {/* the clock tower and the long hall beside it */}
    <group position={[-22, 2, -16]}>
      <mesh position={[0, 18, 0]}><boxGeometry args={[6, 36, 6]} /><meshStandardMaterial color={stone} roughness={0.8} /></mesh>
      {Array.from({ length: 6 }).map((_, k) => <mesh key={k} position={[0, 4 + k * 5, 3.02]}><planeGeometry args={[4.4, 0.5]} /><meshBasicMaterial color={gold} transparent opacity={0.55} /></mesh>)}
      <mesh position={[0, 39.5, 0]}><boxGeometry args={[7.2, 7.2, 7.2]} /><meshStandardMaterial color="#5a52a8" roughness={0.7} /></mesh>
      {[0, 1, 2, 3].map((k) => <mesh key={k} position={[Math.sin(k * 1.5708) * 3.62, 39.5, Math.cos(k * 1.5708) * 3.62]} rotation-y={k * 1.5708}><circleGeometry args={[2.7, 40]} /><meshBasicMaterial map={clock} toneMapped={false} /></mesh>)}
      <mesh position={[0, 46.5, 0]} rotation-y={Math.PI / 4}><coneGeometry args={[4.8, 9, 4]} /><meshStandardMaterial color="#2f9c95" roughness={0.6} /></mesh>
      <mesh position={[0, 52.5, 0]}><coneGeometry args={[0.5, 4, 8]} /><meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.6} /></mesh>
      <pointLight position={[0, 39.5, 8]} color="#ffe6b0" intensity={220} distance={50} />
      <group position={[32, 0, -3]}><mesh position={[0, 7, 0]}><boxGeometry args={[54, 14, 10]} /><meshStandardMaterial color={stone} roughness={0.8} /></mesh>
        {Array.from({ length: 20 }).map((_, k) => <mesh key={k} position={[-25 + k * 2.65, 7.5, 5.02]}><planeGeometry args={[1.1, 7]} /><meshBasicMaterial color={gold} transparent opacity={0.75} /></mesh>)}
        {[-27, -9, 9, 27].map((x) => <mesh key={x} position={[x, 17, 0]} rotation-y={Math.PI / 4}><coneGeometry args={[1.8, 7, 4]} /><meshStandardMaterial color="#5a52a8" /></mesh>)}
        <mesh position={[27, 12, 0]}><boxGeometry args={[7, 24, 9]} /><meshStandardMaterial color={stone} roughness={0.8} /></mesh><mesh position={[27, 27, 0]} rotation-y={Math.PI / 4}><coneGeometry args={[5, 7, 4]} /><meshStandardMaterial color="#2f9c95" /></mesh></group>
    </group>
    {/* the big wheel, turning slowly */}
    <group position={[58, 2, -14]}><group position={[0, 26, 0]} rotation-z={t * 0.12}>
        <mesh><torusGeometry args={[22, 0.35, 8, 80]} /><meshStandardMaterial color="#cfd6ff" emissive="#5fe3ff" emissiveIntensity={0.7} /></mesh><mesh><torusGeometry args={[20.6, 0.16, 6, 80]} /><meshStandardMaterial color="#8c96f0" /></mesh>
        {Array.from({ length: 24 }).map((_, k) => { const a = (k / 24) * 6.283; return <React.Fragment key={k}><mesh rotation-z={a} position={[Math.cos(a) * 10.5, Math.sin(a) * 10.5, 0]}><boxGeometry args={[21, 0.07, 0.07]} /><meshBasicMaterial color="#8c96f0" /></mesh><mesh position={[Math.cos(a) * 23.2, Math.sin(a) * 23.2, 0]} rotation-z={-t * 0.12}><capsuleGeometry args={[0.7, 1.1, 4, 10]} /><meshBasicMaterial color={k % 4 === 0 ? '#ffd08a' : '#9fe6ff'} /></mesh></React.Fragment>; })}</group>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 6, 13, -2]} rotation-z={-s * 0.44}><boxGeometry args={[0.7, 29, 0.7]} /><meshStandardMaterial color="#8c96f0" /></mesh>)}</group>
    {/* a bridge of arches across the river, and the city behind */}
    <group position={[14, 0, 12]}>{Array.from({ length: 7 }).map((_, k) => <mesh key={k} position={[0, 2.4, -22 + k * 9]} rotation-y={Math.PI / 2}><torusGeometry args={[4.2, 0.8, 8, 20, Math.PI]} /><meshStandardMaterial color="#5a52a8" roughness={0.8} /></mesh>)}<mesh position={[0, 6.9, 5]}><boxGeometry args={[5, 0.8, 68]} /><meshStandardMaterial color="#6a62b8" emissive="#ffc46a" emissiveIntensity={0.18} /></mesh></group>
    {Array.from({ length: 40 }).map((_, i) => { const x = -200 + i * 10 + hash(i) * 4, h = 10 + hash(i + 5) ** 2 * 34, m = tex[i % 3].clone(); m.repeat.set(1, Math.max(1, Math.round(h / 10))); m.wrapS = m.wrapT = THREE.RepeatWrapping; m.needsUpdate = true; return <mesh key={i} position={[x, h / 2, -52 - hash(i + 9) * 40]}><boxGeometry args={[8, h, 8]} /><meshStandardMaterial color="#1f2566" map={m} emissiveMap={m} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.8} /></mesh>; })}
    <mesh position={[-90, 70, -220]}><circleGeometry args={[8, 40]} /><meshBasicMaterial color="#fff3d6" fog={false} /></mesh>
  </group>; };

/* ---------- the street ---------- */
const HW = 7.2, DOORS = ['#d2553f', '#2f9c95', '#e9b44c', '#3d7bff', '#7a3a8a', '#1c8a5a', '#d2553f'];
const HER_HOUSE = 3;
const House: React.FC<{ i: number; brick: THREE.Texture; t: number }> = ({ i, brick, t }) => { const lit = (k: number) => hash(i * 7 + k) > 0.35 || (i === HER_HOUSE && k === 1), warm = '#ffd08a', frame = <meshStandardMaterial color="#f2ecdf" roughness={0.6} />;
  return <group position={[(i - 3) * HW, 0, 0]}>
    <mesh position={[0, 4.6, -3]}><boxGeometry args={[HW, 9.2, 6]} /><meshStandardMaterial map={brick} roughness={0.9} /></mesh>
    {/* pitched slate roof, two chimneys with pots */}
    <mesh position={[0, 10.15, -1.6]} rotation-x={0.62}><boxGeometry args={[HW, 0.25, 4.2]} /><meshStandardMaterial color="#2b2f6a" roughness={0.7} /></mesh>
    <mesh position={[0, 10.15, -4.4]} rotation-x={-0.62}><boxGeometry args={[HW, 0.25, 4.2]} /><meshStandardMaterial color="#232660" roughness={0.7} /></mesh>
    <mesh position={[HW / 2 - 0.5, 11.2, -3]}><boxGeometry args={[1, 3.2, 1.8]} /><meshStandardMaterial map={brick} roughness={0.9} /></mesh>
    {[-0.45, 0.45].map((z) => <mesh key={z} position={[HW / 2 - 0.5, 13.1, -3 + z]}><cylinderGeometry args={[0.2, 0.24, 0.7, 10]} /><meshStandardMaterial color="#c9785a" /></mesh>)}
    {/* bay window: sticks out, three tall panes on each floor, its own little roof */}
    <group position={[-1.3, 0, 0]}>
      <mesh position={[0, 3.6, 0.55]}><boxGeometry args={[3.5, 7.2, 1.1]} /><meshStandardMaterial map={brick} roughness={0.9} /></mesh>
      <mesh position={[0, 7.5, 0.55]} rotation-x={0.35}><boxGeometry args={[3.8, 0.2, 1.7]} /><meshStandardMaterial color="#2b2f6a" /></mesh>
      {[1.55, 5.0].map((y, fl) => <group key={fl} position={[0, y, 1.11]}><mesh><boxGeometry args={[3.1, 2.3, 0.08]} />{frame}</mesh>
        {[-1, 0, 1].map((k) => <mesh key={k} position={[k * 0.98, 0, 0.05]}><planeGeometry args={[0.84, 2.0]} /><meshBasicMaterial color={lit(fl) ? (i === HER_HOUSE && fl === 1 ? '#f2c98a' : warm) : '#1d2460'} toneMapped={false} /></mesh>)}
        {i === HER_HOUSE && fl === 1 && <>{[-0.49, 0.49].map((x) => <mesh key={x} position={[x, 0, 0.5]}><boxGeometry args={[0.1, 2.1, 0.06]} />{frame}</mesh>)}<mesh position={[0, -1.35, 0.5]}><boxGeometry args={[3.3, 0.5, 0.5]} /><meshStandardMaterial color="#3a2f6a" roughness={0.8} /></mesh>{Array.from({ length: 9 }).map((_, q) => <mesh key={q} position={[-1.4 + q * 0.35, -1.0, 0.5]}><sphereGeometry args={[0.11, 8, 8]} /><meshStandardMaterial color={q % 3 === 0 ? '#ff8f7a' : q % 3 === 1 ? '#2f9c6a' : '#ffd08a'} /></mesh>)}</>}
        <mesh position={[0, 0, 0.06]}><boxGeometry args={[3.0, 0.07, 0.03]} />{frame}</mesh></group>)}
    </group>
    {/* front door up three steps, fanlight above, a brass number */}
    <group position={[2.1, 0, 0]}>
      {[0, 1, 2].map((k) => <mesh key={k} position={[0, 0.15 + k * 0.3, 0.9 - k * 0.3]}><boxGeometry args={[2, 0.3, 0.6]} /><meshStandardMaterial color="#8f8ac0" roughness={0.8} /></mesh>)}
      <mesh position={[0, 2.25, 0.02]}><boxGeometry args={[1.5, 2.7, 0.1]} /><meshStandardMaterial color={DOORS[i % 7]} roughness={0.45} /></mesh>
      <mesh position={[0, 3.95, 0.03]}><circleGeometry args={[0.75, 20, 0, Math.PI]} /><meshBasicMaterial color={warm} /></mesh>
      <mesh position={[0.5, 2.2, 0.09]}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#ffd08a" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0, 6.0, 0.07]}><planeGeometry args={[1.3, 2.0]} /><meshBasicMaterial color={lit(3) ? warm : '#1d2460'} toneMapped={false} /></mesh><mesh position={[0, 6.0, 0.02]}><boxGeometry args={[1.55, 2.25, 0.04]} />{frame}</mesh>
    </group>
    {/* black iron railings round the little front area */}
    {Array.from({ length: 12 }).map((_, k) => { const x = -HW / 2 + 0.3 + k * 0.42; if (x > 0.9) return null; return <mesh key={k} position={[x, 0.75, 2.3]}><cylinderGeometry args={[0.035, 0.035, 1.5, 6]} /><meshStandardMaterial color="#0d0f2c" metalness={0.5} roughness={0.4} /></mesh>; })}
    <mesh position={[-1.5, 1.45, 2.3]}><boxGeometry args={[4.6, 0.07, 0.07]} /><meshStandardMaterial color="#0d0f2c" /></mesh>
    {i === HER_HOUSE && <pointLight position={[-1.3, 6.4, 3.4]} color="#ffe6c0" intensity={5} distance={7} />}
  </group>; };
const Bus: React.FC<{ t: number }> = ({ t }) => { const x = lerp(-34, 22, clamp01((t - T1 - 0.2) / 5.4));
  return <group position={[x, 0.55, 6.8]} scale={0.9}>
    <mesh position={[0, 2.3, 0]}><boxGeometry args={[9, 4.4, 2.5]} /><meshStandardMaterial color="#d2362e" roughness={0.4} /></mesh>
    <mesh position={[0, 4.56, 0]}><boxGeometry args={[9.05, 0.16, 2.55]} /><meshStandardMaterial color="#f2ecdf" /></mesh>
    {[1.2, 3.3].map((y) => [-1, 1].map((s) => <mesh key={y + '-' + s} position={[0.1, y, s * 1.26]}><planeGeometry args={[7.8, 1.0]} /><meshBasicMaterial color="#ffe6b0" side={THREE.DoubleSide} toneMapped={false} /></mesh>))}
    {[1.2, 3.3].map((y) => Array.from({ length: 7 }).map((_, k) => <mesh key={y + '-' + k} position={[-3.4 + k * 1.14, y, 1.27]}><boxGeometry args={[0.1, 1.06, 0.03]} /><meshStandardMaterial color="#a4241e" /></mesh>))}
    <mesh position={[4.52, 1.6, 0]} rotation-y={Math.PI / 2}><planeGeometry args={[2.1, 1.5]} /><meshBasicMaterial color="#ffe6b0" /></mesh>
    <mesh position={[4.52, 3.9, 0]} rotation-y={Math.PI / 2}><planeGeometry args={[1.8, 0.5]} /><meshBasicMaterial color="#ffb454" /></mesh>
    {[-2.8, 2.8].map((wx) => [-1, 1].map((s) => <mesh key={wx + '-' + s} position={[wx, 0, s * 1.1]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.55, 0.55, 0.4, 16]} /><meshStandardMaterial color="#12143a" /></mesh>))}
    <pointLight position={[6, 1, 0]} color="#fff3d6" intensity={40} distance={16} /><pointLight position={[0, 2, 3]} color="#ff8a70" intensity={20} distance={10} />
  </group>; };
const Street: React.FC<{ t: number }> = ({ t }) => { const bricks = useMemo(() => [brickTex('#7a4466', '#3d2550'), brickTex('#6a4a7a', '#33264f'), brickTex('#84506a', '#42284e')], []);
  return <group position={[SX, 0, 0]}>
    {/* wet road: dark and glossy, with soft streaks of lamp and window light lying on it */}
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 10]}><planeGeometry args={[200, 22]} /><meshStandardMaterial color="#14173f" roughness={0.16} metalness={0.7} /></mesh>
    <mesh position={[0, 0.12, 3.2]}><boxGeometry args={[200, 0.24, 3]} /><meshStandardMaterial color="#4a4f9a" roughness={0.85} /></mesh>
    {Array.from({ length: 9 }).map((_, k) => <mesh key={k} position={[-40 + k * 10.2, 0.03, 9.5]} rotation-x={-Math.PI / 2}><planeGeometry args={[1.3, 9]} /><meshBasicMaterial color="#ffc46a" transparent opacity={0.16} /></mesh>)}
    {Array.from({ length: 14 }).map((_, k) => <mesh key={k} position={[-45 + k * 7, 0.03, 11]} rotation-x={-Math.PI / 2}><planeGeometry args={[3, 0.22]} /><meshBasicMaterial color="#dfe6ff" transparent opacity={0.5} /></mesh>)}
    {Array.from({ length: 7 }).map((_, i) => <House key={i} i={i} brick={bricks[i % 3]} t={t} />)}
    {/* old-style street lamps and a red post box */}
    {Array.from({ length: 5 }).map((_, k) => <group key={k} position={[-27 + k * 14.4, 0.24, 4.2]}><mesh position={[0, 2.4, 0]}><cylinderGeometry args={[0.07, 0.11, 4.8, 8]} /><meshStandardMaterial color="#0d0f2c" /></mesh><mesh position={[0, 5.1, 0]}><boxGeometry args={[0.5, 0.7, 0.5]} /><meshBasicMaterial color="#ffd98a" /></mesh><mesh position={[0, 5.6, 0]}><coneGeometry args={[0.42, 0.4, 4]} /><meshStandardMaterial color="#0d0f2c" /></mesh><pointLight position={[0, 4.9, 0.5]} color="#ffc46a" intensity={26} distance={14} /></group>)}
    <group position={[6.4, 0.24, 3.4]}><mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.42, 0.42, 1.6, 16]} /><meshStandardMaterial color="#d2362e" roughness={0.4} /></mesh><mesh position={[0, 1.66, 0]}><cylinderGeometry args={[0.46, 0.46, 0.14, 16]} /><meshStandardMaterial color="#a4241e" /></mesh><mesh position={[0, 1.2, 0.43]}><boxGeometry args={[0.4, 0.07, 0.02]} /><meshBasicMaterial color="#12143a" /></mesh></group>
    <Bus t={t} />
    {/* her, at the first-floor bay window of her flat, phone in hand */}
    <group position={[(HER_HOUSE - 3) * HW - 1.3, 3.55, 1.36]} rotation-y={-Math.PI / 2 + 0.5} scale={1.02}><Her t={t} still /></group>
    {/* far roofs and the clock tower in the distance, so it is clearly the same city */}
    <group position={[-34, 0, -40]}><mesh position={[0, 16, 0]}><boxGeometry args={[4, 32, 4]} /><meshStandardMaterial color="#3a3480" /></mesh><mesh position={[0, 30, 2.05]}><circleGeometry args={[1.6, 30]} /><meshBasicMaterial color="#fff3d6" /></mesh><mesh position={[0, 35, 0]} rotation-y={Math.PI / 4}><coneGeometry args={[3.2, 6, 4]} /><meshStandardMaterial color="#2f9c95" /></mesh></group>
    <mesh position={[40, 60, -200]}><circleGeometry args={[7, 40]} /><meshBasicMaterial color="#fff3d6" fog={false} /></mesh>
  </group>; };

type Shot = { p: THREE.Vector3; l: THREE.Vector3; fov: number };
const HX = SX + (HER_HOUSE - 3) * HW - 1.3;
const camAt = (t: number): Shot => {
  if (t < T1) { const u = smooth(t / T1); return { p: V(lerp(-46, -14, u), lerp(20, 13, u), lerp(74, 58, u)), l: V(lerp(6, 14, u), lerp(20, 22, u), -14), fov: 44 }; }
  const a = seg(t, T1, 9.8), b = seg(t, 9.8, 13.4);
  const p = V(lerp(SX - 16, SX + 5, a), lerp(2.6, 3.6, a), lerp(20, 18, a)).lerp(V(HX + 1.8, 5.4, 7.4), b), l = V(lerp(SX - 6, SX + 1, a), lerp(4.6, 4.4, a), 0).lerp(V(HX, 5.0, 0.6), b);
  return { p, l, fov: lerp(44, 34, b) };
};
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = vfov(c.fov); cam.near = 0.1; cam.far = 900; cam.lookAt(c.l); cam.updateProjectionMatrix(); }, [t, camera]); return null; };

export const London: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS, street = t >= T1, cut = clamp01(1 - Math.abs(t - T1) / 0.22);
  return (
    <AbsoluteFill style={{ background: '#070a22' }}>
      <ThreeCanvas width={F.W} height={F.H} gl={{ antialias: true }} camera={{ fov: 44, near: 0.1, far: 900 }}>
        <Cam t={t} />
        <color attach="background" args={['#0b0e38']} />
        <fog attach="fog" args={['#141a52', street ? 26 : 70, street ? 150 : 320]} />
        <hemisphereLight args={['#8f9cff', '#1a1048', 1.15]} />
        <directionalLight position={[-20, 30, 30]} intensity={1.1} color="#c9d2ff" />
        {!street ? <Landmarks t={t} /> : <Street t={t} />}
        <EffectComposer><Bloom intensity={0.5} luminanceThreshold={0.86} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.22} darkness={0.75} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill style={{ background: '#03041a', opacity: cut }} />
      <AbsoluteFill><svg width={F.W} height={F.H}>
        <g opacity={seg(t, 0.5, 0.9) * (1 - seg(t, T1 - 0.7, T1 - 0.3))} {...EDGE} transform={tr(120, 890)}><text fill="#eef1ff" style={{ font: `800 60px ${FONT.ui}` }}>London</text><text y={46} fill="#5fe3ff" style={{ font: `500 30px ${FONT.mono}` }}>7,200 km from his balcony</text></g>
        <g opacity={seg(t, 11.2, 11.7)} {...EDGE} transform={tr(120, 890)}><text fill="#eef1ff" style={{ font: `800 54px ${FONT.ui}` }}>Her new flat</text><text y={46} fill="#5fe3ff" style={{ font: `500 30px ${FONT.mono}` }}>waiting for his video</text></g>
      </svg></AbsoluteFill>
    </AbsoluteFill>
  );
};
