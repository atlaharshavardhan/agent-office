import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, hash, lerp } from '../lib/anim';
import { DUSK, Stick, StickPose } from './Dusk';

/* Isometric night street of individual houses (2.5D: flat-shaded iso drawn in SVG).
   World: x runs along the street, y across it, z up. Far row at y<0, near row at y>0. */
const S = 66, OX = 560, OY = 1040;
const iso = (x: number, y: number, z = 0) => [OX + (x - y) * 0.866 * S, OY + (x + y) * 0.5 * S - z * S] as const;
const P = (pts: (readonly [number, number])[]) => pts.map((p) => p.join(',')).join(' ');
const shade = (hex: string, k: number) => { const n = parseInt(hex.slice(1), 16); const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`; };

type H = { x0: number; y0: number; w: number; d: number; h: number; c: string; roof: 'flat' | 'gable' | 'hip'; hero?: 'boy' | 'girl'; seed: number };
const LIT = '#ffd38a';

const HouseIso: React.FC<{ b: H; f: number }> = ({ b, f }) => {
  const { x0, y0, w, d, h, c } = b; const x1 = x0 + w, y1 = y0 + d; const dim = b.hero ? 1 : 0.5;
  const floors = h > 2.6 ? 2 : 1, fh = h / floors;
  const fy = (u: number, v: number) => iso(x0 + u, y1, v);      // face toward lower-left (y1)
  const fx = (u: number, v: number) => iso(x1, y0 + u, v);      // face toward lower-right (x1)
  const win = (face: (u: number, v: number) => readonly [number, number], u: number, v: number, ww: number, wh: number, key: string, lit: boolean) => (
    <g key={key}>
      <polygon points={P([face(u, v), face(u + ww, v), face(u + ww, v + wh), face(u, v + wh)])} fill={lit ? (dim < 1 ? '#9a7f52' : LIT) : '#12142c'} />
      {lit && dim === 1 && <polygon points={P([face(u - 0.12, v - 0.12), face(u + ww + 0.12, v - 0.12), face(u + ww + 0.12, v + wh + 0.12), face(u - 0.12, v + wh + 0.12)])} fill="#ffc46a" opacity={0.22} filter="url(#iB)" />}
      <polygon points={P([face(u - 0.05, v - 0.07), face(u + ww + 0.05, v - 0.07), face(u + ww + 0.05, v), face(u - 0.05, v)])} fill={shade(c, 1.5)} />
    </g>
  );
  const lightCols = b.hero === 'boy' ? ['#7fe3d4', '#d6fff8', '#4fc9b8'] : b.hero === 'girl' ? ['#c9b8ff', '#f0e9ff', '#a58cf0'] : ['#ffd38a', '#fff1d6', '#ffb0a0'];
  const lights = (a: readonly [number, number], e: readonly [number, number], n: number, key: string) => Array.from({ length: n + 1 }).map((_, i) => { const u = i / n; const x = lerp(a[0], e[0], u), y = lerp(a[1], e[1], u) + Math.sin(u * Math.PI) * 9;
    const tw = (0.6 + 0.4 * Math.sin(b.seed * 3 + i * 1.7 + f / 6)) * (dim < 1 ? 0.45 : 1); const col = lightCols[i % lightCols.length];
    return <g key={key + i}><circle cx={x} cy={y} r={7} fill={col} opacity={0.3 * tw} /><circle cx={x} cy={y} r={2.6} fill={col} opacity={0.5 + 0.5 * tw} /></g>; });
  const rh = 1.0, yc = y0 + d / 2;
  return (
    <g>
      {/* soft ground shadow */}
      <polygon points={P([iso(x0, y1), iso(x1 + 0.5, y1 + 0.5), iso(x1 + 0.5, y0 + 0.5), iso(x1, y0)])} fill="#000" opacity={0.25} />
      {/* walls */}
      <polygon points={P([iso(x0, y1, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x0, y1, h)])} fill={shade(c, 1.0)} />
      <polygon points={P([iso(x1, y0, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x1, y0, h)])} fill={shade(c, 0.72)} />
      {floors === 2 && <><polygon points={P([fy(0, fh - 0.06), fy(w, fh - 0.06), fy(w, fh + 0.06), fy(0, fh + 0.06)])} fill={shade(c, 1.35)} /><polygon points={P([fx(0, fh - 0.06), fx(d, fh - 0.06), fx(d, fh + 0.06), fx(0, fh + 0.06)])} fill={shade(c, 1.0)} /></>}
      {/* windows + door */}
      {Array.from({ length: floors }).map((_, fl) => [0, 1].map((i) => win(fy, 0.35 + i * (w - 1.25), fl * fh + fh * 0.32, 0.55, fh * 0.42, `y${fl}${i}`, hash(b.seed * 7 + fl * 3 + i) < (dim < 1 ? 0.45 : 0.9))))}
      {Array.from({ length: floors }).map((_, fl) => [0, 1].map((i) => win(fx, 0.4 + i * (d - 1.35), fl * fh + fh * 0.32, 0.55, fh * 0.42, `x${fl}${i}`, hash(b.seed * 11 + fl * 5 + i) < (dim < 1 ? 0.4 : 0.9))))}
      <polygon points={P([fy(w / 2 - 0.28, 0), fy(w / 2 + 0.28, 0), fy(w / 2 + 0.28, fh * 0.62), fy(w / 2 - 0.28, fh * 0.62)])} fill="#0f1024" />
      <circle cx={fy(w / 2 + 0.5, fh * 0.6)[0]} cy={fy(w / 2 + 0.5, fh * 0.6)[1]} r={3.5} fill="#fff1d6" opacity={dim} />
      <circle cx={fy(w / 2 + 0.5, fh * 0.6)[0]} cy={fy(w / 2 + 0.5, fh * 0.6)[1]} r={26} fill="url(#iHalo)" opacity={0.7 * dim} />
      {/* roofs */}
      {b.roof === 'flat' && (
        <g>
          <polygon points={P([iso(x0 - 0.12, y0 - 0.12, h + 0.22), iso(x1 + 0.12, y0 - 0.12, h + 0.22), iso(x1 + 0.12, y1 + 0.12, h + 0.22), iso(x0 - 0.12, y1 + 0.12, h + 0.22)])} fill={shade(c, 1.45)} />
          <polygon points={P([iso(x0 + 0.1, y0 + 0.1, h + 0.22), iso(x1 - 0.1, y0 + 0.1, h + 0.22), iso(x1 - 0.1, y1 - 0.1, h + 0.22), iso(x0 + 0.1, y1 - 0.1, h + 0.22)])} fill={shade(c, 1.15)} />
          <polygon points={P([iso(x0 - 0.12, y1 + 0.12, h), iso(x1 + 0.12, y1 + 0.12, h), iso(x1 + 0.12, y1 + 0.12, h + 0.22), iso(x0 - 0.12, y1 + 0.12, h + 0.22)])} fill={shade(c, 1.2)} />
          <polygon points={P([iso(x1 + 0.12, y0 - 0.12, h), iso(x1 + 0.12, y1 + 0.12, h), iso(x1 + 0.12, y1 + 0.12, h + 0.22), iso(x1 + 0.12, y0 - 0.12, h + 0.22)])} fill={shade(c, 0.9)} />
          {/* water tank */}
          {(() => { const [tx, ty] = iso(x0 + 0.6, y0 + 0.6, h + 0.22); return <g><rect x={tx - 17} y={ty - 34} width={34} height={34} fill="#14152a" /><ellipse cx={tx} cy={ty} rx={17} ry={9} fill="#14152a" /><ellipse cx={tx} cy={ty - 34} rx={17} ry={9} fill="#232545" /></g>; })()}
          {lights(iso(x0 - 0.12, y1 + 0.12, h + 0.2), iso(x1 + 0.12, y1 + 0.12, h + 0.2), 9, 'a')}
          {lights(iso(x1 + 0.12, y1 + 0.12, h + 0.2), iso(x1 + 0.12, y0 - 0.12, h + 0.2), 9, 'b')}
        </g>
      )}
      {b.roof === 'gable' && (
        <g>
          <polygon points={P([iso(x0 - 0.15, y0 - 0.15, h), iso(x1 + 0.15, y0 - 0.15, h), iso(x1 + 0.15, yc, h + rh), iso(x0 - 0.15, yc, h + rh)])} fill={shade(c, 0.55)} />
          <polygon points={P([iso(x1, y0, h), iso(x1, y1, h), iso(x1, yc, h + rh)])} fill={shade(c, 0.72)} />
          <polygon points={P([iso(x0 - 0.15, y1 + 0.15, h - 0.05), iso(x1 + 0.15, y1 + 0.15, h - 0.05), iso(x1 + 0.15, yc, h + rh), iso(x0 - 0.15, yc, h + rh)])} fill={shade(c, 0.62)} />
          <polygon points={P([iso(x0 - 0.15, y1 + 0.15, h - 0.05), iso(x1 + 0.15, y1 + 0.15, h - 0.05), iso(x1 + 0.15, y1 + 0.15, h + 0.03), iso(x0 - 0.15, y1 + 0.15, h + 0.03)])} fill={shade(c, 1.3)} />
          {lights(iso(x0 - 0.15, y1 + 0.15, h - 0.02), iso(x1 + 0.15, y1 + 0.15, h - 0.02), 9, 'a')}
        </g>
      )}
      {b.roof === 'hip' && (
        <g>
          <polygon points={P([iso(x0 - 0.15, y1 + 0.15, h), iso(x1 + 0.15, y1 + 0.15, h), iso(x0 + w / 2, yc, h + rh * 1.2)])} fill={shade(c, 0.62)} />
          <polygon points={P([iso(x1 + 0.15, y0 - 0.15, h), iso(x1 + 0.15, y1 + 0.15, h), iso(x0 + w / 2, yc, h + rh * 1.2)])} fill={shade(c, 0.48)} />
          {lights(iso(x0 - 0.15, y1 + 0.15, h), iso(x1 + 0.15, y1 + 0.15, h), 9, 'a')}
          {lights(iso(x1 + 0.15, y1 + 0.15, h), iso(x1 + 0.15, y0 - 0.15, h), 9, 'b')}
        </g>
      )}
    </g>
  );
};
const TreeIso: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => { const [a, b] = iso(x, y); return (
  <g><ellipse cx={a + 6} cy={b + 4} rx={22 * s} ry={9 * s} fill="#000" opacity={0.25} /><rect x={a - 3} y={b - 38 * s} width={6} height={38 * s} fill="#1a1626" />
    <circle cx={a} cy={b - 58 * s} r={28 * s} fill="#234636" /><circle cx={a - 12 * s} cy={b - 44 * s} r={20 * s} fill="#1d3a2e" /><circle cx={a + 13 * s} cy={b - 46 * s} r={19 * s} fill="#1d3a2e" /><circle cx={a - 6 * s} cy={b - 66 * s} r={12 * s} fill="#2f5a46" opacity={0.7} /></g>); };
const LampIso: React.FC<{ x: number; y: number }> = ({ x, y }) => { const [a, b] = iso(x, y); return (
  <g><ellipse cx={a} cy={b + 6} rx={70} ry={30} fill="url(#iPool)" /><rect x={a - 2.5} y={b - 110} width={5} height={110} fill="#101022" /><circle cx={a} cy={b - 112} r={44} fill="url(#iHalo)" /><circle cx={a} cy={b - 112} r={7} fill="#fff3d6" /></g>); };

const C1 = ['#3a3f78', '#4a3f7a', '#34487a', '#51437c', '#3d4a82', '#4b3c70'];
const FAR: H[] = [
  { x0: -9.4, y0: -4.6, w: 2.4, d: 2.5, h: 2.2, c: C1[2], roof: 'hip', seed: 21 },
  { x0: -6.3, y0: -4.6, w: 2.4, d: 2.5, h: 2.0, c: C1[0], roof: 'gable', seed: 1 },
  { x0: -3.2, y0: -4.6, w: 2.4, d: 2.5, h: 2.3, c: C1[1], roof: 'hip', seed: 2 },
  { x0: -0.1, y0: -4.7, w: 2.6, d: 2.6, h: 3.3, c: '#5a4d94', roof: 'flat', hero: 'girl', seed: 3 },
  { x0: 3.2, y0: -4.6, w: 2.4, d: 2.5, h: 2.0, c: C1[3], roof: 'gable', seed: 4 },
  { x0: 6.3, y0: -4.6, w: 2.4, d: 2.5, h: 2.3, c: C1[4], roof: 'hip', seed: 22 },
];
const NEAR: H[] = [
  { x0: -9.4, y0: 2.1, w: 2.4, d: 2.5, h: 2.0, c: C1[1], roof: 'gable', seed: 23 },
  { x0: -6.3, y0: 2.1, w: 2.4, d: 2.5, h: 2.1, c: C1[4], roof: 'hip', seed: 5 },
  { x0: -3.2, y0: 2.0, w: 2.6, d: 2.6, h: 2.5, c: '#3f5a8c', roof: 'flat', hero: 'boy', seed: 6 },
  { x0: 0.1, y0: 2.1, w: 2.4, d: 2.5, h: 1.9, c: C1[5], roof: 'gable', seed: 7 },
  { x0: 3.2, y0: 2.1, w: 2.4, d: 2.5, h: 2.2, c: C1[2], roof: 'hip', seed: 8 },
  { x0: 6.3, y0: 2.1, w: 2.4, d: 2.5, h: 2.0, c: C1[0], roof: 'gable', seed: 24 },
];

export const IsoStreet: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const boyH = NEAR[2], girlH = FAR[3];
  const [bx, by] = iso(boyH.x0 + 1.5, boyH.y0 + 0.8, boyH.h + 0.22), [gx, gy] = iso(girlH.x0 + 1.2, girlH.y0 + 1.9, girlH.h + 0.22);
  const SC = 0.46;
  const boy: StickPose = { blink: 0, smile: 0.9, look: 0.8, armR: [108, 118], armL: [-12, -8], holdTorch: true, torch: 1, tilt: -4 };
  const girl: StickPose = { blink: 0, smile: 1, look: -0.8, armR: [150, 168 + Math.sin(t * 11) * 14], armL: [-10, -6], tilt: 4 };
  const lm = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l]; };
  const [ex, ey] = lm(16, -224, boy.armR[0], 62); const [wx, wy] = lm(ex, ey, boy.armR[1], 58); const tr = (90 - boy.armR[1]) * Math.PI / 180;
  const lens = { x: bx + (wx + Math.cos(tr) * 42) * SC, y: by + (wy + Math.sin(tr) * 42) * SC }, tgt = { x: gx - 4, y: gy - 170 * SC };
  const ang = Math.atan2(tgt.y - lens.y, tgt.x - lens.x) * 180 / Math.PI, len = Math.hypot(tgt.x - lens.x, tgt.y - lens.y);
  const X0 = -16, X1 = 16, Y0 = -5.6, Y1 = 6.4;
  return (
    <AbsoluteFill style={{ backgroundColor: '#05081a' }}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="iSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#04071a" /><stop offset=".55" stopColor="#0c1332" /><stop offset="1" stopColor="#141a44" /></linearGradient>
          <radialGradient id="iHalo"><stop offset="0" stopColor="#fff3d6" stopOpacity=".65" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
          <radialGradient id="iPool"><stop offset="0" stopColor="#ffc46a" stopOpacity=".4" /><stop offset="1" stopColor="#ffc46a" stopOpacity="0" /></radialGradient>
          <radialGradient id="iMilky"><stop offset="0" stopColor="#8f9be0" stopOpacity=".2" /><stop offset="1" stopColor="#8f9be0" stopOpacity="0" /></radialGradient>
          <linearGradient id="iBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fffaea" stopOpacity=".95" /><stop offset="1" stopColor="#ffe2b0" stopOpacity=".15" /></linearGradient>
          <filter id="iB"><feGaussianBlur stdDeviation="5" /></filter><filter id="iB2"><feGaussianBlur stdDeviation="9" /></filter>
        </defs>
        <rect width={1080} height={1920} fill="url(#iSky)" />
        <ellipse cx={540} cy={380} rx={700} ry={140} transform="rotate(-22 540 380)" fill="url(#iMilky)" />
        {Array.from({ length: 280 }).map((_, i) => { const tw = 0.55 + 0.45 * Math.sin(f / 9 + i * 2.3); return <circle key={i} cx={hash(i) * 1080} cy={hash(i + 9) * 1920} r={hash(i + 3) * 1.6 + 0.4} fill={i % 7 ? '#fff' : '#ffe6c2'} opacity={(0.2 + 0.7 * hash(i + 5)) * tw * (hash(i + 9) < 0.45 ? 1 : 0.35)} />; })}
        <g transform="translate(180 330)"><circle r={120} fill="#cfd8ff" opacity={0.07} /><circle r={44} fill="#f3eedb" /><circle cx={17} cy={-11} r={41} fill="#050819" /></g>
        {/* the diorama tile */}
        <polygon points={P([iso(X0, Y1, 0), iso(X1, Y1, 0), iso(X1, Y1, -0.7), iso(X0, Y1, -0.7)])} fill="#0d1030" />
        <polygon points={P([iso(X1, Y0, 0), iso(X1, Y1, 0), iso(X1, Y1, -0.7), iso(X1, Y0, -0.7)])} fill="#090b24" />
        <polygon points={P([iso(X0, Y0), iso(X1, Y0), iso(X1, Y1), iso(X0, Y1)])} fill="#1b2150" />
        <polygon points={P([iso(X0, 6.4, 0), iso(X1, 6.4, 0), iso(X1, 6.4, -1.2), iso(X0, 6.4, -1.2)])} fill="#0a0d28" />
        <polygon points={P([iso(X0, -10.5), iso(X1, -10.5), iso(X1, 6.4), iso(X0, 6.4)])} fill="#10183a" />
        {/* gardens, footpaths, road */}
        <polygon points={P([iso(X0, Y0), iso(X1, Y0), iso(X1, -1.9), iso(X0, -1.9)])} fill="#172a3e" /><polygon points={P([iso(X0, 1.9), iso(X1, 1.9), iso(X1, Y1), iso(X0, Y1)])} fill="#172a3e" />
        <polygon points={P([iso(X0, -1.9), iso(X1, -1.9), iso(X1, -1.3), iso(X0, -1.3)])} fill="#333a72" /><polygon points={P([iso(X0, 1.3), iso(X1, 1.3), iso(X1, 1.9), iso(X0, 1.9)])} fill="#333a72" />
        <polygon points={P([iso(X0, -1.3), iso(X1, -1.3), iso(X1, 1.3), iso(X0, 1.3)])} fill="#141736" />
        {Array.from({ length: 21 }).map((_, i) => { const x = X0 + 0.6 + i * 1.5; return <polygon key={i} points={P([iso(x, -0.06), iso(x + 0.8, -0.06), iso(x + 0.8, 0.06), iso(x, 0.06)])} fill="#8e8cc0" opacity={0.5} />; })}
        {/* garden paths from each door */}
        {FAR.map((b, i) => <polygon key={i} points={P([iso(b.x0 + b.w / 2 - 0.2, b.y0 + b.d), iso(b.x0 + b.w / 2 + 0.2, b.y0 + b.d), iso(b.x0 + b.w / 2 + 0.2, -1.9), iso(b.x0 + b.w / 2 - 0.2, -1.9)])} fill="#2a3166" />)}
        {[-9.2, -6.0, -2.8, 0.4, 3.6, 6.8, 10].map((x, i) => <HouseIso key={'bk' + i} b={{ x0: x, y0: -8.6, w: 2.4, d: 2.4, h: 1.9 + (i % 3) * 0.3, c: C1[i % 6], roof: i % 2 ? 'gable' : 'hip', seed: 40 + i }} f={f} />)}
        {/* far row, then street furniture, then near row (painter's order) */}
        {[-6.65, -3.55, -0.45, 2.85, 5.95].map((x, i) => <TreeIso key={i} x={x} y={-2.35} s={0.75} />)}
        {FAR.map((b) => <HouseIso key={b.seed} b={b} f={f} />)}
        <g transform={`translate(${gx} ${gy}) scale(${-SC} ${SC})`}><Stick hair="pony" outfit="kurta" col={DUSK.lav} p={girl} id="g" /></g>
        <LampIso x={-5.0} y={-1.6} /><LampIso x={4.6} y={-1.6} />
        {/* a parked scooter and a cat for life */}
        {(() => { const [a, b] = iso(1.6, -1.05); return <g><ellipse cx={a} cy={b + 3} rx={20} ry={7} fill="#000" opacity={0.3} /><rect x={a - 14} y={b - 16} width={28} height={10} rx={5} fill="#c8553a" /><circle cx={a - 12} cy={b - 3} r={6} fill="#0b0c1a" /><circle cx={a + 12} cy={b - 3} r={6} fill="#0b0c1a" /><rect x={a + 8} y={b - 26} width={3} height={12} fill="#0b0c1a" /></g>; })()}
        <LampIso x={-0.4} y={1.6} />
        {[-6.65, -3.55, -0.2, 2.85, 5.95].map((x, i) => <TreeIso key={i} x={x} y={2.5} s={0.75} />)}
        {NEAR.map((b) => <HouseIso key={b.seed} b={b} f={f} />)}
        <g transform={`translate(${bx} ${by}) scale(${SC})`}><Stick hair="short" outfit="tee" col={DUSK.teal} p={boy} id="b" /></g>
        {/* the torch beam across the street */}
        <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`} style={{ mixBlendMode: 'screen' }}>
          <path d={`M 0 -3 L ${len} -26 L ${len} 26 L 0 3 Z`} fill="url(#iBeam)" opacity={0.7} filter="url(#iB2)" />
          <path d={`M 0 -1.5 L ${len} -9 L ${len} 9 L 0 1.5 Z`} fill="url(#iBeam)" opacity={0.9} />
          <circle cx={0} cy={0} r={14} fill="#fff6dc" filter="url(#iB)" /><circle cx={len} cy={0} r={30} fill="#fff1d0" opacity={0.4} filter="url(#iB2)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
