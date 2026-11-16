import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { glassMat, pulseMat } from './Fiber';
import { winTex, Tower, TOWER } from './Packets';

/* V4, 16:9: from the cell tower the packets go down into a fibre optic cable under the street.
   The ground is cut open like a slice of cake: street and houses on top, soil and stones below, the glass cable running through. */
const W = 1920, H = 1080;
export const UNDER_FRAMES = 270;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const TX = -14, CY = -3.2, CZ = 0.7;      // tower x, cable depth, cable just in front of the cut face
const PATH = new THREE.CatmullRomCurve3([V(TX, 2.2, CZ), V(TX, 0, CZ), V(TX, -1.8, CZ), V(TX + 0.7, -2.8, CZ), V(TX + 2.2, CY, CZ), V(0, CY, CZ), V(30, CY, CZ), V(70, CY, CZ)], false, 'catmullrom', 0.2);
const LEN = PATH.getLength();

type CK = { t: number; p: [number, number, number]; l: [number, number, number]; fov: number };
const CAM: CK[] = [
  { t: 0, p: [TX + 3, 5.5, 20], l: [TX, 5, 0], fov: 40 },            // the tower on the street
  { t: 2.6, p: [TX + 5, -1.2, 13], l: [TX + 3, -2.4, 0], fov: 38 },   // drop below the road with the signal
  { t: 5.2, p: [6, -2.6, 8.5], l: [8, CY, 0], fov: 36 },              // close on the glass cable, tracking with the light
  { t: 9, p: [34, -2.4, 10], l: [37, CY, 0], fov: 38 },
];
const camAt = (t: number) => { let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1].t) i++; const a = CAM[i], b = CAM[i + 1], u = smooth((t - a.t) / (b.t - a.t)); const L = (x: number[], y: number[]) => V(lerp(x[0], y[0], u), lerp(x[1], y[1], u), lerp(x[2], y[2], u)); return { p: L(a.p, b.p), l: L(a.l, b.l), fov: lerp(a.fov, b.fov, u) }; };
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = c.fov; cam.near = 0.05; cam.far = 400; cam.lookAt(c.l); cam.updateProjectionMatrix(); }, [t, camera]); return null; };
/* where the amber light is: down the tower feed first, then along the cable just ahead of where the camera looks, so it never leaves the frame */
const H0 = V(TX + 2.2, CY, CZ);
const lightP = (t: number) => { if (t < 2.9) { const u = clamp01((t - 0.9) / 2.0); return PATH.getPointAt(lerp(0.01, 0.068, u)); } const x = lerp(H0.x, camAt(t).l.x + 1.5, seg(t, 2.9, 4.2)); return V(Math.max(H0.x, x), CY, CZ); };

const Street: React.FC = () => {
  const tex = useMemo(() => [0, 1, 2, 3].map(winTex), []);
  const roof = ['#8f7be0', '#ff8f7a', '#2f9c95', '#e9b44c'];
  return <group>
    {/* road, kerb and pavement, seen from the cut edge */}
    <mesh position={[25, 0.12, -3.2]}><boxGeometry args={[130, 0.24, 6.4]} /><meshStandardMaterial color="#2a2d5e" roughness={0.9} /></mesh>
    {Array.from({ length: 26 }).map((_, i) => <mesh key={i} position={[-36 + i * 5, 0.25, -3.2]}><boxGeometry args={[2.2, 0.02, 0.18]} /><meshStandardMaterial color="#cfd6ff" roughness={0.8} /></mesh>)}
    <mesh position={[25, 0.22, -7.4]}><boxGeometry args={[130, 0.44, 2]} /><meshStandardMaterial color="#4a4f9a" roughness={0.9} /></mesh>
    {/* our little houses along the street, warm windows */}
    {Array.from({ length: 13 }).map((_, i) => { const x = -34 + i * 9.4, w = 7.2, h = 6 + hash(i + 2) * 7, m = tex[i % 4].clone(); m.repeat.set(1, Math.max(1, Math.round(h / 9))); m.wrapS = m.wrapT = THREE.RepeatWrapping; m.needsUpdate = true;
      return <group key={i} position={[x, 0.44, -12.5]}><mesh position={[0, h / 2, 0]}><boxGeometry args={[w, h, 7]} /><meshStandardMaterial color={['#3b3f9a', '#5a3f8e', '#2d4a8c', '#4a3a86'][i % 4]} map={m} emissiveMap={m} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.8} /></mesh>
        <mesh position={[0, h + 0.3, 0]}><boxGeometry args={[w + 0.5, 0.6, 7.5]} /><meshStandardMaterial color={roof[i % 4]} roughness={0.7} /></mesh></group>; })}
    {/* street lamps */}
    {Array.from({ length: 9 }).map((_, i) => { const x = -30 + i * 12; return <group key={i} position={[x, 0.44, -6.8]}><mesh position={[0, 2, 0]}><cylinderGeometry args={[0.07, 0.09, 4, 8]} /><meshStandardMaterial color="#1b1f52" /></mesh><mesh position={[0, 4.1, 0]}><sphereGeometry args={[0.24, 12, 10]} /><meshBasicMaterial color="#ffd98a" /></mesh><pointLight position={[0, 3.9, 0.4]} color="#ffc46a" intensity={7} distance={9} /></group>; })}
  </group>;
};
/* the cut face of the ground: tarmac, a gravel bed, then soil with stones pressed into it */
const Ground: React.FC = () => {
  const geo = useMemo(() => new THREE.IcosahedronGeometry(1, 1), []);
  return <group>
    <mesh position={[25, 0.02, 0]}><boxGeometry args={[130, 0.5, 0.3]} /><meshStandardMaterial color="#1a1c44" roughness={0.9} /></mesh>
    <mesh position={[25, -0.75, -0.2]}><boxGeometry args={[130, 1.1, 0.5]} /><meshStandardMaterial color="#3a3670" roughness={1} /></mesh>
    <mesh position={[25, -7.3, -0.4]}><boxGeometry args={[130, 12, 0.6]} /><meshStandardMaterial color="#231d55" roughness={1} /></mesh>
    {Array.from({ length: 260 }).map((_, i) => { const x = -38 + hash(i) * 116, y = -0.35 - hash(i + 5) * 0.8, s = 0.14 + hash(i + 9) * 0.16; return <mesh key={'g' + i} geometry={geo} position={[x, y, 0.02]} scale={[s * 1.3, s, s * 0.6]} rotation={[hash(i + 2) * 3, hash(i + 4) * 3, 0]}><meshStandardMaterial color={i % 3 ? '#6a66a8' : '#8a86c4'} roughness={0.9} flatShading /></mesh>; })}
    {Array.from({ length: 190 }).map((_, i) => { const x = -38 + hash(i + 300) * 116, y = -1.6 - hash(i + 305) * 9; if (Math.abs(y - CY) < 0.9) return null; const s = 0.25 + hash(i + 309) ** 2 * 0.95; return <mesh key={'s' + i} geometry={geo} position={[x, y, -0.08]} scale={[s * 1.4, s, s * 0.5]} rotation={[hash(i + 302) * 3, hash(i + 304) * 3, 0]}><meshStandardMaterial color={i % 4 === 0 ? '#5a4f9c' : '#352c78'} roughness={0.95} flatShading /></mesh>; })}
    {/* the duct the cable lies in */}
    <mesh position={[30, CY, 0.05]}><boxGeometry args={[88, 1.25, 0.5]} /><meshStandardMaterial color="#120f38" roughness={1} /></mesh>
  </group>;
};
const Cable: React.FC<{ t: number }> = ({ t }) => {
  const outer = useMemo(() => new THREE.TubeGeometry(PATH, 600, 0.26, 20, false), []), core = useMemo(() => new THREE.TubeGeometry(PATH, 600, 0.085, 10, false), []);
  const glass = useMemo(() => glassMat('#bfeaff', 0.12, 0.7), []), pm = useMemo(pulseMat, []);
  const on = seg(t, 0.8, 1.2); pm.uniforms.uT.value = t * 3; pm.uniforms.uLen.value = LEN * 0.8; pm.uniforms.uOn.value = 0.55 * on; pm.uniforms.uAmber.value = -99;
  const glow = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.2, 'rgba(255,190,90,.7)'); gr.addColorStop(0.55, 'rgba(255,150,40,.16)'); gr.addColorStop(1, 'rgba(255,140,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; return x; }, []);
  const p = lightP(t);
  return <group>
    <mesh geometry={core} material={pm} />
    <mesh geometry={outer} material={glass} renderOrder={2} />
    {Array.from({ length: 12 }).map((_, i) => <mesh key={i} position={[TX + 6 + i * 6.5, CY, CZ]} rotation-z={Math.PI / 2}><cylinderGeometry args={[0.31, 0.31, 0.34, 20]} /><meshStandardMaterial color="#8c96f0" roughness={0.4} metalness={0.3} /></mesh>)}
    {on > 0.01 && <group position={p}>
      <sprite scale={[3.4, 3.4, 1]}><spriteMaterial map={glow} transparent opacity={0.9 * on} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
      <sprite scale={[11, 0.45, 1]}><spriteMaterial map={glow} transparent opacity={0.6 * on} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
      <mesh><sphereGeometry args={[0.14, 12, 10]} /><meshBasicMaterial color="#fff0c8" /></mesh>
      <pointLight color="#ffb454" intensity={55 * on} distance={11} decay={1.4} position={[0, 0, 1.4]} />
    </group>}
  </group>;
};
const project = (t: number, p: THREE.Vector3): [number, number] => { const c = camAt(t), cam = new THREE.PerspectiveCamera(c.fov, W / H, 0.05, 400); cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld(); const q = p.clone().project(cam); return [(q.x * 0.5 + 0.5) * W, (-q.y * 0.5 + 0.5) * H]; };

export const Underground: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const o = seg(t, 4.4, 4.9) * (1 - seg(t, 8.3, 8.8)), [x, y] = project(t, lightP(t).add(V(-3.4, 0, 0)));
  return (
    <AbsoluteFill style={{ background: '#070a22' }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true }} camera={{ fov: 40, near: 0.05, far: 400 }}>
        <Cam t={t} />
        <color attach="background" args={['#0a0d34']} />
        <fog attach="fog" args={['#0c1040', 26, 110]} />
        <hemisphereLight args={['#7f8cff', '#160c44', 1.15]} />
        <directionalLight position={[-6, 10, 14]} intensity={1.3} color="#c9d2ff" />
        <Street /><Ground /><Cable t={t} />
        <group position={[TX - TOWER.x, 4.5 + 0.44, -9.5 - TOWER.z]}><Tower t={t + 6.2} /></group>
        <EffectComposer><Bloom intensity={0.5} luminanceThreshold={0.86} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.22} darkness={0.75} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill><svg width={W} height={H}>
        <g opacity={o}><line x1={x} y1={y + 26} x2={x - 70} y2={y + 130} stroke="#5fe3ff" strokeWidth={2.5} /><circle cx={x} cy={y + 26} r={6} fill="#5fe3ff" stroke="#070a22" strokeWidth={2.5} />
          <g transform={`translate(${x - 90} ${y + 160})`}><rect x={-200} y={-30} width={400} height={76} rx={12} fill="#0e1430" fillOpacity={0.92} stroke="#5fe3ff" strokeWidth={2.5} /><text y={7} textAnchor="middle" fill="#eef1ff" style={{ font: `800 28px ${FONT.ui}`, letterSpacing: '0.06em' }}>FIBRE OPTIC CABLE</text><text y={34} textAnchor="middle" fill="#a9b4dd" style={{ font: `500 18px ${FONT.mono}` }}>under the street, the data is light</text></g></g>
      </svg></AbsoluteFill>
    </AbsoluteFill>
  );
};
