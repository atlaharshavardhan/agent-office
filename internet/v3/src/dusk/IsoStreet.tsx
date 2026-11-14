import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, hash, lerp } from '../lib/anim';
import { DUSK, StickPose } from './Dusk';
import { Adult, Heart, A_SHOULDER, A_UPPER, A_FORE, A_TIP } from './Adult';

/* Isometric night street of individual houses (2.5D: flat-shaded iso drawn in SVG).
   World: x runs along the street, y across it, z up. Far row at y<0, near row at y>0. */
const S = 84, OX = 570, OY = 1090;
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


const Box: React.FC<{ x0: number; y0: number; w: number; d: number; h: number; z?: number; c: string }> = ({ x0, y0, w, d, h, z = 0, c }) => { const x1 = x0 + w, y1 = y0 + d; return (
  <g><polygon points={P([iso(x0, y0, z + h), iso(x1, y0, z + h), iso(x1, y1, z + h), iso(x0, y1, z + h)])} fill={shade(c, 1.25)} />
    <polygon points={P([iso(x0, y1, z), iso(x1, y1, z), iso(x1, y1, z + h), iso(x0, y1, z + h)])} fill={c} />
    <polygon points={P([iso(x1, y0, z), iso(x1, y1, z), iso(x1, y1, z + h), iso(x1, y0, z + h)])} fill={shade(c, 0.7)} /></g>); };
const CarIso: React.FC<{ x: number; y: number; dir: 1 | -1; c: string; auto?: boolean }> = ({ x, y, dir, c, auto }) => {
  const [hx, hy] = iso(x + dir * 1.9, y), [fx1, fy1] = iso(x + dir * 0.68, y - 0.2, 0.25), [fx2, fy2] = iso(x + dir * 0.68, y + 0.2, 0.25), [bx1, by1] = iso(x - dir * 0.68, y - 0.2, 0.25), [bx2, by2] = iso(x - dir * 0.68, y + 0.2, 0.25);
  const [sx, sy] = iso(x, y);
  return (
    <g>
      <ellipse cx={sx + 4} cy={sy + 6} rx={50} ry={20} fill="#000" opacity={0.35} />
      <ellipse cx={hx} cy={hy} rx={80} ry={34} fill="url(#iPool)" opacity={0.9} />
      {[-0.42, 0.42].map((dx) => { const [wx, wy] = iso(x + dx, y + 0.32, 0.08); return <ellipse key={dx} cx={wx} cy={wy} rx={7} ry={8} fill="#07070f" />; })}
      <Box x0={x - 0.65} y0={y - 0.3} w={1.3} d={0.6} h={auto ? 0.2 : 0.3} z={0.1} c={c} />
      <Box x0={x - (auto ? 0.5 : 0.32) - (dir > 0 ? 0.08 : -0.08)} y0={y - 0.26} w={auto ? 0.95 : 0.7} d={0.52} h={auto ? 0.46 : 0.26} z={auto ? 0.3 : 0.4} c={auto ? '#1c1c26' : shade(c, 0.55)} />
      {!auto && (() => { const xa = x - 0.32 - (dir > 0 ? 0.08 : -0.08); return <polygon points={P([iso(xa + 0.06, y + 0.26, 0.44), iso(xa + 0.64, y + 0.26, 0.44), iso(xa + 0.64, y + 0.26, 0.62), iso(xa + 0.06, y + 0.26, 0.62)])} fill="#9fd0ff" opacity={0.55} />; })()}
      <circle cx={fx1} cy={fy1} r={4} fill="#fff6d8" /><circle cx={fx2} cy={fy2} r={4} fill="#fff6d8" /><circle cx={(fx1 + fx2) / 2} cy={(fy1 + fy2) / 2} r={18} fill="url(#iHalo)" />
      <circle cx={bx1} cy={by1} r={3} fill="#ff4a5a" /><circle cx={bx2} cy={by2} r={3} fill="#ff4a5a" />
    </g>
  );
};
const Road: React.FC<{ y: number; x0: number; x1: number }> = ({ y, x0, x1 }) => (
  <g>
    <polygon points={P([iso(x0, y - 1.9), iso(x1, y - 1.9), iso(x1, y + 1.9), iso(x0, y + 1.9)])} fill="#333a72" />
    <polygon points={P([iso(x0, y - 1.3), iso(x1, y - 1.3), iso(x1, y + 1.3), iso(x0, y + 1.3)])} fill="#141736" />
    {Array.from({ length: Math.floor((x1 - x0) / 1.5) }).map((_, i) => { const x = x0 + 0.6 + i * 1.5; return <polygon key={i} points={P([iso(x, y - 0.06), iso(x + 0.8, y - 0.06), iso(x + 0.8, y + 0.06), iso(x, y + 0.06)])} fill="#8e8cc0" opacity={0.5} />; })}
  </g>
);

const C1 = ['#3a3f78', '#4a3f7a', '#34487a', '#51437c', '#3d4a82', '#4b3c70'];
const FAR: H[] = [
  { x0: -15.6, y0: -4.6, w: 2.4, d: 2.5, h: 2.0, c: C1[5], roof: 'gable', seed: 31 },
  { x0: -12.5, y0: -4.6, w: 2.4, d: 2.5, h: 2.3, c: C1[3], roof: 'hip', seed: 32 },
  { x0: -9.4, y0: -4.6, w: 2.4, d: 2.5, h: 2.2, c: C1[2], roof: 'hip', seed: 21 },
  { x0: -6.3, y0: -4.6, w: 2.4, d: 2.5, h: 2.0, c: C1[0], roof: 'gable', seed: 1 },
  { x0: -3.3, y0: -4.7, w: 2.6, d: 2.6, h: 3.3, c: '#5a4d94', roof: 'flat', hero: 'girl', seed: 3 },
  { x0: 3.2, y0: -4.6, w: 2.4, d: 2.5, h: 2.0, c: C1[3], roof: 'gable', seed: 4 },
  { x0: 6.3, y0: -4.6, w: 2.4, d: 2.5, h: 2.3, c: C1[4], roof: 'hip', seed: 22 },
  { x0: 9.4, y0: -4.6, w: 2.4, d: 2.5, h: 2.0, c: C1[0], roof: 'gable', seed: 33 },
  { x0: 12.5, y0: -4.6, w: 2.4, d: 2.5, h: 2.2, c: C1[2], roof: 'hip', seed: 34 },
];
const NEAR: H[] = [
  { x0: -15.6, y0: 2.1, w: 2.4, d: 2.5, h: 2.2, c: C1[2], roof: 'hip', seed: 35 },
  { x0: -12.5, y0: 2.1, w: 2.4, d: 2.5, h: 2.0, c: C1[0], roof: 'gable', seed: 36 },
  { x0: -9.4, y0: 2.1, w: 2.4, d: 2.5, h: 2.0, c: C1[1], roof: 'gable', seed: 23 },
  { x0: -6.3, y0: 2.1, w: 2.4, d: 2.5, h: 2.1, c: C1[4], roof: 'hip', seed: 5 },
  { x0: -3.3, y0: 2.0, w: 2.6, d: 2.6, h: 3.3, c: '#3f5a8c', roof: 'flat', hero: 'boy', seed: 6 },
  { x0: 3.2, y0: 2.1, w: 2.4, d: 2.5, h: 2.2, c: C1[2], roof: 'hip', seed: 8 },
  { x0: 6.3, y0: 2.1, w: 2.4, d: 2.5, h: 2.0, c: C1[0], roof: 'gable', seed: 24 },
  { x0: 9.4, y0: 2.1, w: 2.4, d: 2.5, h: 2.3, c: C1[3], roof: 'hip', seed: 37 },
  { x0: 12.5, y0: 2.1, w: 2.4, d: 2.5, h: 2.0, c: C1[5], roof: 'gable', seed: 38 },
];

export const IsoStreet: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const boyH = NEAR.find((h) => h.hero === 'boy')!, girlH = FAR.find((h) => h.hero === 'girl')!;
  const BZ = 1.65, BXE = -0.7, BYC = boyH.y0 + 0.85, GYC = girlH.y0 + girlH.d - 0.85;   // balconies on the side wall, first floor, same height
  const [bx, by] = iso(BXE + 0.3, BYC, BZ), [gx, gy] = iso(BXE + 0.3, GYC, BZ);
  const SC = 0.56;
  const boy: StickPose = { blink: 0, smile: 0.9, look: 0.8, armR: [98, 106], armL: [-12, -8], holdTorch: true, torch: 1, tilt: -4 };
  const girl: StickPose = { blink: 0, smile: 1, look: -0.8, armR: [150, 168 + Math.sin(t * 11) * 14], armL: [-10, -6], tilt: 4 };
  const lm = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l]; };
  const [ex, ey] = lm(A_SHOULDER.x, A_SHOULDER.y, boy.armR[0], A_UPPER); const [wx, wy] = lm(ex, ey, boy.armR[1], A_FORE); const tr = (90 - boy.armR[1]) * Math.PI / 180;
  const lens = { x: bx + (wx + Math.cos(tr) * A_TIP) * SC, y: by + (wy + Math.sin(tr) * A_TIP) * SC }, tgt = { x: gx - 10, y: gy - 225 * SC };
  const ang = Math.atan2(tgt.y - lens.y, tgt.x - lens.x) * 180 / Math.PI, len = Math.hypot(tgt.x - lens.x, tgt.y - lens.y);
  const balBack = (yc: number, col: string) => (
    <g>
      <polygon points={P([iso(BXE, yc - 0.28, BZ), iso(BXE, yc + 0.28, BZ), iso(BXE, yc + 0.28, BZ + 1.15), iso(BXE, yc - 0.28, BZ + 1.15)])} fill="#ffe2a8" />
      <polygon points={P([iso(BXE, yc - 0.5, BZ - 0.1), iso(BXE, yc + 0.5, BZ - 0.1), iso(BXE, yc + 0.5, BZ + 1.4), iso(BXE, yc - 0.5, BZ + 1.4)])} fill="#ffc46a" opacity={0.3} filter="url(#iB)" />
      <Box x0={BXE} y0={yc - 0.7} w={0.62} d={1.4} h={0.12} z={BZ - 0.12} c={col} />
      {[0, 0.31, 0.62].map((dx) => { const [a, b] = iso(BXE + dx, yc - 0.7, BZ), [c2, d2] = iso(BXE + dx, yc - 0.7, BZ + 0.5); return <line key={dx} x1={a} y1={b} x2={c2} y2={d2} stroke="#0c0c1c" strokeWidth={3} />; })}
      <line x1={iso(BXE, yc - 0.7, BZ + 0.5)[0]} y1={iso(BXE, yc - 0.7, BZ + 0.5)[1]} x2={iso(BXE + 0.62, yc - 0.7, BZ + 0.5)[0]} y2={iso(BXE + 0.62, yc - 0.7, BZ + 0.5)[1]} stroke="#0c0c1c" strokeWidth={4} />
    </g>);
  const balFront = (yc: number, cols: string[]) => (
    <g>
      {Array.from({ length: 8 }).map((_, i) => { const y = yc - 0.7 + i * 0.2; const [a, b] = iso(BXE + 0.62, y, BZ), [c2, d2] = iso(BXE + 0.62, y, BZ + 0.5); return <line key={'p' + i} x1={a} y1={b} x2={c2} y2={d2} stroke="#0c0c1c" strokeWidth={3} />; })}
      {[0, 0.31, 0.62].map((dx) => { const [a, b] = iso(BXE + dx, yc + 0.7, BZ), [c2, d2] = iso(BXE + dx, yc + 0.7, BZ + 0.5); return <line key={dx} x1={a} y1={b} x2={c2} y2={d2} stroke="#0c0c1c" strokeWidth={3} />; })}
      <polyline points={P([iso(BXE + 0.62, yc - 0.7, BZ + 0.5), iso(BXE + 0.62, yc + 0.7, BZ + 0.5), iso(BXE, yc + 0.7, BZ + 0.5)])} fill="none" stroke="#0c0c1c" strokeWidth={4.5} strokeLinejoin="round" />
      {Array.from({ length: 8 }).map((_, i) => { const [a, b] = iso(BXE + 0.62, yc - 0.7 + i * 0.2, BZ + 0.42); const tw = 0.6 + 0.4 * Math.sin(i * 1.7 + f / 6); return <g key={'l' + i}><circle cx={a} cy={b} r={8} fill={cols[i % 3]} opacity={0.3 * tw} /><circle cx={a} cy={b} r={3} fill={cols[i % 3]} opacity={0.6 + 0.4 * tw} /></g>; })}
    </g>);
  const X0 = -24, X1 = 24, Y0 = -5.6, Y1 = 6.4;
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
        <g transform="translate(900 190)"><circle r={120} fill="#cfd8ff" opacity={0.07} /><circle r={44} fill="#f3eedb" /><circle cx={17} cy={-11} r={41} fill="#050819" /></g>
        {/* ground: the neighbourhood continues past the frame */}
        <polygon points={P([iso(X0, -26, 0), iso(X1, -26, 0), iso(X1, 26), iso(X0, 26)])} fill="#15263c" />
        {[[-13.4, -12.9], [-9.1, -6.1], [-4.7, -1.9], [1.9, 7.2], [9.9, 10.4], [14.2, 18]].map(([y0, y1], i) => <polygon key={i} points={P([iso(X0, y0), iso(X1, y0), iso(X1, y1), iso(X0, y1)])} fill={i % 2 ? '#15263c' : '#172a3e'} />)}
        <Road y={-11} x0={X0} x1={X1} /><Road y={0} x0={X0} x1={X1} /><Road y={12.3} x0={X0} x1={X1} />
        {/* zebra crossing + garden paths */}
        {Array.from({ length: 6 }).map((_, k) => <polygon key={k} points={P([iso(-1.75, -1.15 + k * 0.42), iso(-1.0, -1.15 + k * 0.42), iso(-1.0, -0.93 + k * 0.42), iso(-1.75, -0.93 + k * 0.42)])} fill="#b9b6e6" opacity={0.6} />)}
        {FAR.map((b, i) => <polygon key={i} points={P([iso(b.x0 + b.w / 2 - 0.2, b.y0 + b.d), iso(b.x0 + b.w / 2 + 0.2, b.y0 + b.d), iso(b.x0 + b.w / 2 + 0.2, -1.9), iso(b.x0 + b.w / 2 - 0.2, -1.9)])} fill="#2a3166" />)}
        {/* top road traffic and the back row */}
        <CarIso x={((t * 2.0 + 6) % 34) - 17} y={-11.6} dir={1} c="#4a6fd0" />
        {Array.from({ length: 12 }).map((_, i) => <HouseIso key={'bk2' + i} b={{ x0: -20 + i * 3.2, y0: -16.6, w: 2.4, d: 2.4, h: 1.9 + ((i + 1) % 3) * 0.3, c: C1[(i + 2) % 6], roof: i % 2 ? 'hip' : 'gable', seed: 100 + i }} f={f} />)}
        {Array.from({ length: 12 }).map((_, i) => <TreeIso key={'tb' + i} x={-19 + i * 3.2} y={-13.6} s={0.7} />)}
        {[-19, -15.8, -12.6, -9.4, -6.2, -3.0, 0.2, 3.4, 6.6, 9.8, 13].map((x, i) => <HouseIso key={'bk' + i} b={{ x0: x, y0: -8.9, w: 2.4, d: 2.4, h: 1.9 + (i % 3) * 0.3, c: C1[i % 6], roof: i % 2 ? 'gable' : 'hip', seed: 40 + i }} f={f} />)}
        {Array.from({ length: 14 }).map((_, i) => <TreeIso key={'t0' + i} x={-12 + i * 1.75 + hash(i) * 0.5} y={-5.7 - hash(i + 3) * 0.5} s={0.6 + hash(i + 7) * 0.35} />)}
        {/* far row with hedges along the footpath */}
        {FAR.map((b) => <HouseIso key={b.seed} b={b} f={f} />)}
        {FAR.map((b, i) => <g key={'hg' + i}><Box x0={b.x0 - 0.2} y0={-2.1} w={b.w / 2 - 0.05} d={0.14} h={0.26} c="#1f4a3a" /><Box x0={b.x0 + b.w / 2 + 0.3} y0={-2.1} w={b.w / 2 - 0.1} d={0.14} h={0.26} c="#1f4a3a" /></g>)}
        {[-6.65, -3.55, 2.85, 5.95, 9.0].map((x, i) => <TreeIso key={i} x={x} y={-2.45} s={0.7} />)}
        {balBack(GYC, '#6a5cab')}
        <g transform={`translate(${gx} ${gy}) scale(${-SC} ${SC})`}><Adult kind="woman" p={girl} id="g" /></g>
        {balFront(GYC, ['#c9b8ff', '#f0e9ff', '#a58cf0'])}
        {[0, 1, 2].map((i) => { const u = ((t * 0.5 + i * 0.33) % 1); return <Heart key={'h' + i} x={gx + 34 + Math.sin(u * 6 + i) * 10} y={gy - 360 * SC - u * 70} s={1.3 - u * 0.5} o={(1 - u) * 0.9} />; })}
        {/* her side garden */}
        {[[1.0, -4.0], [2.1, -3.2], [1.4, -2.6]].map(([x, y], i) => <TreeIso key={'gg' + i} x={x} y={y} s={0.55 + i * 0.1} />)}
        <LampIso x={-8.2} y={-1.6} /><LampIso x={-2.2} y={-1.6} /><LampIso x={4.6} y={-1.6} />
        {/* the street: cars, an auto-rickshaw and a scooter on the move */}
        <CarIso x={((t * 2.2 + 13) % 34) - 17} y={-0.65} dir={1} c="#c8553a" />
        <CarIso x={((t * 1.6 + 27) % 34) - 17} y={-0.65} dir={1} c="#e0b84a" auto />
        <CarIso x={-(((t * 1.9 + 21) % 34) - 17)} y={0.65} dir={-1} c="#3fa7a0" />
        <CarIso x={-(((t * 2.4 + 6) % 34) - 17)} y={0.65} dir={-1} c="#8a6fd8" />
        <LampIso x={-5.4} y={1.6} /><LampIso x={0.9} y={1.6} /><LampIso x={7.4} y={1.6} />
        {[-9.8, -6.65, -3.55, 2.85, 5.95].map((x, i) => <TreeIso key={i} x={x} y={2.55} s={0.7} />)}
        {NEAR.map((b) => <HouseIso key={b.seed} b={b} f={f} />)}
        {balBack(BYC, '#4a68a0')}
        <g transform={`translate(${bx} ${by}) scale(${SC})`}><Adult kind="man" p={boy} id="b" /></g>
        {balFront(BYC, ['#7fe3d4', '#d6fff8', '#4fc9b8'])}
        {/* his side garden */}
        {[[1.3, 3.0], [2.0, 4.0], [0.9, 4.3]].map(([x, y], i) => <TreeIso key={'bg' + i} x={x} y={y} s={0.5 + i * 0.1} />)}
        {/* back gardens: trees, a pond, a bench and garden lamps */}
        {NEAR.map((b, i) => <Box key={'ng' + i} x0={b.x0 - 0.2} y0={4.85} w={b.w + 0.4} d={0.14} h={0.26} c="#1f4a3a" />)}
        {(() => { const [px, py] = iso(-1.2, 6.1); return <g><ellipse cx={px} cy={py} rx={78} ry={34} fill="#1d3f6a" /><ellipse cx={px - 10} cy={py - 4} rx={50} ry={18} fill="#2b5a8f" opacity={0.7} /><ellipse cx={px + 14} cy={py - 8} rx={16} ry={5} fill="#cfe6ff" opacity={0.35} /></g>; })()}
        {Array.from({ length: 12 }).map((_, i) => { const x = -10 + i * 1.8 + hash(i + 20) * 0.6; if (x > -2.6 && x < 0.2) return null; return <TreeIso key={'t2' + i} x={x} y={5.7 + hash(i + 30) * 0.9} s={0.65 + hash(i + 40) * 0.4} />; })}
        <Box x0={1.3} y0={5.9} w={0.9} d={0.25} h={0.18} z={0.12} c="#5a4a3a" /><LampIso x={2.6} y={6.3} /><LampIso x={-6.0} y={6.3} />
        {[-17.4, -14.2, -11, -7.8, -4.6, -1.4, 1.8, 5.0, 8.2, 11.4, 14.6].map((x, i) => <HouseIso key={'ft' + i} b={{ x0: x, y0: 7.4, w: 2.4, d: 2.4, h: 1.9 + (i % 2) * 0.3, c: C1[(i + 3) % 6], roof: i % 2 ? 'hip' : 'gable', seed: 60 + i }} f={f} />)}
        <LampIso x={-3.0} y={10.7} /><LampIso x={3.6} y={10.7} />
        <CarIso x={((t * 2.1 + 15) % 34) - 17} y={11.65} dir={1} c="#d8d8e6" />
        <CarIso x={-(((t * 1.7 + 12) % 34) - 17)} y={12.95} dir={-1} c="#c8553a" />
        {Array.from({ length: 18 }).map((_, i) => <TreeIso key={'t3' + i} x={-18 + i * 2.1} y={14.6} s={0.8} />)}
        {[-19.1, -15.9, -12.7, -9.5, -6.3, -3.1, 0.1, 3.3, 6.5, 9.7, 12.9, 16.1].map((x, i) => <HouseIso key={'bt' + i} b={{ x0: x, y0: 15.4, w: 2.4, d: 2.4, h: 2.0, c: C1[(i + 1) % 6], roof: i % 2 ? 'gable' : 'hip', seed: 80 + i }} f={f} />)}
        {Array.from({ length: 12 }).map((_, i) => <HouseIso key={'bt2' + i} b={{ x0: -20 + i * 3.2, y0: 18.8, w: 2.4, d: 2.4, h: 2.0 + (i % 2) * 0.3, c: C1[(i + 4) % 6], roof: i % 2 ? 'gable' : 'hip', seed: 120 + i }} f={f} />)}
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
