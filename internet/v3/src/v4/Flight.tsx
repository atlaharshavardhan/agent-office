import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { geoInterpolate } from 'd3-geo';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { F, vfov, tr, clampX, EDGE } from './frame';
import { FONT } from '../lib/palette';
import { winTex } from './Packets';
import { earthTex, atmoMat, ll, R } from './Planet';
import { MUMBAI, LONDON, LL } from '../tail/Globe';

/* V4, 16:9: she flies to London. Three shots: she walks to her gate, the plane takes off, then her route across the globe.
   Her journey is drawn as a white dashed arc in the air, so it never looks like the amber data route under the sea. */

export const FLIGHT_FRAMES = 510;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const T1 = 3.4, T2 = 8.4, T3 = 11.0;      // cuts: gate -> runway -> in the air -> globe

/* ---------- the plane ---------- */
const Plane: React.FC<{ gear?: number; scale?: number }> = ({ gear = 1, scale = 1 }) => {
  const body = <meshStandardMaterial color="#eef0ff" roughness={0.4} />, coral = <meshStandardMaterial color="#ff8f7a" roughness={0.5} />, dark = <meshStandardMaterial color="#1b1f52" roughness={0.5} />;
  return <group scale={scale}>
    <mesh rotation-z={-Math.PI / 2}><capsuleGeometry args={[0.56, 6.2, 10, 24]} />{body}</mesh>
    <mesh position={[0, -0.18, 0]} rotation-z={-Math.PI / 2}><capsuleGeometry args={[0.5, 6.0, 8, 20]} /><meshStandardMaterial color="#c9cef5" roughness={0.5} /></mesh>
    <mesh position={[0.2, 0.06, 0]} rotation-z={-Math.PI / 2}><cylinderGeometry args={[0.575, 0.575, 6.0, 24, 1, true]} /><meshStandardMaterial color="#ff8f7a" roughness={0.5} transparent opacity={0} /></mesh>
    {/* cockpit glass and the row of lit windows on both sides */}
    <mesh position={[3.25, 0.2, 0]} rotation-z={-0.5}><boxGeometry args={[0.5, 0.2, 0.86]} />{dark}</mesh>
    {[-1, 1].map((s) => Array.from({ length: 15 }).map((_, k) => <mesh key={s + '-' + k} position={[2.4 - k * 0.33, 0.16, s * 0.555]}><boxGeometry args={[0.16, 0.16, 0.03]} /><meshBasicMaterial color={k === 6 && s === 1 ? '#ffb454' : '#ffe6b0'} /></mesh>))}
    {[-1, 1].map((s) => <mesh key={'st' + s} position={[0, -0.05, s * 0.563]}><boxGeometry args={[6.6, 0.1, 0.02]} />{coral}</mesh>)}
    {/* swept wings, engines, tail */}
    {[-1, 1].map((s) => <group key={'w' + s}>
      <mesh position={[-0.5, -0.22, s * 2.5]} rotation-y={s * 0.42}><boxGeometry args={[1.5, 0.12, 4.6]} />{body}</mesh>
      <mesh position={[-0.05, -0.62, s * 1.9]} rotation-z={-Math.PI / 2}><cylinderGeometry args={[0.3, 0.26, 1.2, 18]} /><meshStandardMaterial color="#8f7be0" roughness={0.5} /></mesh>
      <mesh position={[0.56, -0.62, s * 1.9]} rotation-z={-Math.PI / 2}><cylinderGeometry args={[0.24, 0.24, 0.04, 18]} />{dark}</mesh>
      <mesh position={[-3.3, 0.18, s * 1.05]} rotation-y={s * 0.5}><boxGeometry args={[0.8, 0.09, 1.8]} />{body}</mesh>
      <mesh position={[-1.4, -0.2, s * 4.75]}><sphereGeometry args={[0.07, 8, 8]} /><meshBasicMaterial color={s > 0 ? '#7dffb0' : '#ff5a4a'} /></mesh>
    </group>)}
    <mesh position={[-3.2, 0.95, 0]} rotation-z={0.62}><boxGeometry args={[0.85, 1.7, 0.09]} />{coral}</mesh>
    {/* landing gear, folded away after take-off */}
    {gear > 0.02 && [[2.4, 0], [-0.6, 0.9], [-0.6, -0.9]].map(([x, z], i) => <group key={i} position={[x, -0.55, z]} scale={[1, gear, 1]}><mesh position={[0, -0.35, 0]}><cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />{dark}</mesh><mesh position={[0, -0.72, 0]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.2, 0.2, 0.22, 14]} />{dark}</mesh></group>)}
  </group>;
};
/* her, small and simple in 3D: coral top, jeans, long dark hair, pulling a suitcase */
export const Her: React.FC<{ t: number; still?: boolean }> = ({ t, still }) => { const sw = still ? 0 : Math.sin(t * 9) * 0.45, bob = still ? 0 : Math.abs(Math.sin(t * 9)) * 0.04;
  return <group position={[0, bob, 0]}>
    {[-1, 1].map((s) => <group key={s} position={[0, 0.9, s * 0.11]} rotation-z={s * sw}><mesh position={[0, -0.42, 0]}><capsuleGeometry args={[0.09, 0.62, 4, 10]} /><meshStandardMaterial color="#3d5fa8" roughness={0.7} /></mesh><mesh position={[0.05, -0.86, 0]}><boxGeometry args={[0.24, 0.1, 0.14]} /><meshStandardMaterial color="#f2f4ff" /></mesh></group>)}
    <mesh position={[0, 1.24, 0]}><capsuleGeometry args={[0.2, 0.42, 6, 14]} /><meshStandardMaterial color="#ff8f7a" roughness={0.6} /></mesh>
    <mesh position={[0, 1.78, 0]}><sphereGeometry args={[0.2, 18, 14]} /><meshStandardMaterial color="#c98a63" roughness={0.6} /></mesh>
    <mesh position={[-0.05, 1.82, 0]} scale={[1, 1.05, 1.02]}><sphereGeometry args={[0.215, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color="#1f1a24" roughness={0.6} /></mesh>
    {[-0.075, 0.075].map((z) => <mesh key={z} position={[0.185, 1.8, z]}><sphereGeometry args={[0.026, 8, 8]} /><meshBasicMaterial color="#1f1a24" /></mesh>)}
    <mesh position={[0.19, 1.735, 0]} rotation={[0, Math.PI / 2, Math.PI]}><torusGeometry args={[0.045, 0.01, 6, 12, Math.PI]} /><meshBasicMaterial color="#7a3a2a" /></mesh>
    <mesh position={[-0.16, 1.45, 0]}><capsuleGeometry args={[0.15, 0.42, 4, 10]} /><meshStandardMaterial color="#1f1a24" roughness={0.6} /></mesh>
    <group position={[0.02, 1.36, 0.24]} rotation-z={-sw * 0.6}><mesh position={[0, -0.24, 0]}><capsuleGeometry args={[0.06, 0.42, 4, 8]} /><meshStandardMaterial color="#ff8f7a" /></mesh></group>
    {/* the arm that pulls the suitcase, and the suitcase rolling behind */}
    {still && <><mesh position={[0.16, 1.3, -0.2]} rotation-z={0.9}><capsuleGeometry args={[0.06, 0.4, 4, 8]} /><meshStandardMaterial color="#ff8f7a" /></mesh><mesh position={[0.36, 1.5, -0.2]} rotation-z={0.2}><boxGeometry args={[0.03, 0.26, 0.14]} /><meshBasicMaterial color="#9fe6ff" /></mesh></>}
    {!still && <mesh position={[-0.2, 1.1, -0.24]} rotation-z={-0.7}><capsuleGeometry args={[0.06, 0.46, 4, 8]} /><meshStandardMaterial color="#ff8f7a" /></mesh>}
    <group position={[-0.72, 0, -0.26]} visible={!still}><mesh position={[0, 0.5, 0]} rotation-z={-0.12}><boxGeometry args={[0.42, 0.72, 0.28]} /><meshStandardMaterial color="#2f9c95" roughness={0.5} /></mesh><mesh position={[0.2, 0.95, 0]} rotation-z={-0.75}><cylinderGeometry args={[0.02, 0.02, 0.6, 6]} /><meshStandardMaterial color="#cfd6ff" /></mesh>
      {[-0.1, 0.1].map((z) => <mesh key={z} position={[-0.1, 0.07, z]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.07, 0.07, 0.05, 10]} /><meshStandardMaterial color="#12163f" /></mesh>)}</group>
  </group>; };

/* ---------- the airport ---------- */
const Airport: React.FC<{ t: number }> = ({ t }) => { const tex = useMemo(() => [0, 1].map(winTex), []);
  const glass = useMemo(() => { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d')!; g.fillStyle = '#ffd9a0'; g.fillRect(0, 0, 512, 128); g.fillStyle = '#e8a860'; for (let i = 0; i < 9; i++) g.fillRect(i * 60 + 20, 70, 26, 58); g.fillStyle = '#2a2f7a'; for (let i = 0; i <= 16; i++) g.fillRect(i * 32 - 3, 0, 6, 128); g.fillRect(0, 60, 512, 5); const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; x.wrapS = THREE.RepeatWrapping; x.repeat.set(6, 1); return x; }, []);
  return <group>
    <mesh rotation-x={-Math.PI / 2}><planeGeometry args={[700, 400]} /><meshStandardMaterial color="#12163f" roughness={0.95} /></mesh>
    {/* runway with centre dashes and edge lights */}
    <mesh position={[40, 0.02, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[420, 11]} /><meshStandardMaterial color="#1f2360" roughness={0.9} /></mesh>
    {Array.from({ length: 52 }).map((_, i) => <mesh key={i} position={[-160 + i * 8, 0.04, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[4, 0.3]} /><meshBasicMaterial color="#dfe6ff" /></mesh>)}
    {Array.from({ length: 70 }).map((_, i) => [-1, 1].map((s) => <mesh key={i + '-' + s} position={[-170 + i * 6, 0.12, s * 5.9]}><sphereGeometry args={[0.13, 8, 6]} /><meshBasicMaterial color={i % 5 === 0 ? '#ffd08a' : '#5fe3ff'} /></mesh>))}
    {/* terminal: a long glass front glowing warm, a roof, the control tower */}
    <group position={[-10, 0, -34]}>
      <mesh position={[0, 4, -3]}><boxGeometry args={[110, 8, 14]} /><meshStandardMaterial color="#2d2f86" roughness={0.8} /></mesh>
      <mesh position={[0, 3.2, 4.02]}><planeGeometry args={[110, 5.4]} /><meshBasicMaterial map={glass} toneMapped={false} /></mesh>
      <mesh position={[0, 8.4, -2]} rotation-x={0.08}><boxGeometry args={[114, 0.6, 18]} /><meshStandardMaterial color="#8f7be0" roughness={0.6} /></mesh>
      <mesh position={[0, 0.2, 7]}><boxGeometry args={[110, 0.4, 6]} /><meshStandardMaterial color="#3a3f96" roughness={0.9} /></mesh>
      <pointLight position={[-30, 4, 9]} color="#ffc98a" intensity={60} distance={30} /><pointLight position={[10, 4, 9]} color="#ffc98a" intensity={60} distance={30} />
      <group position={[-50, 0, -8]}><mesh position={[0, 11, 0]}><cylinderGeometry args={[1.6, 2.2, 22, 16]} /><meshStandardMaterial color="#3a3f96" roughness={0.7} /></mesh><mesh position={[0, 23.4, 0]}><cylinderGeometry args={[3.6, 2.6, 2.8, 16]} /><meshBasicMaterial color="#9fe6ff" /></mesh><mesh position={[0, 25.2, 0]}><cylinderGeometry args={[3.9, 3.9, 0.6, 16]} /><meshStandardMaterial color="#8f7be0" /></mesh><mesh position={[0, 27, 0]}><sphereGeometry args={[0.3, 8, 8]} /><meshBasicMaterial color={Math.sin(t * 5) > 0 ? '#ff5a4a' : '#5a1814'} /></mesh></group>
    </group>
    {/* the city behind the airport */}
    {Array.from({ length: 34 }).map((_, i) => { const x = -200 + i * 13 + hash(i) * 5, h = 10 + hash(i + 5) ** 2 * 40, m = tex[i % 2].clone(); m.repeat.set(1, Math.max(1, Math.round(h / 10))); m.wrapS = m.wrapT = THREE.RepeatWrapping; m.needsUpdate = true; return <mesh key={i} position={[x, h / 2, -110 - hash(i + 9) * 40]}><boxGeometry args={[9, h, 9]} /><meshStandardMaterial color="#1f2566" map={m} emissiveMap={m} emissive="#ffffff" emissiveIntensity={0.6} roughness={0.8} /></mesh>; })}
  </group>; };
const Clouds: React.FC<{ t: number }> = ({ t }) => <>{Array.from({ length: 26 }).map((_, i) => { const x = ((hash(i) * 260 - t * (26 + hash(i + 3) * 14)) % 260 + 260) % 260 - 130, y = 52 + hash(i + 5) * 14 - 12, z = -30 - hash(i + 7) * 60 + (i % 4 === 0 ? 44 : 0), s = 5 + hash(i + 9) * 9;
  return <group key={i} position={[x, y, z]}>{[0, 1, 2].map((k) => <mesh key={k} position={[(k - 1) * s * 0.7, k === 1 ? s * 0.2 : 0, 0]} scale={[1, 0.45, 0.7]}><sphereGeometry args={[s * (k === 1 ? 0.8 : 0.6), 14, 10]} /><meshStandardMaterial color="#5a5fc4" roughness={1} transparent opacity={0.85} /></mesh>)}</group>; })}</>;

/* ---------- where things are at each moment ---------- */
const planeAt = (t: number) => { if (t < T2) { const u = clamp01((t - T1 - 0.3) / (T2 - T1 - 0.3)), x = -70 + 150 * u * u, lift = seg(u, 0.62, 1.0); return { p: V(x, 1.28 + lift * 14, 0), pitch: lift * 0.26 * (1 - seg(u, 0.95, 1.2)) + seg(u, 0.55, 0.7) * 0.12, gear: 1 - seg(u, 0.8, 1) }; } return { p: V(0, 62 + Math.sin(t * 0.9) * 0.4, 0), pitch: 0.04, gear: 0 }; };
type Shot = { p: THREE.Vector3; l: THREE.Vector3; fov: number };
const HERX = (t: number) => -38 + t * 1.5;
const FL = geoInterpolate(MUMBAI as [number, number], LONDON as [number, number]);
const flightU = (t: number) => clamp01((t - T3 - 0.6) / 4.4);
const flightP = (u: number) => ll(FL(u) as LL, R * (1.02 + 0.09 * Math.sin(u * Math.PI)));
const camAt = (t: number): Shot => {
  if (t < T1) { const x = HERX(t); return { p: V(x + 4.6 - t * 0.2, 1.7, -24.6), l: V(x + 0.2, 1.25, -27), fov: 34 }; }
  if (t < T2) { const pl = planeAt(t), u = (t - T1) / (T2 - T1); return { p: V(pl.p.x + lerp(16, 11, u), lerp(3.4, 2.6, u) + pl.p.y * 0.5, lerp(22, 20, u)), l: pl.p.clone().add(V(1.5, 0.3, 0)), fov: 38 }; }
  if (t < T3) { const u = (t - T2) / (T3 - T2); return { p: V(lerp(-12, -8, u), 62.9, lerp(13, 10, u)), l: V(1.0, 62.1, 0), fov: 36 }; }
  const u = seg(t, T3, T3 + 5.4), mid = FL(lerp(0.3, 0.86, u)) as LL; return { p: ll([mid[0] + lerp(12, 4, u), mid[1] - lerp(20, 8, u)], lerp(27, 15.5, u)), l: ll(FL(lerp(0.45, 0.98, u)) as LL, R * 0.6), fov: 40 };
};
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = vfov(c.fov); cam.near = 0.1; cam.far = 900; cam.up.set(0, 1, 0); cam.lookAt(c.l); cam.updateProjectionMatrix(); }, [t, camera]); return null; };

const GlobeShot: React.FC<{ t: number }> = ({ t }) => { const tex = useMemo(earthTex, []), atmo = useMemo(atmoMat, []), u = flightU(t);
  const dashes = useMemo(() => Array.from({ length: 70 }).map((_, i) => i / 70), []);
  const p = flightP(u), q = flightP(Math.min(1, u + 0.01)), dir = q.clone().sub(p).normalize(), up = p.clone().normalize(), m = new THREE.Matrix4().makeBasis(dir, up, dir.clone().cross(up).normalize()), quat = new THREE.Quaternion().setFromRotationMatrix(m);
  return <group>
    <mesh><sphereGeometry args={[R, 96, 64]} /><meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.9} /></mesh>
    <mesh material={atmo}><sphereGeometry args={[R * 1.045, 64, 48]} /></mesh>
    {dashes.map((d, i) => d > u ? null : <mesh key={i} position={flightP(d)}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
    <group position={p} quaternion={quat}><Plane gear={0} scale={0.13} /></group>
    {[MUMBAI, LONDON].map((c, i) => <mesh key={i} position={ll(c, R * 1.01)}><sphereGeometry args={[0.1, 12, 10]} /><meshBasicMaterial color={i ? '#ff9c8a' : '#ffe08a'} /></mesh>)}
    {Array.from({ length: 200 }).map((_, i) => { const a = hash(i) * 6.283, b = Math.acos(2 * hash(i + 7) - 1); return <mesh key={i} position={[300 * Math.sin(b) * Math.cos(a), 300 * Math.cos(b), 300 * Math.sin(b) * Math.sin(a)]}><sphereGeometry args={[0.3 + hash(i + 3) * 0.5, 6, 6]} /><meshBasicMaterial color="#cfd6ff" fog={false} /></mesh>; })}
  </group>; };

const project = (t: number, p: THREE.Vector3): [number, number] => { const c = camAt(t), cam = new THREE.PerspectiveCamera(vfov(c.fov), F.W / F.H, 0.1, 900); cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld(); const q = p.clone().project(cam); return [(q.x * 0.5 + 0.5) * F.W, (-q.y * 0.5 + 0.5) * F.H]; };
const Label: React.FC<{ x: number; y: number; o: number; text: string; col: string }> = ({ x, y, o, text, col }) => { const w = text.length * 20 + 40; return <g opacity={o} transform={`translate(${x} ${y})`}><rect x={-w / 2} y={-26} width={w} height={52} rx={12} fill="#0e1430" fillOpacity={0.92} stroke={col} strokeWidth={2.5} /><text y={10} textAnchor="middle" fill="#eef1ff" style={{ font: `800 28px ${FONT.ui}`, letterSpacing: '0.08em' }}>{text}</text></g>; };

export const Flight: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS, globe = t >= T3, air = t >= T2 && t < T3, pl = planeAt(t);
  const cut = Math.max(...[T1, T2, T3].map((c) => 1 - Math.abs(t - c) / 0.22), 0);      // a quick dip to dark on each cut
  const [mx, my] = project(t, ll(MUMBAI, R * 1.01)), [lx, ly] = project(t, ll(LONDON, R * 1.01));
  return (
    <AbsoluteFill style={{ background: '#03041a' }}>
      <ThreeCanvas width={F.W} height={F.H} gl={{ antialias: true }} camera={{ fov: 38, near: 0.1, far: 900 }}>
        <Cam t={t} />
        <color attach="background" args={[globe ? '#03041a' : air ? '#0c1250' : '#0a0d34']} />
        {!globe && <fog attach="fog" args={[air ? '#0c1250' : '#0c1040', 40, air ? 220 : 300]} />}
        <hemisphereLight args={['#8f9cff', '#160c44', globe ? 0.6 : 1.15]} />
        <directionalLight position={globe ? [40, 26, 6] : [-20, 30, 24]} intensity={globe ? 1.6 : 1.3} color="#dfe6ff" />
        {!globe && !air && <><Airport t={t} /><group position={[HERX(t), 0.4, -27]}><Her t={t} /></group></>}
        {air && <><Clouds t={t} /><mesh position={[90, 96, -200]}><circleGeometry args={[9, 40]} /><meshBasicMaterial color="#fff3d6" fog={false} /></mesh></>}
        {!globe && t >= T1 && <group position={pl.p} rotation-z={pl.pitch}><Plane gear={pl.gear} /><pointLight position={[0, -1, 0]} color="#fff3d6" intensity={air ? 0 : 8} distance={8} /></group>}
        {globe && <GlobeShot t={t} />}
        <EffectComposer><Bloom intensity={0.5} luminanceThreshold={0.86} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.22} darkness={0.75} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill style={{ background: '#03041a', opacity: clamp01(cut) }} />
      <AbsoluteFill><svg width={F.W} height={F.H}>
        <g opacity={seg(t, 0.4, 0.8) * (1 - seg(t, T1 - 0.6, T1 - 0.2))} {...EDGE} transform={tr(120, 890)}><text fill="#eef1ff" style={{ font: `800 54px ${FONT.ui}` }}>Mumbai airport</text><text y={46} fill="#5fe3ff" style={{ font: `500 30px ${FONT.mono}` }}>she is moving to London</text></g>
        {globe && <><Label x={mx + 90} y={my + 70} o={seg(t, T3 + 0.3, T3 + 0.7)} text="MUMBAI" col="#ffe08a" /><Label x={lx - 110} y={ly - 70} o={seg(t, T3 + 2.4, T3 + 2.8)} text="LONDON" col="#ff9c8a" />
          <g opacity={seg(t, T3 + 1.0, T3 + 1.5)} {...EDGE} transform={tr(120, 870)}><text fill="#eef1ff" style={{ font: `800 54px ${FONT.ui}` }}>Her flight: about 9 hours</text><text y={46} fill="#5fe3ff" style={{ font: `500 30px ${FONT.mono}` }}>7,200 km through the air</text></g></>}
      </svg></AbsoluteFill>
    </AbsoluteFill>
  );
};
