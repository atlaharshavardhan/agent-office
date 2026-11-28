import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { DogPhoto } from './Story';
import { DogBetter } from './DogBetter';
import { CatPhoto } from './CatPhoto';
/* Part 2 arrival, REAL 3D (Harsh: the flat board did not look real): numbered gold packets fall in the wrong order, tumble, land with a bounce in a numbered grid; three stay missing (big red numbers float above their slots, the camera comes close); they arrive; the packets turn into the whole photo. 9:16. */
const sm = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); }, lp = (a: number, b: number, u: number) => a + (b - a) * u;
export const REAL_FRAMES = 420;
const COLS = 36, ROWS = 56, NT = COLS * ROWS, SW = 1.12, SH = 0.72, BW = COLS * SW, BH = ROWS * SH, FALL = 0.85, TL = 6.7, REST = 0.1;
const LOST = [30 * COLS + 17, 33 * COLS + 18, 36 * COLS + 19];
const rank = Array.from({ length: NT }).map((_, i) => i).sort((a, b) => hash(a + 900) - hash(b + 900)), rk = new Array(NT); rank.forEach((n, r) => { rk[n] = r; });
const SX = (n: number) => ((n % COLS) + 0.5) * SW - BW / 2, SZ = (n: number) => (Math.floor(n / COLS) + 0.5) * SH - BH / 2;
const TA = (n: number) => (LOST.indexOf(n) >= 0 ? TL + LOST.indexOf(n) * 0.25 : 0.4 + (rk[n] / NT) * 4.6);
const lab = (n: number) => String(Math.round((n * 2000) / NT) + 1).padStart(4, '0');
const cv = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const plateTex = () => { const c = cv(COLS * 96, ROWS * 62), g = c.getContext('2d')!; g.fillStyle = '#080e2e'; g.fillRect(0, 0, c.width, c.height); g.textAlign = 'center'; g.font = '700 22px "IBM Plex Mono", monospace';
  for (let n = 0; n < NT; n++) { const x = (n % COLS) * 96, y = Math.floor(n / COLS) * 62; g.strokeStyle = '#18265a'; g.lineWidth = 2; g.strokeRect(x + 3, y + 3, 90, 56); g.fillStyle = '#2f4286'; g.fillText('#' + lab(n), x + 48, y + 38); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const atlasTex = (txt: string) => { const c = cv(COLS * 96, ROWS * 62), g = c.getContext('2d')!; g.textAlign = 'center'; g.font = '800 26px "IBM Plex Mono", monospace'; g.fillStyle = txt;
  for (let n = 0; n < NT; n++) g.fillText('#' + lab(n), (n % COLS) * 96 + 48, Math.floor(n / COLS) * 62 + 38);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const redTex = (txt: string) => { const c = cv(512, 160), g = c.getContext('2d')!; g.textAlign = 'center'; g.font = '900 120px Manrope, sans-serif'; g.shadowColor = 'rgba(255,50,70,.95)'; g.shadowBlur = 26; g.lineWidth = 10; g.strokeStyle = '#4a0a14'; g.strokeText(txt, 256, 122); g.fillStyle = '#ff4a5a'; g.fillText(txt, 256, 122); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const K = [
  { t: 0, p: [-14, 17, 25], l: [0, 0, -2], f: 46 }, { t: 2.6, p: [-6, 8, 19], l: [-1, 0, 2], f: 44 }, { t: 4.7, p: [2, 7, 19], l: [0.4, 0, 4], f: 42 },
  { t: 6.2, p: [0.6, 8.6, 17.5], l: [0.56, 0.2, 3.9], f: 42 }, { t: 7.7, p: [0.6, 9, 18], l: [0.56, 0.2, 3.9], f: 42 }, { t: 9.3, p: [0, 112, 0.4], l: [0, 0, 0], f: 36 },
];
const camAt = (t: number) => { let i = 0; while (i < K.length - 2 && t > K[i + 1].t) i++; const a = K[i], b = K[i + 1], u = sm((t - a.t) / (b.t - a.t)); return { p: a.p.map((v, j) => lp(v, b.p[j], u)) as number[], l: a.l.map((v, j) => lp(v, b.l[j], u)) as number[], f: lp(a.f, b.f, u) }; };
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.set(c.p[0], c.p[1], c.p[2]); cam.fov = c.f; cam.near = 0.05; cam.far = 400; cam.lookAt(c.l[0], c.l[1], c.l[2]); cam.updateProjectionMatrix(); }, [t, camera]); return null; };
const dummy = new THREE.Object3D(), labelLocal = new THREE.Matrix4().compose(new THREE.Vector3(0, REST + 0.002, 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), new THREE.Vector3(1, 1, 1)), mtmp = new THREE.Matrix4();
const Scene: React.FC<{ t: number; pal: string }> = ({ t, pal }) => {
  const PAL = PALS[pal] || PALS.gold;
  const plate = useMemo(plateTex, []), atlas = useMemo(() => atlasTex(PAL.text), []), reds = useMemo(() => LOST.map((n) => redTex('#' + lab(n))), []);
  const inst = useRef<THREE.InstancedMesh>(null), labm = useRef<THREE.InstancedMesh>(null);
  const uvOff = useMemo(() => { const a = new Float32Array(NT * 2); for (let n = 0; n < NT; n++) { a[n * 2] = (n % COLS) / COLS; a[n * 2 + 1] = 1 - (Math.floor(n / COLS) + 1) / ROWS; } return new THREE.InstancedBufferAttribute(a, 2); }, []);
  const labGeo = useMemo(() => { const g = new THREE.PlaneGeometry(1.02, 0.62); g.setAttribute('uvOff', uvOff); return g; }, [uvOff]);
  const labMat = useMemo(() => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { map: { value: atlas } }, vertexShader: `attribute vec2 uvOff; varying vec2 vUv; void main(){ vUv = uv * vec2(${(1 / COLS).toFixed(6)}, ${(1 / ROWS).toFixed(6)}) + uvOff; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0); }`, fragmentShader: 'uniform sampler2D map; varying vec2 vUv; void main(){ gl_FragColor = texture2D(map, vUv); }' }), [atlas]);
  useLayoutEffect(() => { const m = inst.current, l = labm.current; if (!m || !l) return; const col = new THREE.Color();
    for (let n = 0; n < NT; n++) { const ta = TA(n), u = (t - ta) / FALL; let heat = 0, fall = 0;
      if (u < 0) { dummy.position.set(0, -60, 0); dummy.scale.setScalar(0.0001); dummy.rotation.set(0, 0, 0); }
      else if (u < 1) { const e = 1 - u * u, hh = 14 + 22 * hash(n + 3); fall = 1; dummy.position.set(SX(n) + (hash(n + 4) - 0.5) * 7 * e, REST + hh * e, SZ(n) + (hash(n + 5) - 0.5) * 7 * e); dummy.rotation.set((hash(n + 6) - 0.5) * 9 * e, (hash(n + 7) - 0.5) * 9 * e, (hash(n + 8) - 0.5) * 9 * e); dummy.scale.setScalar(1); }
      else { const s = t - ta - FALL; heat = Math.exp(-4.5 * s); dummy.position.set(SX(n), REST + 0.06 * Math.exp(-8 * s) * Math.abs(Math.sin(15 * s)), SZ(n)); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); }
      dummy.updateMatrix(); m.setMatrixAt(n, dummy.matrix); mtmp.multiplyMatrices(dummy.matrix, labelLocal); l.setMatrixAt(n, mtmp);
      { const c0 = fall ? PAL.fall : PAL.base; col.setRGB(lerp3(c0[0], PAL.hot[0], heat), lerp3(c0[1], PAL.hot[1], heat), lerp3(c0[2], PAL.hot[2], heat)); } m.setColorAt(n, col); }
    m.instanceMatrix.needsUpdate = true; l.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }, [t]);
  const miss = sm((t - 2.6) / 0.3) * (1 - sm((t - TL - 0.7) / 0.3)), bl = 0.5 + 0.5 * Math.sin(t * 10), ph = sm((t - 8.3) / 1.3);
  return (<>
    <mesh rotation-x={-Math.PI / 2}><planeGeometry args={[BW, BH]} /><meshBasicMaterial map={plate} toneMapped={false} /></mesh>
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]}><planeGeometry args={[BW + 6, BH + 6]} /><meshBasicMaterial color="#050818" /></mesh>
    <instancedMesh ref={inst} args={[undefined as any, undefined as any, NT]} frustumCulled={false}><boxGeometry args={[1.06, 0.2, 0.66]} /><meshStandardMaterial color="#ffffff" roughness={0.32} metalness={0.25} emissive={PAL.emis} emissiveIntensity={0.3} /></instancedMesh>
    <instancedMesh ref={labm} args={[undefined as any, undefined as any, NT]} frustumCulled={false} geometry={labGeo} material={labMat} />
    {LOST.map((n, i) => miss > 0.01 && <group key={n} position={[SX(n), 0, SZ(n)]}>
      <mesh position={[0, 0.14, 0]}><boxGeometry args={[1.12, 0.22, 0.72]} /><meshBasicMaterial color="#ff2a3a" transparent opacity={miss * (0.45 + 0.55 * bl)} toneMapped={false} /></mesh>
      <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[2.0, 28]} /><meshBasicMaterial color="#ff2a3a" transparent opacity={miss * (0.12 + 0.2 * bl)} depthWrite={false} /></mesh>
      <sprite position={[0, 2.0 + Math.sin(t * 3 + i) * 0.1, 0]} scale={[3.4, 1.06, 1]}><spriteMaterial map={reds[i]} transparent opacity={miss * (0.75 + 0.25 * bl)} depthWrite={false} toneMapped={false} /></sprite></group>)}
  </>); };
export const PALS: Record<string, { base: number[]; fall: number[]; hot: number[]; emis: string; text: string }> = {
  gold: { base: [1, 0.74, 0.2], fall: [0.62, 0.46, 0.12], hot: [1, 0.97, 0.7], emis: '#7a4a08', text: '#3a2008' },
  amber: { base: [0.9, 0.53, 0.05], fall: [0.6, 0.34, 0.04], hot: [0.95, 0.78, 0.32], emis: '#4a2202', text: '#2e1002' },
  cyan: { base: [0.22, 0.72, 1], fall: [0.12, 0.42, 0.62], hot: [0.85, 0.97, 1], emis: '#0a4a7a', text: '#04203a' },
  violet: { base: [0.62, 0.42, 1], fall: [0.36, 0.24, 0.62], hot: [0.95, 0.9, 1], emis: '#3a1a7a', text: '#160a3a' },
  teal: { base: [0.12, 0.85, 0.7], fall: [0.07, 0.5, 0.42], hot: [0.85, 1, 0.97], emis: '#066a5a', text: '#03231d' },
};
const lerp3 = (a: number, b: number, u: number) => a + (b - a) * u;
export const ArriveReal: React.FC<{ pal?: string; cat?: 'dog' | 'dark' | 'gold' }> = ({ pal = 'amber', cat = 'dog' }) => {
  const Photo: React.FC = () => { const tt = useCurrentFrame() / 30, bv = Math.max(0, 1 - Math.abs((tt - 12.15) / 0.12), 1 - Math.abs((tt - 13.0) / 0.12)); return (cat === 'dog' ? <DogBetter blink={Math.min(1, bv * 1.4)} /> : <CatPhoto gold={cat === 'gold'} />); }; const f = useCurrentFrame(), t = f / 30, ms = Math.round(lp(62, 65, sm((t - 0.3) / 9.6)));
  let landed = 0; const got: boolean[] = []; for (let n = 0; n < NT; n++) { const g = t >= TA(n) + FALL; got.push(g); if (g) landed++; }
  const count = Math.round((2000 * landed) / NT), pct = Math.round((100 * landed) / NT), TWd = 230 / COLS, THd = 230 / ROWS, hot = t < TL + 0.7 && t > 4.9 && count > 1000;
  const cap = (txt: string, o: number) => <div style={{ position: 'absolute', left: 0, right: 0, top: 1700, display: 'flex', justifyContent: 'center', opacity: o }}><div style={{ padding: '16px 36px', borderRadius: 40, background: '#2a1630', border: '3px solid #ffb454', font: `800 46px/1 ${FONT.ui}`, color: '#fff1dc', textAlign: 'center' }}>{txt}</div></div>;
  return (<AbsoluteFill style={{ background: '#03051a' }}>
    <ThreeCanvas width={1080} height={1920} gl={{ antialias: true }} camera={{ fov: 44, near: 0.05, far: 400 }}>
      <Cam t={t} /><color attach="background" args={['#03051a']} /><fog attach="fog" args={['#03051a', 70, 260]} />
      <ambientLight intensity={0.8} /><directionalLight position={[6, 14, 8]} intensity={1.3} color="#ffe9c0" /><pointLight position={[0, 6, 0]} intensity={26} color="#ffb454" distance={50} />
      <Scene t={t} pal={pal} />
      <EffectComposer><Bloom intensity={0.7} luminanceThreshold={0.78} luminanceSmoothing={0.25} mipmapBlur /><Vignette eskil={false} offset={0.25} darkness={0.7} /></EffectComposer>
    </ThreeCanvas>
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: sm((t - 0.5) / 0.4) * (1 - sm((t - 9.4) / 0.4)), transform: 'translate(300px, 6px) scale(0.78)', transformOrigin: '0 0' }}><svg width={1080} height={460} style={{ position: 'absolute', left: 0, top: 0 }}>
      <rect x={56} y={116} width={238} height={290} rx={16} fill="#0b1230" stroke="#4a63c8" strokeWidth={3} /><svg x={60} y={120} width={230} height={230} viewBox="0 0 190 190"><Photo /></svg>
      {got.map((g, n) => g ? null : <rect key={n} x={60 + (n % COLS) * TWd} y={120 + Math.floor(n / COLS) * THd} width={TWd + 0.4} height={THd + 0.4} fill="#070b22" />)}
      <text x={175} y={392} textAnchor="middle" fill={pct >= 100 ? '#7dffb0' : '#ffd38a'} style={{ font: `900 40px ${FONT.ui}` }}>PHOTO {pct}%</text></svg></div>
    <div style={{ position: 'absolute', left: 0, top: 414, width: 1080, height: 1080, opacity: sm((t - 9.4) / 1.0), overflow: 'hidden', borderRadius: 6 }}><svg width={1080} height={1080} viewBox="0 0 190 190"><Photo /></svg></div>
    <div style={{ position: 'absolute', left: 50, right: 50, top: 1560, textAlign: 'center', opacity: sm((t - 9.9) / 0.6), transform: `translateY(${(1 - sm((t - 9.9) / 0.6)) * 30}px)`, font: `900 80px/1.1 ${FONT.ui}`, color: '#fff', textShadow: '0 8px 24px rgba(0,0,0,.7)' }}>All of this can happen in the <span style={{ color: '#7fd4ff' }}>blink</span> of an eye.</div>
    <div style={{ position: 'absolute', left: 56, top: 360, textAlign: 'left', font: `900 120px/1 ${FONT.ui}`, color: hot ? '#ff4a5a' : t >= TL + 0.7 ? '#7dffb0' : '#fff', textShadow: '0 6px 18px rgba(0,0,0,.8)', opacity: 1 - sm((t - 9.4) / 0.4) }}>{count.toLocaleString('en-US')}<span style={{ font: `700 54px ${FONT.ui}`, color: '#cfd8ff' }}> / 2,000</span><div style={{ font: `700 46px ${FONT.ui}`, color: '#fff' }}>packets</div></div>
    <div style={{ position: 'absolute', right: 70, top: 150, display: 'flex', alignItems: 'baseline', gap: 8, font: `800 120px/1 ${FONT.ui}`, color: t > 10.3 ? '#7dffb0' : '#7fd4ff', textShadow: '0 0 30px rgba(127,212,255,.6)' }}>{String(ms).padStart(3, '0')}<span style={{ font: `800 40px ${FONT.ui}` }}>ms</span></div>
    <div style={{ position: 'absolute', right: 70, top: 282, font: `600 26px ${FONT.mono}`, color: '#9fb4e8', textShadow: '0 2px 8px rgba(0,0,0,.8)' }}>one packet, one way</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'space-between', padding: '0 60px', font: `800 46px ${FONT.ui}`, color: '#fff', textShadow: '0 4px 10px rgba(0,0,0,.7)', opacity: 1 - sm((t - 9.4) / 0.4) }}><span>Hyderabad</span><span>London</span></div>
    {cap('They arrive in the wrong order', sm((t - 0.8) / 0.4) * (1 - sm((t - 2.0) / 0.3)))}{cap('Sorted by number', sm((t - 2.7) / 0.4) * (1 - sm((t - 4.9) / 0.3)))}{cap('3 packets missing. Asking again', sm((t - 5.2) / 0.4) * (1 - sm((t - 6.9) / 0.3)))}{cap('We decrypt it', sm((t - 7.9) / 0.4) * (1 - sm((t - 10.0) / 0.3)))}
  </AbsoluteFill>); };
