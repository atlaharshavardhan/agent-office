import React, { useLayoutEffect, useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { geoEquirectangular, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
// @ts-ignore
import land110 from 'world-atlas/land-110m.json';
import { FPS, clamp01, lerp, smooth, hash } from '../lib/anim';
import { F, vfov, tr, clampX, EDGE } from './frame';
import { FONT } from '../lib/palette';
import { WEB, MAIN as MAIN_MUMBAI, MUMBAI, LONDON, HYD, routePts, LL } from '../tail/Globe';
/* Part 2 (decided 28 Nov): the photo leaves Hyderabad, crosses the sea and lands in London (drawn straight from Hyderabad, simplified) */
export const MAIN: LL[] = [HYD, ...MAIN_MUMBAI];

/* V4, 16:9: the planet and its cables. From low over the Arabian Sea the camera pulls back until the whole Earth is in view,
   the web of undersea cables lighting up as it goes, our own route in amber. A real 3D globe with real coastlines. */
export const R = 10;
export const PLANET_FRAMES = 360;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/* the Part 2 hook turns the globe once and shows the cables only later: it sets these (lon = camera longitude by time, show = how much of the cable web and our route is visible, 0 to 1) */
export const ov: { lon: null | ((t: number) => number); show: null | ((t: number) => number); pins: null | number; thin?: boolean; u?: null | ((t: number) => number); dense?: boolean; real?: boolean; dy?: number; alt?: null | ((t: number) => number); cut?: null | ((t: number) => number); blue?: boolean } = { lon: null, show: null, pins: null, thin: false, u: null, dense: false, real: false, alt: null };   // thin = Harsh: a thin edge on the globe and a few clear stars (hook v9)
const seg = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const ll = (p: LL, r = R) => { const la = (p[1] * Math.PI) / 180, lo = (p[0] * Math.PI) / 180; return V(r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo)); };
const CITIES: LL[] = [MUMBAI, LONDON, [78.5, 17.4], [77.2, 28.6], [77.6, 13], [80.3, 13.1], [88.4, 22.6], [67, 24.9], [55.3, 25.3], [46.7, 24.7], [51.4, 35.7], [31.2, 30], [29, 41], [37.6, 55.8], [2.35, 48.9], [13.4, 52.5], [-3.7, 40.4], [12.5, 41.9], [103.8, 1.3], [114.2, 22.3], [121.5, 31.2], [139.8, 35.7], [126.9, 37.5], [116.4, 39.9], [100.5, 13.8], [106.8, -6.2], [151.2, -33.9], [144.9, -37.8], [18.4, -33.9], [28, -26.2], [3.4, 6.4], [36.8, -1.3], [-74, 40.7], [-118.2, 34], [-87.6, 41.9], [-99.1, 19.4], [-46.6, -23.5], [-58.4, -34.6], [-43.2, -22.9], [-79.4, 43.7], [-122.4, 37.8], [-80.2, 25.8]];

/* the Earth's surface, drawn once: night-blue sea, our purple land, warm city lights */
export const earthTex = () => { const c = document.createElement('canvas'); c.width = 4096; c.height = 2048; const g = c.getContext('2d')!; const proj = geoEquirectangular().fitSize([4096, 2048], { type: 'Sphere' } as any), path = geoPath(proj, g);
  const sea = g.createLinearGradient(0, 0, 0, 2048); sea.addColorStop(0, '#0d1660'); sea.addColorStop(0.5, '#101c72'); sea.addColorStop(1, '#0d1660'); g.fillStyle = sea; g.fillRect(0, 0, 4096, 2048);
  g.beginPath(); path(geoGraticule10() as any); g.strokeStyle = 'rgba(160,176,255,.10)'; g.lineWidth = 2; g.stroke();
  const land = feature(land110 as any, (land110 as any).objects.land) as any;
  g.beginPath(); path(land); g.fillStyle = '#3e3596'; g.fill(); g.strokeStyle = '#9a8cf0'; g.lineWidth = 3; g.lineJoin = 'round'; g.stroke();
  CITIES.forEach((p, i) => { const [x, y] = proj(p)!; const gr = g.createRadialGradient(x, y, 0, x, y, 26); gr.addColorStop(0, 'rgba(255,240,200,.95)'); gr.addColorStop(0.3, 'rgba(255,205,120,.45)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gr; g.fillRect(x - 26, y - 26, 52, 52);
    for (let k = 0; k < 9; k++) { g.fillStyle = 'rgba(255,220,150,.8)'; g.fillRect(x + (hash(i * 9 + k) - 0.5) * 60, y + (hash(i * 5 + k + 3) - 0.5) * 44, 3, 3); } });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

/* a more real-looking night Earth (Harsh's reference): deep-blue sea with shallow coasts, shaded land (green, desert, mountain, polar), thousands of warm city lights */
const EXTRA: LL[] = [[-74, 40.7], [-118.2, 34], [-87.6, 41.9], [-99.1, 19.4], [-46.6, -23.5], [-58.4, -34.6], [3.4, 6.5], [31.2, 30], [28, -26.2], [36.8, -1.3], [116.4, 39.9], [139.7, 35.7], [127, 37.5], [121.5, 31.2], [113.3, 23.1], [106.8, -6.2], [151.2, -33.9], [77.2, 28.6], [72.8, 19], [88.4, 22.6], [90.4, 23.8], [67, 24.9], [51.4, 35.7], [29, 41], [46.7, 24.7], [55.3, 25.3], [2.35, 48.9], [-0.1, 51.5], [13.4, 52.5], [-3.7, 40.4], [12.5, 41.9], [37.6, 55.8], [78.5, 17.4], [77.6, 13], [80.3, 13.1], [100.5, 13.7], [105.8, 21], [121, 14.6], [-43.2, -22.9], [-70.6, -33.4], [-77, -12], [-74, 4.7], [-80, 25.8], [-122.4, 37.8], [-79.4, 43.7], [30.5, 50.4], [44.4, 33.3], [39.8, 21.5], [72.6, 23], [73.9, 18.5], [75.8, 26.9], [80.9, 26.8], [85.1, 25.6], [91.8, 26.1]];
export const earthTexReal = () => { const W = 3072, H = 1536, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d')!; const proj = geoEquirectangular().fitSize([W, H], { type: 'Sphere' } as any), land = feature(land110 as any, (land110 as any).objects.land) as any;
  const m = document.createElement('canvas'); m.width = W; m.height = H; const mg = m.getContext('2d')!; mg.fillStyle = '#000'; mg.fillRect(0, 0, W, H); mg.beginPath(); geoPath(proj, mg)(land); mg.fillStyle = '#fff'; mg.fill(); const md = mg.getImageData(0, 0, W, H).data;
  const T = new Float32Array(65536); for (let i = 0; i < 65536; i++) T[i] = hash(i * 1.37 + 5);
  const vn = (x: number, y: number) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), a = T[(xi & 255) + ((yi & 255) << 8)], b = T[((xi + 1) & 255) + ((yi & 255) << 8)], cc = T[(xi & 255) + (((yi + 1) & 255) << 8)], d = T[((xi + 1) & 255) + (((yi + 1) & 255) << 8)]; return a + (b - a) * u + (cc - a) * v + (a - b - cc + d) * u * v; };
  const fbm = (x: number, y: number) => { let s = 0, a = 0.5, f = 1; for (let o = 0; o < 5; o++) { s += a * vn(x * f, y * f); f *= 2; a *= 0.5; } return s; };
  const img = g.createImageData(W, H), d = img.data, ss = (e0: number, e1: number, x: number) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  for (let y = 0; y < H; y++) { const lat = Math.abs(90 - (y / H) * 180);
    for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, isLand = md[i] > 127, n1 = fbm(x / 90, y / 90), n2 = fbm(x / 22 + 40, y / 22 + 17); let r: number, gg: number, b: number;
      if (isLand) { const des = ss(0.52, 0.7, n1) * ss(12, 20, lat) * (1 - ss(38, 46, lat)), pol = ss(60, 72, lat + (n1 - 0.5) * 14), mtn = ss(0.55, 0.78, n2);
        r = 48 + 22 * n1; gg = 84 + 18 * n1; b = 70 + 10 * n1; r += (118 - r) * des; gg += (104 - gg) * des; b += (74 - b) * des; r += (112 - r) * mtn * 0.6; gg += (118 - gg) * mtn * 0.6; b += (130 - b) * mtn * 0.6; r += (206 - r) * pol; gg += (214 - gg) * pol; b += (230 - b) * pol; r *= 0.78; gg *= 0.8; b *= 0.9; }
      else { const near = md[(y * W + Math.min(W - 1, x + 5)) * 4] + md[(y * W + Math.max(0, x - 5)) * 4] + md[(Math.min(H - 1, y + 5) * W + x) * 4] + md[(Math.max(0, y - 5) * W + x) * 4], sh = Math.min(1, near / 255); r = 6 + 6 * n1 + 14 * sh; gg = 22 + 14 * n1 + 52 * sh; b = 62 + 26 * n1 + 70 * sh; }
      d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255; } }
  g.putImageData(img, 0, 0);
  g.beginPath(); geoPath(proj, g)(land); g.strokeStyle = 'rgba(130,190,255,.22)'; g.lineWidth = 1.6; g.stroke();
  g.globalCompositeOperation = 'lighter';
  CITIES.concat(EXTRA).forEach((p, i) => { const [x, y] = proj(p)!; const gr = g.createRadialGradient(x, y, 0, x, y, 34); gr.addColorStop(0, 'rgba(255,216,150,.30)'); gr.addColorStop(0.35, 'rgba(255,190,100,.08)'); gr.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = gr; g.fillRect(x - 34, y - 34, 68, 68);
    for (let k = 0; k < 110; k++) { const dx = (hash(i * 131 + k) + hash(i * 17 + k + 3) - 1) * 46, dy = (hash(i * 71 + k + 9) + hash(i * 29 + k + 5) - 1) * 34, px = Math.round(x + dx), py = Math.round(y + dy); if (px < 0 || py < 0 || px >= W || py >= H || md[(py * W + px) * 4] < 128) continue; g.fillStyle = `rgba(255,${200 + Math.floor(hash(k + i) * 40)},${130 + Math.floor(hash(k * 3 + i) * 60)},${0.55 + 0.4 * hash(k + 7 * i)})`; g.fillRect(px, py, 1.6, 1.6); } });
  g.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
export const atmoMat = () => new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(clamp(1. - abs(dot(normalize(vN), normalize(vV))), 0., 1.), 2.6); gl_FragColor = vec4(vec3(.25, .6, 1.) * f * 0.9, f * 0.7); }' });

type CK = { t: number; lon: number; lat: number; d: number; tl: LL | null; fov: number };
const CAM: CK[] = [
  { t: 0, lon: 70, lat: 4, d: 12.4, tl: [58, 15], fov: 46 },        // low over the Arabian Sea, the cable heading for the Red Sea
  { t: 3.2, lon: 60, lat: 6, d: 14.5, tl: [44, 20], fov: 44 },
  { t: 6.6, lon: 42, lat: 20, d: 30, tl: null, fov: 40 },            // back and up: the whole Earth and the web
  { t: 12, lon: 14, lat: 26, d: 31, tl: null, fov: 40 },             // slow drift round towards Europe
];
const camAt = (t: number) => { let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1].t) i++; const a = CAM[i], b = CAM[i + 1], u = smooth((t - a.t) / (b.t - a.t));
  const far = F.v ? 0.86 : 1, p = ll([ov.lon ? ov.lon(t) : lerp(a.lon, b.lon, u), lerp(a.lat, b.lat, u)], lerp(a.d * (a.tl ? 1 : far), b.d * (b.tl ? 1 : far), u)), ta = a.tl ? ll(a.tl) : V(0, 0, 0), tb = b.tl ? ll(b.tl) : V(0, 0, 0); return { p, l: ta.lerp(tb, u), fov: lerp(a.fov, b.fov, u) }; };
/* once the whole Earth is in view it sits left of centre, leaving the right side for the words */
const shift = (t: number) => (F.v ? 0 : 330 * seg(t, 3.6, 6.6));
/* in the Short the Earth drops a little instead, leaving the top for the words */
const shiftY = (t: number) => ((F.v ? 190 * seg(t, 3.6, 6.6) : 0)) + (ov.dy || 0);
const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { const c = camAt(t), cam = camera as THREE.PerspectiveCamera; cam.position.copy(c.p); cam.fov = vfov(c.fov); cam.near = 0.1; cam.far = 600; cam.up.set(0, 1, 0); cam.lookAt(c.l); cam.setViewOffset(F.W, F.H, shift(t), -shiftY(t), F.W, F.H); cam.updateProjectionMatrix(); }, [t, camera]); return null; };

const curveOf = (r: LL[], lift = 1.006) => new THREE.CatmullRomCurve3(routePts(r, 1, 0.02).map((p) => ll(p as LL, R * lift)));
const MAIN_C = curveOf(MAIN, 1.008);
/* the back-up route round Africa, used when the short way is cut (Part 2, anchor scene) */
export const ALT: LL[] = [MUMBAI, [62, 2], [52, -16], [38, -32], [18, -36], [8, -20], [2, -5], [-8, 5], [-17, 15], [-18, 28], [-12, 40], [-9, 46], [-4.55, 50.83]];
const ALT_C = curveOf(ALT, 1.008);
const mainU = (t: number) => clamp01((t - 0.6) / 8.6) ** 0.9;      // how far along its route our light is

/* Harsh's reference: a dense web of glowing cable arcs over the whole Earth (ov.dense) */
const DenseWeb: React.FC<{ t: number }> = ({ t }) => { const arcs = useMemo(() => { const out: { g: THREE.BufferGeometry; c: THREE.CatmullRomCurve3 }[] = []; let tries = 0;
    while (out.length < 42 && tries++ < 2000) { const a = CITIES[Math.floor(hash(tries * 3) * CITIES.length)], b = CITIES[Math.floor(hash(tries * 3 + 1) * CITIES.length)], A = ll(a, 1), B = ll(b, 1), ang = A.angleTo(B); if (ang < 0.35 || ang > 2.4) continue;
      const pts = Array.from({ length: 26 }).map((_, i) => { const u = i / 25, q = new THREE.Quaternion().setFromUnitVectors(A.clone().normalize(), B.clone().normalize()), id = new THREE.Quaternion(), r = id.clone().slerp(q, u); return A.clone().applyQuaternion(r).normalize().multiplyScalar(R * (1.004 + 0.045 * Math.sin(Math.PI * u) * Math.min(1, ang / 1.2))); });
      const c = new THREE.CatmullRomCurve3(pts); out.push({ g: new THREE.TubeGeometry(c, 40, 0.0075, 4, false), c }); } return out; }, []);
  const o = seg(t, 5.4, 7.0);
  return <group>{arcs.map(({ c }, i) => [0, 1].map((k) => { const pu = (((t * (0.16 + 0.1 * hash(i + 40)) + hash(i + 7) + k * 0.5) % 1) + 1) % 1, pp = c.getPointAt(pu), fade = Math.sin(Math.PI * pu); return <mesh key={'p' + i + '-' + k} position={pp}><sphereGeometry args={[0.042, 8, 6]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.95 * o * fade} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>; }))}{arcs.map(({ g }, i) => <mesh key={i} geometry={g}><meshBasicMaterial color={i % 3 ? '#cfeaff' : '#8fd0ff'} transparent opacity={(0.25 + 0.25 * hash(i)) * o} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>)}</group>; };
const Earth: React.FC<{ t: number }> = ({ t }) => {
  const tex = useMemo(() => (ov.real ? earthTexReal() : earthTex()), []), atmo = useMemo(atmoMat, []), atmoThin = useMemo(() => new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }', fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(clamp(1. - abs(dot(normalize(vN), normalize(vV))), 0., 1.), 5.0); gl_FragColor = vec4(vec3(.35, .65, 1.) * f * 0.55, f * 0.45); }' }), []);
  const web = useMemo(() => WEB.map((r) => { const c = curveOf(r); return { c, g: new THREE.TubeGeometry(c, Math.max(20, Math.round(c.getLength() * 8)), ov.real ? 0.011 : 0.03, 6, false) }; }), []);
  const mainG = useMemo(() => new THREE.TubeGeometry(MAIN_C, 500, ov.dense ? 0.02 : ov.real ? 0.03 : 0.05, 8, false), []), mainGlow = useMemo(() => new THREE.TubeGeometry(MAIN_C, 300, 0.075, 8, false), []), mainThin = useMemo(() => new THREE.TubeGeometry(MAIN_C, 500, ov.dense ? 0.02 : ov.real ? 0.014 : 0.018, 8, false), []), mainDim = useMemo(() => new THREE.TubeGeometry(MAIN_C, 500, ov.dense ? 0.011 : ov.real ? 0.008 : 0.024, 6, false), []);
  const glow = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d')!; const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.2, 'rgba(255,190,90,.7)'); gr.addColorStop(0.55, 'rgba(255,150,40,.16)'); gr.addColorStop(1, 'rgba(255,140,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const x = new THREE.CanvasTexture(c); x.colorSpace = THREE.SRGBColorSpace; return x; }, []);
  const altG = useMemo(() => new THREE.TubeGeometry(ALT_C, 500, ov.dense ? 0.02 : ov.real ? 0.03 : 0.05, 8, false), []), altGlow = useMemo(() => new THREE.TubeGeometry(ALT_C, 300, 0.075, 8, false), []), ua = ov.alt ? ov.alt(t) : 0; altG.setDrawRange(0, Math.floor((altG.index!.count * ua) / 3) * 3); altGlow.setDrawRange(0, Math.floor((altGlow.index!.count * ua) / 3) * 3);
  const u = ov.u ? ov.u(t) : mainU(t); mainG.setDrawRange(0, Math.floor((mainG.index!.count * u) / 3) * 3); mainThin.setDrawRange(0, Math.floor((mainThin.index!.count * u) / 3) * 3); mainGlow.setDrawRange(0, Math.floor((mainGlow.index!.count * u) / 3) * 3);
  const mainCol = ov.cut && ov.cut(t) > 0.5 ? '#ff2e3e' : ov.dense ? '#ffe04a' : '#ffc24a';
  const head = MAIN_C.getPointAt(u), zoom = seg(t, 3.2, 6.6);
  return <group>
    <mesh><sphereGeometry args={[R, 96, 64]} /><meshStandardMaterial map={tex} emissiveMap={tex} color={ov.blue ? "#9cc0f5" : "#ffffff"} emissive={ov.blue ? "#9cc0ff" : "#ffffff"} emissiveIntensity={ov.blue ? 1.15 : ov.real ? 1.0 : 0.55} roughness={0.9} /></mesh>
    <mesh material={ov.real ? atmo : ov.thin ? atmoThin : atmo}><sphereGeometry args={[R * (ov.blue ? 1.075 : ov.real ? 1.03 : ov.thin ? 1.012 : 1.045), 64, 48]} /></mesh>
    {ov.dense && <DenseWeb t={t} />}
    {/* the world's cables: dim cyan, lighting up one after another as the camera pulls back */}
    {web.map((w, i) => { const on = seg(t, 4.2 + i * 0.09, 5.0 + i * 0.09); w.g.setDrawRange(0, Math.floor((w.g.index!.count * on) / 3) * 3); const pu = ((t * 0.16 + hash(i) * 5) % 1 + 1) % 1, pp = w.c.getPointAt(pu);
      return <group key={i}><mesh geometry={w.g}><meshBasicMaterial color="#6fd0ff" transparent opacity={0.8 * (ov.show ? ov.show(t) : 1)} /></mesh>{on > 0.95 && <mesh position={pp}><sphereGeometry args={[0.055, 8, 8]} /><meshBasicMaterial color="#dff6ff" /></mesh>}</group>; })}
    <mesh geometry={mainDim} visible={!ov.show || ov.show(t) > 0.5}><meshBasicMaterial color={ov.dense ? "#d6ebff" : "#5fb8ff"} transparent opacity={ov.dense ? 0.75 : 0.4} /></mesh>
    {ov.dense && <mesh geometry={mainGlow}><meshBasicMaterial color={mainCol} transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>}
    <mesh geometry={mainG} visible={zoom > 0.45 && (!ov.show || ov.show(t) > 0.5)}><meshBasicMaterial color={mainCol} /></mesh>
    <mesh geometry={mainThin} visible={zoom <= 0.45 && (!ov.show || ov.show(t) > 0.5)}><meshBasicMaterial color={mainCol} /></mesh>
    {ov.alt && ua > 0.001 && <>{ov.dense && <mesh geometry={altGlow}><meshBasicMaterial color="#ffe04a" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>}<mesh geometry={altG}><meshBasicMaterial color="#ffe04a" /></mesh><group position={ALT_C.getPointAt(ua)}><sprite scale={[1.6, 1.6, 1]}><spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite><mesh><sphereGeometry args={[0.07, 10, 8]} /><meshBasicMaterial color="#fff0c8" /></mesh></group></>}
    <group position={head}><sprite scale={[lerp(0.45, 2.2, zoom), lerp(0.45, 2.2, zoom), 1]}><spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></sprite><mesh><sphereGeometry args={[lerp(0.028, 0.1, zoom), 10, 8]} /><meshBasicMaterial color="#fff0c8" /></mesh></group>
    {[LONDON, HYD].map((p, i) => <mesh key={i} position={ll(p, R * 1.01)}><sphereGeometry args={[0.1, 12, 10]} /><meshBasicMaterial color={i ? '#ffe08a' : '#ff9c8a'} /></mesh>)}
  </group>;
};
const Stars: React.FC<{ t?: number }> = ({ t = 0 }) => <>{Array.from({ length: ov.thin ? 1400 : 260 }).map((_, i) => { const a = hash(i) * 6.283, b = Math.acos(2 * hash(i + 7) - 1), r = 260, blink = ov.thin && hash(i + 11) < 0.45, o = blink ? 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 1.4 + hash(i + 5) * 6.283)) : 1; return <mesh key={i} position={[r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)]}><sphereGeometry args={[(ov.thin ? 0.3 : 0.25) + hash(i + 3) * (ov.thin ? 0.45 : 0.5), 6, 6]} /><meshBasicMaterial color="#e6ebff" fog={false} transparent={blink} opacity={o} /></mesh>; })}</>;

export const project = (t: number, p: THREE.Vector3): [number, number, boolean] => { const c = camAt(t), cam = new THREE.PerspectiveCamera(vfov(c.fov), F.W / F.H, 0.1, 600); cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld(); const q = p.clone().project(cam); q.x -= (shift(t) / F.W) * 2; const front = p.clone().normalize().dot(c.p.clone().normalize()) > 0.18; return [(q.x * 0.5 + 0.5) * F.W, (-q.y * 0.5 + 0.5) * F.H + shiftY(t), front]; };
/* a Google Maps style pin: red teardrop with a white dot, its tip exactly on the city, name beside it */
const Pin: React.FC<{ t: number; at: LL; name: string; col: string; a: number; dx: number; dy: number }> = ({ t, at, name, a, dx, col }) => { const [x, y, front] = project(t, ll(at, R * 1.01)), aa = ov.pins != null ? ov.pins + (name === 'HYDERABAD' ? 0.3 : 0) : a, o = seg(t, aa, aa + 0.4) * (front ? 1 : 0); if (o < 0.01) return null;
  const drop = 1 - seg(t, aa, aa + 0.5), side = dx < 0 ? -1 : 1, w = name.length * 19 + 20, ly = y - 50, lx = clampX(x + side * (64 + w / 2 + 46), w + 40);
  return <g opacity={o}>
    <ellipse cx={x} cy={y} rx={16} ry={6} fill="#000" opacity={0.45} />
    <g transform={`translate(${x} ${y - drop * 70}) scale(${0.8 + 0.2 * (1 - drop)})`}>
      <path d="M 0 0 C -8 -16 -30 -30 -30 -56 A 30 30 0 1 1 30 -56 C 30 -30 8 -16 0 0 Z" fill="#ea4335" stroke="#a52714" strokeWidth={3} strokeLinejoin="round" />
      <circle cx={0} cy={-56} r={12} fill="#fff" /></g>
    {(() => { const sub = name === 'LONDON' ? 'she gets it here' : 'you send it here', cw = Math.max(name.length * 24, sub.length * 14) + 70, ch = 92, cx0 = lx - cw / 2, cy0 = ly - 36; return <g style={{ filter: `drop-shadow(0 0 14px ${col}88)` }}>
      <defs><linearGradient id="pinbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24357e" /><stop offset="1" stopColor="#0a1030" /></linearGradient></defs>
      <rect x={cx0} y={cy0} width={cw} height={ch} rx={18} fill="url(#pinbg)" stroke={col} strokeWidth={3} />
      <path d={`M ${cx0 + 18} ${cy0 + 3} H ${cx0 + cw - 18} Q ${cx0 + cw - 6} ${cy0 + 3} ${cx0 + cw - 4} ${cy0 + 16} H ${cx0 + 4} Q ${cx0 + 6} ${cy0 + 3} ${cx0 + 18} ${cy0 + 3} Z`} fill="#fff" opacity={0.14} />
      <rect x={cx0 + 10} y={cy0 + 14} width={6} height={ch - 28} rx={3} fill={col} />
      <text x={lx + 6} y={cy0 + 44} textAnchor="middle" fill="#fff" style={{ font: `800 36px ${FONT.ui}`, letterSpacing: '0.06em' }}>{name}</text>
      <text x={lx + 6} y={cy0 + 74} textAnchor="middle" fill={col} style={{ font: `600 22px ${FONT.mono}` }}>{sub}</text></g>; })()}
  </g>; };

export const Planet: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  return (
    <AbsoluteFill style={{ background: '#03041a' }}>
      <ThreeCanvas width={F.W} height={F.H} gl={{ antialias: true }} camera={{ fov: 44, near: 0.1, far: 600 }}>
        <Cam t={t} />
        <color attach="background" args={['#03041a']} />
        <ambientLight intensity={0.5} color="#8f9cff" />
        <directionalLight position={[40, 26, 6]} intensity={1.6} color="#dfe6ff" />
        <Stars t={t} /><Earth t={t} />
        <EffectComposer><Bloom intensity={0.6} luminanceThreshold={0.8} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.25} darkness={0.7} /></EffectComposer>
      </ThreeCanvas>
      <AbsoluteFill><svg width={F.W} height={F.H}>
        <Pin t={t} at={LONDON} name="LONDON" col="#ff9c8a" a={5.6} dx={110} dy={-80} />
        <Pin t={t} at={HYD} name="HYDERABAD" col="#ffe08a" a={0.4} dx={-200} dy={-110} />
        <g opacity={seg(t, 0.5, 0.9) * (1 - seg(t, 3.6, 4.1))} {...EDGE} transform={tr(120, 890)}><text fill="#eef1ff" style={{ font: `800 54px ${FONT.ui}` }}>Arabian Sea</text><text y={46} fill="#ffc24a" style={{ font: `500 30px ${FONT.mono}` }}>our packet, on its way to the Red Sea</text></g>
      </svg></AbsoluteFill>
    </AbsoluteFill>
  );
};
