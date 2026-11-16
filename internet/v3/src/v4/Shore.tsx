import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { stripeTex } from './Fiber';
import { winTex } from './Packets';

/* V4, 16:9: the shore. The cable leaves the landing station, crosses the beach and goes into the sea, the city across the bay.
   The camera follows the amber light down the sand and under the water, ready to cut to the seabed. */
const W = 1920, H = 1080;
export const SHORE_FRAMES = 285;
export const COAST_NAME = 'Mumbai coast';
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
/* the beach: rises gently inland, slopes down under the water (water level is y = 0, the shoreline is near z = -10) */
const sand = (x: number, z: number) => (z > -4 ? 0.95 + (z + 4) * 0.1 : z > -10 ? 0.95 + (z + 4) * 0.165 : -0.04 + (z + 10) * 0.3) + 0.18 * Math.sin(x * 0.21 + z * 0.13) + 0.1 * Math.sin(x * 0.07 - z * 0.3);
const cx = (z: number) => 1.6 * Math.sin(z * 0.07) + (z > 0 ? z * 1.25 : 0);
const cpt = (z: number) => V(cx(z), sand(cx(z), z) + 0.3, z);
const PATH = new THREE.CatmullRomCurve3(Array.from({ length: 60 }).map((_, i) => cpt(6.5 - i * 1.25)));
const zAt = (t: number) => lerp(6, -46, clamp01((t - 1.0) / 8.2) ** 1.15);      // where the amber light is

type CK = { t: number; p: [number, number, number]; l: [number, number, number]; fov: number };
const CAM: CK[] = [
  { t: 0, p: [-5, 7.5, 27], l: [6, 1.5, -8], fov: 42 },             // the station, the beach, the bay and the city
  { t: 3.4, p: [-6, 6.2, 9], l: [0.5, 0, -14], fov: 42 },        // down behind the cable as the light runs to the water
  { t: 6.2, p: [-5, 4.6, 0.5], l: [0, -1.6, -22], fov: 46 },        // at the waterline
  { t: 9.5, p: [-3, -1.6, -15], l: [0, -8, -38], fov: 50 },      // under the surface, following it down the slope
];
const camAt = (t: number) => { let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1].t) i++; const a = CAM[i], b = CAM[i + 1], u = smooth((t - a.t) / (b.t - a.t)); const L = (x: number[], y: number[]) => V(lerp(x[0], y[0], u), lerp(x[1], y[1], u), lerp(x[2], y[2], u)); return { p: L(a.p, b.p), l: L(a.l, b.l), fov: lerp(a.fov, b.fov, u) }; };
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = c.fov; cam.near = 0.05; cam.far = 500; cam.lookAt(c.l); cam.updateProjectionMatrix(); }, [t, camera]); return null; };

const Beach: React.FC = () => { const geo = useMemo(() => { const g = new THREE.PlaneGeometry(160, 130, 120, 110); g.rotateX(-Math.PI / 2); g.translate(0, 0, -35); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, sand(p.getX(i), p.getZ(i))); g.computeVertexNormals(); return g; }, []);
  const rock = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  return <group><mesh geometry={geo}><meshStandardMaterial color="#6f6aa0" roughness={0.95} /></mesh>
    {Array.from({ length: 90 }).map((_, i) => { const x = (hash(i) - 0.5) * 70, z = 14 - hash(i + 7) * 70; if (Math.abs(x - cx(z)) < 1.4) return null; const s = 0.12 + hash(i + 3) ** 3 * 1.1; return <mesh key={i} geometry={rock} position={[x, sand(x, z) + s * 0.2, z]} scale={[s * 1.3, s * 0.6, s]} rotation={[hash(i + 9) * 3, hash(i + 11) * 3, 0]}><meshStandardMaterial color="#3d3a72" roughness={0.9} flatShading /></mesh>; })}</group>; };
/* the sea surface: a few rolling waves, redrawn every frame */
const Sea: React.FC<{ t: number; under: number }> = ({ t, under }) => { const geo = useMemo(() => { const g = new THREE.PlaneGeometry(420, 260, 110, 70); g.rotateX(-Math.PI / 2); g.translate(0, 0, -135); return g; }, []);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, 0.09 * Math.sin(x * 0.35 + t * 1.3) + 0.07 * Math.sin(z * 0.5 - t * 1.7 + x * 0.1) + 0.04 * Math.sin((x + z) * 0.9 + t * 2.2)); } p.needsUpdate = true; geo.computeVertexNormals();
  return <mesh geometry={geo}><meshStandardMaterial color="#2a44c8" emissive="#10206a" emissiveIntensity={0.6} roughness={0.18} metalness={0.35} transparent opacity={lerp(0.62, 0.4, under)} side={THREE.DoubleSide} /></mesh>; };
/* the city across the bay, with a cable-stayed sea bridge in front of it */
const Skyline: React.FC = () => { const tex = useMemo(() => [0, 1, 2, 3].map(winTex), []);
  return <group position={[0, 0, -150]}>
    {Array.from({ length: 44 }).map((_, i) => { const x = -150 + i * 7 + hash(i) * 3, w = 5 + hash(i + 3) * 4, h = 9 + hash(i + 5) ** 2 * 44, m = tex[i % 4].clone(); m.repeat.set(1, Math.max(1, Math.round(h / 10))); m.wrapS = m.wrapT = THREE.RepeatWrapping; m.needsUpdate = true;
      return <mesh key={i} position={[x, h / 2, -hash(i + 9) * 18]}><boxGeometry args={[w, h, w]} /><meshStandardMaterial color="#1f2566" map={m} emissiveMap={m} emissive="#ffffff" emissiveIntensity={0.75} roughness={0.8} /></mesh>; })}
    <group position={[-30, 0, 38]}>
      <mesh position={[0, 3.2, 0]}><boxGeometry args={[150, 0.7, 2.2]} /><meshStandardMaterial color="#3a4196" emissive="#ffc46a" emissiveIntensity={0.25} /></mesh>
      {Array.from({ length: 14 }).map((_, i) => <mesh key={i} position={[-70 + i * 10.8, 1.5, 0]}><boxGeometry args={[0.7, 3.2, 1.4]} /><meshStandardMaterial color="#2a3080" /></mesh>)}
      {[-14, 14].map((px) => <group key={px} position={[px, 0, 0]}><mesh position={[0, 11, 0]}><boxGeometry args={[1.1, 22, 1.1]} /><meshStandardMaterial color="#8c96f0" emissive="#3a4196" emissiveIntensity={0.6} /></mesh>
        {Array.from({ length: 7 }).map((_, k) => [-1, 1].map((sd) => { const a = V(0, 21 - k * 1.6, 0), b = V(sd * (3 + k * 2.6), 3.6, 0), d = b.clone().sub(a), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); return <mesh key={k + '-' + sd} position={a.clone().add(b).multiplyScalar(0.5)} quaternion={q}><cylinderGeometry args={[0.06, 0.06, d.length(), 5]} /><meshBasicMaterial color="#cfd6ff" /></mesh>; }))}</group>)}
    </group>
  </group>; };
/* the cable landing station: where the land network hands over to the sea cable */
const Station: React.FC = () => { const P = cpt(6.5), y = sand(13, 11);
  return <group position={[13, y, 11]} rotation-y={-0.5}>
    <mesh position={[0, 2.2, 0]}><boxGeometry args={[11, 4.4, 7]} /><meshStandardMaterial color="#4a3f8e" roughness={0.8} /></mesh>
    <mesh position={[0, 4.6, 0]}><boxGeometry args={[11.6, 0.5, 7.6]} /><meshStandardMaterial color="#2f9c95" roughness={0.7} /></mesh>
    {[-3.4, -1.1, 1.2].map((x) => <mesh key={x} position={[x, 2.6, -3.52]}><planeGeometry args={[1.5, 1.3]} /><meshBasicMaterial color="#ffd08a" side={THREE.DoubleSide} /></mesh>)}
    <mesh position={[3.6, 1.3, -3.52]}><planeGeometry args={[1.5, 2.6]} /><meshBasicMaterial color="#12163f" side={THREE.DoubleSide} /></mesh>
    <mesh position={[3.6, 3.1, -3.7]}><sphereGeometry args={[0.16, 10, 8]} /><meshBasicMaterial color="#ffd98a" /></mesh><pointLight position={[3.6, 3, -4.4]} color="#ffc46a" intensity={14} distance={12} />
    <mesh position={[-3.5, 6.6, 1]}><cylinderGeometry args={[0.06, 0.08, 4, 6]} /><meshStandardMaterial color="#8c96f0" /></mesh><mesh position={[-3.5, 8.7, 1]}><sphereGeometry args={[0.14, 8, 8]} /><meshBasicMaterial color="#ff5a4a" /></mesh>
    <mesh position={[-2, 5.4, -1]} rotation-x={-0.5}><cylinderGeometry args={[1.1, 0.2, 0.5, 20, 1, true]} /><meshStandardMaterial color="#dfe6ff" side={THREE.DoubleSide} /></mesh>
    <group visible={false}><mesh position={P} /></group>
  </group>; };
const Cable: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => new THREE.TubeGeometry(PATH, 500, 0.3, 20, false), []);
  const tex = useMemo(() => { const x = stripeTex('#3b4078', '#c9cdf2', 22, 1); x.repeat.set(9, 1); return x; }, []), texB = useMemo(() => { const x = stripeTex('#000000', '#ffffff', 22, 1); x.repeat.set(9, 1); x.colorSpace = THREE.NoColorSpace; return x; }, []);
  const glow = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.2, 'rgba(255,190,90,.7)'); gr.addColorStop(0.55, 'rgba(255,150,40,.16)'); gr.addColorStop(1, 'rgba(255,140,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; return x; }, []);
  const z = zAt(t), p = cpt(z), on = seg(t, 0.9, 1.3);
  return <group>
    <mesh geometry={geo}><meshStandardMaterial map={tex} bumpMap={texB} bumpScale={2} roughness={0.36} metalness={0.5} /></mesh>
    {/* the heavier jointed pipe that protects the cable through the surf */}
    {Array.from({ length: 26 }).map((_, i) => { const zz = -4 - i * 0.62, a = cpt(zz), d = cpt(zz - 0.3).sub(cpt(zz + 0.3)).normalize(), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d); return <mesh key={i} position={a} quaternion={q}><cylinderGeometry args={[0.44, 0.5, 0.5, 18]} /><meshStandardMaterial color="#2b3180" roughness={0.5} metalness={0.3} /></mesh>; })}
    {/* marker posts either side of the cable on the beach */}
    {[[3.4, 3], [3.2, -3], [-4.6, -9], [3.4, -12]].map(([dx, zz], i) => { const x = cx(zz) + dx, y = sand(x, zz); return <group key={i} position={[x, y, zz]}><mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.09, 0.11, 2.2, 8]} /><meshStandardMaterial color="#2b3180" /></mesh><mesh position={[0, 2.25, 0]}><boxGeometry args={[0.3, 0.26, 0.3]} /><meshBasicMaterial color="#9fe6ff" /></mesh><pointLight position={[0, 2.3, 0]} color="#5fe3ff" intensity={4} distance={6} /></group>; })}
    {on > 0.01 && <group position={p}>
      <sprite scale={[5.5, 5.5, 1]}><spriteMaterial map={glow} transparent opacity={0.9 * on} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
      <sprite scale={[60, 0.7, 1]}><spriteMaterial map={glow} transparent opacity={0.6 * on} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
      <mesh><sphereGeometry args={[0.36, 14, 10]} /><meshBasicMaterial color="#fff0c8" /></mesh>
      <pointLight color="#ffb454" intensity={260 * on} distance={46} decay={1.35} position={[0, 1.6, 0]} />
    </group>}
  </group>; };
const project = (t: number, p: THREE.Vector3): [number, number] => { const c = camAt(t), cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.05, 500); cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld(); const q = p.clone().project(cam); return [(q.x * 0.5 + 0.5) * W, (-q.y * 0.5 + 0.5) * H]; };
const Box: React.FC<{ x: number; y: number; o: number; text: string; sub?: string; col?: string }> = ({ x, y, o, text, sub, col = '#5fe3ff' }) => { const ww = Math.max(text.length * 19 + 44, (sub?.length ?? 0) * 11.5 + 44);
  return <g opacity={o} transform={`translate(${x} ${y})`}><rect x={-ww / 2} y={-30} width={ww} height={sub ? 76 : 56} rx={12} fill="#0e1430" fillOpacity={0.92} stroke={col} strokeWidth={2.5} /><text y={7} textAnchor="middle" fill="#eef1ff" style={{ font: `800 28px ${FONT.ui}`, letterSpacing: '0.06em' }}>{text}</text>{sub && <text y={34} textAnchor="middle" fill="#a9b4dd" style={{ font: `500 18px ${FONT.mono}` }}>{sub}</text>}</g>; };

export const Shore: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS, cam = camAt(t), under = clamp01((0.4 - cam.p.y) / 0.9);
  const [sx, sy] = project(t, V(13, sand(13, 11) + 5.4, 11)), stO = seg(t, 0.5, 0.9) * (1 - seg(t, 3.0, 3.5));
  const bg = under > 0.5 ? '#08124a' : '#0a0d34';
  return (
    <AbsoluteFill style={{ background: '#070a22' }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true }} camera={{ fov: 42, near: 0.05, far: 500 }}>
        <Cam t={t} />
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[under > 0.5 ? '#0a1654' : '#0c1040', under > 0.5 ? 6 : 40, under > 0.5 ? 70 : 330]} />
        <hemisphereLight args={['#7f8cff', '#160c44', 1.1]} />
        <directionalLight position={[-20, 30, 20]} intensity={1.1} color="#c9d2ff" />
        <mesh position={[60, 46, -230]}><circleGeometry args={[7, 40]} /><meshBasicMaterial color="#fff3d6" fog={false} /></mesh>
        <Beach /><Skyline /><Station /><Cable t={t} /><Sea t={t} under={under} />
        {Array.from({ length: 26 }).map((_, i) => <mesh key={i} position={[18 + i * 1.5 + Math.sin(t * 1.4 + i) * 0.6, 0.14, -24 - i * 7]} rotation-x={-Math.PI / 2}><planeGeometry args={[3 + hash(i) * 6, 0.35]} /><meshBasicMaterial color="#fff3d6" transparent opacity={(0.5 - i * 0.012) * (1 - under) * (0.6 + 0.4 * Math.sin(t * 3 + i * 1.7))} /></mesh>)}
        {Array.from({ length: 30 }).map((_, i) => <mesh key={'f' + i} position={[-44 + i * 3, 0.12, -9.9 + 0.5 * Math.sin(i * 0.9 + t * 1.2)]} rotation-x={-Math.PI / 2}><planeGeometry args={[3.2, 0.3]} /><meshBasicMaterial color="#cfe6ff" transparent opacity={0.45 * (1 - under)} /></mesh>)}
        <EffectComposer><Bloom intensity={0.5} luminanceThreshold={0.86} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.22} darkness={0.75} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill style={{ background: '#0a1e6a', opacity: under * 0.22 }} />
      <AbsoluteFill><svg width={W} height={H}>
        <g opacity={stO}><line x1={sx} y1={sy} x2={sx - 40} y2={sy - 90} stroke="#5fe3ff" strokeWidth={2.5} /><Box x={sx - 60} y={sy - 122} o={1} text="CABLE LANDING STATION" sub="where land cables meet the sea cable" /></g>
        <g opacity={seg(t, 0.4, 0.8) * (1 - seg(t, 5.6, 6.1))} transform="translate(120 880)"><text fill="#eef1ff" style={{ font: `800 54px ${FONT.ui}` }}>{COAST_NAME}</text><text y={46} fill="#5fe3ff" style={{ font: `500 30px ${FONT.mono}` }}>the cable goes into the sea</text></g>
      </svg></AbsoluteFill>
    </AbsoluteFill>
  );
};
