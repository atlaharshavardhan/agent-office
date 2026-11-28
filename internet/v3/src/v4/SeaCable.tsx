import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { F, vfov, tr, clampX } from './frame';
import { FONT } from '../lib/palette';
import { stripeTex, pulseMat } from './Fiber';

/* V4, 16:9: how thin the undersea cable is, and what is inside it.
   First the cable beside a garden hose, then its layers slide out one after another, ending on the glass fibres. */

export const SEACABLE_FRAMES = 450;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const TILT = 0.5;      // the cable leans up to the right
const along = (x: number, off = 0, z = 0) => V(x * Math.cos(TILT) - off * Math.sin(TILT), 2.2 + x * Math.sin(TILT) + off * Math.cos(TILT), z);

type CK = { t: number; p: [number, number, number]; l: [number, number, number]; fov: number };
const P = (x: number, off: number, z: number): [number, number, number] => { const v = along(x, off, z); return [v.x, v.y, v.z]; };
const CAM: CK[] = [
  { t: 0, p: P(-1.5, -0.8, 18), l: P(-1.5, -1.3, 0), fov: 36 },          // cable and hose side by side
  { t: 4.2, p: P(0, 0.6, 14), l: P(0.5, 0, 0), fov: 34 },
  { t: 6.0, p: P(3.2, 1.6, 12), l: P(3, 0, 0), fov: 34 },           // the cut end as the layers come out
  { t: 10.4, p: P(5.4, 1.3, 9.5), l: P(5.2, 0, 0), fov: 32 },
  { t: 13.0, p: P(8.6, 0.9, 4.6), l: P(8.2, 0, 0), fov: 30 },       // close on the glass fibres
  { t: 15.2, p: P(9.2, 0.8, 4.0), l: P(8.8, 0, 0), fov: 30 },
];
const camAt = (t: number) => { let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1].t) i++; const a = CAM[i], b = CAM[i + 1], u = smooth((t - a.t) / (b.t - a.t)); const L = (x: number[], y: number[]) => V(lerp(x[0], y[0], u), lerp(x[1], y[1], u), lerp(x[2], y[2], u)); return { p: L(a.p, b.p), l: L(a.l, b.l), fov: lerp(a.fov, b.fov, u) }; };
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = vfov(c.fov); cam.near = 0.05; cam.far = 300; cam.lookAt(c.l); cam.updateProjectionMatrix(); }, [t, camera]); return null; };

const Cyl: React.FC<{ r: number; x0: number; x1: number; children?: React.ReactNode; sg?: number }> = ({ r, x0, x1, children, sg = 40 }) => x1 - x0 < 0.001 ? null : <mesh position={[(x0 + x1) / 2, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[r, r, x1 - x0, sg]} />{children}</mesh>;
const Ring: React.FC<{ r: number; wire: number; n: number; x0: number; x1: number; col: string }> = ({ r, wire, n, x0, x1, col }) => x1 - x0 < 0.001 ? null : <>{Array.from({ length: n }).map((_, k) => <mesh key={k} position={[(x0 + x1) / 2, Math.cos((k / n) * 6.283) * r, Math.sin((k / n) * 6.283) * r]} rotation-z={Math.PI / 2}><cylinderGeometry args={[wire, wire, x1 - x0, 10]} /><meshStandardMaterial color={col} roughness={0.3} metalness={0.5} /></mesh>)}</>;

/* how far each layer has slid out of the cut end (x = 0 is the cut) */
const OUT = (t: number) => ({ poly: lerp(0, 2.0, seg(t, 5.0, 6.0)), copper: lerp(0, 3.6, seg(t, 6.2, 7.2)), strand: lerp(0, 4.8, seg(t, 7.4, 8.4)), gel: lerp(0, 5.8, seg(t, 8.6, 9.6)), fib: lerp(0, 9.4, seg(t, 9.9, 11.4)) });
const Cable: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => { const x = stripeTex('#3b4078', '#c9cdf2', 22, 1); x.repeat.set(5, 1); return x; }, []), texB = useMemo(() => { const x = stripeTex('#000000', '#ffffff', 22, 1); x.repeat.set(5, 1); x.colorSpace = THREE.NoColorSpace; return x; }, []);
  const o = OUT(t), mats = useMemo(() => Array.from({ length: 8 }).map(() => pulseMat()), []);
  const lit = seg(t, 11.2, 12.2);
  mats.forEach((m, k) => { m.uniforms.uT.value = t * (2 + k * 0.15) + k * 2.3; m.uniforms.uLen.value = 9; m.uniforms.uOn.value = lit * 0.6; m.uniforms.uAmber.value = k === 0 ? ((t * 2.4) % 14) - 2 : -99; });
  return <group position={[along(0).x, along(0).y, 0]} rotation-z={TILT}>
    <Cyl r={1} x0={-30} x1={0}><meshStandardMaterial map={tex} bumpMap={texB} bumpScale={2.4} roughness={0.36} metalness={0.5} /></Cyl>
    <Ring r={0.88} wire={0.115} n={22} x0={-0.6} x1={0.02} col="#c9cdf2" />
    <mesh position={[0, 0, 0]} rotation-y={Math.PI / 2}><circleGeometry args={[0.78, 40]} /><meshStandardMaterial color="#12163f" /></mesh>
    <Cyl r={0.74} x0={-1} x1={o.poly}><meshStandardMaterial color="#7f8cf0" roughness={0.45} /></Cyl>
    <Cyl r={0.5} x0={-1} x1={o.copper}><meshStandardMaterial color="#e2a35a" roughness={0.3} metalness={0.5} emissive="#5a3410" emissiveIntensity={0.5} /></Cyl>
    <Ring r={0.33} wire={0.075} n={14} x0={-1} x1={o.strand} col="#dfe4ff" />
    <Cyl r={0.24} x0={-1} x1={o.gel}><meshStandardMaterial color="#f2f4ff" roughness={0.5} /></Cyl>
    {/* eight glass fibres, fanning very slightly at the tip */}
    {o.fib > o.gel + 0.01 && Array.from({ length: 8 }).map((_, k) => { const a = (k / 8) * 6.283, r0 = k === 0 ? 0 : 0.11, sp = k === 0 ? 0 : 0.42, len = o.fib - (k % 3) * 0.35; if (len < o.gel) return null;
      const cv = new THREE.CatmullRomCurve3([V(o.gel - 0.2, Math.cos(a) * r0, Math.sin(a) * r0), V(o.gel + 0.6, Math.cos(a) * r0, Math.sin(a) * r0), V(lerp(o.gel, len, 0.6), Math.cos(a) * (r0 + sp * 0.5), Math.sin(a) * (r0 + sp * 0.5)), V(len, Math.cos(a) * (r0 + sp), Math.sin(a) * (r0 + sp))]);
      return <group key={k}><mesh geometry={new THREE.TubeGeometry(cv, 50, 0.022, 8, false)}><meshStandardMaterial color={k === 0 ? '#ffd9a0' : '#d9f4ff'} roughness={0.3} emissive={k === 0 ? '#ffb454' : '#5fe3ff'} emissiveIntensity={0.25 + 0.5 * lit} /></mesh>
        <mesh geometry={new THREE.TubeGeometry(cv, 50, 0.025, 8, false)} material={mats[k]} /></group>; })}
  </group>;
};
/* a garden hose with its brass screw fitting, the same thickness as the cable */
const Hose: React.FC<{ t: number }> = ({ t }) => { const away = seg(t, 3.6, 4.8), p = along(-1.5, -2.6 - away * 9, 0.4);
  if (away > 0.99) return null;
  return <group position={[p.x, p.y, p.z]} rotation-z={TILT}>
    <Cyl r={1} x0={-30} x1={2}><meshStandardMaterial color="#2f9c6a" roughness={0.45} /></Cyl>
    {Array.from({ length: 40 }).map((_, k) => <mesh key={k} position={[1.6 - k * 0.8, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[1.012, 1.012, 0.05, 40]} /><meshStandardMaterial color="#27855a" roughness={0.5} /></mesh>)}
    <Cyl r={1.1} x0={2} x1={2.9}><meshStandardMaterial color="#d8a63c" roughness={0.3} metalness={0.7} emissive="#4a3408" emissiveIntensity={0.6} /></Cyl>
    <mesh position={[3.2, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[1.32, 1.32, 0.6, 6]} /><meshStandardMaterial color="#b98a2c" roughness={0.35} metalness={0.7} emissive="#4a3408" emissiveIntensity={0.6} /></mesh>
    {[0, 1, 2, 3].map((k) => <mesh key={k} position={[3.7 + k * 0.2, 0, 0]} rotation-z={Math.PI / 2}><cylinderGeometry args={[1.06, 1.06, 0.1, 40]} /><meshStandardMaterial color="#e6b84a" roughness={0.3} metalness={0.7} emissive="#4a3408" emissiveIntensity={0.6} /></mesh>)}
    <Cyl r={0.98} x0={3.5} x1={4.5}><meshStandardMaterial color="#c99a34" roughness={0.3} metalness={0.7} emissive="#4a3408" emissiveIntensity={0.5} /></Cyl>
  </group>; };
const Floor: React.FC = () => { const rock = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  const rip = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!; for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x += 2) { const v = 0.5 + 0.5 * Math.sin((y / 256) * Math.PI * 2 * 9 + Math.sin((x / 256) * Math.PI * 2 * 2) * 1.6), s = Math.round(v * 255); g.fillStyle = `rgb(${s},${s},${s})`; g.fillRect(x, y, 2, 1); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 12); return t; }, []);
  return <group><mesh position={[4, 2, -9]}><planeGeometry args={[150, 90]} /><meshStandardMaterial color="#2e3190" roughness={0.95} bumpMap={rip} bumpScale={1.4} /></mesh>
    {Array.from({ length: 70 }).map((_, i) => { const x = -40 + hash(i) * 90, y = -22 + hash(i + 5) * 50, s = 0.2 + hash(i + 9) ** 3 * 1.6; return <mesh key={i} geometry={rock} position={[x, y, -8.8]} scale={[s * 1.4, s, s * 0.5]} rotation={[hash(i + 2) * 3, hash(i + 4) * 3, 0]}><meshStandardMaterial color="#1b1e5e" roughness={0.9} flatShading /></mesh>; })}</group>; };

const project = (t: number, p: THREE.Vector3): [number, number] => { const c = camAt(t), cam = new THREE.PerspectiveCamera(vfov(c.fov), F.W / F.H, 0.05, 300); cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld(); const q = p.clone().project(cam); return [(q.x * 0.5 + 0.5) * F.W, (-q.y * 0.5 + 0.5) * F.H]; };
const Tag: React.FC<{ t: number; at: THREE.Vector3; text: string; sub?: string; a: number; b: number; dx: number; dy: number; col?: string }> = ({ t, at, text, sub, a, b, dx, dy, col = '#5fe3ff' }) => {
  const o = seg(t, a, a + 0.4) * (1 - seg(t, b - 0.4, b)); if (o <= 0.001) return null; const [x, y] = project(t, at), w = Math.max(text.length * 30 + 60, (sub?.length ?? 0) * 19 + 60), lx = clampX(x + dx, w), ly = y + dy;
  return <g opacity={o}><line x1={x} y1={y} x2={lx} y2={ly + (dy < 0 ? 30 : -30)} stroke={col} strokeWidth={2.5} /><circle cx={x} cy={y} r={6} fill={col} stroke="#070a22" strokeWidth={2.5} />
    <g transform={`translate(${lx} ${ly})`}><defs><linearGradient id="cbF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24357e" /><stop offset="1" stopColor="#0a1030" /></linearGradient><linearGradient id="cbH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity={0.28} /><stop offset="1" stopColor="#ffffff" stopOpacity={0} /></linearGradient></defs><g style={{ filter: `drop-shadow(0 10px 18px rgba(0,0,0,.6)) drop-shadow(0 0 16px ${col}66)` }}><rect x={-w / 2} y={-46} width={w} height={sub ? 128 : 78} rx={24} fill="url(#cbF)" stroke={col} strokeWidth={3.5} /><path d={`M ${-w / 2 + 26} -45 H ${w / 2 - 26} Q ${w / 2 - 4} -45 ${w / 2 - 4} -22 V -12 H ${-w / 2 + 4} V -22 Q ${-w / 2 + 4} -45 ${-w / 2 + 26} -45 Z`} fill="url(#cbH)" /><rect x={-w / 2 + 16} y={-30} width={9} height={sub ? 98 : 48} rx={4.5} fill={col} /></g><text x={10} y={8} textAnchor="middle" fill="#ffffff" style={{ font: `800 46px ${FONT.ui}`, letterSpacing: '0.03em', filter: `drop-shadow(0 0 10px ${col}aa)` }}>{text}</text>{sub && <text x={10} y={52} textAnchor="middle" fill="#d6e4ff" style={{ font: `600 30px ${FONT.mono}` }}>{sub}</text>}</g></g>; };

export const SeaCable: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS, o = OUT(t);
  return (
    <AbsoluteFill style={{ background: '#070a22' }}>
      <ThreeCanvas width={F.W} height={F.H} gl={{ antialias: true }} camera={{ fov: 36, near: 0.05, far: 300 }}>
        <Cam t={t} />
        <color attach="background" args={['#0a1040']} />
        <fog attach="fog" args={['#0d1650', 16, 70]} />
        <hemisphereLight args={['#8fa0ff', '#1a1050', 1.3]} />
        <directionalLight position={[-6, 12, 14]} intensity={1.8} color="#e6ebff" />
        <directionalLight position={[10, -4, 8]} intensity={0.6} color="#5fe3ff" />
        <Floor /><Cable t={t} /><Hose t={t} />
        <EffectComposer><Bloom intensity={0.5} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.22} darkness={0.75} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill><svg width={F.W} height={F.H}>
        <Tag t={t} at={along(o.poly * 0.55, 0.74, 0)} text="PLASTIC" sub="keeps the sea water out" a={6.0} b={9.6} dx={-40} dy={-230} col="#9fa8ff" />
        <Tag t={t} at={along(8.0, 0.15, 0)} text="GLASS FIBRES" sub="each as thin as a human hair" a={11.6} b={15.0} dx={-250} dy={-190} col="#ffb454" />
      </svg></AbsoluteFill>
      
    </AbsoluteFill>
  );
};
