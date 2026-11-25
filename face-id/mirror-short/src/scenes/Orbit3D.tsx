import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { C, FONT, Label, ramp } from '../theme';
import { ISLAND_Y, P3, Phone3D, usePhoneModel } from './Phone3D';

// Full 3D scan: a real 3D model of the host's head (public/models/head.glb, Hunyuan3D from his
// near-front still) with the camera travelling from one side of his head to the other.
// g = frames from 0:08 (330 frames to 0:19).
//   0– 55  the iPhone's projector fires the dots; they fly through space and land on his face
// 112–132  the infrared camera reads the pattern: dots turn cyan (depth points)
// 185–197  the head becomes a shaded depth map (near = bright)
// 205–325  CLOSER (nose) and FARTHER (cheek) are marked on the depth map
const CYAN = '#7fe3ea', FOV = 30, UNIT = 1000, FLIGHT = 11, FL = 34;   // FL: flight of a dot in the red clip, in frames (fast start, slow-motion landing)
const hash = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

type Head = { geo: THREE.BufferGeometry; map: THREE.Texture; dots: Float32Array; rnd: Float32Array; n: number;
  nose: THREE.Vector3; cheek: THREE.Vector3; proj: THREE.Vector3; phonePos: THREE.Vector3; phoneQuat: THREE.Quaternion; zMin: number; zMax: number;
  mapIr: THREE.Texture;                    // the same texture in grey, for the infrared look
  centre: number[];                        // middle of his face (x, y) and the flat reference depth z
  lattice: { pts: number[][]; runs: number[][] };   // a latitude / longitude web on his face: points [x, y, z] and the lines (index runs)
  grid: number[][] };                      // a regular grid over his face and around it: [x, y, z on the face, 1 if on the face]
export type HeadApi = { S: (x: number, y: number, z: number) => [number, number]; head: Head };
const PS = 0.95;

const useHead = (): Head | null => {
  const [head, setHead] = useState<Head | null>(null);
  const [h] = useState(() => delayRender('head.glb', { timeoutInMilliseconds: 120000 }));
  useEffect(() => {
    new GLTFLoader().load(staticFile('models/head.glb'), async (gltf) => {
      const map = await new THREE.TextureLoader().loadAsync(staticFile('models/head_tex.jpg'));
      map.flipY = false; map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
      let mesh: THREE.Mesh | null = null;
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((o) => { if ((o as THREE.Mesh).isMesh && !mesh) mesh = o as THREE.Mesh; });
      const m = mesh! as THREE.Mesh;
      const geo = m.geometry.clone().applyMatrix4(m.matrixWorld).scale(UNIT, UNIT, UNIT);
      if (FLIP) geo.rotateY(Math.PI);
      geo.computeBoundingBox();
      const b = geo.boundingBox!;
      geo.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
      geo.computeBoundingBox();
      const P = geo.attributes.position, Nn = geo.attributes.normal, H = geo.boundingBox!.max.y;
      // nose tip = the most forward point of the head (upper part of the bust)
      const nose = new THREE.Vector3(0, 0, -1e9);
      for (let i = 0; i < P.count; i++) if (P.getY(i) > H * 0.45 && P.getY(i) < H * 0.8 && Math.abs(P.getX(i)) < 60 && P.getZ(i) > nose.z) nose.set(P.getX(i), P.getY(i), P.getZ(i));
      // a point on his cheek, beside the nose
      const cheek = new THREE.Vector3(0, 0, -1e9), tx = nose.x + 95, ty = nose.y - 5;
      for (let i = 0; i < P.count; i++) if (Math.abs(P.getX(i) - tx) < 7 && Math.abs(P.getY(i) - ty) < 7 && P.getZ(i) > cheek.z) cheek.set(P.getX(i), P.getY(i), P.getZ(i));
      // phone: held in front of him, a little below his face and tilted up at it
      const ph = new THREE.Object3D();
      ph.position.set(nose.x, nose.y - 210, nose.z + 430); ph.lookAt(nose.x, nose.y - 20, nose.z); ph.updateMatrixWorld();
      const proj = ph.localToWorld(new THREE.Vector3(-13 * PS, ISLAND_Y * PS, (P3.d / 2 + 1.5) * PS));
      // depth-map look baked into vertex colours: nearer the phone = brighter, lightly shaded by the surface
      const colr = new Float32Array(P.count * 3), Lg = new THREE.Vector3(0.2, 0.3, 1).normalize(), nv = new THREE.Vector3();
      for (let i = 0; i < P.count; i++) {
        const tt = Math.min(1, Math.max(0, (P.getZ(i) - (nose.z - 270)) / 270)), dd = Math.pow(tt * tt * (3 - 2 * tt), 1.4);
        nv.fromBufferAttribute(Nn, i);
        const c = Math.pow((0.06 + 0.94 * dd) * (0.8 + 0.2 * Math.max(0, nv.dot(Lg))), 2.2);    // to linear for the renderer
        colr[i * 3] = c; colr[i * 3 + 1] = c; colr[i * 3 + 2] = c;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
      // dots: surface points of the head that face the projector
      const cand: number[] = [];
      const v = new THREE.Vector3(), nn = new THREE.Vector3(), d = new THREE.Vector3();
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i); if (v.y < nose.y - 190) continue;
        nn.fromBufferAttribute(Nn, i); d.copy(proj).sub(v).normalize();
        if (nn.dot(d) > 0.22) cand.push(i);
      }
      const step = Math.max(1, Math.floor(cand.length / 7000)), n = Math.floor(cand.length / step);
      const dots = new Float32Array(n * 3), rnd = new Float32Array(n);
      for (let k = 0; k < n; k++) { const i = cand[k * step]; nn.fromBufferAttribute(Nn, i); dots[k * 3] = P.getX(i) + nn.x * 2; dots[k * 3 + 1] = P.getY(i) + nn.y * 2; dots[k * 3 + 2] = P.getZ(i) + nn.z * 2; rnd[k] = hash(i); }
      // ---- the face as data, for the explainers (all taken from this same head) ----
      const img = map.image as HTMLImageElement, cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
      const cx2 = cv.getContext('2d')!; cx2.drawImage(img, 0, 0); const px = cx2.getImageData(0, 0, cv.width, cv.height);
      const UVa = geo.attributes.uv, CELL = 5, zmap = new Map<string, number[]>();          // front surface: cell -> [z, brightness]
      for (let i = 0; i < P.count; i++) {
        if (Nn.getZ(i) < 0.12 || P.getZ(i) < nose.z - 175) continue;
        const k = `${Math.round(P.getX(i) / CELL)},${Math.round(P.getY(i) / CELL)}`, o = (Math.min(cv.height - 1, Math.floor(UVa.getY(i) * cv.height)) * cv.width + Math.min(cv.width - 1, Math.floor(UVa.getX(i) * cv.width))) * 4;
        const cur = zmap.get(k); if (!cur || P.getZ(i) > cur[0]) zmap.set(k, [P.getZ(i), px.data[o] + px.data[o + 1] + px.data[o + 2]]);
      }
      const FCX = nose.x - 40, FCY = nose.y + 16;                                          // middle of his face (the head is turned a little)
      const face = (x: number, y: number): number | null => {
        // squarer at the top so the whole forehead is inside, up to the hairline (the hair itself is excluded below)
        const dx = Math.abs(x - FCX) / (y > FCY ? 168 : 156), dy = Math.abs(y - FCY) / (y > FCY ? 262 : 200), e = y > FCY ? 3.2 : 2; if (Math.pow(dx, e) + Math.pow(dy, e) > 1) return null;
        let best: number[] | null = null;
        for (let a = -1; a <= 1 && !best; a++) for (let b = -1; b <= 1 && !best; b++) best = zmap.get(`${Math.round(x / CELL) + a},${Math.round(y / CELL) + b}`) ?? null;
        if (!best || (y - nose.y > 150 && best[1] < 165)) return null;                      // no surface here, or hair above the forehead
        return best[0];
      };
      const lpts: number[][] = [], runs: number[][] = [], idx = new Map<string, number>(), US: number[] = [], STEP = 0.092;
      for (let u = -1.38; u <= 1.381; u += STEP) US.push(u);
      const at = (u: number, v: number) => [FCX + 160 * Math.sin(u) * (v > 0 ? 0.9 + 0.1 * Math.cos(v) : 0.74 + 0.26 * Math.cos(v)), FCY + (v > 0 ? 262 : 208) * Math.sin(v) - (v > 0 ? 30 : 52) * (1 - Math.cos(u)) * Math.sin(v)];
      // depth at every crossing; small holes inside the face (an eye socket, a nostril) are filled from the crossings either side
      const Z: (number | null)[][] = US.map((v) => US.map((u) => { const [x, y] = at(u, v); return face(x, y); }));
      for (let pass = 0; pass < 2; pass++) US.forEach((_, a) => US.forEach((_, b) => {
        if (Z[a][b] !== null) return;
        for (const [da, db] of [[0, 1], [1, 0]]) {
          let p = 0, q = 0;
          for (let k = 1; k <= 3 && !p; k++) if (Z[a - da * k]?.[b - db * k] != null) p = k;
          for (let k = 1; k <= 3 && !q; k++) if (Z[a + da * k]?.[b + db * k] != null) q = k;
          if (p && q) { Z[a][b] = (Z[a - da * p][b - db * p]! * q + Z[a + da * q][b + db * q]! * p) / (p + q); return; }
        }
      }));
      US.forEach((v, a) => US.forEach((u, b) => { const [x, y] = at(u, v), z = Z[a][b]; if (z !== null) { idx.set(`${a},${b}`, lpts.length); lpts.push([x, y, z]); } }));
      const collect = (key: (i: number, j: number) => string) => US.forEach((_, i) => { let cur: number[] = []; US.forEach((_, j) => { const k = idx.get(key(i, j)); if (k !== undefined) cur.push(k); else { if (cur.length > 1) runs.push(cur); cur = []; } }); if (cur.length > 1) runs.push(cur); });
      collect((i, j) => `${i},${j}`); collect((i, j) => `${j},${i}`);
      const grid: number[][] = [];
      for (let y = FCY - 232; y <= FCY + 265; y += 11) for (let x = FCX - 176; x <= FCX + 176; x += 11) { const z = face(x, y); grid.push([x, y, z ?? 0, z === null ? 0 : 1]); }
      // grey copy of the texture (infrared look)
      for (let i = 0; i < px.data.length; i += 4) { const v = 0.3 * px.data[i] + 0.55 * px.data[i + 1] + 0.15 * px.data[i + 2]; px.data[i] = px.data[i + 1] = px.data[i + 2] = Math.min(255, v * 1.25); }
      cx2.putImageData(px, 0, 0); const mapIr = new THREE.CanvasTexture(cv); mapIr.flipY = false; mapIr.colorSpace = THREE.SRGBColorSpace; mapIr.anisotropy = 8;
      setHead({ geo, map, dots, rnd, n, nose, cheek, proj, phonePos: ph.position.clone(), phoneQuat: ph.quaternion.clone(), zMin: nose.z - 260, zMax: nose.z,
        mapIr, centre: [FCX, FCY, nose.z - 70], lattice: { pts: lpts, runs }, grid });
    });
  }, [h]);
  // release the frame only after the loaded head has been committed and the canvas has drawn it
  useEffect(() => { if (head) requestAnimationFrame(() => requestAnimationFrame(() => continueRender(h))); }, [head, h]);
  return head;
};
const FLIP = false;

// camera: one continuous move from the left of his head to the right
// red clip: stays on his side profile (a short arc); cyan clip: near the front, ending straight on
// ALIGN: camera that puts this 3D head where the frontal face of Scan.tsx (zoom FZ) is: same eye line, nose and size.
export const ALIGN = { d: 1800, dx: -21, dy: 87 };
export type View = { az: number; dist?: number };                         // explainer camera: turn (degrees) round his face, and distance
const camAt = (g: number, head: Head, cyan?: number, pov?: number, align?: boolean, view?: View) => {
  if (view) {
    const c = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 10, 9000), a = (view.az * Math.PI) / 180, d = (view.dist ?? ALIGN.d) + 90;
    const px = head.nose.x + ALIGN.dx, py = head.nose.y + ALIGN.dy, pz = head.nose.z - 90;
    c.position.set(px + d * Math.sin(a), py, pz + d * Math.cos(a)); c.lookAt(px, py, pz); c.updateMatrixWorld(); c.updateProjectionMatrix();
    return c;
  }
  if (align) {
    const c = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 10, 9000);
    c.position.set(head.nose.x + ALIGN.dx, head.nose.y + ALIGN.dy, head.nose.z + ALIGN.d);
    c.lookAt(head.nose.x + ALIGN.dx, head.nose.y + ALIGN.dy, head.nose.z); c.updateMatrixWorld(); c.updateProjectionMatrix();
    return c;
  }
  if (pov !== undefined) {                 // the mirror's point of view: straight at him, from where the glass is
    const c = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 10, 9000), e = 1 - Math.pow(1 - Math.min(1, pov / 14), 3);
    // a short push that settles (by frame 14) exactly on the framing of the frontal face that follows
    c.position.set(head.nose.x + ALIGN.dx, head.nose.y + ALIGN.dy, head.nose.z + ALIGN.d + 420 * (1 - e));
    c.lookAt(head.nose.x + ALIGN.dx, head.nose.y + ALIGN.dy, head.nose.z); c.updateMatrixWorld(); c.updateProjectionMatrix();
    return c;
  }
  const u = Math.min(1, Math.max(0, cyan !== undefined ? cyan / 32 : g / 164)), e = u * u * (3 - 2 * u);
  const az = ((cyan !== undefined ? -16 + 16 * e : -64 + 30 * (0.35 * u + 0.65 * e)) * Math.PI) / 180;
  const dist = cyan !== undefined ? 2550 - 150 * e : 3300 - 700 * e;
  const t = new THREE.Vector3(head.nose.x, head.nose.y - 70 - 60 * (1 - ramp(g, 40, 120)), head.nose.z - 60 + 60 * (1 - ramp(g, 60, 170)));
  const cam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 10, 9000);
  cam.position.set(t.x + dist * Math.sin(az), t.y + 60, t.z + dist * Math.cos(az));
  cam.lookAt(t); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  return cam;
};
const toScreen = (cam: THREE.Camera, p: THREE.Vector3) => { const v = p.clone().project(cam); return [(v.x + 1) * 540, (1 - v.y) * 960]; };

const PVS = `attribute float aSize; attribute vec3 aCol; uniform float uScale; varying vec3 vCol;
void main(){ vCol = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`;
const PFS = `varying vec3 vCol; uniform float uO;
void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; if (r > 1.0) discard; float a = smoothstep(1.0, 0.35, r);
  gl_FragColor = vec4(mix(vCol, vec3(1.0), smoothstep(0.5, 0.0, r) * 0.7) * a * uO, a * uO); }`;
const RED = new THREE.Color(C.ir), CY = new THREE.Color(CYAN);

const Inner: React.FC<{ g: number; cyan?: number; pov?: number; align?: boolean; cam: THREE.PerspectiveCamera; head: Head; phone: THREE.Object3D; ex?: Explain; look?: Look }> = ({ g, cyan, pov, align, cam, head, phone, ex, look }) => {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene), advance = useThree((s) => s.advance);
  // the canvas only draws on demand: draw after every commit of this scene so no frame is left blank
  useEffect(() => { advance(performance.now()); });
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
    return () => pm.dispose();
  }, [gl, scene]);
  useLayoutEffect(() => {
    camera.position.copy(cam.position); camera.quaternion.copy(cam.quaternion);
    camera.fov = FOV; camera.near = 10; camera.far = 9000; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  }, [cam, camera]);

  const { dots, rnd, n } = head;
  // mirror view: he holds the phone beside his face with its front toward the mirror (toward us)
  const povPhone = useMemo(() => { const o = new THREE.Object3D(); o.position.set(head.nose.x + 200, head.nose.y - 150, head.nose.z + 150); o.rotation.set(-0.04, -0.16, 0.04); o.updateMatrixWorld();
    return { pos: o.position.clone(), quat: o.quaternion.clone(), proj: o.localToWorld(new THREE.Vector3(-13 * PS, ISLAND_Y * PS, (P3.d / 2 + 1.5) * PS)) }; }, [head]);
  const proj = pov !== undefined ? povPhone.proj : head.proj, ZG = head.nose.z + 900;     // ZG: where the glass is
  const launch = useMemo(() => { const a = new Float32Array(n); let far = 0;
    for (let i = 0; i < n; i++) far = Math.max(far, Math.hypot(dots[i * 3] - proj.x, dots[i * 3 + 1] - proj.y, dots[i * 3 + 2] - proj.z));
    for (let i = 0; i < n; i++) a[i] = 3 + (1 - (dots[i * 3 + 1] - (head.nose.y - 190)) / 420) * 30 + rnd[i] * 6;   // top of the head first, sweeping down
    return a; }, [dots, rnd, n, proj, head.nose.y]);
  const toDepth = ex ? ex.depth ?? 0 : ramp(g, 185, 197);
  const pts = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(n), 1));
    geo.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const mat = new THREE.ShaderMaterial({ vertexShader: PVS, fragmentShader: PFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 1 }, uO: { value: 1 } } });
    return { geo, mat };
  }, [n]);
  const RAYS = 520;
  const rays = useMemo(() => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RAYS * 6), 3)); return geo; }, []);
  const pos = pts.geo.attributes.position.array as Float32Array, size = pts.geo.attributes.aSize.array as Float32Array, col = pts.geo.attributes.aCol.array as Float32Array;
  // mirror view: no flying dots. Rays go from the phone to the glass and back to his face; they sweep across his face
  // from left to right, and a dot appears wherever a ray lands.
  const povAt = (i: number) => 3 + Math.min(1, Math.max(0, (dots[i * 3] + 190) / 380)) * 24 + rnd[i] * 2;
  for (let i = 0; pov !== undefined && i < n; i++) {
    const t0 = povAt(i) + 3, on = pov >= t0;
    pos[i * 3] = dots[i * 3]; pos[i * 3 + 1] = dots[i * 3 + 1]; pos[i * 3 + 2] = dots[i * 3 + 2];
    size[i] = on ? 4.6 * (1 + 1.3 * (1 - ramp(pov, t0, t0 + 6))) : 0;
    col[i * 3] = RED.r; col[i * 3 + 1] = RED.g; col[i * 3 + 2] = RED.b;
  }
  // each dot leaves the phone fast, then goes into slow motion for the last stretch just before it lands on his face
  for (let i = 0; pov === undefined && i < n; i++) {
    const p = Math.min(1, Math.max(0, (g - launch[i]) / FL)), e = p < 0.22 ? 0.8 * (p / 0.22) : 0.8 + 0.2 * ((p - 0.22) / 0.78);
    pos[i * 3] = proj.x + (dots[i * 3] - proj.x) * e; pos[i * 3 + 1] = proj.y + (dots[i * 3 + 1] - proj.y) * e; pos[i * 3 + 2] = proj.z + (dots[i * 3 + 2] - proj.z) * e;
    const land = ramp(g, launch[i] + FL, launch[i] + FL + 5);
    size[i] = p <= 0 ? 0 : p < 1 ? (p > 0.22 ? 7.5 : 6.5) : 4.4 * (1 + 0.9 * (1 - land));
    const c = cyan !== undefined && cyan >= ((dots[i * 3] + 200) / 400) * 12 + rnd[i] * 4 ? CY : RED;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  pts.geo.attributes.position.needsUpdate = true; pts.geo.attributes.aSize.needsUpdate = true; pts.geo.attributes.aCol.needsUpdate = true;
  pts.mat.uniforms.uScale.value = gl.domElement.height / (2 * Math.tan((FOV * Math.PI) / 360));
  pts.mat.uniforms.uO.value = ex ? ex.dotO ?? 0 : look === 'eye' ? 0 : 1 - ramp(g, 190, 202);
  const rp = rays.attributes.position.array as Float32Array, stride = Math.max(1, Math.floor(n / RAYS)), off = Math.floor(g / 2) % stride;
  for (let k = 0; k < RAYS; k++) {
    const i = (k * stride + off) % n, on = g >= launch[i] + FL;
    rp[k * 6] = proj.x; rp[k * 6 + 1] = proj.y; rp[k * 6 + 2] = proj.z;
    rp[k * 6 + 3] = on ? dots[i * 3] : proj.x; rp[k * 6 + 4] = on ? dots[i * 3 + 1] : proj.y; rp[k * 6 + 5] = on ? dots[i * 3 + 2] : proj.z;
  }
  // mirror view: the light path is drawn as two legs per ray, phone -> glass and glass -> face
  const hitOf = (i: number) => { const u = (ZG - proj.z) / (2 * ZG - dots[i * 3 + 2] - proj.z); return [proj.x + (dots[i * 3] - proj.x) * u, proj.y + (dots[i * 3 + 1] - proj.y) * u]; };
  for (let k = 0; pov !== undefined && k < RAYS; k++) {
    const i = (Math.floor(k / 2) * stride * 2) % n, [hx, hy] = hitOf(i), out = k % 2 === 0, t0 = povAt(i);
    // a ray is drawn while it is the one landing (the fan sweeps left to right); every sixth ray stays on afterwards
    const show = pov >= t0 && (pov < t0 + 9 || Math.floor(k / 2) % 6 === 0);
    rp[k * 6] = out ? proj.x : hx; rp[k * 6 + 1] = out ? proj.y : hy; rp[k * 6 + 2] = out ? proj.z : ZG;
    rp[k * 6 + 3] = !show ? rp[k * 6] : out ? hx : dots[i * 3]; rp[k * 6 + 4] = !show ? rp[k * 6 + 1] : out ? hy : dots[i * 3 + 1]; rp[k * 6 + 5] = !show ? rp[k * 6 + 2] : out ? ZG : dots[i * 3 + 2];
  }
  rays.attributes.position.needsUpdate = true;
  const rayO = cyan !== undefined || ex || look ? 0 : pov !== undefined ? 0.5 : 0.2 * ramp(g, 4, 10);
  // where the middle of the pattern meets the glass: the reflecting waves spread from here
  const noseHit = (() => { const u = (ZG - proj.z) / (2 * ZG - head.nose.z - proj.z); return [proj.x + (head.nose.x - proj.x) * u, proj.y + (head.nose.y - 40 - proj.y) * u]; })();
  return (
    <>
      {toDepth < 1 && <mesh geometry={head.geo}><meshBasicMaterial map={ex?.tone === 'ir' || look === 'cam' ? head.mapIr : head.map} color={ex ? ex.tint ?? (ex.tone === 'ir' ? '#8e8e8e' : '#d9b79c') : look === 'eye' ? '#d9b79c' : look === 'cam' ? '#8e8e8e' : pov !== undefined ? '#c9a184' : '#7c7c7c'} /></mesh>}
      {toDepth > 0 && <mesh geometry={head.geo}><meshBasicMaterial vertexColors color={ex ? '#8fb2ff' : '#ffffff'} transparent opacity={toDepth} /></mesh>}
      <lineSegments geometry={rays}><lineBasicMaterial color={C.ir} transparent opacity={rayO} blending={THREE.AdditiveBlending} depthWrite={false} /></lineSegments>
      <points geometry={pts.geo} material={pts.mat} frustumCulled={false} />
      {/* reflecting waves on the glass: rings that spread out from where the light bounces, again and again */}
      {pov !== undefined && pov > 8 && [0, 1, 2].map((k) => { const u = (((pov - 8) / 20) + k / 3) % 1, r = 6 + 58 * u;
        return <mesh key={k} position={[noseHit[0], noseHit[1], ZG]}><ringGeometry args={[r, r + 2 - 1.2 * u, 64]} /><meshBasicMaterial color="#ff8fa0" transparent opacity={0.6 * (1 - u) * ramp(pov, 8, 12)} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>; })}
      {pov !== undefined && pov > 8 && <mesh position={[noseHit[0], noseHit[1], ZG]}><circleGeometry args={[14, 32]} /><meshBasicMaterial color={C.ir} transparent opacity={0.2 + 0.06 * Math.sin(pov / 2)} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} /></mesh>}
      <ambientLight intensity={0.5} />
      <directionalLight position={[600, 900, 2200]} intensity={2.2} />
      <pointLight position={[-700, 900, 900]} intensity={3} color="#ffb060" decay={0} />
      <group visible={!align && !ex} position={pov !== undefined ? povPhone.pos : head.phonePos} quaternion={pov !== undefined ? povPhone.quat : head.phoneQuat} scale={PS}>
        <Phone3D model={phone} />
        <mesh position={[-13, ISLAND_Y, P3.d / 2 + 1.2]}><circleGeometry args={[4, 20]} /><meshBasicMaterial color="#ffffff" /></mesh>
        <mesh position={[-13, ISLAND_Y, P3.d / 2 + 1.1]}><circleGeometry args={[15, 24]} /><meshBasicMaterial color={C.ir} transparent opacity={cyan !== undefined || look ? 0 : 0.75} blending={THREE.AdditiveBlending} /></mesh>
      </group>
    </>
  );
};

const Mark: React.FC<{ x: number; y: number; text: string; sub: string; dx: number; o: number }> = ({ x, y, text, sub, dx, o }) => (
  <>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <path d={`M ${x + dx} ${y + 190} L ${x} ${y}`} stroke="#fff" strokeWidth={3} fill="none" />
      <circle cx={x} cy={y} r={15} fill="none" stroke={C.amber} strokeWidth={4} /><circle cx={x} cy={y} r={5} fill="#fff" />
    </svg>
    <div style={{ position: 'absolute', left: Math.min(760, Math.max(60, x + dx - 130)), top: y + 190, opacity: o, padding: '12px 20px', borderRadius: 10, background: 'rgba(10,8,7,.75)', border: `2px solid ${C.amber}` }}>
      <div style={{ font: `800 36px/1 ${FONT}`, letterSpacing: '0.12em', color: '#fff' }}>{text}</div>
      <div style={{ font: `600 26px/1 ${FONT}`, color: '#c9c2bb', marginTop: 8 }}>{sub}</div>
    </div>
  </>
);

// cyan === undefined: the red dots clip (g = its frame). cyan = frame of the point-cloud clip: all dots have landed and turn cyan.
// pov = frame of the mirror's-point-of-view clip: we look at him from the mirror; the dots fly at us, hit the glass and go back to his face.
// ex = explainer mode: the same head with a chosen camera, look and overlay (no phone, no captions of its own).
export type Explain = { view: View; tone?: 'colour' | 'ir'; tint?: string; depth?: number; dotO?: number; bg?: string; overlay?: (api: HeadApi) => React.ReactNode };
// look: the same shot shown two ways, with nothing else changed. 'eye' = what you see (colour, no dots: they are invisible);
// 'cam' = what the infrared camera sees (grey, with the dot pattern).
export type Look = 'eye' | 'cam';
export const Orbit3D: React.FC<{ g: number; cyan?: number; pov?: number; align?: boolean; ex?: Explain; look?: Look }> = ({ g, cyan, pov, align, ex, look }) => {
  const head = useHead(), phone = usePhoneModel();
  const cam = useMemo(() => (head ? camAt(g, head, cyan, pov, align, ex?.view) : null), [g, head, cyan, pov, align, ex?.view.az, ex?.view.dist]);
  const nose = head && cam ? toScreen(cam, head.nose) : [0, 0], cheek = head && cam ? toScreen(cam, head.cheek) : [0, 0];
  return (
    <AbsoluteFill style={{ backgroundColor: ex?.bg ?? '#070606' }}>
      {pov !== undefined && <AbsoluteFill style={{ background: 'radial-gradient(90% 60% at 30% 22%, #6b3d1c 0%, #2a1a10 45%, #0d0907 100%)' }} />}
      <ThreeCanvas width={1080} height={1920} flat gl={{ antialias: true, alpha: true }} style={{ position: 'absolute', inset: 0 }} camera={{ fov: FOV, near: 10, far: 9000 }}>
        {head && phone && cam && <Inner g={g} cyan={cyan} pov={pov} align={align} cam={cam} head={head} phone={phone} ex={ex} look={look} />}
      </ThreeCanvas>
      {ex && head && cam && ex.overlay && (() => { const v = new THREE.Vector3(); return <AbsoluteFill>{ex.overlay({ head, S: (x, y, z) => { v.set(x, y, z).project(cam); return [(v.x + 1) * 540, (1 - v.y) * 960]; } })}</AbsoluteFill>; })()}
      <Mark x={nose[0]} y={nose[1]} text="CLOSER" sub="nose" dx={-150} o={ramp(g, 205, 209) * (1 - ramp(g, 322, 328))} />
      <Mark x={cheek[0]} y={cheek[1]} text="FARTHER" sub="cheek" dx={170} o={ramp(g, 270, 274) * (1 - ramp(g, 322, 328))} />
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1425, textAlign: 'center', opacity: cyan !== undefined || pov !== undefined || ex || look ? 0 : ramp(g, 40, 44), color: C.ir, font: `800 112px/1 ${FONT}` }}>
        30,000+ <span style={{ fontSize: 46, letterSpacing: '0.06em' }}>DOTS</span>
      </div>
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1425, textAlign: 'center', opacity: cyan !== undefined && !ex ? ramp(cyan, 8, 12) : 0, color: CYAN, font: `800 104px/1 ${FONT}` }}>
        30,000+ <span style={{ fontSize: 42, letterSpacing: '0.06em' }}>DEPTH POINTS</span>
      </div>
      <Label text="DEPTH MAP" x={505} y={1500} o={ramp(g, 197, 201)} align="center" />
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: ex || look ? 0 : 0.5 * (1 - ramp(g, 185, 197)), font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>3D illustration · dot count: Apple · fewer dots drawn than fired · invisible to the eye</div>
    </AbsoluteFill>
  );
};
