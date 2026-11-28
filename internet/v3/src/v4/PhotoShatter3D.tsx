import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FONT } from '../lib/palette';
import { DOG_N, DOG_C } from './dog-tiles';

/* Part 2 v6: the photo breaks into real 3D pieces (1,936 tiles), they tumble through the air, then turn into the ring of amber packets
   (the next shot, PktStoryV, continues from that ring). 9:16. Tiles take their colour from the dog photo. */
export const SHATTER_FRAMES = 108;
const N = DOG_N, COUNT = N * N, SZ = 4.5, S = SZ / N;
const sm = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); };
const AMBER = ['#ffd27a', '#f2a93a', '#c98318', '#ffe3a0'].map((c) => new THREE.Color(c));

const Cam: React.FC<{ t: number }> = ({ t }) => { const { camera } = useThree(); useLayoutEffect(() => { camera.position.set(Math.sin(t * 0.7) * 1.1 * sm((t - 0.6) / 1.0), 0.2 * sm((t - 0.6) / 1.0), 11.2 - 0.7 * sm(t / 1.4)); camera.lookAt(0, 0, 0); (camera as THREE.PerspectiveCamera).fov = 42; (camera as THREE.PerspectiveCamera).updateProjectionMatrix(); }, [t, camera]); return null; };

const Tiles: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const base = useMemo(() => DOG_C.map((c) => new THREE.Color('#' + c)), []);
  const rnd = useMemo(() => { let a = 123456789; const R = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; return Array.from({ length: COUNT }, () => [R(), R(), R(), R(), R()]); }, []);
  useLayoutEffect(() => {
    const m = ref.current!; const o = new THREE.Object3D(), col = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      const ix = i % N, iy = Math.floor(i / N), x = (ix - (N - 1) / 2) * S, y = ((N - 1) / 2 - iy) * S, [h1, h2, h3, h4, h5] = rnd[i];
      const r = Math.hypot(x, y) / (SZ * 0.62), t0 = 1.0 + r * 1.15 + h1 * 0.3, tau = Math.max(0, t - t0), a = Math.atan2(y, x);
      // free flight
      const v = 1.0 + h2 * 2.0, vz = (h3 - 0.25) * 5.0, g = 0.45;
      let px = x + Math.cos(a + (h4 - 0.5) * 0.9) * v * tau, py = y + Math.sin(a + (h4 - 0.5) * 0.9) * v * tau - g * tau * tau, pz = vz * tau;
      const wx = (h2 - 0.5) * 9, wy = (h3 - 0.5) * 9, wz = (h5 - 0.5) * 9; let rx = wx * tau, ry = wy * tau, rz = wz * tau;
      // before the break: a trembling photo
      if (t < t0) { const k = sm((t - 0.45) / 0.5) * 0.022; px += Math.sin(t * 61 + h4 * 90) * k; py += Math.cos(t * 53 + h5 * 90) * k; pz += Math.sin(t * 47 + h3 * 90) * k * 0.6; }
      // then the pieces gather into the ring of amber packets
      const u = sm((t - 2.35) / 1.1); let sx = S * 0.97, sy = S * 0.97, sz = S * 0.55;
      col.copy(base[i]);
      if (u > 0) {
        const th = h1 * Math.PI * 2 + t * 0.55, rho = 1.25 + Math.sqrt(h2) * 1.0, tx = Math.cos(th) * rho, ty = Math.sin(th) * rho, tz = (h3 - 0.5) * 0.7;
        px += (tx - px) * u; py += (ty - py) * u; pz += (tz - pz) * u; rx = rx * (1 - u) + (0.4 + h4) * u; ry = ry * (1 - u) + (h5 - 0.5) * 0.8 * u; rz = rz * (1 - u) + (th + Math.PI / 2 + (h3 - 0.5)) * u;
        sx = S * 0.97 + (0.17 - S * 0.97) * u; sy = S * 0.97 + (0.11 - S * 0.97) * u; sz = S * 0.55 + (0.07 - S * 0.55) * u;
        col.lerp(AMBER[Math.floor(h5 * 4) % 4], u);
      }
      o.position.set(px, py, pz); o.rotation.set(rx, ry, rz); o.scale.set(sx, sy, sz); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, col);
    }
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [t, base, rnd]);
  return <instancedMesh ref={ref} args={[undefined, undefined, COUNT]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={0.42} metalness={0.2} emissive="#2a1a05" emissiveIntensity={0.25} /></instancedMesh>;
};

export const PhotoShatter3D: React.FC = () => {
  const f = useCurrentFrame(), t = f / 30, cnt = Math.round(COUNT * sm((t - 1.1) / 1.6) / 10) * 10, ms = 1 + Math.round(1 * sm((t - 1.5) / 2.0));
  return (<AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #0b1440 0%, #04061a 70%)' }}>
    <ThreeCanvas width={1080} height={1920} gl={{ antialias: true }} camera={{ fov: 42, near: 0.1, far: 100 }}>
      <Cam t={t} /><ambientLight intensity={0.95} /><directionalLight position={[3, 5, 9]} intensity={1.7} color="#fff1d8" /><directionalLight position={[-6, 2, -3]} intensity={0.7} color="#7f96ff" /><pointLight position={[0, 0, 5]} intensity={18} color="#ffb454" distance={14} />
      <Tiles t={t} />
      <EffectComposer><Bloom intensity={0.35} luminanceThreshold={0.9} luminanceSmoothing={0.2} mipmapBlur /><Vignette eskil={false} offset={0.25} darkness={0.7} /></EffectComposer>
    </ThreeCanvas>
    <div style={{ position: 'absolute', right: 70, top: 150, display: 'flex', alignItems: 'baseline', gap: 8, font: `800 120px/1 ${FONT.ui}`, color: '#7fd4ff', textShadow: '0 0 30px rgba(127,212,255,.6)' }}>{String(ms).padStart(3, '0')}<span style={{ font: `800 40px ${FONT.ui}` }}>ms</span></div>
    <div style={{ position: 'absolute', left: 60, top: 330, opacity: sm((t - 1.1) / 0.4), textShadow: '0 4px 14px rgba(0,0,0,.7)' }}><div style={{ font: `900 80px/1 ${FONT.ui}`, color: '#ffc94a' }}>{cnt.toLocaleString('en-US')}</div><div style={{ font: `600 30px ${FONT.mono}`, color: '#d6e4ff' }}>packets</div></div>
  </AbsoluteFill>);
};
