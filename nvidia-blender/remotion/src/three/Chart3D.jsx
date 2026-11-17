// Scene 6: the collapse as a 3D chart of verified closes (Oct 6 -> Nov 16, 2026).
// The ribbon draws itself, the camera dollies down with it, the GPU rides the line, green -> red.
import React, { useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame } from 'remotion';
import * as THREE from 'three';
import { C, W, H, CAPS, ramp, lerp, clamp } from '../theme';
import { CamRig, projector, StudioEnv, GpuModel } from './kit';
import { Title, R, Source } from '../ui';

const SX = 0.26, Y0 = 3.4, SY = 1.6;                 // x spacing per close; $3.4T at y=0; units per $1T
const pt = (i) => new THREE.Vector3(i * SX - 2.2, (CAPS[i][1] - Y0) * SY, 0);

export const Chart3D = ({ start, end, down35 }) => {
  const f = useCurrentFrame();
  const t = f / 30, lt = t - start, d = end - start;
  const draw = clamp(ramp(f, start + 0.2, d * 0.62));
  const n = CAPS.length - 1;
  const head = draw * n;
  const i0 = Math.floor(head), fr = head - i0;
  const hp = i0 >= n ? pt(n) : pt(i0).lerp(pt(i0 + 1), fr);
  const redness = clamp((5.77 - (CAPS[Math.min(i0, n)][1])) / 2.0);
  const bg = new THREE.Color('#0e1a10').lerp(new THREE.Color('#1c0709'), redness);
  // dolly: start wide on the peak, follow the head down and slightly in
  const wide = ramp(f, start + 0.2 + d * 0.62, 0.9);
  const fc = [hp.x + 0.4, hp.y + 0.3, 8.5], fl = [hp.x - 0.5, hp.y + 0.55, 0];       // follow the head (kept mid-frame)
  const wc = [0.45, 2.1, 15.5], wl = [0.45, 1.7, 0];                                 // wide: the whole fall
  const cam = fc.map((v, k) => lerp(v, wc[k], wide));
  const look = fl.map((v, k) => lerp(v, wl[k], wide));
  const P = projector(cam, look, 40);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(CAPS.map((_, i) => pt(i)), false, 'catmullrom', 0.15), []);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 400, 0.028, 10, false), [curve]);
  // wall under the line (vertex colors green -> red)
  const wall = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = [], col = [];
    const cg = new THREE.Color(C.green), cr = new THREE.Color(C.red);
    for (let k = 0; k <= 400; k++) {
      const p = curve.getPoint(k / 400);
      const c = cg.clone().lerp(cr, k / 400);
      pos.push(p.x, p.y, 0, p.x, -1.2, 0);
      col.push(c.r, c.g, c.b, c.r * 0.15, c.g * 0.15, c.b * 0.15);
    }
    const idx = [];
    for (let k = 0; k < 400; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    return g;
  }, [curve]);
  const tubeCount = Math.floor(tube.index.count * draw / 6) * 6;
  const wallCount = Math.floor(400 * draw) * 6;
  tube.setDrawRange(0, tubeCount);
  wall.setDrawRange(0, wallCount);
  const tilt = i0 < n ? Math.atan2(pt(Math.min(i0 + 1, n)).y - pt(i0).y, SX) : 0;
  const big = ramp(f, down35, 0.35);
  const lbl = (p, node, a = 1) => {
    const [x, y] = P(p);
    if (x < 140 || x > 880 || y < 470 || y > 1230) return null;           // keep labels inside the safe area
    return <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-100%)', opacity: a, whiteSpace: 'nowrap', textShadow: '0 4px 16px #000' }}>{node}</div>;
  };
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, #${bg.getHexString()}, ${C.bg} 75%)` }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <CamRig pos={cam} look={look} fov={40} />
        <StudioEnv />
        <ambientLight intensity={0.3} />
        <directionalLight position={[2, 5, 4]} intensity={1.8} />
        <pointLight position={[hp.x, hp.y + 1, 1.2]} color={redness > 0.5 ? C.red : C.green} intensity={6} distance={5} />
        {[4, 5, 6].map((v) => (
          <group key={v}>
            <mesh position={[0, (v - Y0) * SY, -0.01]}><planeGeometry args={[9, 0.008]} /><meshBasicMaterial color={v === 4 ? C.red : '#3a4148'} /></mesh>
          </group>
        ))}
        <mesh geometry={wall}><meshBasicMaterial vertexColors transparent opacity={0.35} side={THREE.DoubleSide} /></mesh>
        <mesh geometry={tube}><meshBasicMaterial color={new THREE.Color(C.green).lerp(new THREE.Color(C.red), redness)} toneMapped={false} /></mesh>
        <GpuModel scale={0.035} position={[hp.x, hp.y + 0.3, 0.05]} rotation={[0.9, 0, tilt * 0.8]} />
      </ThreeCanvas>
      {[4, 5, 6].map((v) => lbl([pt(0).x - 0.1, (v - Y0) * SY + 0.04, 0], <span style={{ font: '600 24px Inter', color: v === 4 ? C.red : '#9aa3ad' }}>${v}T</span>, 0.9))}
      {lbl(pt(0).toArray().map((v, k) => (k === 1 ? v + 0.35 : v)), <div style={{ font: "800 54px 'Inter Display',Inter", color: C.green }}>$5.77T<div style={{ font: '600 26px Inter', color: '#ddd' }}>record · Oct 6</div></div>, ramp(f, start + 0.1, 0.4) * (1 - ramp(f, start + 2.2, 0.4)))}
      {draw > 0.98 && lbl(pt(n).toArray().map((v, k) => (k === 1 ? v - 0.25 : v)), <div style={{ font: "800 54px 'Inter Display',Inter", color: C.red, transform: 'translateY(100%)' }}>$3.76T<div style={{ font: '600 26px Inter', color: '#ddd' }}>Nov 16 close</div></div>, ramp(f, start + 0.2 + d * 0.62, 0.3))}
      <div style={{ position: 'absolute', left: 90, right: 180, top: 440, textAlign: 'center', opacity: big, transform: `scale(${0.7 + 0.3 * big})` }}>
        <div style={{ font: "800 130px/1 'Inter Display',Inter", color: C.red, textShadow: '0 0 50px rgba(229,72,77,.45)' }}>−35%</div>
        <div style={{ font: '700 40px Inter', color: '#F5F5F5', marginTop: 8 }}>−$2.0T in 6 weeks</div>
      </div>
      <Title at={start + 0.1} sub="NVIDIA market value, daily closes">The <R>collapse</R></Title>
      <Source at={start + 0.6} top={1462}>Closes × 24.1B shares · 4 of 18 points derived · see RESEARCH.md</Source>
    </div>
  );
};
