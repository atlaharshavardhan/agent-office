import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { F, vfov, tr, clampX, EDGE } from './frame';
import { FONT } from '../lib/palette';

/* V4, 16:9: the router. Close on one router rack as our amber packet comes in on one cable and leaves on another,
   then wide: many routers joined by cables, the packet handed from one to the next, a busy link avoided. */

export const ROUTERS_FRAMES = 360;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const T_WIDE = 4.6;

const canvas = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
/* the front of one router unit: a row of ports with status lights */
const unitTex = (seed: number) => canvas(512, 96, (g) => { g.fillStyle = '#232a6e'; g.fillRect(0, 0, 512, 96); g.fillStyle = '#1a2058'; g.fillRect(0, 0, 512, 8); g.fillRect(0, 88, 512, 8); g.fillStyle = '#10143c'; g.fillRect(14, 22, 44, 52);
  for (let i = 0; i < 12; i++) { const x = 76 + i * 35; g.fillStyle = '#0b0f30'; g.fillRect(x, 34, 24, 28); g.fillStyle = hash(seed * 13 + i) > 0.35 ? (hash(seed * 7 + i) > 0.8 ? '#ffd08a' : '#7dffb0') : '#2a3180'; g.fillRect(x + 3, 20, 7, 7); g.fillStyle = hash(seed * 5 + i) > 0.5 ? '#5fe3ff' : '#2a3180'; g.fillRect(x + 14, 20, 7, 7); } });
const farTex = () => canvas(64, 160, (g) => { g.fillStyle = '#161b52'; g.fillRect(0, 0, 64, 160); for (let r = 0; r < 14; r++) for (let c = 0; c < 6; c++) { g.fillStyle = hash(r * 7 + c) > 0.55 ? (hash(r + c * 3) > 0.8 ? '#ffd08a' : '#5fe3ff') : '#232a70'; g.fillRect(8 + c * 8, 10 + r * 10, 5, 4); } });
const glowTex = (rgb: string) => canvas(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(0.2, `rgba(${rgb},.6)`); gr.addColorStop(0.55, `rgba(${rgb},.14)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });

/* ---------- the network: routers standing on dark ground, cables between them ---------- */
const NODES: [number, number][] = [[0, 0], [-16, -10], [12, -12], [26, -4], [-6, -24], [20, -26], [38, -18], [6, -40], [30, -40], [50, -32], [-24, -36], [44, -52], [18, -56], [62, -48], [-10, -54], [58, -66]];
const LINKS: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [2, 5], [3, 5], [3, 6], [4, 7], [5, 7], [5, 8], [6, 8], [6, 9], [4, 10], [7, 12], [8, 11], [9, 11], [9, 13], [10, 14], [12, 14], [11, 15], [13, 15], [8, 12]];
const ROUTE = [0, 2, 5, 8, 11, 15];      // the way our packet is handed on
const BUSY: [number, number] = [5, 7];   // the link it does not take
const nodeP = (i: number, y = 0) => V(NODES[i][0], y, NODES[i][1]);
const linkCurve = (a: number, b: number) => { const A = nodeP(a, 0.12), B = nodeP(b, 0.12), m = A.clone().lerp(B, 0.5), d = B.clone().sub(A), n = V(-d.z, 0, d.x).normalize().multiplyScalar(d.length() * 0.12 * (hash(a * 9 + b) - 0.5) * 2); return new THREE.CatmullRomCurve3([A, m.add(n), B]); };
const HOP = 1.05, T_GO = T_WIDE + 1.3;      // seconds per hop, when the packet leaves the first router in the wide view
const routePos = (uu: number) => { const u = Math.max(0, Math.min(ROUTE.length - 1, uu)), k = Math.min(ROUTE.length - 2, Math.floor(u)), f = smooth(u - k); return linkCurve(ROUTE[k], ROUTE[k + 1]).getPointAt(f); };
const packetAt = (t: number) => { const u = clamp01((t - T_GO) / (HOP * (ROUTE.length - 1))) * (ROUTE.length - 1), k = Math.min(ROUTE.length - 2, Math.floor(u)), f = smooth(u - k); const p = linkCurve(ROUTE[k], ROUTE[k + 1]).getPointAt(f); return { p, k, f }; };

type CK = { t: number; p: [number, number, number]; l: [number, number, number]; fov: number };
const CAM: CK[] = [
  { t: 0, p: [3.6, 3.6, 10.5], l: [0.3, 3.0, 0.8], fov: 36 },           // close on the rack, slow push
  { t: 3.8, p: [2.6, 3.4, 8.4], l: [0.2, 2.9, 0.8], fov: 34 },
  { t: 6.6, p: [-5, 10, 15], l: [9, 0, -9], fov: 40 },                // up and back: the whole network
  { t: 12, p: [12, 13, 4], l: [30, 0, -32], fov: 42 },                  // drift after the packet
];
const camAt = (t: number) => { let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1].t) i++; const a = CAM[i], b = CAM[i + 1], u = smooth((t - a.t) / (b.t - a.t)); const L = (x: number[], y: number[]) => V(lerp(x[0], y[0], u), lerp(x[1], y[1], u), lerp(x[2], y[2], u)); return { p: L(a.p, b.p), l: L(a.l, b.l), fov: lerp(a.fov, b.fov, u) }; };
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = vfov(c.fov); cam.near = 0.05; cam.far = 500; cam.lookAt(c.l); cam.updateProjectionMatrix(); }, [t, camera]); return null; };

/* ---------- the hero rack ---------- */
const UNITS = 8, UH = 0.5, U0 = 0.9;      // unit count, height, y of the lowest
const portP = (u: number, i: number) => V(-0.92 + (76 + i * 35 + 12) / 512 * 2.2 - 0.16, U0 + u * (UH + 0.08) + 0.0, 0.84);
const patch = (u: number, i: number, side: number, drop: number) => { const a = portP(u, i); return new THREE.CatmullRomCurve3([a, a.clone().add(V(0, -0.02, 0.45)), V(a.x * 0.5 + side * 0.9, a.y - 0.35, 1.35), V(side * 1.42, a.y - 0.9, 1.05), V(side * 1.42, drop, 0.95)]); };
const IN = patch(5, 3, -1, 0.1), OUT = patch(2, 8, 1, 0.1);
const Rack: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => Array.from({ length: UNITS }).map((_, i) => unitTex(i + 1)), []);
  const cables = useMemo(() => Array.from({ length: 15 }).map((_, k) => { const u = Math.floor(hash(k + 1) * UNITS), i = Math.floor(hash(k + 31) * 12); if ((u === 5 && i === 3) || (u === 2 && i === 8)) return null; return new THREE.TubeGeometry(patch(u, i, hash(k + 9) > 0.5 ? 1 : -1, 0.1), 40, 0.026, 8, false); }), []);
  const gIn = useMemo(() => new THREE.TubeGeometry(IN, 60, 0.04, 10, false), []), gOut = useMemo(() => new THREE.TubeGeometry(OUT, 60, 0.04, 10, false), []);
  const amber = useMemo(() => glowTex('255,190,90'), []);
  /* the packet: in along one cable, a beat inside while the router reads the address, out along another */
  const uIn = clamp01((t - 0.9) / 1.3), think = seg(t, 2.2, 2.4) * (1 - seg(t, 3.0, 3.2)), uOut = clamp01((t - 3.1) / 1.3);
  const p = t < 2.2 ? IN.getPointAt(1 - smooth(uIn)) : t < 3.1 ? null : OUT.getPointAt(smooth(uOut)), show = t > 0.9 && t < 4.5;
  const litOut = seg(t, 3.0, 3.2);
  return <group>
    <mesh position={[0, 3.1, 0]}><boxGeometry args={[2.7, 6.2, 1.6]} /><meshStandardMaterial color="#12163f" roughness={0.6} metalness={0.2} /></mesh>
    {[-1, 1].map((s) => <mesh key={s} position={[s * 1.28, 3.1, 0.82]}><boxGeometry args={[0.14, 6.2, 0.06]} /><meshStandardMaterial color="#3a4196" roughness={0.5} /></mesh>)}
    <mesh position={[0, 6.05, 0.82]}><boxGeometry args={[2.7, 0.3, 0.06]} /><meshStandardMaterial color="#3a4196" roughness={0.5} /></mesh>
    {tex.map((m, u) => { const y = U0 + u * (UH + 0.08), hot = (u === 5 || u === 2) ? think : 0; return <mesh key={u} position={[0, y, 0.79]}><boxGeometry args={[2.36, UH, 0.08]} /><meshStandardMaterial map={m} emissiveMap={m} emissive={hot > 0 ? '#ffd9a0' : '#ffffff'} emissiveIntensity={0.55 + hot * 1.4} roughness={0.5} /></mesh>; })}
    {cables.map((g, k) => g && <mesh key={k} geometry={g}><meshStandardMaterial color="#6fb6ff" roughness={0.5} emissive="#1c4a8a" emissiveIntensity={0.5} /></mesh>)}
    <mesh geometry={gIn}><meshStandardMaterial color="#ffb454" roughness={0.4} emissive="#ff9a2e" emissiveIntensity={0.25 + 0.9 * seg(t, 0.9, 1.2) * (1 - seg(t, 2.3, 2.8))} /></mesh>
    <mesh geometry={gOut}><meshStandardMaterial color={litOut > 0.5 ? '#ffb454' : '#6fb6ff'} roughness={0.4} emissive={litOut > 0.5 ? '#ff9a2e' : '#1c4a8a'} emissiveIntensity={0.5 + litOut * 0.6} /></mesh>
    {show && t < 2.2 && [1, 2, 3, 4, 5, 6].map((j) => { const q = IN.getPointAt(Math.min(1, Math.max(0, 1 - smooth(uIn) + j * 0.045))); return <mesh key={'a' + j} position={q}><sphereGeometry args={[0.07 - j * 0.006, 8, 6]} /><meshBasicMaterial color="#ffd9a0" /></mesh>; })}
    {show && t >= 3.1 && [1, 2, 3, 4, 5, 6].map((j) => { const q = OUT.getPointAt(Math.min(1, Math.max(0, smooth(uOut) - j * 0.045))); return <mesh key={'b' + j} position={q}><sphereGeometry args={[0.07 - j * 0.006, 8, 6]} /><meshBasicMaterial color="#ffd9a0" /></mesh>; })}
    {show && p && <group position={p}><sprite scale={[1.1, 1.1, 1]}><spriteMaterial map={amber} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite><mesh><sphereGeometry args={[0.07, 12, 10]} /><meshBasicMaterial color="#fff0c8" /></mesh><pointLight color="#ffb454" intensity={6} distance={3} /></group>}
    <pointLight position={[0, 3, 3]} intensity={10 + think * 22} color={think > 0.3 ? '#ffd9a0' : '#9fb6ff'} distance={9} />
  </group>;
};

/* every router in the network is the SAME server rack as the big one (Harsh), just smaller */
const MiniRack: React.FC<{ seed: number; lit: number; wide: number }> = ({ seed, lit, wide }) => {
  const tex = useMemo(() => unitTex(seed + 20), [seed]);
  const cab = useMemo(() => [0, 1, 2].map((k) => { const y = 1.6 + k * 1.5, s = k % 2 ? 1 : -1; return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.5 * s, y, 0.86), V(-0.8 * s, y - 0.2, 1.4), V(-1.25 * s, y - 0.9, 1.15), V(-1.3 * s, y - 1.5, 0.9)]), 24, 0.045, 6, false); }), []);
  return <group scale={0.95}>
    <mesh position={[0, 3.1, 0]}><boxGeometry args={[2.7, 6.2, 1.6]} /><meshStandardMaterial color="#12163f" roughness={0.6} metalness={0.2} /></mesh>
    {Array.from({ length: 6 }).map((_, u) => <mesh key={u} position={[0, 0.9 + u * 0.9, 0.79]}><boxGeometry args={[2.36, 0.64, 0.08]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive={lit > 0.05 ? '#ffd9a0' : '#ffffff'} emissiveIntensity={(0.75 + lit * 1.5) * wide} roughness={0.5} /></mesh>)}
    {cab.map((g, k) => <mesh key={k} geometry={g}><meshStandardMaterial color="#6fb6ff" emissive="#1c4a8a" emissiveIntensity={0.9 * wide} /></mesh>)}
  </group>; };

/* ---------- the wide view ---------- */
const Net: React.FC<{ t: number }> = ({ t }) => {
  const ft = useMemo(farTex, []), amber = useMemo(() => glowTex('255,190,90'), []), red = useMemo(() => glowTex('255,90,80'), []);
  const tubes = useMemo(() => LINKS.map(([a, b]) => new THREE.TubeGeometry(linkCurve(a, b), 40, 0.09, 8, false)), []);
  const wide = seg(t, T_WIDE - 0.4, T_WIDE + 0.8), pk = packetAt(t), going = t > T_GO;
  const onRoute = (a: number, b: number) => { for (let k = 0; k < ROUTE.length - 1; k++) if ((ROUTE[k] === a && ROUTE[k + 1] === b) || (ROUTE[k] === b && ROUTE[k + 1] === a)) return k; return -1; };
  /* at the third router it looks at the busy link first, sees it is jammed, and takes the other */
  const tBusy = T_GO + HOP * 2, busy = seg(t, tBusy - 0.5, tBusy - 0.2);      // the link FAILS and stays broken
  return <group>
    <mesh rotation-x={-Math.PI / 2} position={[20, 0, -30]}><planeGeometry args={[260, 220]} /><meshStandardMaterial color="#0b0e36" roughness={0.95} /></mesh>
    {NODES.map((_, i) => { if (i === 0) return null; const h = 4 + hash(i + 3) * 2.2, hot = ROUTE.indexOf(i), lit = hot > 0 ? seg(t, T_GO + HOP * hot - 0.25, T_GO + HOP * hot) * (1 - seg(t, T_GO + HOP * hot + 0.8, T_GO + HOP * hot + 1.6)) : 0;
      return <group key={i} position={nodeP(i)}><MiniRack seed={i} lit={lit} wide={wide} />
        <mesh position={[0, 0.06, 0]}><boxGeometry args={[2.5, 0.12, 1.9]} /><meshStandardMaterial color="#232a70" roughness={0.7} /></mesh>
        {lit > 0.02 && <pointLight position={[0, h * 0.6, 1.4]} color="#ffb454" intensity={40 * lit} distance={12} />}</group>; })}
    {tubes.map((g, i) => { const [a, b] = LINKS[i], k = onRoute(a, b), done = k >= 0 && going ? clamp01((t - T_GO - HOP * k) / HOP) : 0, isBusy = (a === BUSY[0] && b === BUSY[1]);
      const col = isBusy && busy > 0.3 ? '#ff5a4a' : done >= 1 ? '#ffb454' : '#3f6fd8', em = isBusy ? 0.25 + busy * 1.6 : done >= 1 ? 0.9 : 0.28;
      return <mesh key={i} geometry={g} visible={!(isBusy && busy > 0.25)}><meshStandardMaterial color={col} emissive={col} emissiveIntensity={em * wide} roughness={0.5} transparent opacity={0.35 + 0.65 * Math.min(1, em)} /></mesh>; })}
    {/* the stretch of the current link already travelled */}
    {going && (() => { const g = new THREE.TubeGeometry(linkCurve(ROUTE[pk.k], ROUTE[pk.k + 1]), 40, 0.11, 8, false); g.setDrawRange(0, Math.floor((g.index!.count * pk.f) / 3) * 3); return <mesh geometry={g}><meshBasicMaterial color="#ffb454" /></mesh>; })()}
    {going && (() => { const hu = clamp01((t - T_GO) / (HOP * (ROUTE.length - 1))) * (ROUTE.length - 1);   // the photo is light now: a string of glowing pulses follows the head along the route
      return <group>{Array.from({ length: 30 }).map((_, i) => { const uu = hu - 0.05 - i * 0.075; if (uu < 0 || i === 0) return null; const q = routePos(uu), k = 1 - i / 34;
        return <group key={i} position={[q.x, 0.55, q.z]}><sprite scale={[2.6 * k + 0.6, 2.6 * k + 0.6, 1]}><spriteMaterial map={amber} transparent opacity={0.9 * k} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite><mesh><sphereGeometry args={[0.2 * k + 0.05, 10, 8]} /><meshBasicMaterial color="#fff0c8" /></mesh></group>; })}</group>; })()}
    {going && <group position={[pk.p.x, 0.5, pk.p.z]}><sprite scale={[5, 5, 1]}><spriteMaterial map={amber} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite><mesh><sphereGeometry args={[0.28, 12, 10]} /><meshBasicMaterial color="#fff0c8" /></mesh><pointLight color="#ffb454" intensity={70} distance={16} decay={1.5} position={[0, 1.5, 0]} /></group>}
    {busy > 0.02 && (() => { const c = linkCurve(BUSY[0], BUSY[1]), m = c.getPointAt(0.5), fl = 0.5 + 0.5 * Math.sin(t * 12), sp = (t * 7) % 1;
      const halfA = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 12 }).map((_, i) => c.getPointAt(i / 11 * 0.4))), 20, 0.09, 6, false), halfB = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 12 }).map((_, i) => c.getPointAt(0.6 + i / 11 * 0.4))), 20, 0.09, 6, false);
      return <group>
        <mesh geometry={halfA}><meshStandardMaterial color="#ff5a4a" emissive="#ff3a2a" emissiveIntensity={0.8 * busy * (0.4 + 0.6 * fl)} transparent opacity={0.8} /></mesh><mesh geometry={halfB}><meshStandardMaterial color="#ff5a4a" emissive="#ff3a2a" emissiveIntensity={0.8 * busy * (0.4 + 0.6 * fl)} transparent opacity={0.8} /></mesh>
        <group position={[m.x, 0.7, m.z]}><sprite scale={[11 * busy, 11 * busy, 1]}><spriteMaterial map={red} transparent opacity={busy * (0.5 + 0.5 * fl)} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
          <mesh rotation={[0, 0, Math.PI / 4]} scale={busy}><boxGeometry args={[2.6, 0.32, 0.32]} /><meshBasicMaterial color="#ff4a3a" /></mesh><mesh rotation={[0, 0, -Math.PI / 4]} scale={busy}><boxGeometry args={[2.6, 0.32, 0.32]} /><meshBasicMaterial color="#ff4a3a" /></mesh>
          {(() => { const e = Math.max(0, t - (tBusy - 0.5)) , x = Math.min(1, e / 1.1), fade = 1 - x; if (e <= 0 || x >= 1) return null; const ez = 1 - Math.pow(1 - x, 3);
            return <group>
              <sprite scale={[30 * ez + 5, 30 * ez + 5, 1]}><spriteMaterial map={red} transparent opacity={fade * 1.4} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
              <mesh rotation={[-Math.PI / 2, 0, 0]} scale={0.5 + ez * 10}><ringGeometry args={[0.85, 1, 48]} /><meshBasicMaterial color="#ff5a3a" transparent opacity={fade} side={THREE.DoubleSide} /></mesh>
              {Array.from({ length: 60 }).map((_, k) => { const a = hash(k + 3) * 6.283, up = 0.4 + hash(k + 50) * 1.1, sp = 6 + hash(k + 90) * 12, d = ez * sp;
                return <mesh key={k} position={[Math.cos(a) * d, up * d * 0.9 - x * x * 3, Math.sin(a) * d * 0.7]} scale={fade * (0.5 + hash(k + 7))}><boxGeometry args={[0.6, 0.6, 0.6]} /><meshBasicMaterial color={k % 3 ? '#ff3a2a' : '#ffb070'} /></mesh>; })}
            </group>; })()}
          <pointLight color="#ff4a3a" intensity={50 * busy} distance={14} /></group></group>; })()}
  </group>;
};

const project = (t: number, p: THREE.Vector3): [number, number] => { const c = camAt(t), cam = new THREE.PerspectiveCamera(vfov(c.fov), F.W / F.H, 0.05, 500); cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld(); const q = p.clone().project(cam); return [(q.x * 0.5 + 0.5) * F.W, (-q.y * 0.5 + 0.5) * F.H]; };
const Box: React.FC<{ x: number; y: number; o: number; text: string; sub?: string; col?: string; w?: number }> = ({ x, y, o, text, sub, col = '#5fe3ff', w }) => { const ww = w ?? Math.max(text.length * 30 + 60, (sub?.length ?? 0) * 19 + 60);
  return <g opacity={o} transform={`translate(${x} ${y})`}><defs><linearGradient id="cbF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24357e" /><stop offset="1" stopColor="#0a1030" /></linearGradient><linearGradient id="cbH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity={0.28} /><stop offset="1" stopColor="#ffffff" stopOpacity={0} /></linearGradient></defs><g style={{ filter: `drop-shadow(0 10px 18px rgba(0,0,0,.6)) drop-shadow(0 0 16px ${col}66)` }}><rect x={-ww / 2} y={-46} width={ww} height={sub ? 128 : 78} rx={24} fill="url(#cbF)" stroke={col} strokeWidth={3.5} /><path d={`M ${-ww / 2 + 26} -45 H ${ww / 2 - 26} Q ${ww / 2 - 4} -45 ${ww / 2 - 4} -22 V -12 H ${-ww / 2 + 4} V -22 Q ${-ww / 2 + 4} -45 ${-ww / 2 + 26} -45 Z`} fill="url(#cbH)" /><rect x={-ww / 2 + 16} y={-30} width={9} height={sub ? 98 : 48} rx={4.5} fill={col} /></g><text y={7} textAnchor="middle" fill="#eef1ff" style={{ font: `800 46px ${FONT.ui}`, letterSpacing: '0.03em' }}>{text}</text>{sub && <text x={10} y={52} textAnchor="middle" fill="#d6e4ff" style={{ font: `600 30px ${FONT.mono}` }}>{sub}</text>}</g>; };

export const Routers: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS, pk = packetAt(t);
  const [px, py] = project(t, V(pk.p.x, 0.5, pk.p.z)), tagO = seg(t, T_GO, T_GO + 0.4) * (1 - seg(t, 11.2, 11.7));
  const tBusy = T_GO + HOP * 2, bm = linkCurve(BUSY[0], BUSY[1]).getPointAt(0.45), [bx, by] = project(t, V(bm.x, 0.6, bm.z)), busyO = seg(t, tBusy - 0.3, tBusy) * (1 - seg(t, tBusy + 1.8, tBusy + 2.3));
  return (
    <AbsoluteFill style={{ background: '#070a22' }}>
      <ThreeCanvas width={F.W} height={F.H} gl={{ antialias: true }} camera={{ fov: 36, near: 0.05, far: 500 }}>
        <Cam t={t} />
        <color attach="background" args={['#080b2c']} />
        <fog attach="fog" args={['#0a0d38', 30, 150]} />
        <hemisphereLight args={['#7f8cff', '#120a3a', 0.9]} />
        <directionalLight position={[-10, 20, 14]} intensity={0.9} color="#c9d2ff" />
        <Rack t={t} /><Net t={t} />
        <EffectComposer><Bloom intensity={0.55} luminanceThreshold={0.84} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.22} darkness={0.78} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill><svg width={F.W} height={F.H}>
        <Box x={F.v ? 540 : 1440} y={F.v ? 330 : 250} o={seg(t, 0.5, 0.9) * (1 - seg(t, 4.0, 4.5))} text="ROUTER" sub="reads the address on each packet" />
        <Box x={F.v ? 540 : 1440} y={F.v ? 500 : 370} o={seg(t, 2.3, 2.6) * (1 - seg(t, 4.0, 4.5))} text="TO 86.14.203.57 · LONDON" sub="so it picks the cable that leads there" col="#ffb454" />
        <g opacity={tagO}><line x1={px} y1={py - 14} x2={px + 60} y2={py - 96} stroke="#ffb454" strokeWidth={2.5} /><g transform={`translate(${Math.min(px + 150, 740)} ${py - 190})`} style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.6)) drop-shadow(0 0 18px rgba(255,180,84,.55))' }}><defs><linearGradient id="gTag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd77a" /><stop offset="1" stopColor="#d9901c" /></linearGradient></defs><rect x={-190} y={-44} width={380} height={140} rx={26} fill="url(#gTag)" stroke="#ffe9b0" strokeWidth={4} /><rect x={-190} y={-44} width={380} height={44} rx={26} fill="#2a1630" /><rect x={-176} y={-36} width={34} height={26} rx={6} fill="#f0b23a" /><path d="M -186 -40 H 186 Q 186 -4 186 -4 H -186 Z" fill="none" /><text x={-128} y={-12} fill="#ffe6b8" style={{ font: `700 21px ${FONT.mono}` }}>TO 86.14.203.57 · LONDON</text><text y={66} textAnchor="middle" fill="#2a1630" style={{ font: `900 70px ${FONT.ui}` }}>#1204</text></g></g>
        <g opacity={busyO}><line x1={bx} y1={by + 14} x2={bx - 50} y2={by + 100} stroke="#ff5a4a" strokeWidth={2.5} /><Box x={Math.min(Math.max(bx - 70, 400), 540)} y={by + 150} o={1} text="LINK DOWN" sub="this cable failed: another way" col="#ff5a4a" /></g>
        <g opacity={seg(t, 5.6, 6.1) * (1 - seg(t, 11.3, 11.8))} {...EDGE} transform={tr(120, 150)}><text fill="#eef1ff" style={{ font: `800 70px ${FONT.ui}` }}>Router to router</text><text y={44} fill="#5fe3ff" style={{ font: `600 38px ${FONT.mono}` }}>each one only knows the next step</text></g>
      </svg></AbsoluteFill>
      <div style={{ position: 'absolute', right: 70, top: 150, display: 'flex', alignItems: 'baseline', gap: 8, font: `800 120px/1 ${FONT.ui}`, color: '#7fd4ff', textShadow: '0 0 30px rgba(127,212,255,.6)' }}>{String(Math.round(lerp(9, 15, seg(t, 0.5, 11)))).padStart(3, '0')}<span style={{ font: `800 40px ${FONT.ui}` }}>ms</span></div>
    </AbsoluteFill>
  );
};
