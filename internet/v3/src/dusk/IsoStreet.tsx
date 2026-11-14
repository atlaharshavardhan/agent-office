import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, hash, lerp } from '../lib/anim';
import { DUSK, StickPose } from './Dusk';
import { Adult, Heart, A_SHOULDER, A_UPPER, A_FORE, A_TIP } from './Adult';
import { Audio, Img, staticFile } from 'remotion';
import { prog, pulse, clamp01, easeOut, easeInOut } from '../lib/anim';
import { FONT, TECH } from '../lib/palette';
import '@fontsource/manrope/700.css'; import '@fontsource/manrope/800.css'; import '@fontsource/ibm-plex-mono/600.css';

/* Isometric night street of individual houses (2.5D: flat-shaded iso drawn in SVG).
   World: x runs along the street, y across it, z up. Far row at y<0, near row at y>0. */
const S = 112, OX = 630, OY = 1180;
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
  { x0: -4.2, y0: -5.6, w: 2.6, d: 2.6, h: 3.3, c: '#5a4d94', roof: 'flat', hero: 'girl', seed: 3 },
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

/* hook timeline (0 - 15.6 s), same beats and voice mix as the approved hook */
const BLINKS: [number, number][] = [[1.15, 1.45], [2.0, 2.95], [3.75, 8.2], [8.95, 9.5]];
const HBITS = [0, 1, 0, 0, 1, 0, 0, 0], BIT0 = 10.55, BITD = 0.14, FLY = 0.6;
const BOYC = { x: 335, y: 1040 }, GIRLC = { x: 872, y: 615 }, WIDE = { x: 540, y: 960 };
type Key = [number, number, number, number];
const HOOK_KEYS: Key[] = [
  [0.0, BOYC.x, BOYC.y, 2.1], [1.1, BOYC.x, BOYC.y, 2.2],            // open on him raising the torch
  [2.7, WIDE.x, WIDE.y, 1.0], [3.4, WIDE.x, WIDE.y, 1.0],             // slow pull back: both balconies and the beam
  [4.5, 400, 1010, 1.9], [4.8, 400, 1010, 1.92],                      // ease in on the torch
  [6.2, GIRLC.x, GIRLC.y, 2.0], [6.7, GIRLC.x, GIRLC.y, 2.03],        // glide along the beam to her
  [7.9, WIDE.x, WIDE.y, 1.0], [10.6, WIDE.x, WIDE.y, 1.0],            // back to the street (title, then the torch close-up covers)
  [11.5, 600, 850, 1.18], [12.5, 600, 850, 1.2],                      // bits fly across
  [13.4, WIDE.x, WIDE.y, 1.0], [14.2, WIDE.x, WIDE.y, 1.0],           // HELLO
  [15.3, GIRLC.x, GIRLC.y, 2.2], [15.6, GIRLC.x, GIRLC.y, 2.22],      // too slow
];
const camAt = (t: number, KEYS: Key[] = HOOK_KEYS) => {
  let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1]; const u = easeInOut(clamp01((t - a[0]) / (b[0] - a[0])));
  return { fx: lerp(a[1], b[1], u), fy: lerp(a[2], b[2], u), z: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)) };
};
const VO: [number, React.ReactNode][] = [
  [3.45, <>Flash a <em>torch</em></>], [4.3, <>at your <em>friend</em> across the street,</>], [5.85, <>and you've basically built</>], [6.95, <>the <em>internet.</em></>],
  [8.4, <>On is <em>one</em>. Off is <em>zero</em>.</>], [10.5, <>Eight blinks make <em>one letter</em>.</>], [12.45, <>But <em>"hello"</em> takes forty blinks.</>], [14.3, <>Too <em>slow.</em></>],
];

/* wire scene (local time 0 - 7 s): he lowers the torch, a wire links the two balconies, pulses race, HELLO arrives at once */
const WIRE_KEYS: Key[] = [[0, BOYC.x + 60, BOYC.y - 20, 1.9], [0.7, BOYC.x + 60, BOYC.y - 20, 1.9], [1.5, WIDE.x, WIDE.y, 1.0], [2.2, WIDE.x, WIDE.y, 1.0], [3.2, 590, 900, 1.12], [7, 590, 900, 1.15]];
const WVO: [number, React.ReactNode][] = [[0.2, <>So we use a <em>wire.</em></>], [2.3, <>Now it's a <em>billion</em> blinks,</>], [3.6, <>every <em>second.</em></>], [4.5, <><em>"Hello"</em> arrives before you blink.</>]];
export const IsoHook: React.FC = () => <IsoStreet hook />;
export const IsoWire: React.FC = () => <IsoStreet wire />;
export const IsoStreet: React.FC<{ hook?: boolean; wire?: boolean }> = ({ hook, wire }) => {
  const f = useCurrentFrame(); const t = f / FPS;
  let on = 1; const cam = hook ? camAt(t) : wire ? camAt(t, WIRE_KEYS) : { fx: 540, fy: 960, z: 1 };
  if (hook) { on = Math.max(...BLINKS.map(([a, b]) => pulse(f, a, b))); HBITS.forEach((b, i) => { if (b) on = Math.max(on, pulse(f, BIT0 + i * BITD, BIT0 + i * BITD + 0.1)); }); }
  let raise = hook ? prog(f, 0.25, 0.85, easeOut) : 1, notice = hook ? prog(f, 2.1, 2.4, easeOut) : 1;
  let wave = hook ? prog(f, 4.6, 4.9) * (1 - prog(f, 7.0, 7.4)) : 1, sleepy = hook ? prog(f, 14.25, 14.6) : 0;
  // reactions: she is startled by the light and shields her eyes, he cheers when she waves, she counts along, gets bored, yawns
  let startle = hook ? prog(f, 2.05, 2.2, easeOut) * (1 - prog(f, 3.0, 3.5)) : 0;
  let cheer = hook ? prog(f, 5.0, 5.3) * (1 - prog(f, 7.0, 7.4)) : 0;
  const count = hook ? prog(f, 10.6, 10.9) * (1 - prog(f, 12.3, 12.6)) : 0;
  const bored = hook ? prog(f, 12.7, 13.3) : 0, yawn = hook ? prog(f, 13.5, 13.75) * (1 - prog(f, 14.15, 14.35)) : 0;
  const tired = hook ? prog(f, 13.0, 14.0) : 0;
  const wDraw = wire ? prog(f, 0.75, 1.4) : 0, wLive = wire ? prog(f, 2.35, 2.6) : 0, got = wire ? prog(f, 5.45, 5.7, easeOut) : 0;
  if (wire) { on = 0; raise = prog(f, 0.05, 0.5, easeOut) * (1 - prog(f, 1.9, 2.3, easeInOut)); sleepy = 1 - prog(f, 1.4, 1.6); wave = got; cheer = prog(f, 5.9, 6.2); startle = prog(f, 1.4, 1.5, easeOut) * (1 - prog(f, 2.1, 2.5)) * 0.6; }
  const breathe = Math.sin(t * 2.4), gHop = Math.abs(Math.sin(t * 9)) * 9 * wave + Math.sin(Math.PI * clamp01((t - 2.05) / 0.35)) * 14 * (hook ? 1 : 0);
  const bHop = Math.abs(Math.sin(t * 8.5)) * 10 * cheer;
  if (hook && t > 12.5 && t < 14.15) on = Math.max(on, Math.sin(t * 2 * Math.PI * 5.5) > 0.1 ? 1 : 0);   // forty quick blinks
  const macro = hook && t >= 8.4 && t < 10.45 ? Math.min(prog(f, 8.4, 8.55), 1 - prog(f, 10.3, 10.45)) : 0;
  const boyH = NEAR.find((h) => h.hero === 'boy')!, girlH = FAR.find((h) => h.hero === 'girl')!;
  const BZ = 1.65, BX0 = -0.7, GBX = girlH.x0 + girlH.w, BYC = boyH.y0 + 0.85, GYC = girlH.y0 + girlH.d - 0.85;   // balconies on the side wall, first floor, same height
  const [bx, by0] = iso(BX0 + 0.3, BYC, BZ), [gx, gy0] = iso(GBX + 0.3, GYC, BZ);
  const SC = 0.5;
  const by = by0 - bHop, gy = gy0 - gHop;
  const boy: StickPose = { blink: hook ? Math.max(0, 1 - Math.abs(t - 2.9) / 0.07, 1 - Math.abs(t - 7.6) / 0.07, 1 - Math.abs(t - 11.9) / 0.07, tired * 0.35) : 0, smile: 0.4 + 0.5 * (hook ? prog(f, 2.4, 2.8) : 1) + 0.1 * cheer - 0.5 * tired, look: 0.8,
    armR: [lerp(8, 98, raise) + Math.sin(t * 3.1) * 1.5 * raise + 6 * tired + (wire ? 16 * Math.max(0, 1 - Math.abs(t - 0.8) / 0.18) : 0), lerp(5, 106, raise) + Math.sin(t * 2.3) * 2 * raise + 8 * tired],
    armL: [lerp(-12, -150, cheer) + Math.sin(t * 10) * 12 * cheer, lerp(-8, -172, cheer) + Math.sin(t * 10 + 1) * 16 * cheer], holdTorch: true, torch: on, tilt: -4 * raise + breathe * 1.2 + Math.sin(t * 8.5) * 4 * cheer + 7 * tired };
  const girl: StickPose = { blink: Math.max(sleepy * 0.95, yawn, hook ? Math.max(1 - Math.abs(t - 1.0) / 0.07, 1 - Math.abs(t - 6.0) / 0.07, 1 - Math.abs(t - 11.2) / 0.07, startle * 0.6 * (1 - prog(f, 2.5, 2.9))) : 0), smile: Math.max(lerp(0.2, 1, notice) * (1 - sleepy * 0.7) * (1 - bored * 0.75), yawn), look: -lerp(0.2, 0.8, notice) * (1 - bored * 0.6),
    armR: [lerp(8, 150, wave) + lerp(0, 118, yawn), lerp(5, 168, wave) + Math.sin(t * 11) * 14 * wave + lerp(0, 150, yawn)],
    armL: [lerp(-10, -112, startle) + lerp(0, -22, bored * (1 - sleepy)), lerp(-6, -150, startle) + lerp(0, -128, bored * (1 - sleepy))],
    tilt: 4 * notice + 14 * sleepy + breathe * 1.2 + Math.sin(t * 2 * Math.PI / (BITD * 2)) * 5 * count + 9 * bored * (1 - sleepy) - 6 * startle };
  const lm = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l]; };
  const [ex, ey] = lm(A_SHOULDER.x, A_SHOULDER.y, boy.armR[0], A_UPPER); const [wx, wy] = lm(ex, ey, boy.armR[1], A_FORE); const tr = (90 - boy.armR[1]) * Math.PI / 180;
  const lens = { x: bx + (wx + Math.cos(tr) * A_TIP) * SC, y: by + (wy + Math.sin(tr) * A_TIP) * SC }, tgt = { x: gx - 10, y: gy - 225 * SC };
  const ang = Math.atan2(tgt.y - lens.y, tgt.x - lens.x) * 180 / Math.PI, len = Math.hypot(tgt.x - lens.x, tgt.y - lens.y);
  const balBack = (yc: number, col: string, BXE = BX0) => (
    <g>
      <polygon points={P([iso(BXE, yc - 0.4, BZ), iso(BXE, yc + 0.4, BZ), iso(BXE, yc + 0.4, BZ + 1.28), iso(BXE, yc - 0.4, BZ + 1.28)])} fill="#e9dcc0" />
      <polygon points={P([iso(BXE, yc - 0.34, BZ), iso(BXE, yc + 0.34, BZ), iso(BXE, yc + 0.34, BZ + 1.22), iso(BXE, yc - 0.34, BZ + 1.22)])} fill="#241c3a" />
      {[[0.1, 0.56], [0.66, 1.12]].map(([z0, z1], i) => <polygon key={i} points={P([iso(BXE, yc - 0.26, BZ + z0), iso(BXE, yc + 0.26, BZ + z0), iso(BXE, yc + 0.26, BZ + z1), iso(BXE, yc - 0.26, BZ + z1)])} fill="#30264c" />)}
      <circle cx={iso(BXE, yc + 0.27, BZ + 0.6)[0]} cy={iso(BXE, yc + 0.27, BZ + 0.6)[1]} r={3.5} fill="#ffd36b" />
      <Box x0={BXE} y0={yc - 0.7} w={0.62} d={1.4} h={0.12} z={BZ - 0.12} c={col} />
      {[0, 0.31, 0.62].map((dx) => { const [a, b] = iso(BXE + dx, yc - 0.7, BZ), [c2, d2] = iso(BXE + dx, yc - 0.7, BZ + 0.5); return <line key={dx} x1={a} y1={b} x2={c2} y2={d2} stroke="#0c0c1c" strokeWidth={3} />; })}
      <line x1={iso(BXE, yc - 0.7, BZ + 0.5)[0]} y1={iso(BXE, yc - 0.7, BZ + 0.5)[1]} x2={iso(BXE + 0.62, yc - 0.7, BZ + 0.5)[0]} y2={iso(BXE + 0.62, yc - 0.7, BZ + 0.5)[1]} stroke="#0c0c1c" strokeWidth={4} />
    </g>);
  const balFront = (yc: number, cols: string[], BXE = BX0) => (
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
        <g transform={`translate(540 960) scale(${cam.z}) translate(${-cam.fx} ${-cam.fy})`}>
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
        {Array.from({ length: 22 }).map((_, i) => <TreeIso key={'pk' + i} x={-16 + (i % 11) * 1.08 + hash(i + 70) * 0.5} y={-4.4 + Math.floor(i / 11) * 0.95 + hash(i + 80) * 0.3} s={0.6 + hash(i + 90) * 0.35} />)}
        {FAR.map((b) => <HouseIso key={b.seed} b={b} f={f} />)}
        {FAR.map((b, i) => <g key={'hg' + i}><Box x0={b.x0 - 0.2} y0={-2.1} w={b.w / 2 - 0.05} d={0.14} h={0.26} c="#1f4a3a" /><Box x0={b.x0 + b.w / 2 + 0.3} y0={-2.1} w={b.w / 2 - 0.1} d={0.14} h={0.26} c="#1f4a3a" /></g>)}
        {[-15.4, -13.4, -11.5, -9.6, -7.6, -5.6, 2.85, 5.95, 9.0].map((x, i) => <TreeIso key={i} x={x} y={-2.45} s={0.7} />)}
        {balBack(GYC, '#6a5cab', GBX)}
        <g transform={`translate(${gx} ${gy}) scale(${-SC} ${SC})`}><Adult kind="woman" p={girl} id="g" /></g>
        {balFront(GYC, ['#c9b8ff', '#f0e9ff', '#a58cf0'], GBX)}
        {wave > 0.5 && [0, 1, 2].map((i) => { const u = ((t * 0.5 + i * 0.33) % 1); return <Heart key={'h' + i} x={gx + 34 + Math.sin(u * 6 + i) * 10} y={gy - 360 * SC - u * 70} s={1.3 - u * 0.5} o={(1 - u) * 0.9} />; })}
        {/* her side garden */}
        {[[-0.3, -4.7], [0.5, -3.7], [1.2, -4.5], [2.1, -3.2], [1.4, -2.6], [-3.9, -2.8], [-1.5, -2.7]].map(([x, y], i) => <TreeIso key={'gg' + i} x={x} y={y} s={0.55 + i * 0.1} />)}
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
        <g transform={`translate(${bx} ${by}) scale(${SC})`}><Adult kind="man" p={boy} id="b" gun={wire} /></g>
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
        <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`} style={{ mixBlendMode: 'screen' }} opacity={on}>
          <path d={`M 0 -3 L ${len} -26 L ${len} 26 L 0 3 Z`} fill="url(#iBeam)" opacity={0.7} filter="url(#iB2)" />
          <path d={`M 0 -1.5 L ${len} -9 L ${len} 9 L 0 1.5 Z`} fill="url(#iBeam)" opacity={0.9} />
          <circle cx={0} cy={0} r={14} fill="#fff6dc" filter="url(#iB)" /><circle cx={len} cy={0} r={30} fill="#fff1d0" opacity={0.4} filter="url(#iB2)" />
        </g>
        {/* the wire between the two balconies, with data pulses (cyan = data) */}
        {wire && (() => {
          const A0 = iso(BX0 + 0.62, BYC - 0.7, BZ + 0.5), B = iso(GBX + 0.62, GYC + 0.7, BZ + 0.5);
          const clip = prog(f, 1.9, 2.3, easeInOut), A = [lerp(lens.x, A0[0], clip), lerp(lens.y + 10, A0[1], clip)];   // the line leaves the gun, then he clips it to the box
          const tight = prog(f, 1.4, 1.75, easeOut), fly = wDraw < 1;
          const E = [lerp(A[0], B[0], wDraw), lerp(A[1], B[1], wDraw) - 70 * Math.sin(Math.PI * wDraw)];
          const Pt = (k: number) => [lerp(A[0], B[0], k), lerp(A[1], B[1], k)];
          const sag = 46 * (1 - tight) * wDraw + Math.sin(t * 40) * 5 * tight * (1 - prog(f, 1.75, 2.1));
          const pts = Array.from({ length: 25 }).map((_, i) => { const k = i / 24; return `${lerp(A[0], E[0], k)},${lerp(A[1], E[1], k) - 10 + sag * Math.sin(Math.PI * k)}`; }).join(' ');
          const box = (q: readonly number[], lit: number) => <g><rect x={q[0] - 13} y={q[1] - 22} width={26} height={24} rx={5} fill="#1a2040" stroke="#5fe3ff" strokeWidth={2} /><circle cx={q[0]} cy={q[1] - 10} r={4} fill={lit > 0.5 ? '#5fe3ff' : '#35406a'} /><circle cx={q[0]} cy={q[1] - 10} r={12} fill="#5fe3ff" opacity={0.35 * lit} filter="url(#iB)" /></g>;
          const send = clamp01((t - 4.95) / 0.5), sending = t > 4.95 && t < 5.45;
          const hit = t - 1.4, ang2 = Math.atan2(B[1] - A[1] - 70 * Math.PI * Math.cos(Math.PI * wDraw), B[0] - A[0]) * 180 / Math.PI;
          return <g>
            {box(A0, clip)}{box(B, wLive)}
            {wDraw > 0 && <><polyline points={pts} fill="none" stroke="#000" strokeWidth={7} strokeLinecap="round" opacity={0.3} transform="translate(0 6)" />
            <polyline points={pts} fill="none" stroke="#c9843a" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={pts} fill="none" stroke="#ffd9a0" strokeWidth={1.6} strokeLinecap="round" opacity={0.8} transform="translate(0 -1.5)" /></>}
            {/* muzzle puff, the flying dart, and the hit */}
            {t > 0.75 && t < 1.0 && <g opacity={1 - (t - 0.75) / 0.25}><circle cx={lens.x} cy={lens.y} r={10 + (t - 0.75) * 120} fill="#fff1d0" opacity={0.7} filter="url(#iB)" />{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={lens.x + Math.cos(i * 1.3 - 1) * (t - 0.75) * 160} cy={lens.y + Math.sin(i * 1.3 - 1) * (t - 0.75) * 120} r={7} fill="#cfd6ee" opacity={0.6} />)}</g>}
            {wDraw > 0 && fly && <g transform={`translate(${E[0]} ${E[1] - 10}) rotate(${ang2})`}><path d="M -14 -5 L 8 -5 L 20 0 L 8 5 L -14 5 Z" fill="#d9d6cf" /><rect x={-16} y={-7} width={7} height={14} rx={2} fill="#f28c38" /></g>}
            {hit > 0 && hit < 0.35 && <g opacity={1 - hit / 0.35}><circle cx={B[0]} cy={B[1] - 10} r={8 + hit * 110} fill="none" stroke="#fff1d0" strokeWidth={4} />{[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={B[0] + Math.cos(i * 1.05) * (14 + hit * 60)} y1={B[1] - 10 + Math.sin(i * 1.05) * (14 + hit * 60)} x2={B[0] + Math.cos(i * 1.05) * (26 + hit * 90)} y2={B[1] - 10 + Math.sin(i * 1.05) * (26 + hit * 90)} stroke="#ffe08a" strokeWidth={4} strokeLinecap="round" />)}</g>}
            {wLive > 0 && <g opacity={wLive}>
              <line x1={A[0]} y1={A[1] - 10} x2={B[0]} y2={B[1] - 10} stroke="#5fe3ff" strokeWidth={16} opacity={0.3} filter="url(#iB)" />
              <line x1={A[0]} y1={A[1] - 10} x2={B[0]} y2={B[1] - 10} stroke="#dffbff" strokeWidth={4} strokeLinecap="round" strokeDasharray="9 15" strokeDashoffset={-t * 520} />
            </g>}
            {/* HELLO leaves him as forty bits and is whole again at her side */}
            {t > 4.4 && t < 5.1 && <g opacity={prog(f, 4.4, 4.55) * (1 - prog(f, 4.95, 5.1))} transform={`translate(${bx + 20} ${by - 215})`}><rect x={-62} y={-30} width={124} height={44} rx={14} fill="#0e1430" stroke="#5fe3ff" strokeWidth={2} /><text y={3} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#fff">HELLO</text></g>}
            {sending && Array.from({ length: 40 }).map((_, i) => { const k = send * 1.5 - i * 0.012; if (k < 0 || k > 1) return null; const q = Pt(k); const b = (0x48454c4c4f / Math.pow(2, 39 - i)) & 1; return <text key={i} x={q[0]} y={q[1] - 22 - (i % 2) * 12} textAnchor="middle" style={{ font: `600 15px ${FONT.mono}` }} fill={b ? '#ffe08a' : '#9fe9ff'}>{b}</text>; })}
            {got > 0 && <g opacity={got} transform={`translate(${gx + 6} ${gy - 232 - got * 8}) scale(${0.8 + 0.2 * got})`}><rect x={-64} y={-30} width={128} height={44} rx={14} fill="#0e1430" stroke="#5fe3ff" strokeWidth={2} /><text y={3} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#fff">HELLO</text><circle cx={64} cy={-30} r={13} fill="#3ddc97" /><path d="M 58 -30 L 62 -25 L 70 -35" stroke="#06261a" strokeWidth={3.5} fill="none" strokeLinecap="round" /></g>}
          </g>; })()}
        {/* the binary rides in the beam: bright = on (1), dark gap = off (0) */}
        {hook && t > BIT0 - 0.05 && t < 12.45 && <line x1={lens.x} y1={lens.y} x2={tgt.x} y2={tgt.y} stroke="#8a92d8" strokeWidth={2} strokeDasharray="3 10" opacity={0.6} />}
        {hook && HBITS.map((b, i) => { const u = (t - (BIT0 + i * BITD)) / FLY; if (u < -0.05 || u > 1.05 || t > 12.45) return null;
          const Pt = (k: number) => ({ x: lerp(lens.x, tgt.x, k), y: lerp(lens.y, tgt.y, k) }); const a0 = Pt(clamp01(u - 0.07)), a1 = Pt(clamp01(u + 0.07)), c = Pt(clamp01(u));
          const nx = -(tgt.y - lens.y) / len, ny = (tgt.x - lens.x) / len;
          return <g key={i}>
            {b ? <><line x1={a0.x} y1={a0.y} x2={a1.x} y2={a1.y} stroke="#ffe2a8" strokeWidth={26} strokeLinecap="round" opacity={0.45} filter="url(#iB2)" /><line x1={a0.x} y1={a0.y} x2={a1.x} y2={a1.y} stroke="#fff6dc" strokeWidth={11} strokeLinecap="round" /></>
               : <line x1={a0.x} y1={a0.y} x2={a1.x} y2={a1.y} stroke="#2a3070" strokeWidth={11} strokeLinecap="round" opacity={0.95} />}
            <text x={c.x - nx * 40} y={c.y - ny * 40 + 14} textAnchor="middle" style={{ font: `600 40px ${FONT.mono}` }} fill={b ? '#ffe08a' : '#b9c4ff'} stroke="#0a0e24" strokeWidth={6} paintOrder="stroke">{b}</text>
          </g>; })}
        {hook && t > BIT0 + 7 * BITD + FLY && t < 12.6 && <text x={gx + 62} y={gy - 150} textAnchor="middle" style={{ font: `800 80px ${FONT.ui}` }} fill="#ffd38a" stroke="#0a0e24" strokeWidth={8} paintOrder="stroke" opacity={prog(f, BIT0 + 7 * BITD + FLY, BIT0 + 7 * BITD + FLY + 0.15)}>H</text>}
        {sleepy > 0 && <text x={gx + 26} y={gy - 190 - (t - 14.3) * 14} style={{ font: `800 26px ${FONT.ui}` }} fill="#eaf0ff" stroke="#0a0e24" strokeWidth={4} paintOrder="stroke" opacity={sleepy}>z Z z</text>}
        </g>
        {/* HELLO floats over the park while the count runs */}
        {hook && t > 12.45 && t < 14.3 && 'HELLO'.split('').map((ch, j) => { const a = prog(f, 12.5 + j * 0.2, 12.75 + j * 0.2, easeOut); return (
          <g key={j} opacity={a * (1 - prog(f, 14.1, 14.3))} transform={`translate(${78 + j * 92} ${640 - a * 30})`}>
            <text textAnchor="middle" style={{ font: `800 104px ${FONT.ui}` }} fill="#ffd38a" filter="url(#iB2)" opacity={0.8}>{ch}</text>
            <text textAnchor="middle" style={{ font: `800 104px ${FONT.ui}` }} fill="#fff1d0">{ch}</text>
            <text y={44} textAnchor="middle" style={{ font: `600 17px ${FONT.mono}` }} fill="#b9c4ff">{['01001000', '01000101', '01001100', '01001100', '01001111'][j]}</text>
          </g>); })}
      </svg>
      {hook && <HookOverlays f={f} t={t} macro={macro} />}
      {wire && <WireOverlays f={f} t={t} />}
    </AbsoluteFill>
  );
};

const HookOverlays: React.FC<{ f: number; t: number; macro: number }> = ({ f, t, macro }) => {
  let line: React.ReactNode = null; for (const [a, txt] of VO) if (t >= a) line = txt;
  const SK = '#d6a481', SKS = '#b47f5a';
  return (
    <>
      <Audio src={staticFile('hook-mix.wav')} />
      {macro > 0 && (
        <AbsoluteFill style={{ opacity: macro }}>
          <svg width={1080} height={1920}>
            <defs><filter id="mB"><feGaussianBlur stdDeviation="26" /></filter><filter id="mB2"><feGaussianBlur stdDeviation="9" /></filter><radialGradient id="mG"><stop offset="0" stopColor="#fff8e6" /><stop offset=".3" stopColor="#ffe2a8" stopOpacity=".8" /><stop offset="1" stopColor="#ffcf80" stopOpacity="0" /></radialGradient>
              <linearGradient id="mT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a5266" /><stop offset=".3" stopColor="#8e97ab" /><stop offset=".5" stopColor="#2a2f3c" /><stop offset="1" stopColor="#14161d" /></linearGradient></defs>
            <rect width={1080} height={1920} fill="#0b1030" />
            <g filter="url(#mB)">{Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={hash(i) * 1080} cy={600 + hash(i + 3) * 1200} r={30 + hash(i + 5) * 60} fill={i % 3 ? '#ffc46a' : '#8f7be0'} opacity={0.35} />)}</g>
            <g transform={`translate(600 1080) rotate(-18) scale(${0.92 + (t - 8.4) * 0.03})`}>
              {pulse(f, 8.95, 9.5) > 0 && <g style={{ mixBlendMode: 'screen' }}><path d="M 290 -40 L 1200 -330 L 1200 330 L 290 40 Z" fill="url(#mG)" opacity={0.6} filter="url(#mB2)" /><circle cx={300} cy={0} r={180} fill="url(#mG)" /></g>}
              <path d="M -200 10 L -330 160" stroke={SK} strokeWidth={84} strokeLinecap="round" /><path d="M -300 130 L -1200 1170" stroke="#2f9c95" strokeWidth={120} strokeLinecap="butt" /><path d="M -262 163 L -338 97" stroke="#22756f" strokeWidth={130} strokeLinecap="butt" strokeDasharray="22 400" />
              <rect x={-420} y={-52} width={560} height={104} rx={26} fill="url(#mT)" />
              {Array.from({ length: 9 }).map((_, i) => <rect key={i} x={-380 + i * 26} y={-52} width={6} height={104} fill="#0b0d12" opacity={0.6} />)}
              <path d="M 130 -52 L 260 -92 L 290 -92 L 290 92 L 260 92 L 130 52 Z" fill="#c4553a" /><path d="M 130 -52 L 260 -92 L 290 -92 L 290 -70 L 260 -70 L 130 -34 Z" fill="#ff8a6a" opacity={0.5} />
              <rect x={284} y={-98} width={16} height={196} rx={6} fill="#d6d9df" />
              <ellipse cx={300} cy={0} rx={14} ry={86} fill={pulse(f, 8.95, 9.5) > 0 ? '#fffaf0' : '#3a3f4c'} />
              <rect x={-250} y={-80} width={210} height={170} rx={70} fill={SK} />{[0, 1, 2].map((i) => <path key={i} d={`M ${-200 + i * 50} 30 L ${-200 + i * 50} 84`} stroke={SKS} strokeWidth={5} strokeLinecap="round" />)}
              <rect x={-120} y={-112} width={110} height={52} rx={26} fill={SK} /><path d="M -112 -62 L -30 -62" stroke={SKS} strokeWidth={4} strokeLinecap="round" />
            </g>
            {t > 8.9 && <text x={830} y={760} textAnchor="middle" style={{ font: `700 260px ${FONT.mono}` }} fill={t < 9.5 ? '#ffe08a' : '#9fb0ff'} opacity={prog(f, 8.9, 9.0)}>{t < 9.5 ? '1' : '0'}</text>}
            {t > 8.9 && <text x={830} y={830} textAnchor="middle" style={{ font: `600 34px ${FONT.mono}`, letterSpacing: '0.2em' }} fill="#cfd8ff" opacity={0.8 * prog(f, 8.9, 9.0)}>{t < 9.5 ? 'LIGHT ON' : 'LIGHT OFF'}</text>}
          </svg>
        </AbsoluteFill>
      )}
      {t > 10.5 && t < 14.25 && (
        <div style={{ position: 'absolute', top: 236, left: 90, right: 90, height: 200, borderRadius: 40, background: 'rgba(10,14,36,.86)', border: '1px solid rgba(160,176,255,.25)', boxShadow: '0 20px 60px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, opacity: prog(f, 10.5, 10.75) * (1 - prog(f, 14.05, 14.25)) }}>
          {t < 12.45 ? (
            <>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', font: `600 58px ${FONT.mono}` }}>
                {HBITS.map((b, i) => { const shown = t > BIT0 + i * BITD + FLY; return <span key={i} style={{ width: 58, height: 80, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.05)', border: `1px solid ${shown && b ? 'rgba(255,224,138,.7)' : 'rgba(255,255,255,.14)'}`, color: shown ? (b ? '#ffe08a' : '#9fb0ff') : 'rgba(255,255,255,.2)' }}>{shown ? b : '·'}</span>; })}
                {t > BIT0 + 7 * BITD + FLY && <span style={{ marginLeft: 10, font: `800 72px ${FONT.ui}`, color: TECH.text }}>= <span style={{ color: '#ffd38a' }}>H</span></span>}
              </div>
              <div style={{ font: `600 26px ${FONT.mono}`, letterSpacing: '0.12em', color: '#a9b4dd' }}>8 BLINKS = 1 LETTER</div>
            </>
          ) : (
            <>
              <div style={{ font: `800 76px ${FONT.ui}`, color: TECH.text, letterSpacing: '0.12em' }}>HELLO</div>
              <div style={{ font: `600 28px ${FONT.mono}`, color: '#a9b4dd' }}>5 letters × 8 = <span style={{ color: '#ffe08a' }}>{Math.min(40, Math.round(Math.max(0, t - 12.45) / 1.5 * 40))}</span> blinks</div>
            </>
          )}
        </div>
      )}
      <div style={{ position: 'absolute', top: 236, left: 90, right: 90, height: 200, borderRadius: 40, background: 'rgba(10,14,36,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 62px/1.12 ${FONT.ui}`, color: TECH.text, opacity: prog(f, 7.1, 7.4) * (1 - prog(f, 8.2, 8.4)) }}>
        <div>How does the <span style={{ color: '#ffd38a' }}>internet</span><br />reach you?</div>
      </div>
      {line && t >= 3.45 && (
        <div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 6px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.9)' }}>
          <div className="sub">{line}</div>
        </div>
      )}
      <style>{'.sub em{font-style:normal;color:#ffd38a}'}</style>
      <div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.8 }}>
        <Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} />
        <span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span>
      </div>
    </>
  );
};

const WireOverlays: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  let line: React.ReactNode = null; for (const [a, txt] of WVO) if (t >= a) line = txt;
  const n = Math.round(1e9 * clamp01((t - 2.4) / 1.2) ** 3);
  return (
    <>
      {t > 2.3 && (
        <div style={{ position: 'absolute', top: 236, left: 90, right: 90, height: 200, borderRadius: 40, background: 'rgba(10,14,36,.86)', border: '1px solid rgba(95,227,255,.35)', boxShadow: '0 20px 60px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: prog(f, 2.3, 2.55) }}>
          {t < 4.45 ? (
            <>
              <div style={{ font: `600 74px ${FONT.mono}`, color: '#9fe9ff' }}>{n.toLocaleString('en-US')}</div>
              <div style={{ font: `600 26px ${FONT.mono}`, letterSpacing: '0.12em', color: '#a9b4dd' }}>BLINKS EVERY SECOND</div>
            </>
          ) : (
            <>
              <div style={{ font: `800 60px ${FONT.ui}`, color: TECH.text }}>"HELLO" = <span style={{ color: '#ffe08a' }}>40</span> blinks</div>
              <div style={{ font: `600 28px ${FONT.mono}`, color: '#a9b4dd' }}>torch: <span style={{ color: '#ffb38a' }}>~40 s</span> · wire: <span style={{ color: '#9fe9ff' }}>0.00000004 s</span></div>
            </>
          )}
        </div>
      )}
      {line && t >= 0.2 && (
        <div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 6px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.9)' }}>
          <div className="sub">{line}</div>
        </div>
      )}
      <style>{'.sub em{font-style:normal;color:#ffd38a}'}</style>
      <div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.8 }}>
        <Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} />
        <span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span>
      </div>
    </>
  );
};
