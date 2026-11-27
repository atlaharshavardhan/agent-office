import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { F, vfov, tr, clampX, EDGE } from './frame';
import { FONT } from '../lib/palette';

/* V4, 16:9: his video becomes packets. He presses Send, the video tile breaks into numbered packets that lift out of the phone,
   gather above it, then leave as radio waves towards the cell tower. Packet #0004 is amber: it is the one the film follows. */

export const PACKETS_FRAMES = 300;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const N = 180, HERO = 4;
export const TOWER = V(17, 15, -30);

/* ---------- textures drawn in code ---------- */
const canvas = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
/* the little video he sends: the torch across the street, as a thumbnail */
const drawThumb = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  const sky = g.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#141a4e'); sky.addColorStop(1, '#3a2f7a'); g.fillStyle = sky; rr(g, x, y, w, h, 18); g.fill(); g.save(); rr(g, x, y, w, h, 18); g.clip();
  g.fillStyle = '#8f7be0'; g.fillRect(x + w * 0.56, y + h * 0.3, w * 0.36, h * 0.7); g.fillStyle = '#5546b8'; g.fillRect(x + w * 0.53, y + h * 0.26, w * 0.42, h * 0.07);
  g.fillStyle = '#ffd98a'; [[0.61, 0.42], [0.79, 0.42], [0.61, 0.68]].forEach(([a, b]) => g.fillRect(x + w * a, y + h * b, w * 0.1, h * 0.15));
  g.fillStyle = '#2a245f'; g.fillRect(x, y + h * 0.84, w, h * 0.16);
  const beam = g.createLinearGradient(x + w * 0.1, 0, x + w * 0.62, 0); beam.addColorStop(0, 'rgba(255,240,190,.95)'); beam.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = beam; g.beginPath(); g.moveTo(x + w * 0.12, y + h * 0.62); g.lineTo(x + w * 0.66, y + h * 0.4); g.lineTo(x + w * 0.66, y + h * 0.62); g.closePath(); g.fill();
  g.fillStyle = '#ff5a4a'; g.fillRect(x + w * 0.06, y + h * 0.58, w * 0.08, h * 0.08); g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(x + w * 0.2, y + h * 0.2, h * 0.07, 0, 7); g.fill(); g.restore();
};
const screenTex = (sent: boolean, hideThumb: boolean) => canvas(600, 1240, (g) => {
  g.fillStyle = '#0b0f2e'; g.fillRect(0, 0, 600, 1240);
  g.fillStyle = '#141a45'; g.fillRect(0, 0, 600, 150); g.fillStyle = '#ff8f7a'; g.beginPath(); g.arc(80, 86, 34, 0, 7); g.fill();
  g.fillStyle = '#eef1ff'; g.font = '800 40px Manrope, sans-serif'; g.fillText('Arjun', 136, 82); g.fillStyle = '#7dffb0'; g.font = '500 24px Manrope, sans-serif'; g.fillText('Hyderabad · online', 136, 116);
  g.fillStyle = '#1b2258'; rr(g, 40, 200, 330, 84, 26); g.fill(); g.fillStyle = '#cfd6ff'; g.font = '500 30px Manrope, sans-serif'; g.fillText('Send me a photo!', 64, 252);
  g.fillStyle = '#1d6f8f'; rr(g, 150, 330, 410, 470, 30); g.fill(); if (!hideThumb) { drawThumb(g, 170, 350, 370, 370); g.fillStyle = 'rgba(8,12,40,.55)'; g.beginPath(); g.arc(355, 535, 54, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(338, 505); g.lineTo(388, 535); g.lineTo(338, 565); g.closePath(); g.fill(); } else { g.strokeStyle = 'rgba(160,230,255,.5)'; g.setLineDash([10, 10]); g.lineWidth = 3; rr(g, 170, 350, 370, 370, 18); g.stroke(); g.setLineDash([]); }
  g.fillStyle = '#d9f4ff'; g.font = '500 26px "IBM Plex Mono", monospace'; g.fillText(sent ? 'sending… 3 MB' : 'photo.jpg · 3 MB', 180, 770);
  g.fillStyle = '#141a45'; g.fillRect(0, 1080, 600, 160); g.fillStyle = '#0b0f2e'; rr(g, 30, 1110, 410, 90, 45); g.fill(); g.fillStyle = '#6f7ab8'; g.font = '500 30px Manrope, sans-serif'; g.fillText('Message', 66, 1166);
  g.fillStyle = sent ? '#7dffb0' : '#5fe3ff'; g.beginPath(); g.arc(520, 1155, 52, 0, 7); g.fill(); g.fillStyle = '#07102c'; g.beginPath(); g.moveTo(498, 1128); g.lineTo(548, 1155); g.lineTo(498, 1182); g.closePath(); g.fill();
});
const tagTex = (n: number, hero: boolean) => canvas(256, 112, (g) => {
  g.fillStyle = hero ? '#ffb454' : '#bfeaff'; rr(g, 4, 4, 248, 104, 18); g.fill(); g.fillStyle = hero ? '#7a4a08' : '#12436a'; g.fillRect(4, 4, 248, 26); g.fillStyle = hero ? '#ffe6b8' : '#e9f8ff'; g.font = '700 16px "IBM Plex Mono", monospace'; g.fillText('TO: ARJUN · HYDERABAD', 16, 23);
  g.fillStyle = '#07102c'; g.font = '800 54px Manrope, sans-serif'; g.textAlign = 'center'; g.fillText('#' + String(n).padStart(4, '0'), 128, 88);
});
export const winTex = (seed: number) => canvas(128, 256, (g) => { g.fillStyle = '#141a4a'; g.fillRect(0, 0, 128, 256); for (let r = 0; r < 12; r++) for (let c = 0; c < 5; c++) { const h = hash(seed * 31 + r * 7 + c); g.fillStyle = h > 0.74 ? (h > 0.93 ? '#9fe6ff' : '#ffd08a') : '#1d2460'; g.fillRect(10 + c * 23, 10 + r * 20, 14, 11); } });

/* ---------- camera ---------- */
type CK = { t: number; p: [number, number, number]; l: [number, number, number]; fov: number };
const CAM: CK[] = [
  { t: 0, p: [1.5, 1.9, 6.8], l: [0, 1.7, 0], fov: 36 },           // on the phone: the chat and the video tile
  { t: 2.2, p: [0.9, 1.9, 3.4], l: [0.1, 1.6, 0], fov: 34 },        // push to the screen as he presses Send
  { t: 5.2, p: [-2.6, 3.6, 9.5], l: [0.6, 4.6, 0], fov: 40 },       // pull back and up: the packets gather above it
  { t: 8.2, p: [-7, 5.0, 13], l: [8, 8.5, -14], fov: 44 },        // follow them out towards the tower
  { t: 10, p: [-5, 6, 9], l: [12, 10.5, -22], fov: 40 },
];
const camAt = (t: number) => { let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1].t) i++; const a = CAM[i], b = CAM[i + 1], u = smooth((t - a.t) / (b.t - a.t)); const L = (x: number[], y: number[]) => V(lerp(x[0], y[0], u), lerp(x[1], y[1], u), lerp(x[2], y[2], u)); return { p: L(a.p, b.p), l: L(a.l, b.l), fov: lerp(a.fov, b.fov, u) }; };
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = vfov(c.fov); cam.near = 0.05; cam.far = 400; cam.lookAt(c.l); cam.updateProjectionMatrix(); }, [t, camera]); return null; };

/* ---------- set: his balcony ledge, the night city, the tower ---------- */
const City: React.FC = () => {
  const tex = useMemo(() => [0, 1, 2, 3].map(winTex), []);
  return <group>
    <mesh position={[0, -0.25, 0]}><boxGeometry args={[30, 0.5, 5]} /><meshStandardMaterial color="#2a2f7a" roughness={0.8} /></mesh>
    <mesh position={[0, 0.1, -2.3]}><boxGeometry args={[30, 0.5, 0.4]} /><meshStandardMaterial color="#3a3f96" roughness={0.8} /></mesh>
    {Array.from({ length: 46 }).map((_, i) => { const x = -110 + hash(i) * 220, z = -62 - hash(i + 9) * 70, w = 6 + hash(i + 3) * 7, h = 8 + hash(i + 5) ** 2 * 26; const m = tex[i % 4].clone(); m.repeat.set(Math.max(1, Math.round(w / 5)), Math.max(1, Math.round(h / 9))); m.wrapS = m.wrapT = THREE.RepeatWrapping; m.needsUpdate = true;
      return <mesh key={i} position={[x, h / 2 - 6, z]}><boxGeometry args={[w, h, w]} /><meshStandardMaterial color="#232a6a" emissiveMap={m} emissive="#ffffff" emissiveIntensity={0.42} map={m} roughness={0.8} /></mesh>; })}
    <mesh rotation-x={-Math.PI / 2} position={[0, -6, -50]}><planeGeometry args={[300, 160]} /><meshStandardMaterial color="#0d1140" roughness={1} /></mesh>
  </group>;
};
export const Tower: React.FC<{ t: number }> = ({ t }) => { const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]], Hh = 22, top = 0.4, bot = 2.0, base = TOWER.y - Hh + 2.5;
  const at = (k: number, y: number) => { const s = lerp(bot, top, y / Hh); return V(legs[k][0] * s, y, legs[k][1] * s); };
  const bar = (a: THREE.Vector3, b: THREE.Vector3, key: string, r = 0.07) => { const d = b.clone().sub(a), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); return <mesh key={key} position={a.clone().add(b).multiplyScalar(0.5)} quaternion={q}><cylinderGeometry args={[r, r, d.length(), 6]} /><meshStandardMaterial color="#8c96f0" roughness={0.5} emissive="#2a3190" emissiveIntensity={0.6} /></mesh>; };
  const recv = seg(t, 6.0, 6.6);
  return <group position={[TOWER.x, base, TOWER.z]}>
    {legs.map((_, k) => bar(at(k, 0), at(k, Hh), 'l' + k, 0.1))}
    {Array.from({ length: 8 }).map((_, j) => legs.map((_, k) => <React.Fragment key={j + '-' + k}>{bar(at(k, (j * Hh) / 8), at((k + 1) % 4, (j * Hh) / 8), 'h' + j + k)}{bar(at(k, (j * Hh) / 8), at((k + 1) % 4, ((j + 1) * Hh) / 8), 'x' + j + k, 0.05)}</React.Fragment>))}
    {[0, 1, 2].map((k) => <mesh key={k} position={[Math.cos(k * 2.09) * 0.8, Hh - 1.6, Math.sin(k * 2.09) * 0.8]} rotation-y={-k * 2.09 + Math.PI / 2}><boxGeometry args={[0.5, 2.6, 0.22]} /><meshStandardMaterial color="#dfe6ff" roughness={0.4} emissive="#5fe3ff" emissiveIntensity={recv * 0.9} /></mesh>)}
    <mesh position={[0, Hh + 0.8, 0]}><sphereGeometry args={[0.2, 12, 10]} /><meshBasicMaterial color={Math.sin(t * 5) > 0 ? '#ff5a4a' : '#7a1f18'} /></mesh>
  </group>; };

/* ---------- the phone ---------- */
const Phone: React.FC<{ t: number }> = ({ t }) => {
  const texs = useMemo(() => [screenTex(false, false), screenTex(true, false), screenTex(true, true)], []);
  const stage = t < 2.0 ? 0 : t < 2.75 ? 1 : 2, press = seg(t, 1.75, 2.0) * (1 - seg(t, 2.0, 2.3));
  return <group position={[0, 1.7, 0]} rotation={[-0.14, 0.2, 0.03]}>
    <RoundedBox args={[1.62, 3.3, 0.16]} radius={0.16} smoothness={5}><meshStandardMaterial color="#1a1f52" roughness={0.35} metalness={0.4} /></RoundedBox>
    <mesh position={[0, 0, 0.083]}><planeGeometry args={[1.48, 3.06]} /><meshBasicMaterial map={texs[stage]} toneMapped={false} /></mesh>
    {/* his fingertip pressing Send */}
    <group position={[0.54, -1.42 - (1 - press) * 0.5, 0.2 + (1 - press) * 0.5]} visible={t > 1.2 && t < 2.6}><mesh rotation-x={-0.5}><capsuleGeometry args={[0.13, 0.5, 6, 12]} /><meshStandardMaterial color="#a8714f" roughness={0.7} /></mesh></group>
    <pointLight position={[0, 0, 1.2]} intensity={5} color="#9fe6ff" distance={5} />
  </group>;
};

/* ---------- the packets ---------- */
const BIRTH = 2.75, GO = 5.6;
const tagPos = (i: number, t: number) => {
  const hero = i === HERO, b = BIRTH + (i / N) * 2.0, cloud = V((hash(i) - 0.5) * 5.2 + 0.6, 4.2 + hash(i + 7) * 2.6, (hash(i + 13) - 0.5) * 2.2);
  if (hero) cloud.set(0.9, 5.4, 1.3);
  const start = V(0.25 + (hash(i + 3) - 0.5) * 0.9, 1.75 + (hash(i + 5) - 0.5) * 0.9, 0.3);
  const u = seg(t, b, b + 0.9); const p = start.clone().lerp(cloud, u); p.y += Math.sin(u * Math.PI) * 0.5; p.y += 0.08 * Math.sin(t * 2 + i);
  const go = GO + (hero ? 0.5 : (i / N) * 1.6), w = clamp01((t - go) / 1.5), ww = w * w * (3 - 2 * w);
  const end = TOWER.clone().add(V((hash(i + 21) - 0.5) * 1.2, (hash(i + 23) - 0.5) * 1.5, 0)); const q = p.clone().lerp(end, ww); q.y += Math.sin(ww * Math.PI) * 2.2;
  return { p: q, born: u, away: ww, scale: lerp(0.25, hero ? 1.45 : 1, u) * lerp(1, 2.6, ww) * (1 - seg(ww, 0.93, 1)) };
};
const Tags: React.FC<{ t: number }> = ({ t }) => {
  const texs = useMemo(() => Array.from({ length: N }).map((_, i) => tagTex(i === HERO ? 4 : 1 + Math.floor(hash(i + 40) * 1499), i === HERO)), []);
  const { camera } = useThree();
  return <>{texs.map((m, i) => { const k = tagPos(i, t); if (k.born <= 0.001 || k.scale <= 0.001) return null; const s = 0.42 * k.scale;
    return <mesh key={i} position={k.p} quaternion={camera.quaternion} rotation-z={0} scale={[s * 2.28, s, 1]} renderOrder={i === HERO ? 5 : 1}><planeGeometry args={[1, 1]} /><meshBasicMaterial map={m} transparent toneMapped={false} opacity={i === HERO ? 1 : 0.94} depthWrite={false} /></mesh>; })}</>;
};
/* radio waves: arcs opening from the phone towards the tower */
const Waves: React.FC<{ t: number }> = ({ t }) => { const dir = TOWER.clone().sub(V(0, 3.2, 0)).normalize(), q = new THREE.Quaternion().setFromUnitVectors(V(0, 0, 1), dir);
  return <group position={[0.3, 3.4, 0]} quaternion={q}>{Array.from({ length: 5 }).map((_, k) => { const u = (((t - GO + 0.3) * 0.55 + k / 5) % 1 + 1) % 1, on = seg(t, GO - 0.3, GO + 0.3) * (1 - seg(t, 9.0, 9.8)); return <mesh key={k} position={[0, 0, 2 + u * 22]}><torusGeometry args={[1 + u * 7, 0.04 + u * 0.05, 8, 60, Math.PI * 0.9]} /><meshBasicMaterial color="#5fe3ff" transparent opacity={0.55 * on * (1 - u)} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>; })}</group>; };

const project = (t: number, p: THREE.Vector3): [number, number] => { const c = camAt(t), cam = new THREE.PerspectiveCamera(vfov(c.fov), F.W / F.H, 0.05, 400); cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld(); const q = p.clone().project(cam); return [(q.x * 0.5 + 0.5) * F.W, (-q.y * 0.5 + 0.5) * F.H]; };

export const PacketBurst: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const count = Math.round(lerp(0, 2000, seg(t, 2.8, 5.0)) / 10) * 10, title = seg(t, 3.0, 3.5) * (1 - seg(t, 9.2, 9.8));
  const hk = tagPos(HERO, t), [hx, hy] = project(t, hk.p), heroTag = seg(t, 4.6, 5.0) * (1 - seg(t, 6.6, 7.0));
  const [tx, ty] = project(t, TOWER), towerTag = seg(t, 6.8, 7.3) * (1 - seg(t, 9.4, 9.9));
  return (
    <AbsoluteFill style={{ background: '#070a22' }}>
      <ThreeCanvas width={F.W} height={F.H} gl={{ antialias: true }} camera={{ fov: 36, near: 0.05, far: 400 }}>
        <Cam t={t} />
        <color attach="background" args={['#0a0d34']} />
        <fog attach="fog" args={['#0c1040', 30, 150]} />
        <hemisphereLight args={['#7f8cff', '#160c44', 1.1]} />
        <directionalLight position={[-8, 12, 10]} intensity={1.2} color="#c9d2ff" />
        <City /><Tower t={t} /><Phone t={t} /><Waves t={t} /><Tags t={t} />
        <EffectComposer><Bloom intensity={0.5} luminanceThreshold={0.86} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.22} darkness={0.75} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill><svg width={F.W} height={F.H}>
        <g opacity={title} {...EDGE} transform={tr(1560, 150)}><text textAnchor="middle" fill="#eef1ff" style={{ font: `800 46px ${FONT.ui}` }}>1 photo</text>
          <text y={98} textAnchor="middle" fill="#5fe3ff" style={{ font: `800 104px ${FONT.ui}` }}>{count.toLocaleString('en-US')}</text><text y={150} textAnchor="middle" fill="#eef1ff" style={{ font: `800 46px ${FONT.ui}` }}>packets</text>
          <text y={196} textAnchor="middle" fill="#a9b4dd" style={{ font: `500 24px ${FONT.mono}` }}>3 MB, about 1,500 bytes each</text></g>
        <g opacity={heroTag}><line x1={hx} y1={hy + 40} x2={hx + 150} y2={hy + 150} stroke="#ffb454" strokeWidth={2.5} /><g transform={`translate(${hx + 250} ${hy + 176})`}><rect x={-190} y={-30} width={380} height={76} rx={12} fill="#0e1430" fillOpacity={0.92} stroke="#ffb454" strokeWidth={2.5} /><text y={7} textAnchor="middle" fill="#eef1ff" style={{ font: `800 28px ${FONT.ui}`, letterSpacing: '0.06em' }}>FOLLOW THIS ONE</text><text y={34} textAnchor="middle" fill="#a9b4dd" style={{ font: `500 18px ${FONT.mono}` }}>each packet carries her address</text></g></g>
        <g opacity={towerTag}><line x1={tx} y1={ty - 20} x2={tx - 120} y2={ty - 130} stroke="#5fe3ff" strokeWidth={2.5} /><g transform={`translate(${tx - 190} ${ty - 160})`}><rect x={-150} y={-30} width={300} height={76} rx={12} fill="#0e1430" fillOpacity={0.92} stroke="#5fe3ff" strokeWidth={2.5} /><text y={7} textAnchor="middle" fill="#eef1ff" style={{ font: `800 28px ${FONT.ui}`, letterSpacing: '0.06em' }}>CELL TOWER</text><text y={34} textAnchor="middle" fill="#a9b4dd" style={{ font: `500 18px ${FONT.mono}` }}>packets fly as radio waves</text></g></g>
      </svg></AbsoluteFill>
    </AbsoluteFill>
  );
};
