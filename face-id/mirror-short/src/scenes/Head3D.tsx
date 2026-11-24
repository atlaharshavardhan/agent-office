import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, staticFile } from 'remotion';
import * as THREE from 'three';
import front from '../front.json';
import { FACE } from '../theme';

// The host's head, straight on to the phone's sensor, as a real 3D object: his face still mapped onto a
// relief built from his depth map (tools/prep_front.py). The camera is orthographic, so at az = 0 the head is pixel-for-pixel the
// original image — the face itself is never altered; turning it only adds parallax.
// Framing matches the 2D FaceStage (zoom about `ORIGIN`, shifted down by `DY`).
const ORIGIN: [number, number] = [376, 600], DY = 150, ZS = front.zs;
const PIVOT = new THREE.Vector3(0, 70, 105);                 // inside the head
const shape = (d: number) => (d > 0.6 ? 0.6 + (d - 0.6) * 0.5 : d);   // same curve as prep_3d.py
type Dot = [number, number, number, number];
const DOTS = front.dots as Dot[];
const N = DOTS.length;

const view = (zoom: number) => {
  const k = FACE.s * zoom;
  const sx = (540 / FACE.s - ORIGIN[0]) / zoom + ORIGIN[0], sy = ((960 + 5 - DY) / FACE.s - ORIGIN[1]) / zoom + ORIGIN[1];
  return { cx: sx - FACE.w / 2, cy: FACE.h / 2 - sy, hw: 540 / k, hh: 960 / k, k };
};
// screen position of a point on the face (source px + depth 0..1) for a given turn
export const headPoint = (p: { x: number; y: number; d: number }, az: number, zoom: number): [number, number] => {
  const v = new THREE.Vector3(p.x - FACE.w / 2, FACE.h / 2 - p.y, shape(p.d) * ZS).sub(PIVOT).applyAxisAngle(new THREE.Vector3(0, 1, 0), (az * Math.PI) / 180).add(PIVOT);
  const w = view(zoom);
  return [540 + (v.x - w.cx) * w.k, 960 - (v.y - w.cy) * w.k];
};

const useTex = (file: string) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [h] = useState(() => delayRender('texture ' + file));
  useEffect(() => { new THREE.TextureLoader().load(staticFile(file), (t) => { t.anisotropy = 8; setTex(t); continueRender(h); }); }, [file, h]);
  return tex;
};

const VS = `uniform sampler2D uRelief; uniform float uZS; varying vec2 vUv;
void main(){ vUv = uv; vec3 p = position; p.z += texture2D(uRelief, uv).r * uZS; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
const FS = `uniform sampler2D uFace; uniform sampler2D uIr; uniform sampler2D uRelief; uniform float uIrMix; uniform float uDepth; varying vec2 vUv;
void main(){ vec4 r = texture2D(uRelief, vUv); if (r.g < 0.5) discard;
  vec3 c = texture2D(uFace, vUv).rgb;
  vec3 ir = texture2D(uIr, vUv).rgb * 0.58 * vec3(1.04, 1.0, 0.93);          // near-monochrome infrared look
  vec3 d = vec3(clamp((pow(r.b, 0.9) - 0.5) * 1.15 + 0.5, 0.0, 1.0));        // shaded depth map
  gl_FragColor = vec4(mix(mix(c, ir, uIrMix), d, uDepth), 1.0); }`;
const PVS = `attribute float aB; uniform float uSize; varying float vB;
void main(){ vB = aB; gl_PointSize = uSize * (0.85 + 0.3 * aB); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const PFS = `varying float vB; uniform float uO;
void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.7, r) * uO * (0.8 + 0.2 * vB); if (a < 0.01) discard;
  vec3 red = vec3(1.0, 0.16, 0.30);                                           // the channel's infrared red
  gl_FragColor = vec4(mix(red, vec3(1.0, 0.86, 0.88), smoothstep(0.5, 0.0, r) * 0.7), a); }`;

type P = { az: number; zoom: number; irMix: number; depthMix: number; dotO: number };
const Inner: React.FC<P & { face: THREE.Texture; ir: THREE.Texture; relief: THREE.Texture }> = ({ az, zoom, irMix, depthMix, dotO, face, ir, relief }) => {
  const gl = useThree((s) => s.gl), advance = useThree((s) => s.advance);
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;
  useEffect(() => { advance(performance.now()); });
  const w = view(zoom);
  useLayoutEffect(() => {
    camera.left = -w.hw; camera.right = w.hw; camera.top = w.hh; camera.bottom = -w.hh; camera.near = 1; camera.far = 8000; camera.zoom = 1;
    camera.position.set(w.cx, w.cy, 3000); camera.rotation.set(0, 0, 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  }, [camera, w.hw, w.hh, w.cx, w.cy]);
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS,
    uniforms: { uFace: { value: face }, uIr: { value: ir }, uRelief: { value: relief }, uZS: { value: ZS }, uIrMix: { value: 0 }, uDepth: { value: 0 } } }), [face, ir, relief]);
  mat.uniforms.uIrMix.value = irMix; mat.uniforms.uDepth.value = depthMix;
  const pts = useMemo(() => {
    const pos = new Float32Array(N * 3), b = new Float32Array(N);
    DOTS.forEach((d, i) => { pos[i * 3] = d[0] - FACE.w / 2; pos[i * 3 + 1] = FACE.h / 2 - d[1]; pos[i * 3 + 2] = shape(d[2]) * ZS + 2; b[i] = (d[3] * 7.3) % 1; });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aB', new THREE.BufferAttribute(b, 1));
    const m = new THREE.ShaderMaterial({ vertexShader: PVS, fragmentShader: PFS, transparent: true, depthTest: false, depthWrite: false, uniforms: { uSize: { value: 3 }, uO: { value: 0 } } });
    return { geo, m };
  }, []);
  pts.m.uniforms.uSize.value = 3.9 * w.k * (gl.domElement.height / 1920);     // ~2.7 source px across, crisp
  pts.m.uniforms.uO.value = dotO;
  return (
    <group position={PIVOT} rotation={[0, (az * Math.PI) / 180, 0]}>
      <group position={PIVOT.clone().negate()}>
        <mesh material={mat}><planeGeometry args={[FACE.w, FACE.h, 250, 446]} /></mesh>
        {dotO > 0.01 && <points geometry={pts.geo} material={pts.m} frustumCulled={false} />}
      </group>
    </group>
  );
};

export const Head3D: React.FC<P> = (p) => {
  const face = useTex('face_front.png'), ir = useTex('face_front_ir.png'), relief = useTex('relief_front.png');
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0908' }}>
      <ThreeCanvas width={1080} height={1920} flat linear orthographic gl={{ antialias: true }} camera={{ near: 1, far: 8000, position: [0, 0, 3000] }}>
        {face && ir && relief && <Inner {...p} face={face} ir={ir} relief={relief} />}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
