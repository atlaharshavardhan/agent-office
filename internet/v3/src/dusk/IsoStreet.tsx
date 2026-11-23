import React from 'react';
import { fx, fw, isWide } from '../lib/wide';
import { MARK_O } from '../lib/mark';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, hash, lerp } from '../lib/anim';
import { DUSK, StickPose } from './Dusk';
import { Adult, Heart, A_SHOULDER, A_UPPER, A_FORE, A_TIP } from './Adult';
import { Audio, Img, Sequence, staticFile } from 'remotion';
import { Pov, POV_A, POV_B } from './Pov';
import { FiberCut, RouterCut, FIB_A, FIB_B, RT_A } from './Extras';
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

let DETAIL = false;   // detail pass: bricks, roof tiles, window frames, rooftop clutter, street life, haze and grain
let HOSTEL_LIT = false;
let NB_LIT = -1;   // street scene: time at which the neighbours start switching their lights on (-1 = stay dim)
const HouseIso: React.FC<{ b: H; f: number }> = ({ b, f }) => {
  const { x0, y0, w, d, h, c } = b; const x1 = x0 + w, y1 = y0 + d; const dim = b.hero || (b.seed >= 77 && b.seed <= 79 && HOSTEL_LIT) || (NB_LIT !== -1 && f / FPS > NB_LIT + hash(b.seed * 13) * 0.9) ? 1 : 0.5;
  const floors = h > 2.6 ? 2 : 1, fh = h / floors;
  const fy = (u: number, v: number) => iso(x0 + u, y1, v);      // face toward lower-left (y1)
  const fx = (u: number, v: number) => iso(x1, y0 + u, v);      // face toward lower-right (x1)
  const win = (face: (u: number, v: number) => readonly [number, number], u: number, v: number, ww: number, wh: number, key: string, lit: boolean) => (
    <g key={key}>
      <polygon points={P([face(u, v), face(u + ww, v), face(u + ww, v + wh), face(u, v + wh)])} fill={lit ? (dim < 1 ? '#9a7f52' : LIT) : '#12142c'} />
      {lit && dim === 1 && <polygon points={P([face(u - 0.12, v - 0.12), face(u + ww + 0.12, v - 0.12), face(u + ww + 0.12, v + wh + 0.12), face(u - 0.12, v + wh + 0.12)])} fill="#ffc46a" opacity={0.22} filter="url(#iB)" />}
      <polygon points={P([face(u - 0.05, v - 0.07), face(u + ww + 0.05, v - 0.07), face(u + ww + 0.05, v), face(u - 0.05, v)])} fill={shade(c, 1.5)} />
      {DETAIL && <>
        {lit && hash(b.seed * 3 + u * 7 + v) < 0.6 && <polygon points={P([face(u, v + wh * 0.35), face(u + ww * 0.3, v + wh * 0.5), face(u + ww * 0.3, v + wh), face(u, v + wh)])} fill="#e98f6a" opacity={0.75} />}
        {lit && hash(b.seed * 5 + u * 3 + v) < 0.35 && <polygon points={P([face(u + ww * 0.55, v), face(u + ww * 0.8, v), face(u + ww * 0.8, v + wh * 0.45), face(u + ww * 0.55, v + wh * 0.45)])} fill="#3a2a22" opacity={0.6} />}
        <polygon points={P([face(u, v), face(u + ww, v), face(u + ww, v + wh), face(u, v + wh)])} fill="none" stroke={shade(c, 0.5)} strokeWidth={3} />
        <line x1={face(u + ww / 2, v)[0]} y1={face(u + ww / 2, v)[1]} x2={face(u + ww / 2, v + wh)[0]} y2={face(u + ww / 2, v + wh)[1]} stroke={shade(c, 0.5)} strokeWidth={2.4} />
        <line x1={face(u, v + wh * 0.6)[0]} y1={face(u, v + wh * 0.6)[1]} x2={face(u + ww, v + wh * 0.6)[0]} y2={face(u + ww, v + wh * 0.6)[1]} stroke={shade(c, 0.5)} strokeWidth={2.4} />
        <polygon points={P([face(u - 0.08, v + wh), face(u + ww + 0.08, v + wh), face(u + ww + 0.08, v + wh + 0.07), face(u - 0.08, v + wh + 0.07)])} fill={shade(c, 1.7)} />
        {lit && dim === 1 && <polygon points={P([face(u - 0.1, v - 0.75), face(u + ww + 0.1, v - 0.75), face(u + ww, v - 0.08), face(u, v - 0.08)])} fill="#ffc46a" opacity={0.06} />}
      </>}
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
      {DETAIL && <>
        <polygon points={P([iso(x0, y1, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x0, y1, h)])} fill="url(#brL)" />
        <polygon points={P([iso(x1, y0, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x1, y0, h)])} fill="url(#brR)" />
        <polygon points={P([iso(x0, y1, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x0, y1, h)])} fill="url(#wallSh)" />
        <polygon points={P([iso(x1, y0, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x1, y0, h)])} fill="url(#wallSh)" />
        <polygon points={P([iso(x0, y1, 0), iso(x1, y1, 0), iso(x1, y1, 0.22), iso(x0, y1, 0.22)])} fill={shade(c, 0.6)} /><polygon points={P([iso(x1, y0, 0), iso(x1, y1, 0), iso(x1, y1, 0.22), iso(x1, y0, 0.22)])} fill={shade(c, 0.45)} />
        <line x1={iso(x1, y1, 0)[0]} y1={iso(x1, y1, 0)[1]} x2={iso(x1, y1, h)[0]} y2={iso(x1, y1, h)[1]} stroke={shade(c, 1.5)} strokeWidth={2.5} opacity={0.7} />
      </>}
      {floors === 2 && <><polygon points={P([fy(0, fh - 0.06), fy(w, fh - 0.06), fy(w, fh + 0.06), fy(0, fh + 0.06)])} fill={shade(c, 1.35)} /><polygon points={P([fx(0, fh - 0.06), fx(d, fh - 0.06), fx(d, fh + 0.06), fx(0, fh + 0.06)])} fill={shade(c, 1.0)} /></>}
      {/* windows + door */}
      {Array.from({ length: floors }).map((_, fl) => [0, 1].map((i) => win(fy, 0.35 + i * (w - 1.25), fl * fh + fh * 0.32, 0.55, fh * 0.42, `y${fl}${i}`, hash(b.seed * 7 + fl * 3 + i) < (dim < 1 ? 0.45 : 0.9))))}
      {Array.from({ length: floors }).map((_, fl) => [0, 1].map((i) => win(fx, 0.4 + i * (d - 1.35), fl * fh + fh * 0.32, 0.55, fh * 0.42, `x${fl}${i}`, hash(b.seed * 11 + fl * 5 + i) < (dim < 1 ? 0.4 : 0.9))))}
      <polygon points={P([fy(w / 2 - 0.28, 0), fy(w / 2 + 0.28, 0), fy(w / 2 + 0.28, fh * 0.62), fy(w / 2 - 0.28, fh * 0.62)])} fill="#0f1024" />
      {DETAIL && <>
        <polygon points={P([fy(w / 2 - 0.34, 0), fy(w / 2 + 0.34, 0), fy(w / 2 + 0.34, fh * 0.66), fy(w / 2 - 0.34, fh * 0.66)])} fill="none" stroke={shade(c, 1.6)} strokeWidth={4} />
        <polygon points={P([fy(w / 2 - 0.2, fh * 0.34), fy(w / 2 + 0.2, fh * 0.34), fy(w / 2 + 0.2, fh * 0.56), fy(w / 2 - 0.2, fh * 0.56)])} fill="#2a2140" /><polygon points={P([fy(w / 2 - 0.2, 0.08), fy(w / 2 + 0.2, 0.08), fy(w / 2 + 0.2, fh * 0.28), fy(w / 2 - 0.2, fh * 0.28)])} fill="#2a2140" />
        <circle cx={fy(w / 2 + 0.2, fh * 0.31)[0]} cy={fy(w / 2 + 0.2, fh * 0.31)[1]} r={3} fill="#ffd36b" />
        <polygon points={P([iso(x0 + w / 2 - 0.45, y1), iso(x0 + w / 2 + 0.45, y1), iso(x0 + w / 2 + 0.45, y1 + 0.3), iso(x0 + w / 2 - 0.45, y1 + 0.3)])} fill="#4a5088" /><polygon points={P([iso(x0 + w / 2 - 0.25, y1 + 0.06), iso(x0 + w / 2 + 0.25, y1 + 0.06), iso(x0 + w / 2 + 0.25, y1 + 0.24), iso(x0 + w / 2 - 0.25, y1 + 0.24)])} fill="#b0503a" />
        {hash(b.seed * 19) < 0.7 && [0.7, 0.95].map((dx, i) => { const q = iso(x0 + w / 2 + dx, y1 + 0.12); return <g key={i}><rect x={q[0] - 7} y={q[1] - 10} width={14} height={11} rx={2} fill="#b0603a" /><circle cx={q[0]} cy={q[1] - 17} r={9} fill="#2f7a4e" /><circle cx={q[0] - 4} cy={q[1] - 21} r={3} fill={i ? '#ff8672' : '#ffd36b'} /></g>; })}
      </>}
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
          {DETAIL && (() => { const z = h + 0.22, tl = Array.from({ length: 6 }).map((_, i) => <line key={'rt' + i} x1={iso(x0 + 0.1 + i * (w - 0.2) / 6, y0 + 0.1, z)[0]} y1={iso(x0 + 0.1 + i * (w - 0.2) / 6, y0 + 0.1, z)[1]} x2={iso(x0 + 0.1 + i * (w - 0.2) / 6, y1 - 0.1, z)[0]} y2={iso(x0 + 0.1 + i * (w - 0.2) / 6, y1 - 0.1, z)[1]} stroke="#000" strokeWidth={1.5} opacity={0.14} />);
            const sp = [iso(x0 + 1.25, y0 + 0.35, z + 0.02), iso(x0 + 2.2, y0 + 0.35, z + 0.3), iso(x0 + 2.2, y0 + 1.0, z + 0.3), iso(x0 + 1.25, y0 + 1.0, z + 0.02)] as (readonly [number, number])[];
            const c1 = iso(x0 + 0.4, y0 + 1.5, z + 0.75), c2 = iso(x0 + 0.4, y1 - 0.3, z + 0.75), d0 = iso(x1 - 0.45, y1 - 0.5, z);
            return <g>{tl}
              <polygon points={P(sp)} fill="#1c3a7a" stroke="#9fb4ff" strokeWidth={1.5} />{[0.33, 0.66].map((k) => <line key={k} x1={lerp(sp[0][0], sp[1][0], k)} y1={lerp(sp[0][1], sp[1][1], k)} x2={lerp(sp[3][0], sp[2][0], k)} y2={lerp(sp[3][1], sp[2][1], k)} stroke="#9fb4ff" strokeWidth={1.2} opacity={0.7} />)}
              <line x1={iso(x0 + 0.4, y0 + 1.5, z)[0]} y1={iso(x0 + 0.4, y0 + 1.5, z)[1]} x2={c1[0]} y2={c1[1]} stroke="#101022" strokeWidth={3} /><line x1={iso(x0 + 0.4, y1 - 0.3, z)[0]} y1={iso(x0 + 0.4, y1 - 0.3, z)[1]} x2={c2[0]} y2={c2[1]} stroke="#101022" strokeWidth={3} /><line x1={c1[0]} y1={c1[1]} x2={c2[0]} y2={c2[1]} stroke="#d9d6cf" strokeWidth={1.4} />
              {[0.2, 0.42, 0.64, 0.84].map((k, i) => { const sw = Math.sin(f / 14 + i + b.seed) * 2; return <polygon key={k} points={`${lerp(c1[0], c2[0], k) - 8},${lerp(c1[1], c2[1], k) - 3} ${lerp(c1[0], c2[0], k) + 8},${lerp(c1[1], c2[1], k) + 5} ${lerp(c1[0], c2[0], k) + 8 + sw},${lerp(c1[1], c2[1], k) + 30} ${lerp(c1[0], c2[0], k) - 8 + sw},${lerp(c1[1], c2[1], k) + 22}`} fill={['#ff8672', '#f3f0ea', '#7fd0f0', '#f6c34a'][i]} opacity={0.92} />; })}
              <line x1={d0[0]} y1={d0[1]} x2={d0[0]} y2={d0[1] - 26} stroke="#101022" strokeWidth={3} /><ellipse cx={d0[0] + 6} cy={d0[1] - 30} rx={15} ry={11} fill="#cfd3de" transform={`rotate(-28 ${d0[0] + 6} ${d0[1] - 30})`} /><ellipse cx={d0[0] + 8} cy={d0[1] - 31} rx={10} ry={7} fill="#8e97ab" transform={`rotate(-28 ${d0[0] + 8} ${d0[1] - 31})`} />
              {[[0.35, 0.3], [0.65, 0.25], [0.3, 0.6]].map(([dx, dy], i) => { const q = iso(x1 - dx - 0.3, y0 + dy + 0.2, z); return <g key={'pt' + i}><rect x={q[0] - 6} y={q[1] - 9} width={12} height={10} rx={2} fill="#b0603a" /><circle cx={q[0]} cy={q[1] - 15} r={8} fill="#2f7a4e" /></g>; })}
            </g>; })()}
          {lights(iso(x0 - 0.12, y1 + 0.12, h + 0.2), iso(x1 + 0.12, y1 + 0.12, h + 0.2), 9, 'a')}
          {lights(iso(x1 + 0.12, y1 + 0.12, h + 0.2), iso(x1 + 0.12, y0 - 0.12, h + 0.2), 9, 'b')}
        </g>
      )}
      {b.roof === 'gable' && (
        <g>
          <polygon points={P([iso(x0 - 0.15, y0 - 0.15, h), iso(x1 + 0.15, y0 - 0.15, h), iso(x1 + 0.15, yc, h + rh), iso(x0 - 0.15, yc, h + rh)])} fill={shade(c, 0.55)} />
          <polygon points={P([iso(x1, y0, h), iso(x1, y1, h), iso(x1, yc, h + rh)])} fill={shade(c, 0.72)} />
          <polygon points={P([iso(x0 - 0.15, y1 + 0.15, h - 0.05), iso(x1 + 0.15, y1 + 0.15, h - 0.05), iso(x1 + 0.15, yc, h + rh), iso(x0 - 0.15, yc, h + rh)])} fill={shade(c, 0.62)} />
          {DETAIL && <>{[0.14, 0.28, 0.42, 0.56, 0.7, 0.84].map((k) => <line key={k} x1={iso(x0 - 0.15, lerp(y1 + 0.15, yc, k), lerp(h - 0.05, h + rh, k))[0]} y1={iso(x0 - 0.15, lerp(y1 + 0.15, yc, k), lerp(h - 0.05, h + rh, k))[1]} x2={iso(x1 + 0.15, lerp(y1 + 0.15, yc, k), lerp(h - 0.05, h + rh, k))[0]} y2={iso(x1 + 0.15, lerp(y1 + 0.15, yc, k), lerp(h - 0.05, h + rh, k))[1]} stroke="#000" strokeWidth={2} opacity={0.22} />)}
            {Array.from({ length: 9 }).map((_, i) => { const xx = x0 + i * (w / 8); return <line key={'v' + i} x1={iso(xx, y1 + 0.15, h - 0.05)[0]} y1={iso(xx, y1 + 0.15, h - 0.05)[1]} x2={iso(xx, yc, h + rh)[0]} y2={iso(xx, yc, h + rh)[1]} stroke="#fff" strokeWidth={1.2} opacity={0.06} />; })}
            <line x1={iso(x0 - 0.15, yc, h + rh)[0]} y1={iso(x0 - 0.15, yc, h + rh)[1]} x2={iso(x1 + 0.15, yc, h + rh)[0]} y2={iso(x1 + 0.15, yc, h + rh)[1]} stroke={shade(c, 1.5)} strokeWidth={4} strokeLinecap="round" />
            {(() => { const q = iso(x0 + w * 0.7, yc + 0.5, h + rh * 0.55); return <g><rect x={q[0] - 9} y={q[1] - 34} width={18} height={34} fill={shade(c, 0.9)} /><rect x={q[0] - 11} y={q[1] - 38} width={22} height={6} fill={shade(c, 1.4)} />{[0, 1, 2].map((k) => { const u = ((f / 90 + k * 0.33 + b.seed) % 1); return <circle key={k} cx={q[0] + u * 22 + Math.sin(u * 5 + k) * 5} cy={q[1] - 44 - u * 60} r={8 + u * 12} fill="#cfd6ee" opacity={0.2 * (1 - u)} />; })}</g>; })()}</>}
          <polygon points={P([iso(x0 - 0.15, y1 + 0.15, h - 0.05), iso(x1 + 0.15, y1 + 0.15, h - 0.05), iso(x1 + 0.15, y1 + 0.15, h + 0.03), iso(x0 - 0.15, y1 + 0.15, h + 0.03)])} fill={shade(c, 1.3)} />
          {lights(iso(x0 - 0.15, y1 + 0.15, h - 0.02), iso(x1 + 0.15, y1 + 0.15, h - 0.02), 9, 'a')}
        </g>
      )}
      {b.roof === 'hip' && (
        <g>
          <polygon points={P([iso(x0 - 0.15, y1 + 0.15, h), iso(x1 + 0.15, y1 + 0.15, h), iso(x0 + w / 2, yc, h + rh * 1.2)])} fill={shade(c, 0.62)} />
          <polygon points={P([iso(x1 + 0.15, y0 - 0.15, h), iso(x1 + 0.15, y1 + 0.15, h), iso(x0 + w / 2, yc, h + rh * 1.2)])} fill={shade(c, 0.48)} />
          {DETAIL && <>{[0.2, 0.4, 0.6, 0.8].map((k) => { const ap = iso(x0 + w / 2, yc, h + rh * 1.2), a = iso(x0 - 0.15, y1 + 0.15, h), e = iso(x1 + 0.15, y1 + 0.15, h), g2 = iso(x1 + 0.15, y0 - 0.15, h); return <g key={k}><line x1={lerp(a[0], ap[0], k)} y1={lerp(a[1], ap[1], k)} x2={lerp(e[0], ap[0], k)} y2={lerp(e[1], ap[1], k)} stroke="#000" strokeWidth={2} opacity={0.22} /><line x1={lerp(e[0], ap[0], k)} y1={lerp(e[1], ap[1], k)} x2={lerp(g2[0], ap[0], k)} y2={lerp(g2[1], ap[1], k)} stroke="#000" strokeWidth={2} opacity={0.25} /></g>; })}
            <line x1={iso(x1 + 0.15, y1 + 0.15, h)[0]} y1={iso(x1 + 0.15, y1 + 0.15, h)[1]} x2={iso(x0 + w / 2, yc, h + rh * 1.2)[0]} y2={iso(x0 + w / 2, yc, h + rh * 1.2)[1]} stroke={shade(c, 1.3)} strokeWidth={3} /></>}
          {lights(iso(x0 - 0.15, y1 + 0.15, h), iso(x1 + 0.15, y1 + 0.15, h), 9, 'a')}
          {lights(iso(x1 + 0.15, y1 + 0.15, h), iso(x1 + 0.15, y0 - 0.15, h), 9, 'b')}
        </g>
      )}
    </g>
  );
};
const TreeIso: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => { const [a, b] = iso(x, y); return (
  <g><ellipse cx={a + 6} cy={b + 4} rx={22 * s} ry={9 * s} fill="#000" opacity={0.25} /><rect x={a - 3} y={b - 38 * s} width={6} height={38 * s} fill="#1a1626" />
    <circle cx={a} cy={b - 58 * s} r={28 * s} fill="#234636" /><circle cx={a - 12 * s} cy={b - 44 * s} r={20 * s} fill="#1d3a2e" /><circle cx={a + 13 * s} cy={b - 46 * s} r={19 * s} fill="#1d3a2e" /><circle cx={a - 6 * s} cy={b - 66 * s} r={12 * s} fill="#2f5a46" opacity={0.7} />{DETAIL && <>{[[-14, -52, 5], [8, -70, 6], [14, -50, 4], [-2, -78, 5], [-18, -40, 4], [4, -44, 5]].map(([dx, dy, r], i) => <circle key={i} cx={a + dx * s} cy={b + dy * s} r={r * s} fill={i % 2 ? '#3f7a5a' : '#16302a'} opacity={0.8} />)}<path d={`M ${a + 10 * s} ${b - 82 * s} A ${28 * s} ${28 * s} 0 0 1 ${a + 27 * s} ${b - 52 * s}`} stroke="#ffd9a0" strokeWidth={2.5 * s} fill="none" opacity={0.35} /></>}</g>); };
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
  { x0: 1.4, y0: -5.0, w: 2.6, d: 2.6, h: 3.3, c: '#8a4f74', roof: 'flat', seed: 77 },   // the hostel she moves to
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
  { x0: 3.2, y0: 2.1, w: 2.6, d: 2.6, h: 3.3, c: '#a8683a', roof: 'flat', seed: 79 },   // third place she stays (near row)
  { x0: 6.3, y0: 2.1, w: 2.4, d: 2.5, h: 2.0, c: C1[0], roof: 'gable', seed: 24 },
  { x0: 9.4, y0: 2.1, w: 2.4, d: 2.5, h: 2.3, c: C1[3], roof: 'hip', seed: 37 },
  { x0: 12.5, y0: 2.1, w: 2.4, d: 2.5, h: 2.0, c: C1[5], roof: 'gable', seed: 38 },
];

/* hook timeline (0 - 15.6 s), same beats and voice mix as the approved hook */
const BLINKS: [number, number][] = [[0.45, 0.8], [1.15, 1.45], [2.0, 2.95], [3.75, 8.2], [8.95, 9.5]];
const HBITS = [0, 1, 0, 0, 1, 0, 0, 0], BIT0 = 10.55, BITD = 0.14, FLY = 0.6;
const BOYC = { x: 335, y: 1040 }, GIRLC = { x: 872, y: 615 }, WIDE = { x: 540, y: 960 };
type Key = [number, number, number, number];
const HOOK_KEYS: Key[] = [
  [0.0, BOYC.x + 40, BOYC.y - 30, 1.75], [0.55, BOYC.x + 40, BOYC.y - 30, 1.8],   // open on him, torch already up
  [1.9, WIDE.x, WIDE.y, 1.0], [3.4, WIDE.x, WIDE.y, 1.0],             // slow pull back: both balconies and the beam
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
  [0.25, <>You can build the <em>internet</em></>], [1.5, <>with a <em>torch.</em></>], [2.45, <><em>Seriously.</em></>],
  [3.4, <>Flash it at your <em>friend</em></>], [4.4, <>across the <em>street,</em></>], [5.85, <>and you've basically built</>], [6.95, <>the <em>internet.</em></>],
  [8.4, <>On is <em>one</em>. Off is <em>zero</em>.</>], [10.5, <>Eight blinks make <em>one letter</em>.</>], [12.45, <>But <em>"hello"</em> takes forty blinks.</>], [14.3, <>Too <em>slow.</em></>],
];

/* wire scene (local time 0 - 7 s): he lowers the torch, a wire links the two balconies, pulses race, HELLO arrives at once */
const WIRE_KEYS: Key[] = [[0, BOYC.x + 60, BOYC.y - 20, 1.9], [0.7, BOYC.x + 60, BOYC.y - 20, 1.9], [1.5, WIDE.x, WIDE.y, 1.0], [2.2, WIDE.x, WIDE.y, 1.0], [3.2, 590, 900, 1.12], [7, 590, 900, 1.15]];
const WVO: [number, React.ReactNode][] = [[0.2, <>So we use a <em>LAN cable.</em></>], [2.3, <>Now it's a <em>billion</em> blinks,</>], [3.75, <>every <em>second.</em></>], [4.95, <><em>"Hello"</em> arrives before you blink.</>]];
export const IsoHook: React.FC = () => <IsoStreet hook />;
export const IsoFull: React.FC = () => (<AbsoluteFill><Audio src={staticFile('full-mix.wav')} /><Sequence durationInFrames={468}><IsoStreet hook mute /></Sequence><Sequence from={468} durationInFrames={222}><IsoStreet wire /></Sequence><Sequence from={690} durationInFrames={555}><IsoStreet move /></Sequence></AbsoluteFill>);
export const IsoHookCine: React.FC = () => <IsoStreet hook cine />;
export const IsoFullCine: React.FC = () => (<AbsoluteFill><Audio src={staticFile('full-mix.wav')} /><Sequence durationInFrames={468}><IsoStreet hook mute cine /></Sequence><Sequence from={468} durationInFrames={222}><IsoStreet wire cine /></Sequence><Sequence from={690} durationInFrames={555}><IsoStreet move cine /></Sequence></AbsoluteFill>);
const HookCut: React.FC = () => { const f = useCurrentFrame(); return f >= POV_A && f < POV_B ? null : <IsoStreet hook mute cine />; };
/* the full street part, with the first-person "Hi" shot cut into the torch scene */
export const IsoFullHi: React.FC = () => (<AbsoluteFill><Audio src={staticFile('full-mix.wav')} /><Sequence durationInFrames={468}><HookCut /></Sequence><Sequence from={POV_A} durationInFrames={POV_B - POV_A}><Pov hi /></Sequence><Sequence from={468} durationInFrames={222}><IsoStreet wire cine /></Sequence><Sequence from={690} durationInFrames={555}><IsoStreet move cine /></Sequence></AbsoluteFill>);
/* v3 cut: Hi shot, fibre cutaway in the wire scene, router close-up at the end of the street scene */
const FA = Math.round(FIB_A * 30), FB = Math.round(FIB_B * 30), RA = Math.round(RT_A * 30);
const WireCut: React.FC = () => { const f = useCurrentFrame(); return f >= FA && f < FB ? null : <IsoStreet wire cine />; };
const MoveCut: React.FC = () => { const f = useCurrentFrame(); return f >= RA ? null : <IsoStreet move cine />; };
export const IsoFullV3: React.FC = () => (<AbsoluteFill><Audio src={staticFile('full-mix.wav')} /><Sequence durationInFrames={468}><HookCut /></Sequence><Sequence from={POV_A} durationInFrames={POV_B - POV_A}><Pov hi /></Sequence>
  <Sequence from={468} durationInFrames={222}><WireCut /></Sequence><Sequence from={468 + FA} durationInFrames={FB - FA}><FiberCut /></Sequence>
  <Sequence from={690} durationInFrames={555}><MoveCut /></Sequence><Sequence from={690 + RA} durationInFrames={555 - RA}><RouterCut /></Sequence></AbsoluteFill>);
export const IsoHookView: React.FC = () => <IsoStreet hook cine mute view={{ fx: 600, fy: 850, z: 1.45 }} />;
export const IsoWire: React.FC = () => <IsoStreet wire />;
export const IsoDetail: React.FC = () => <IsoStreet hook detail mute />;
export const IsoMoveDetail: React.FC = () => <IsoStreet move detail />;
/* street scene (local 0 - 9.5 s): the neighbours want in, 45 wires tangle, one router box untangles it */
const NET_KEYS: Key[] = [[0, 590, 900, 1.15], [0.4, 590, 900, 1.15], [1.7, 600, 960, 0.64], [9.5, 600, 960, 0.67]];
const NVO: [number, React.ReactNode][] = [[0.3, <>Now the whole <em>street</em> wants in.</>], [2.3, <>Ten houses would need <em>forty-five</em> wires!</>], [5.0, <>So every wire goes to <em>one box:</em></>], [7.2, <>the <em>router.</em></>]];
const NODES: [number, number, number][] = [[-2.0, 3.3, 3.5], [-2.9, -4.3, 3.5], [-5.1, 3.35, 3.0], [4.4, 3.35, 3.1], [7.5, 3.35, 2.9], [-8.2, -7.7, 2.8], [-5.0, -7.7, 3.1], [-1.8, -7.7, 3.4], [3.0, 8.6, 2.8], [6.2, 8.6, 3.1]];
const PAIRS: [number, number][] = []; for (let i = 0; i < 10; i++) for (let j = i + 1; j < 10; j++) PAIRS.push([i, j]);
export const IsoNet: React.FC = () => <IsoStreet net />;
/* step 2 (local 0 - 10 s): she moves to a hostel down the street, the old wire is useless, a new wire per place cannot go on -> the router */
const MOVE_KEYS: Key[] = [[0, 590, 900, 1.12], [0.5, 590, 900, 1.12], [2.0, 1000, 1040, 0.63], [16.8, 1000, 1040, 0.655]];
const MVO: [number, React.ReactNode][] = [[0.2, <>Then she moves to a <em>hostel.</em> New wire.</>], [3.2, <>Then a friend's place. <em>Another wire.</em></>], [5.63, <>Then <em>another!</em></>], [6.71, <>Now the neighbours want in <em>too.</em></>], [8.41, <>So every house plugs into <em>one box:</em></>], [10.69, <>the <em>router.</em></>], [11.62, <>Every house gets a number, like a <em>door number.</em></>], [14.47, <>That's its <em>IP address.</em></>], [16.11, <>The router reads it and <em>delivers.</em></>]];
const SHOTS = [2.2, 3.8, 5.3], AIMS: [number, number][] = [[90, 93], [60, 57], [103, 104]], ARR = [-9, 2.0, 3.5, 5.0], LEAVE = [0.6, 3.0, 4.6, 99];
const MESH_ON = false;
export const IsoMove: React.FC = () => <IsoStreet move />;
/* concept stills for the "many houses" scene: 1a/1b follow her, 2a/2b neighbour chaos */
export const Concept: React.FC<{ k: string }> = ({ k }) => <IsoStreet concept={k} />;
const CSUB: Record<string, React.ReactNode> = { '1a': <>She moves down the <em>street.</em> The wire can't follow.</>, '1b': <>So every house plugs into <em>one box.</em></>, '2a': <>Now the whole <em>street</em> wants in.</>, '2b': <>One box untangles it: the <em>router.</em></> };
const GRAN = { hair: '#d9d9e3', top: '#7fbf9a', topSh: '#5a9a78', glasses: true, bun: true }, UNCLE = { hair: '#8d8d9a', top: '#c97b4a', topSh: '#9a5a32', moustache: true }, KIDT = { top: '#f6c34a', topSh: '#cf9a26' }, AUNTY = { top: '#e06a8c', topSh: '#b04a6a', bun: true };
export const IsoStreet: React.FC<{ hook?: boolean; wire?: boolean; net?: boolean; mute?: boolean; concept?: string; move?: boolean; detail?: boolean; cine?: boolean; view?: { fx: number; fy: number; z: number } }> = ({ hook, wire, net, mute, concept, move, detail = true, cine = false, view }) => {
  DETAIL = !!detail;
  const f = useCurrentFrame(); const t = f / FPS;
  let on = 1; const cam = view ? view : hook ? camAt(t) : wire ? camAt(t, WIRE_KEYS) : net ? camAt(t, NET_KEYS) : move ? camAt(t, MOVE_KEYS) : concept ? { fx: 800, fy: 900, z: 0.74 } : { fx: 540, fy: 960, z: 1 };
  HOSTEL_LIT = !!move;
  NB_LIT = net ? 0.25 : move ? 7.0 : concept ? -5 : -1; const cv = concept ? concept[0] : '', cb = concept ? concept[1] === 'b' : false;
  if (hook) { on = Math.max(...BLINKS.map(([a, b]) => pulse(f, a, b))); HBITS.forEach((b, i) => { if (b) on = Math.max(on, pulse(f, BIT0 + i * BITD, BIT0 + i * BITD + 0.1)); }); }
  let raise = hook ? prog(f, 0.0, 0.4, easeOut) : 1, notice = hook ? prog(f, 2.1, 2.4, easeOut) : 1;
  let wave = hook ? prog(f, 4.6, 4.9) * (1 - prog(f, 7.0, 7.4)) : 1, sleepy = hook ? prog(f, 14.25, 14.6) : 0;
  // reactions: she is startled by the light and shields her eyes, he cheers when she waves, she counts along, gets bored, yawns
  let startle = hook ? prog(f, 2.05, 2.2, easeOut) * (1 - prog(f, 3.0, 3.5)) : 0;
  let cheer = hook ? prog(f, 5.0, 5.3) * (1 - prog(f, 7.0, 7.4)) : 0;
  const count = hook ? prog(f, 10.6, 10.9) * (1 - prog(f, 12.3, 12.6)) : 0;
  const bored = hook ? prog(f, 12.7, 13.3) : 0, yawn = hook ? prog(f, 13.5, 13.75) * (1 - prog(f, 14.15, 14.35)) : 0;
  const tired = hook ? prog(f, 13.0, 14.0) : 0;
  const wDraw = wire ? prog(f, 0.75, 1.4) : 0, wLive = wire ? prog(f, 2.35, 2.6) : 0, got = wire ? prog(f, 5.45, 5.7, easeOut) : 0;
  if (wire) { on = 0; raise = prog(f, 0.05, 0.5, easeOut) * (1 - prog(f, 1.9, 2.3, easeInOut)); sleepy = 1 - prog(f, 1.4, 1.6); wave = got; cheer = prog(f, 5.9, 6.2); startle = prog(f, 1.4, 1.5, easeOut) * (1 - prog(f, 2.1, 2.5)) * 0.6; }
  const kTs = move ? SHOTS : [0.75], hTs = move ? SHOTS.map((x) => x + 0.5) : [1.4]; const kick = wire || move ? kTs.reduce((a, kT) => a + (t < kT ? 0 : Math.exp(-(t - kT) * 7) * (1 + 0.5 * Math.cos((t - kT) * 26)) / 1.5), 0) : 0, thud = wire || move ? hTs.reduce((a, hT) => a + (t > hT ? Math.exp(-(t - hT) * 9) : 0), 0) : 0;
  const worry = net ? prog(f, 2.9, 3.3) * (1 - prog(f, 4.8, 5.2)) : 0, glad = net ? prog(f, 6.6, 6.9) : 0;
  if (net) { on = 0; raise = 0; wave = glad; cheer = glad; }
  const boyH = NEAR.find((h) => h.hero === 'boy')!, girlH = FAR.find((h) => h.hero === 'girl')!;
  const BZ = 1.65, BX0 = -0.7, GBX = girlH.x0 + girlH.w, BYC = boyH.y0 + 0.85, GYC = girlH.y0 + girlH.d - 0.85;   // balconies on the side wall, first floor, same height
  const hostelH = FAR.find((h) => h.seed === 77)!, HBX = hostelH.x0 + hostelH.w, HYC = hostelH.y0 + hostelH.d - 0.85, nearP = NEAR.find((h) => h.seed === 79)!;
  // the places she stays, in order: home, hostel, a friend's house (near row), a new flat (back row)
  const PL = [{ x: GBX, yc: GYC, slot: 'far', col: '#6a5cab', name: '' }, { x: HBX, yc: HYC, slot: 'far', col: '#a3688c', name: 'HOSTEL' }, { x: nearP.x0 + nearP.w, yc: nearP.y0 + 0.85, slot: 'near', col: '#c98a5a', name: "FRIEND'S" }, { x: 2.8, yc: -7.35, slot: 'bk', col: '#5aa07c', name: 'NEW FLAT' }];
  let pi = 0; if (move) for (let i = 1; i < 4; i++) if (t >= ARR[i]) pi = i;
  const mWalk = move ? prog(f, 0.8, 1.8) : 0, walking = !!move && t >= 0.8 && t < 1.8, herVis = !move || walking || (t >= ARR[pi] && t < LEAVE[pi]), herSlot = !move || walking ? 'far' : PL[pi].slot;
  const shotI = t < 3.4 ? 0 : t < 4.9 ? 1 : 2, tiredM = move ? prog(f, 5.9, 6.3) * (1 - prog(f, 7.3, 7.7)) : 0;
  const mGot = move ? prog(f, 15.1, 15.3, easeOut) : 0, mStage = walking ? 2 : 0;

  if (move) { on = 0; raise = Math.max(...SHOTS.map((sh) => prog(f, sh - 0.4, sh - 0.12, easeOut) * (1 - prog(f, sh + 0.6, sh + 0.9, easeInOut)))); wave = walking ? 0 : pi === 0 ? 1 : Math.max(prog(f, ARR[pi], ARR[pi] + 0.2) * (1 - prog(f, ARR[pi] + 0.8, ARR[pi] + 1.1)), mGot); cheer = prog(f, 8.9, 9.2) * (1 - prog(f, 9.9, 10.2)) + mGot; }
  if (concept) { on = 0; raise = cb ? 0 : cv === '1' ? 1 : 0; wave = cb || cv === '1' ? 1 : 0; cheer = cb ? 1 : 0; }
  const breathe = Math.sin(t * 2.4), gHop = Math.abs(Math.sin(t * 9)) * 9 * wave + Math.sin(Math.PI * clamp01((t - 2.05) / 0.35)) * 14 * (hook ? 1 : 0) + (wire ? Math.sin(Math.PI * clamp01((t - 1.4) / 0.4)) * 22 + Math.sin(Math.PI * clamp01((t - 2.4) / 0.3)) * 10 + Math.abs(Math.sin(t * 7)) * 4 * prog(f, 2.8, 3.0) * (1 - prog(f, 4.6, 4.9)) : 0);
  const bHop = Math.abs(Math.sin(t * 8.5)) * 10 * cheer;
  if (hook && t > 12.5 && t < 14.15) on = Math.max(on, Math.sin(t * 2 * Math.PI * 5.5) > 0.1 ? 1 : 0);   // forty quick blinks
  const macro = hook && t >= 8.4 && t < 10.45 ? Math.min(prog(f, 8.4, 8.55), 1 - prog(f, 10.3, 10.45)) : 0;
  const [bx, by0] = iso(BX0 + 0.3, BYC, BZ), [gx, gy0] = cv === '1' ? iso(3.75, -1.72, 0) : walking ? iso(lerp(-2.9, 2.7, mWalk), -1.72, 0) : move ? iso(PL[pi].x + 0.3, PL[pi].yc, BZ) : iso(GBX + 0.3, GYC, BZ);
  const SC = 0.5;
  const by = by0 - bHop, gy = gy0 - gHop - (mStage === 2 ? Math.abs(Math.sin(t * 11)) * 7 : 0) - (move ? Math.abs(Math.sin(t * 9)) * 9 * mGot + Math.sin(Math.PI * clamp01((t - ARR[pi]) / 0.3)) * 14 : 0);
  const boy: StickPose = { blink: wire ? Math.min(1, kick * 2.2) : hook ? Math.max(0, 1 - Math.abs(t - 2.9) / 0.07, 1 - Math.abs(t - 7.6) / 0.07, 1 - Math.abs(t - 11.9) / 0.07, tired * 0.35) : 0, smile: 0.4 + 0.5 * (hook ? prog(f, 2.4, 2.8) : 1) + 0.1 * cheer - 0.5 * tired, look: 0.8,
    armR: [lerp(8, 98, raise) + Math.sin(t * 3.1) * 1.5 * raise + 6 * tired + (wire ? 16 * Math.max(0, 1 - Math.abs(t - 0.8) / 0.18) : 0), lerp(5, 106, raise) + Math.sin(t * 2.3) * 2 * raise + 8 * tired],
    armL: [lerp(-12, -150, cheer) + Math.sin(t * 10) * 12 * cheer, lerp(-8, -172, cheer) + Math.sin(t * 10 + 1) * 16 * cheer], holdTorch: true, torch: on, tilt: -4 * raise + breathe * 1.2 + Math.sin(t * 8.5) * 4 * cheer + 7 * tired };
  const girl: StickPose = { blink: Math.max(sleepy * 0.95, yawn, hook ? Math.max(1 - Math.abs(t - 1.0) / 0.07, 1 - Math.abs(t - 6.0) / 0.07, 1 - Math.abs(t - 11.2) / 0.07, startle * 0.6 * (1 - prog(f, 2.5, 2.9))) : 0), smile: Math.max(lerp(0.2, 1, notice) * (1 - sleepy * 0.7) * (1 - bored * 0.75), yawn), look: -lerp(0.2, 0.8, notice) * (1 - bored * 0.6),
    armR: [lerp(8, 150, wave) + lerp(0, 118, yawn), lerp(5, 168, wave) + Math.sin(t * 11) * 14 * wave + lerp(0, 150, yawn)],
    armL: [lerp(-10, -112, startle) + lerp(0, -22, bored * (1 - sleepy)), lerp(-6, -150, startle) + lerp(0, -128, bored * (1 - sleepy))],
    tilt: 4 * notice + 14 * sleepy + breathe * 1.2 + Math.sin(t * 2 * Math.PI / (BITD * 2)) * 5 * count + 9 * bored * (1 - sleepy) - 6 * startle };
  if (move) {
    boy.armR = [lerp(8, AIMS[shotI][0], raise) + 14 * Math.min(1, kick * 2) + 4 * tiredM, lerp(5, AIMS[shotI][1], raise) + 6 * tiredM]; boy.armL = [boy.armL[0] - 4 * tiredM, boy.armL[1]]; boy.look = 0.9; boy.smile = 0.5 + 0.4 * cheer - 0.45 * tiredM; boy.blink = Math.max(Math.min(1, kick * 2.2), 1 - Math.abs(t - 1.2) / 0.07, 1 - Math.abs(t - 8.1) / 0.07, tiredM * 0.5);
    boy.tilt = breathe * 1.2 + 12 * tiredM;
    if (mStage === 2) { girl.armR = [20 + Math.sin(t * 11) * 22, 10 + Math.sin(t * 11) * 14]; girl.armL = [-24, -8]; girl.look = -0.9; girl.tilt = -4; girl.smile = 0.7; }
    if (!walking) { girl.look = pi === 2 ? -0.9 : -0.8; }
  }
  if (concept && cv === '2' && !cb) { girl.armR = [158, 176]; girl.armL = [-158, -176]; girl.smile = 0.1; boy.armR = [150, 165]; boy.armL = [-150, -165]; boy.smile = 0.1; boy.holdTorch = false; }
  if (concept && cb) boy.holdTorch = false;
  if (net) {   // both look around at the neighbours, hold their heads at the tangle, cheer at the router
    girl.armR = [girl.armR[0] + 150 * worry, girl.armR[1] + 168 * worry]; girl.armL = [-10 - 150 * worry, -6 - 168 * worry]; girl.smile = Math.max(glad, 0.5 * (1 - worry)); girl.tilt = breathe * 1.2 + Math.sin(t * 9) * 4 * worry; girl.look = -0.8 + 1.6 * prog(f, 0.6, 0.9) * (1 - prog(f, 1.6, 1.9));
    boy.armR = [8 + 142 * worry, 5 + 160 * worry]; boy.armL = [boy.armL[0] - 138 * worry, boy.armL[1] - 160 * worry]; boy.smile = Math.max(glad, 0.5 * (1 - worry)); boy.tilt = breathe * 1.2 + Math.sin(t * 9 + 1) * 4 * worry; boy.look = 0.8 - 1.6 * prog(f, 0.8, 1.1) * (1 - prog(f, 1.8, 2.1));
  }
  if (wire) {   // her side of the wire scene: dozing nod, jump when the anchor lands, peek at it, clap as it lights up, bounce and wave when HELLO lands
    const jump = prog(f, 1.4, 1.5, easeOut) * (1 - prog(f, 1.85, 2.1)), peek = prog(f, 1.95, 2.25, easeInOut) * (1 - prog(f, 2.35, 2.55)), clap = prog(f, 2.7, 2.95) * (1 - prog(f, 4.5, 4.8)), watch = prog(f, 4.9, 5.1) * (1 - prog(f, 5.4, 5.5));
    girl.tilt = (girl.tilt || 0) + Math.sin(t * 3.2) * 5 * sleepy + 12 * peek - 5 * jump + Math.sin(t * 7) * 3 * clap;
    girl.armR = [girl.armR[0] + 150 * jump + 34 * peek + 58 * clap + Math.sin(t * 14) * 9 * clap, girl.armR[1] + 165 * jump + 40 * peek + 132 * clap];
    girl.armL = [-10 - 150 * jump - 56 * clap - Math.sin(t * 14) * 9 * clap, -6 - 165 * jump - 130 * clap];
    girl.smile = Math.max(girl.smile * (1 - jump * 0.5), clap, got); girl.look = -0.8 * (1 - peek * 0.5) - 0.1 * watch;
    girl.blink = Math.max(girl.blink, 1 - Math.abs(t - 3.6) / 0.07, 1 - Math.abs(t - 6.4) / 0.07);
  }
  const lm = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l]; };
  const [ex, ey] = lm(A_SHOULDER.x, A_SHOULDER.y, boy.armR[0], A_UPPER); const [wx, wy] = lm(ex, ey, boy.armR[1], A_FORE); const tr = (90 - boy.armR[1]) * Math.PI / 180;
  const lens = { x: bx - 34 * kick + (wx + Math.cos(tr) * A_TIP) * SC, y: by + (wy + Math.sin(tr) * A_TIP) * SC }, tgt = { x: gx - 10, y: gy - 225 * SC };
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
  const herG = <g transform={`translate(${gx} ${gy}) scale(${walking ? SC : -SC} ${SC})`}><Adult kind="woman" p={girl} id="g" />{walking && <g><rect x={-74} y={-70} width={46} height={62} rx={8} fill="#e0b84a" /><rect x={-74} y={-48} width={46} height={7} fill="#b98a2a" /><rect x={-60} y={-92} width={18} height={24} rx={6} fill="none" stroke="#2b2e3a" strokeWidth={5} /><circle cx={-64} cy={-4} r={6} fill="#2b2e3a" /><circle cx={-38} cy={-4} r={6} fill="#2b2e3a" /></g>}</g>;
  const herAt = (slot: string, i: number) => <>{balBack(PL[i].yc, PL[i].col, PL[i].x)}{herVis && herSlot === slot && pi === i && herG}{balFront(PL[i].yc, ['#ffe0b8', '#fff6e6', '#f0c08c'], PL[i].x)}</>;
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
          <pattern id="brL" patternUnits="userSpaceOnUse" width={0.56} height={0.3} patternTransform={`matrix(${0.866 * S} ${0.5 * S} 0 ${-S} ${OX} ${OY})`}><path d="M 0 0.01 H 0.56 M 0 0.16 H 0.56 M 0.02 0 V 0.15 M 0.3 0.15 V 0.3" stroke="#000" strokeWidth={0.022} opacity={0.2} fill="none" /><path d="M 0 0.035 H 0.56 M 0 0.185 H 0.56" stroke="#fff" strokeWidth={0.012} opacity={0.07} fill="none" /></pattern>
          <pattern id="brR" patternUnits="userSpaceOnUse" width={0.56} height={0.3} patternTransform={`matrix(${-0.866 * S} ${0.5 * S} 0 ${-S} ${OX} ${OY})`}><path d="M 0 0.01 H 0.56 M 0 0.16 H 0.56 M 0.02 0 V 0.15 M 0.3 0.15 V 0.3" stroke="#000" strokeWidth={0.022} opacity={0.26} fill="none" /></pattern>
          <linearGradient id="wallSh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".06" /><stop offset=".5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#060818" stopOpacity=".38" /></linearGradient>
          <linearGradient id="hazeT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a6fd0" stopOpacity=".5" /><stop offset=".35" stopColor="#3a4aa0" stopOpacity=".12" /><stop offset=".6" stopColor="#3a4aa0" stopOpacity="0" /></linearGradient>
          <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#02030c" stopOpacity=".7" /></radialGradient>
          <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 -0.12" /></filter>
          <filter id="iB"><feGaussianBlur stdDeviation="5" /></filter><filter id="iB2"><feGaussianBlur stdDeviation="9" /></filter>
        </defs>
        <rect x={fx()} width={fw()} height={1920} fill="url(#iSky)" />
        <ellipse cx={540} cy={380} rx={700} ry={140} transform="rotate(-22 540 380)" fill="url(#iMilky)" />
        {Array.from({ length: 280 }).map((_, i) => { const tw = 0.55 + 0.45 * Math.sin(f / 9 + i * 2.3); return <circle key={i} cx={fx() + hash(i) * fw()} cy={hash(i + 9) * 1920} r={hash(i + 3) * 1.6 + 0.4} fill={i % 7 ? '#fff' : '#ffe6c2'} opacity={(0.2 + 0.7 * hash(i + 5)) * tw * (hash(i + 9) < 0.45 ? 1 : 0.35)} />; })}
        <g transform="translate(900 190)"><circle r={120} fill="#cfd8ff" opacity={0.07} /><circle r={44} fill="#f3eedb" /><circle cx={17} cy={-11} r={41} fill="#050819" /></g>
        <g transform={`translate(${540 + Math.sin(t * 95) * 9 * kick + Math.sin(t * 120) * 5 * thud} ${960 + Math.cos(t * 80) * 7 * kick + Math.cos(t * 100) * 4 * thud}) scale(${cam.z}) translate(${-cam.fx} ${-cam.fy})`}>
        {/* ground: the neighbourhood continues past the frame */}
        <polygon points={P([iso(X0, -26, 0), iso(X1, -26, 0), iso(X1, 26), iso(X0, 26)])} fill="#15263c" />
        {[[-13.4, -12.9], [-9.1, -6.1], [-4.7, -1.9], [1.9, 7.2], [9.9, 10.4], [14.2, 18]].map(([y0, y1], i) => <polygon key={i} points={P([iso(X0, y0), iso(X1, y0), iso(X1, y1), iso(X0, y1)])} fill={i % 2 ? '#15263c' : '#172a3e'} />)}
        <Road y={-11} x0={X0} x1={X1} /><Road y={0} x0={X0} x1={X1} /><Road y={12.3} x0={X0} x1={X1} />
        {detail && <>
          {/* footpath paving seams, road wear, wet reflections under the lamps, manholes */}
          {[-1.6, 1.6].map((yy) => Array.from({ length: 60 }).map((_, i) => { const x = -24 + i * 0.8; return <line key={yy + '_' + i} x1={iso(x, yy - 0.28)[0]} y1={iso(x, yy - 0.28)[1]} x2={iso(x, yy + 0.28)[0]} y2={iso(x, yy + 0.28)[1]} stroke="#1a1f4a" strokeWidth={2} opacity={0.7} />; }))}
          {[-1.3, 1.3].map((yy) => <line key={'kb' + yy} x1={iso(X0, yy)[0]} y1={iso(X0, yy)[1]} x2={iso(X1, yy)[0]} y2={iso(X1, yy)[1]} stroke="#5a62a8" strokeWidth={3} opacity={0.7} />)}
          {Array.from({ length: 40 }).map((_, i) => { const q = iso(-22 + hash(i * 3) * 44, -1.1 + hash(i * 7) * 2.2); return <ellipse key={'wr' + i} cx={q[0]} cy={q[1]} rx={30 + hash(i) * 50} ry={5 + hash(i * 5) * 6} fill={i % 3 ? '#0c0e26' : '#20265a'} opacity={0.5} transform={`rotate(30 ${q[0]} ${q[1]})`} />; })}
          {[[-8.2, -0.9], [-2.2, -0.9], [4.6, -0.9], [-5.4, 0.9], [0.9, 0.9], [7.4, 0.9]].map(([x, y], i) => { const q = iso(x, y); return <g key={'rf' + i}><ellipse cx={q[0]} cy={q[1]} rx={26} ry={62} fill="#ffd9a0" opacity={0.2} filter="url(#iB2)" transform={`rotate(30 ${q[0]} ${q[1]})`} /><ellipse cx={q[0]} cy={q[1]} rx={7} ry={34} fill="#fff3d6" opacity={0.22} filter="url(#iB)" transform={`rotate(30 ${q[0]} ${q[1]})`} /></g>; })}
          {[[-6.5, 0.4], [2.8, -0.5]].map(([x, y], i) => { const q = iso(x, y); return <g key={'mh' + i}><ellipse cx={q[0]} cy={q[1]} rx={22} ry={12} fill="#0a0c20" /><ellipse cx={q[0]} cy={q[1]} rx={17} ry={9} fill="none" stroke="#3a4080" strokeWidth={2} /></g>; })}
          {/* garden: grass tufts and flowers in the park and yards */}
          {Array.from({ length: 220 }).map((_, i) => { const x = -16 + hash(i * 3 + 1) * 20, y = -5.4 + hash(i * 5 + 2) * 3.2; if (x > -4.6 && x < 4.3) return null; const q = iso(x, y); return i % 4 === 0 ? <g key={'fl' + i}><circle cx={q[0]} cy={q[1]} r={3.2} fill={['#ff8672', '#ffd36b', '#f58fb4', '#fff'][i % 4 === 0 ? (i / 4) % 4 | 0 : 0]} /><circle cx={q[0]} cy={q[1]} r={1.2} fill="#3a2a05" /></g> : <path key={'gr' + i} d={`M ${q[0] - 4} ${q[1]} l 2 -8 l 2 8 l 2 -10 l 2 10`} stroke="#2f6a4a" strokeWidth={1.6} fill="none" opacity={0.8} />; })}
        </>}
        {/* zebra crossing + garden paths */}
        {Array.from({ length: 6 }).map((_, k) => <polygon key={k} points={P([iso(-1.75, -1.15 + k * 0.42), iso(-1.0, -1.15 + k * 0.42), iso(-1.0, -0.93 + k * 0.42), iso(-1.75, -0.93 + k * 0.42)])} fill="#b9b6e6" opacity={0.6} />)}
        {FAR.map((b, i) => <polygon key={i} points={P([iso(b.x0 + b.w / 2 - 0.2, b.y0 + b.d), iso(b.x0 + b.w / 2 + 0.2, b.y0 + b.d), iso(b.x0 + b.w / 2 + 0.2, -1.9), iso(b.x0 + b.w / 2 - 0.2, -1.9)])} fill="#2a3166" />)}
        {/* top road traffic and the back row */}
        <CarIso x={((t * 2.0 + 6) % 34) - 17} y={-11.6} dir={1} c="#4a6fd0" />
        {Array.from({ length: 12 }).map((_, i) => <HouseIso key={'bk2' + i} b={{ x0: -20 + i * 3.2, y0: -16.6, w: 2.4, d: 2.4, h: 1.9 + ((i + 1) % 3) * 0.3, c: C1[(i + 2) % 6], roof: i % 2 ? 'hip' : 'gable', seed: 100 + i }} f={f} />)}
        {Array.from({ length: 12 }).map((_, i) => <TreeIso key={'tb' + i} x={-19 + i * 3.2} y={-13.6} s={0.7} />)}
        {[-19, -15.8, -12.6, -9.4, -6.2, -3.0, 0.2, 3.4, 6.6, 9.8, 13].map((x, i) => <HouseIso key={'bk' + i} b={x === 0.2 ? { x0: 0.2, y0: -9.1, w: 2.6, d: 2.6, h: 3.3, c: '#3f7a5c', roof: 'flat', seed: 78 } : { x0: x, y0: -8.9, w: 2.4, d: 2.4, h: 1.9 + (i % 3) * 0.3, c: C1[i % 6], roof: i % 2 ? 'gable' : 'hip', seed: 40 + i }} f={f} />)}
        {move && herAt('bk', 3)}
        {Array.from({ length: 14 }).map((_, i) => <TreeIso key={'t0' + i} x={-12 + i * 1.75 + hash(i) * 0.5} y={-5.7 - hash(i + 3) * 0.5} s={0.6 + hash(i + 7) * 0.35} />)}
        {/* far row with hedges along the footpath */}
        {Array.from({ length: 22 }).map((_, i) => <TreeIso key={'pk' + i} x={-16 + (i % 11) * 1.08 + hash(i + 70) * 0.5} y={-4.4 + Math.floor(i / 11) * 0.95 + hash(i + 80) * 0.3} s={0.6 + hash(i + 90) * 0.35} />)}
        {FAR.map((b) => <HouseIso key={b.seed} b={b} f={f} />)}
        {FAR.map((b, i) => <g key={'hg' + i}><Box x0={b.x0 - 0.2} y0={-2.1} w={b.w / 2 - 0.05} d={0.14} h={0.26} c="#1f4a3a" /><Box x0={b.x0 + b.w / 2 + 0.3} y0={-2.1} w={b.w / 2 - 0.1} d={0.14} h={0.26} c="#1f4a3a" /></g>)}
        {[-15.4, -13.4, -11.5, -9.6, -7.6, -5.6, 5.3, 9.0].map((x, i) => <TreeIso key={i} x={x} y={-2.45} s={0.7} />)}
        {balBack(GYC, '#6a5cab', GBX)}
        {move && balBack(HYC, '#a3688c', HBX)}
        {herVis && herSlot === 'far' && herG}
        {balFront(GYC, ['#c9b8ff', '#f0e9ff', '#a58cf0'], GBX)}
        {move && balFront(HYC, ['#ffb8d8', '#fff0f6', '#f08cb8'], HBX)}
        {concept && (() => { const st = (x: number, y: number, flip: boolean, node: React.ReactNode) => { const [a, b] = iso(x, y, 0); return <g transform={`translate(${a} ${b}) scale(${flip ? -SC : SC} ${SC})`}>{node}</g>; };
          const idle: StickPose = { blink: 0, smile: 1, look: -0.6, armR: [150, 170], armL: [-10, -6], tilt: 3 }, aim: StickPose = { blink: 0, smile: 0.9, look: 0.7, armR: [100, 104], armL: [-12, -8], holdTorch: true, tilt: -3 }, yay: StickPose = { blink: 0, smile: 1, look: 0, armR: [150, 170], armL: [-150, -170], tilt: 0 };
          return cv === '1' ? <></>
            : <>{st(4.4, -1.72, true, <Adult kind="woman" dress={3} p={cb ? yay : aim} id="au" tint={AUNTY} gun={!cb} />)}{st(7.4, -1.72, true, <Adult kind="man" p={cb ? yay : aim} id="un" tint={UNCLE} gun={!cb} />)}<g transform={`translate(${iso(-6.2, -1.72)[0]} ${iso(-6.2, -1.72)[1]}) scale(0.72)`}><g transform={`scale(${SC})`}><Adult kind="man" p={cb ? yay : aim} id="kd" tint={KIDT} gun={!cb} /></g></g></>; })()}
        {wave > 0.5 && !concept && !move && [0, 1, 2].map((i) => { const u = ((t * 0.5 + i * 0.33) % 1); return <Heart key={'h' + i} x={gx + 34 + Math.sin(u * 6 + i) * 10} y={gy - 360 * SC - u * 70} s={1.3 - u * 0.5} o={(1 - u) * 0.9} />; })}
        {/* her side garden */}
        {[[-0.6, -4.8], [0.3, -3.9], [-0.4, -2.9], [4.9, -4.4], [-3.9, -2.8], [-1.5, -2.7]].map(([x, y], i) => <TreeIso key={'gg' + i} x={x} y={y} s={0.55 + i * 0.1} />)}
        <LampIso x={-8.2} y={-1.6} /><LampIso x={-2.2} y={-1.6} /><LampIso x={4.6} y={-1.6} />
        {/* the street: cars, an auto-rickshaw and a scooter on the move */}
        <CarIso x={((t * 2.2 + 13) % 34) - 17} y={-0.65} dir={1} c="#c8553a" />
        <CarIso x={((t * 1.6 + 27) % 34) - 17} y={-0.65} dir={1} c="#e0b84a" auto />
        <CarIso x={-(((t * 1.9 + 21) % 34) - 17)} y={0.65} dir={-1} c="#3fa7a0" />
        <CarIso x={-(((t * 2.4 + 6) % 34) - 17)} y={0.65} dir={-1} c="#8a6fd8" />
        {concept === '2a' && <CarIso x={1.6} y={-0.65} dir={1} c="#e0b84a" />}
        {detail && <>
          {/* a parked scooter, a bicycle, a bench with a cat, a postbox */}
          {(() => { const q = iso(-0.4, -1.55); return <g><ellipse cx={q[0]} cy={q[1] + 4} rx={26} ry={8} fill="#000" opacity={0.3} /><circle cx={q[0] - 15} cy={q[1] - 4} r={8} fill="#101022" /><circle cx={q[0] + 15} cy={q[1] - 4} r={8} fill="#101022" /><path d={`M ${q[0] - 15} ${q[1] - 6} L ${q[0] - 4} ${q[1] - 10} L ${q[0] + 10} ${q[1] - 10} L ${q[0] + 15} ${q[1] - 6}`} stroke="#3fb8a8" strokeWidth={9} fill="none" strokeLinecap="round" /><rect x={q[0] - 14} y={q[1] - 22} width={18} height={6} rx={3} fill="#1b1520" /><line x1={q[0] + 13} y1={q[1] - 8} x2={q[0] + 9} y2={q[1] - 28} stroke="#cfd3de" strokeWidth={3} /><line x1={q[0] + 3} y1={q[1] - 29} x2={q[0] + 15} y2={q[1] - 27} stroke="#1b1520" strokeWidth={4} strokeLinecap="round" /></g>; })()}
          {(() => { const q = iso(-7.3, -1.6); return <g><rect x={q[0] - 26} y={q[1] - 16} width={52} height={6} fill="#7a5a3a" /><rect x={q[0] - 26} y={q[1] - 30} width={52} height={5} fill="#7a5a3a" /><rect x={q[0] - 24} y={q[1] - 12} width={4} height={12} fill="#2b2e3a" /><rect x={q[0] + 20} y={q[1] - 12} width={4} height={12} fill="#2b2e3a" /><ellipse cx={q[0] + 6} cy={q[1] - 21} rx={10} ry={6} fill="#f3f0ea" /><circle cx={q[0] + 15} cy={q[1] - 25} r={5} fill="#f3f0ea" /><path d={`M ${q[0] + 11} ${q[1] - 29} l 2 -5 l 2 4 M ${q[0] + 16} ${q[1] - 30} l 2 -4 l 1 5`} stroke="#f3f0ea" strokeWidth={2} fill="none" /><path d={`M ${q[0] - 4} ${q[1] - 21} q -10 -2 -8 -12`} stroke="#f3f0ea" strokeWidth={3} fill="none" strokeLinecap="round" /></g>; })()}
          {(() => { const q = iso(2.0, 1.55); return <g><rect x={q[0] - 3} y={q[1] - 30} width={6} height={30} fill="#2b2e3a" /><rect x={q[0] - 11} y={q[1] - 52} width={22} height={26} rx={5} fill="#c8553a" /><rect x={q[0] - 7} y={q[1] - 44} width={14} height={3} fill="#3a1a12" /></g>; })()}
        </>}
        <LampIso x={-5.4} y={1.6} /><LampIso x={0.9} y={1.6} /><LampIso x={7.4} y={1.6} />
        {[-9.8, -6.65, -3.55, 2.85, 5.95].map((x, i) => <TreeIso key={i} x={x} y={2.55} s={0.7} />)}
        {NEAR.map((b) => <HouseIso key={b.seed} b={b} f={f} />)}
        {move && herAt('near', 2)}
        {balBack(BYC, '#4a68a0')}
        <g transform={`translate(${bx - 16 * kick} ${by}) rotate(${-9 * kick}) scale(${SC})`}><Adult kind="man" p={boy} id="b" gun={wire || move || (cv === '1' && !cb)} /></g>
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
        {/* cinematic pass: everything except the two balconies drops back, so the eye goes to the light */}
        {cine && (hook || wire || move) && <g><defs><radialGradient id="ciHole"><stop offset="0" stopColor="#000" /><stop offset=".55" stopColor="#000" stopOpacity=".9" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient><radialGradient id="ciWarm"><stop offset="0" stopColor="#fff6dc" stopOpacity=".95" /><stop offset=".3" stopColor="#ffd98a" stopOpacity=".45" /><stop offset="1" stopColor="#ffc864" stopOpacity="0" /></radialGradient>
          <mask id="ciSpot" maskUnits="userSpaceOnUse" x={-1500} y={-1500} width={4200} height={5000}><rect x={-1500} y={-1500} width={4200} height={5000} fill="#fff" /><ellipse cx={bx} cy={by - 110} rx={270} ry={250} fill="url(#ciHole)" /><ellipse cx={gx} cy={gy - 110} rx={270} ry={250} fill="url(#ciHole)" opacity={hook ? 0.55 + 0.45 * on : 1} />{move && <ellipse cx={iso(1.7, -0.5, 2.6)[0]} cy={iso(1.7, -0.5, 2.6)[1]} rx={230} ry={230} fill="url(#ciHole)" opacity={prog(f, 6.9, 7.5)} />}</mask></defs>
          <rect x={-1500} y={-1500} width={4200} height={5000} fill="#040820" opacity={hook ? 0.52 : wire ? 0.46 : 0.42 * (1 - prog(f, 9.3, 10.0))} mask="url(#ciSpot)" /></g>}
        {/* the torch beam across the street */}
        <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`} style={{ mixBlendMode: 'screen' }} opacity={on}>
          <path d={`M 0 -3 L ${len} -26 L ${len} 26 L 0 3 Z`} fill="url(#iBeam)" opacity={0.7} filter="url(#iB2)" />
          <path d={`M 0 -1.5 L ${len} -9 L ${len} 9 L 0 1.5 Z`} fill="url(#iBeam)" opacity={0.9} />
          <circle cx={0} cy={0} r={14} fill="#fff6dc" filter="url(#iB)" /><circle cx={len} cy={0} r={30} fill="#fff1d0" opacity={0.4} filter="url(#iB2)" />
        </g>
        {cine && hook && on > 0 && <g opacity={on}>
          <circle cx={lens.x} cy={lens.y} r={95} fill="url(#ciWarm)" opacity={0.75} />
          {[0, 0.5].map((d) => { const u = (t * 1.5 + d) % 1, x = lerp(lens.x, tgt.x, u), y = lerp(lens.y, tgt.y, u); return <g key={d} opacity={Math.sin(Math.PI * u)}><circle cx={x} cy={y} r={52} fill="url(#ciWarm)" /><circle cx={x} cy={y} r={7} fill="#fffbee" /></g>; })}
          {[0, 0.5].map((d) => { const u = (t * 1.2 + d) % 1; return <circle key={d} cx={tgt.x} cy={tgt.y} r={24 + u * 100} fill="none" stroke="#ffe2a8" strokeWidth={5 * (1 - u) + 1} opacity={(1 - u) * 0.7} />; })}
        </g>}
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
          const send = clamp01((t - 5.0) / 0.5), sending = t > 5.0 && t < 5.5;
          const hit = t - 1.4, ang2 = Math.atan2(B[1] - A[1] - 70 * Math.PI * Math.cos(Math.PI * wDraw), B[0] - A[0]) * 180 / Math.PI;
          return <g>
            {box(A0, clip)}{box(B, wLive)}
            {wDraw > 0 && <><polyline points={pts} fill="none" stroke="#000" strokeWidth={7} strokeLinecap="round" opacity={0.3} transform="translate(0 6)" />
            <polyline points={pts} fill="none" stroke="#c9843a" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={pts} fill="none" stroke="#ffd9a0" strokeWidth={1.6} strokeLinecap="round" opacity={0.8} transform="translate(0 -1.5)" /></>}
            {/* recoil: shock ring, speed lines along the shot, drifting smoke */}
            {t > 0.75 && t < 1.25 && (() => { const u = (t - 0.75) / 0.5, dx = B[0] - lens.x, dy = B[1] - lens.y, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
              return <g opacity={1 - u}>
                <ellipse cx={lens.x} cy={lens.y} rx={12 + u * 70} ry={(12 + u * 70) * 0.6} fill="none" stroke="#fff6dc" strokeWidth={5 * (1 - u)} />
                {[-2, -1, 1, 2].map((i) => <line key={i} x1={lens.x + ux * (20 + u * 60) - uy * i * 9} y1={lens.y + uy * (20 + u * 60) + ux * i * 9} x2={lens.x + ux * (60 + u * 150) - uy * i * 13} y2={lens.y + uy * (60 + u * 150) + ux * i * 13} stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.8} />)}
                {[0, 1, 2, 3].map((i) => <circle key={'s' + i} cx={lens.x - 10 - i * 7 - u * 26 * (i + 1) * 0.5} cy={lens.y - 6 - u * (26 + i * 12)} r={9 + u * 12 + i * 2} fill="#cfd6ee" opacity={0.45} />)}
                {[0, 1, 2].map((i) => <path key={'k' + i} d={`M ${bx - 44 - i * 10} ${by - 150 + i * 34} l -18 ${-4 + i * 4}`} stroke="#fff" strokeWidth={3.5} strokeLinecap="round" opacity={0.85} />)}
              </g>; })()}
            {/* muzzle puff, the flying dart, and the hit */}
            {t > 0.75 && t < 1.0 && <g opacity={1 - (t - 0.75) / 0.25}><circle cx={lens.x} cy={lens.y} r={10 + (t - 0.75) * 120} fill="#fff1d0" opacity={0.7} filter="url(#iB)" />{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={lens.x + Math.cos(i * 1.3 - 1) * (t - 0.75) * 160} cy={lens.y + Math.sin(i * 1.3 - 1) * (t - 0.75) * 120} r={7} fill="#cfd6ee" opacity={0.6} />)}</g>}
            {wDraw > 0 && (() => { const anchor = <g><line x1={-22} y1={0} x2={8} y2={0} stroke="#d9d6cf" strokeWidth={5} strokeLinecap="round" /><circle cx={-24} cy={0} r={5} fill="none" stroke="#d9d6cf" strokeWidth={3} /><path d="M 8 0 Q 16 -2 12 -16 M 8 0 Q 16 2 12 16 M 8 0 L 20 0" stroke="#eef0f6" strokeWidth={5} fill="none" strokeLinecap="round" /><path d="M 12 -16 L 4 -13 M 12 16 L 4 13" stroke="#eef0f6" strokeWidth={4} strokeLinecap="round" /></g>;
              return fly ? <g transform={`translate(${E[0]} ${E[1] - 10}) rotate(${ang2}) scale(0.95)`}>{anchor}</g> : <g transform={`translate(${B[0] + 4} ${B[1] - 16}) rotate(${62 + Math.sin(t * 30) * 8 * (1 - prog(f, 1.4, 1.9))}) scale(0.85)`}>{anchor}</g>; })()}
            {hit > 0 && hit < 0.35 && <g opacity={1 - hit / 0.35}><circle cx={B[0]} cy={B[1] - 10} r={8 + hit * 110} fill="none" stroke="#fff1d0" strokeWidth={4} />{[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={B[0] + Math.cos(i * 1.05) * (14 + hit * 60)} y1={B[1] - 10 + Math.sin(i * 1.05) * (14 + hit * 60)} x2={B[0] + Math.cos(i * 1.05) * (26 + hit * 90)} y2={B[1] - 10 + Math.sin(i * 1.05) * (26 + hit * 90)} stroke="#ffe08a" strokeWidth={4} strokeLinecap="round" />)}</g>}
            {wLive > 0 && <g opacity={wLive}>
              <line x1={A[0]} y1={A[1] - 10} x2={B[0]} y2={B[1] - 10} stroke="#5fe3ff" strokeWidth={16} opacity={0.3} filter="url(#iB)" />
              <line x1={A[0]} y1={A[1] - 10} x2={B[0]} y2={B[1] - 10} stroke="#dffbff" strokeWidth={4} strokeLinecap="round" strokeDasharray="9 15" strokeDashoffset={-t * 520} />
            </g>}
            {/* HELLO leaves him as forty bits and is whole again at her side */}
            {t > 4.4 && t < 5.15 && <g opacity={prog(f, 4.4, 4.55) * (1 - prog(f, 5.0, 5.15))} transform={`translate(${bx + 20} ${by - 215})`}><rect x={-62} y={-30} width={124} height={44} rx={14} fill="#0e1430" stroke="#5fe3ff" strokeWidth={2} /><text y={3} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#fff">HELLO</text></g>}
            {sending && Array.from({ length: 40 }).map((_, i) => { const k = send * 1.5 - i * 0.012; if (k < 0 || k > 1) return null; const q = Pt(k); const b = (0x48454c4c4f / Math.pow(2, 39 - i)) & 1; return <text key={i} x={q[0]} y={q[1] - 22 - (i % 2) * 12} textAnchor="middle" style={{ font: `600 15px ${FONT.mono}` }} fill={b ? '#ffe08a' : '#9fe9ff'}>{b}</text>; })}
            {got > 0 && <g opacity={got} transform={`translate(${gx + 6} ${gy - 232 - got * 8}) scale(${0.8 + 0.2 * got})`}><rect x={-64} y={-30} width={128} height={44} rx={14} fill="#0e1430" stroke="#5fe3ff" strokeWidth={2} /><text y={3} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#fff">HELLO</text><circle cx={64} cy={-30} r={13} fill="#3ddc97" /><path d="M 58 -30 L 62 -25 L 70 -35" stroke="#06261a" strokeWidth={3.5} fill="none" strokeLinecap="round" /></g>}
          </g>; })()}
        {net && (() => {
          const N = NODES.map(([x, y, z]) => iso(x, y, z)), RT = iso(1.0, 0, 3.6), RB = iso(1.0, 0, 0);
          const tangle = 1 - prog(f, 4.9, 5.5), rise = prog(f, 5.1, 5.7, easeOut), shake = prog(f, 3.6, 3.9) * tangle;
          const curve = (a: readonly number[], b: readonly number[], sag: number, u = 1) => { const pts: string[] = []; for (let i = 0; i <= 14; i++) { const k = (i / 14) * u; pts.push(`${lerp(a[0], b[0], k)},${lerp(a[1], b[1], k) + sag * Math.sin(Math.PI * k)}`); } return pts.join(' '); };
          return <g>
            {/* every house hooks up to every other house: 45 wires */}
            {tangle > 0 && PAIRS.map(([i, j], n) => { const u = prog(f, 1.9 + n * 0.035, 2.3 + n * 0.035, easeOut); if (u <= 0) return null; const sg = 30 + hash(n) * 70; const jx = Math.sin(t * 38 + n) * 5 * shake;
              return <g key={n} opacity={tangle} transform={`translate(${jx} 0)`}><polyline points={curve(N[i], N[j], sg, u)} fill="none" stroke="#000" strokeWidth={7} opacity={0.25} transform="translate(0 8)" /><polyline points={curve(N[i], N[j], sg, u)} fill="none" stroke={shake > 0.5 ? '#ff7a5a' : '#c9843a'} strokeWidth={5} strokeLinecap="round" /></g>; })}
            {/* "me too!" from the neighbours */}
            {N.slice(2).map((q, i) => { const a = prog(f, 0.5 + i * 0.12, 0.7 + i * 0.12, easeOut) * (1 - prog(f, 1.9, 2.2)); return a > 0 ? <g key={i} opacity={a} transform={`translate(${q[0]} ${q[1] - 40 - a * 14}) scale(2.3)`}><rect x={-46} y={-22} width={92} height={36} rx={12} fill="#fff6e0" /><path d="M -8 14 L 0 26 L 8 14 Z" fill="#fff6e0" /><text y={3} textAnchor="middle" style={{ font: `800 20px ${FONT.ui}` }} fill="#1b1520">Me too!</text></g> : null; })}
            {/* the router on its pole, and one wire from each house */}
            {rise > 0 && <g opacity={rise}>
              <line x1={RB[0]} y1={RB[1]} x2={RT[0]} y2={RT[1] + (1 - rise) * 120} stroke="#2b2e3a" strokeWidth={10} strokeLinecap="round" />
              {N.map((q, i) => { const u = prog(f, 5.7 + i * 0.08, 6.2 + i * 0.08, easeOut); if (u <= 0) return null; const pk = ((t * 0.9 + i * 0.37) % 1), dir = i % 2, kk = dir ? pk : 1 - pk; const live = prog(f, 6.7, 7.0);
                return <g key={i}><polyline points={curve(q, RT, 26, u)} fill="none" stroke="#5fe3ff" strokeWidth={14} opacity={0.22} filter="url(#iB)" /><polyline points={curve(q, RT, 26, u)} fill="none" stroke="#9fe9ff" strokeWidth={4.5} strokeLinecap="round" />
                  {live > 0 && <circle cx={lerp(q[0], RT[0], kk)} cy={lerp(q[1], RT[1], kk) + 26 * Math.sin(Math.PI * kk)} r={8} fill="#fff" opacity={live} />}
                  <circle cx={q[0]} cy={q[1]} r={9} fill="#0e1430" stroke="#5fe3ff" strokeWidth={3} /></g>; })}
              <g transform={`translate(${RT[0]} ${RT[1] + (1 - rise) * 120}) scale(1.7)`}>
                <circle r={90} fill="#5fe3ff" opacity={0.22} filter="url(#iB2)" />
                <line x1={-34} y1={-20} x2={-46} y2={-74} stroke="#d9d6cf" strokeWidth={6} strokeLinecap="round" /><line x1={34} y1={-20} x2={46} y2={-74} stroke="#d9d6cf" strokeWidth={6} strokeLinecap="round" />
                <rect x={-62} y={-26} width={124} height={52} rx={14} fill="#f3f0ea" /><rect x={-62} y={8} width={124} height={18} rx={9} fill="#cfd3de" />
                {[0, 1, 2, 3].map((i) => <circle key={i} cx={-36 + i * 24} cy={-6} r={6} fill={Math.sin(t * 9 + i * 1.7) > 0 ? '#3ddc97' : '#1f6a4c'} />)}
                <text y={-96} textAnchor="middle" style={{ font: `800 40px ${FONT.ui}` }} fill="#fff" stroke="#0a0e24" strokeWidth={8} paintOrder="stroke" opacity={prog(f, 7.2, 7.5)}>ROUTER</text>
              </g>
            </g>}
          </g>; })()}
        {concept && (() => {
          const A0 = iso(BX0 + 0.62, BYC - 0.7, BZ + 0.5), HB = iso(GBX + 0.62, GYC + 0.7, BZ + 0.5), GP = iso(4.1, -2.0, 0.9), RT = iso(-6.4, -3.3, 3.4), RB = iso(-6.4, -3.3, 0);
          const curve = (a: readonly number[], b: readonly number[], sag: number) => Array.from({ length: 15 }).map((_, i) => { const k = i / 14; return `${lerp(a[0], b[0], k)},${lerp(a[1], b[1], k) + sag * Math.sin(Math.PI * k)}`; }).join(' ');
          const cop = (a: readonly number[], b: readonly number[], sag = 34, key = '') => <g key={key}><polyline points={curve(a, b, sag)} fill="none" stroke="#000" strokeWidth={7} opacity={0.25} transform="translate(0 8)" /><polyline points={curve(a, b, sag)} fill="none" stroke="#c9843a" strokeWidth={5.5} strokeLinecap="round" /></g>;
          const cy = (a: readonly number[], b: readonly number[], key = '') => <g key={key}><polyline points={curve(a, b, 22)} fill="none" stroke="#5fe3ff" strokeWidth={15} opacity={0.22} filter="url(#iB)" /><polyline points={curve(a, b, 22)} fill="none" stroke="#9fe9ff" strokeWidth={5} strokeLinecap="round" /><circle cx={lerp(a[0], b[0], 0.45)} cy={lerp(a[1], b[1], 0.45) + 21} r={8} fill="#fff" /><circle cx={a[0]} cy={a[1]} r={9} fill="#0e1430" stroke="#5fe3ff" strokeWidth={3} /></g>;
          const anch = (q: readonly number[], rot: number, key = '') => <g key={key} transform={`translate(${q[0]} ${q[1]}) rotate(${rot})`}><line x1={-22} y1={0} x2={8} y2={0} stroke="#d9d6cf" strokeWidth={5} strokeLinecap="round" /><path d="M 8 0 Q 16 -2 12 -16 M 8 0 Q 16 2 12 16 M 8 0 L 20 0" stroke="#eef0f6" strokeWidth={5} fill="none" strokeLinecap="round" /></g>;
          const post = (q: readonly number[]) => <g><line x1={q[0]} y1={q[1]} x2={q[0]} y2={q[1] + 100} stroke="#2b2e3a" strokeWidth={7} /><rect x={q[0] - 14} y={q[1] - 14} width={28} height={26} rx={5} fill="#1a2040" stroke="#5fe3ff" strokeWidth={2} /><circle cx={q[0]} cy={q[1] - 1} r={4.5} fill="#5fe3ff" /></g>;
          const router = <g><line x1={RB[0]} y1={RB[1]} x2={RT[0]} y2={RT[1]} stroke="#2b2e3a" strokeWidth={11} strokeLinecap="round" /><g transform={`translate(${RT[0]} ${RT[1]}) scale(1.8)`}><circle r={80} fill="#5fe3ff" opacity={0.22} filter="url(#iB2)" /><line x1={-34} y1={-20} x2={-46} y2={-70} stroke="#d9d6cf" strokeWidth={6} strokeLinecap="round" /><line x1={34} y1={-20} x2={46} y2={-70} stroke="#d9d6cf" strokeWidth={6} strokeLinecap="round" /><rect x={-62} y={-26} width={124} height={52} rx={14} fill="#f3f0ea" /><rect x={-62} y={8} width={124} height={18} rx={9} fill="#cfd3de" />{[0, 1, 2, 3].map((i) => <circle key={i} cx={-36 + i * 24} cy={-6} r={6} fill={i % 2 ? '#3ddc97' : '#1f6a4c'} />)}<text y={-90} textAnchor="middle" style={{ font: `800 38px ${FONT.ui}` }} fill="#fff" stroke="#0a0e24" strokeWidth={8} paintOrder="stroke">ROUTER</text></g></g>;
          const roofs = [iso(-5.1, 3.35, 3.0), iso(4.4, 3.35, 3.1), iso(4.4, -3.35, 2.9), iso(7.5, -3.35, 3.2), iso(-5.0, -7.7, 3.1), iso(-1.8, -7.7, 3.4)];
          const bub = (q: readonly number[], txt: string, key = '') => <g key={key} transform={`translate(${q[0]} ${q[1]}) scale(2.1)`}><rect x={-50} y={-22} width={100} height={36} rx={12} fill="#fff6e0" /><path d="M -8 14 L 0 26 L 8 14 Z" fill="#fff6e0" /><text y={3} textAnchor="middle" style={{ font: `800 19px ${FONT.ui}` }} fill="#1b1520">{txt}</text></g>;
          if (cb) return <g>{[A0, HB, GP, ...roofs].map((q, i) => cy(q, RT, 'c' + i))}{post(GP)}{router}{cv === '1' && bub([gx - 10, gy - 215], 'HELLO ✓')}</g>;
          if (cv === '1') { const F = iso(4.4, 3.35, 3.1), mid = [lerp(lens.x, F[0], 0.62), lerp(lens.y, F[1], 0.62) - 40];
            return <g>{cop(A0, HB)}{anch([HB[0] + 4, HB[1] - 6], 62)}{cop([lens.x, lens.y], GP, 46)}{anch([GP[0], GP[1] - 8], 80)}{post(GP)}{cop([lens.x, lens.y], mid, 14)}{anch(mid, 20)}
              {bub([HB[0] + 30, HB[1] - 150], 'She left!')}<text x={bx - 10} y={by - 220} textAnchor="middle" style={{ font: `800 54px ${FONT.ui}` }} fill="#ffd38a" stroke="#0a0e24" strokeWidth={8} paintOrder="stroke">2 … 3 … 4 ?!</text></g>; }
          const K = iso(-6.2, -1.72, 1.0), AU = iso(4.4, -1.72, 1.6), UN = iso(7.4, -1.72, 1.6), car = iso(1.6, -0.65, 0.75);
          const fly = [lerp(UN[0], A0[0], 0.5), lerp(UN[1], A0[1], 0.5) - 70];
          return <g>{cop(A0, HB)}{cop(K, HB, 30)}{anch([HB[0] - 8, HB[1] - 12], 20)}{cop(K, A0, 40)}{anch([A0[0] - 4, A0[1] - 12], 95)}{cop(AU, A0, 50)}{cop(AU, car, 10)}{anch([car[0], car[1] - 4], 130)}{cop(UN, fly, 16)}{anch(fly, 195)}{cop(UN, roofs[5], 40)}{anch(roofs[5], -120)}{cop(K, roofs[4], 30)}{anch(roofs[4], -60)}{cop(roofs[0], HB, 60)}{cop(roofs[1], roofs[2], 50)}{cop(roofs[0], roofs[1], 50)}
            {bub([K[0], K[1] - 130], 'Me too!', 'b1')}{bub([AU[0] - 10, AU[1] - 170], 'Me too!', 'b2')}{bub([UN[0], UN[1] - 175], 'Me too!', 'b3')}{bub([roofs[0][0], roofs[0][1] - 40], 'Me too!', 'b4')}{bub([roofs[1][0], roofs[1][1] - 40], 'Me too!', 'b5')}
            <text x={car[0] + 70} y={car[1] - 60} style={{ font: `800 64px ${FONT.ui}` }} fill="#ff7a5a" stroke="#0a0e24" strokeWidth={8} paintOrder="stroke">!</text></g>; })()}
        {move && (() => {
          const A0 = iso(BX0 + 0.62, BYC - 0.7, BZ + 0.5), BXS = PL.map((q) => iso(q.x + 0.62, q.yc + 0.7, BZ + 0.5)), RT = iso(1.7, -0.5, 4.0), RB = iso(1.7, -0.5, 0);
          const roofs = [iso(-5.1, 3.35, 3.0), iso(7.5, -3.35, 3.2), iso(-5.0, -7.7, 3.1), iso(-1.8, -7.7, 3.4)];
          const curve = (a: readonly number[], b: readonly number[], sag: number, u = 1) => Array.from({ length: 15 }).map((_, i) => { const k = (i / 14) * u; return `${lerp(a[0], b[0], k)},${lerp(a[1], b[1], k) + sag * Math.sin(Math.PI * k)}`; }).join(' ');
          const cop = (a: readonly number[], b: readonly number[], sag: number, o: number, dead = 0) => <g opacity={o}><polyline points={curve(a, b, sag)} fill="none" stroke="#000" strokeWidth={7} opacity={0.25} transform="translate(0 8)" /><polyline points={curve(a, b, sag)} fill="none" stroke={dead > 0.5 ? '#6a6f8a' : '#c9843a'} strokeWidth={5.5} strokeLinecap="round" /></g>;
          const anch = (q: readonly number[], rot: number, sc = 0.9) => <g transform={`translate(${q[0]} ${q[1]}) rotate(${rot}) scale(${sc})`}><line x1={-22} y1={0} x2={8} y2={0} stroke="#d9d6cf" strokeWidth={5} strokeLinecap="round" /><path d="M 8 0 Q 16 -2 12 -16 M 8 0 Q 16 2 12 16 M 8 0 L 20 0" stroke="#eef0f6" strokeWidth={5} fill="none" strokeLinecap="round" /></g>;
          const box = (q: readonly number[], lit: number) => <g><rect x={q[0] - 13} y={q[1] - 22} width={26} height={24} rx={5} fill="#1a2040" stroke="#5fe3ff" strokeWidth={2} /><circle cx={q[0]} cy={q[1] - 10} r={4} fill={lit > 0.5 ? '#5fe3ff' : '#35406a'} /></g>;
          const fade = 1 - prog(f, 7.0, 7.6), rise = prog(f, 6.9, 7.5, easeOut), wires = 1 + SHOTS.filter((sh) => t >= sh + 0.5).length;
          const hello = (q: readonly number[], a: number, tick: boolean) => a > 0 ? <g opacity={a} transform={`translate(${q[0]} ${q[1]}) scale(1.5)`}><rect x={-64} y={-30} width={128} height={44} rx={14} fill="#0e1430" stroke="#5fe3ff" strokeWidth={2} /><text y={3} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#fff">HELLO</text>{tick && <><circle cx={64} cy={-30} r={13} fill="#3ddc97" /><path d="M 58 -30 L 62 -25 L 70 -35" stroke="#06261a" strokeWidth={3.5} fill="none" strokeLinecap="round" /></>}</g> : null;
          const T3 = BXS[3], pk = clamp01((t - 14.45) / 0.65), pkP = pk < 0.5 ? [lerp(A0[0], RT[0], pk * 2), lerp(A0[1], RT[1], pk * 2) + 22 * Math.sin(Math.PI * pk * 2)] : [lerp(RT[0], T3[0], pk * 2 - 1), lerp(RT[1], T3[1], pk * 2 - 1) + 22 * Math.sin(Math.PI * (pk * 2 - 1))];
          const star: [readonly number[], number][] = [[A0, 2], [BXS[0], 3], [BXS[1], 4], [BXS[2], 5], [T3, 7], [roofs[0], 6], [roofs[1], 8], [roofs[2], 9], [roofs[3], 10]];
          return <g>
            {/* every place she stays gets its own wire from his balcony: 1, 2, 3, 4 ... */}
            {fade > 0 && <g opacity={fade}>
              {cop([A0[0], A0[1] - 10], [BXS[0][0], BXS[0][1] - 10], 4 + 30 * prog(f, 0.7, 1.1), 1, prog(f, 0.7, 1.1))}{anch([BXS[0][0] + 4, BXS[0][1] - 16], 62 + 20 * prog(f, 0.7, 1.1))}
              {SHOTS.map((sh, i) => { const u = prog(f, sh, sh + 0.5), B = BXS[i + 1]; if (u <= 0) return null; const dd = pi > i + 1 ? 1 : 0, st = u < 1 ? [lens.x, lens.y] : [lerp(lens.x, A0[0], prog(f, sh + 0.55, sh + 0.85)), lerp(lens.y, A0[1] - 10, prog(f, sh + 0.55, sh + 0.85))];
                const E = [lerp(st[0], B[0], u), lerp(st[1], B[1] - 10, u) - 50 * Math.sin(Math.PI * u)], ang3 = Math.atan2(B[1] - st[1], B[0] - st[0]) * 180 / Math.PI;
                return <g key={i}>{cop(st, u < 1 ? E : [B[0], B[1] - 10], u < 1 ? 24 * u : 10 + 20 * dd, 1, dd)}{u < 1 ? anch(E, ang3) : anch([B[0] + 4, B[1] - 16], 62 + 20 * dd)}
                  {t > sh && t < sh + 0.3 && <g opacity={1 - (t - sh) / 0.3}><circle cx={lens.x} cy={lens.y} r={10 + (t - sh) * 130} fill="#fff1d0" opacity={0.7} filter="url(#iB)" /><ellipse cx={lens.x} cy={lens.y} rx={14 + (t - sh) * 180} ry={(14 + (t - sh) * 180) * 0.6} fill="none" stroke="#fff6dc" strokeWidth={4} /></g>}
                  {t > sh + 0.5 && t < sh + 0.85 && <circle cx={B[0]} cy={B[1] - 10} r={8 + (t - sh - 0.5) * 110} fill="none" stroke="#fff1d0" strokeWidth={4} opacity={1 - (t - sh - 0.5) / 0.35} />}</g>; })}
              <text x={bx + 40} y={by - 250} textAnchor="middle" style={{ font: `800 62px ${FONT.ui}` }} fill={wires > 2 ? '#ff9a7a' : '#ffd38a'} stroke="#0a0e24" strokeWidth={9} paintOrder="stroke" opacity={prog(f, 2.7, 2.9)}>{wires} wire{wires > 1 ? 's' : ''}{wires > 3 ? '?!' : ''}</text>
            </g>}
            {/* the neighbours see it and want the same thing */}
            {roofs.map((q, i) => { const a = prog(f, 6.0 + i * 0.18, 6.2 + i * 0.18, easeOut) * (1 - prog(f, 7.3, 7.6)); return a > 0 ? <g key={'mt' + i} opacity={a} transform={`translate(${q[0]} ${q[1] - 30 - a * 16}) scale(${2.6 * (0.7 + 0.3 * a)})`}><rect x={-62} y={-22} width={124} height={36} rx={12} fill="#fff6e0" /><path d="M -8 14 L 0 26 L 8 14 Z" fill="#fff6e0" /><text y={3} textAnchor="middle" style={{ font: `800 19px ${FONT.ui}` }} fill="#1b1520">{i % 2 ? 'Me too!' : 'I want one!'}</text></g> : null; })}
            {/* her hop from one place to the next */}
            {[2, 3].map((i) => { const u = clamp01((t - LEAVE[i - 1]) / (ARR[i] - LEAVE[i - 1])); if (u <= 0 || u >= 1) return null; const a = iso(PL[i - 1].x + 0.3, PL[i - 1].yc, BZ + 1), b = iso(PL[i].x + 0.3, PL[i].yc, BZ + 1), q = [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 130 * Math.sin(Math.PI * u)];
              return <g key={'hop' + i}><polyline points={curve(a, b, -130, u)} fill="none" stroke="#ff8672" strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" /><g transform={`translate(${q[0]} ${q[1]})`}><rect x={-20} y={-16} width={40} height={34} rx={7} fill="#e0b84a" /><rect x={-20} y={-4} width={40} height={6} fill="#b98a2a" /><rect x={-9} y={-28} width={18} height={14} rx={5} fill="none" stroke="#fff" strokeWidth={4} /></g></g>; })}
            {box(A0, 1)}{BXS.map((q, i) => (i === 0 || t > ARR[i]) && <g key={'bx' + i}>{box(q, i === pi ? 1 : 0)}</g>)}
            {/* place name signs */}
            {PL.map((q, i) => { if (!q.name) return null; const c = iso(q.x - 1.3, q.yc + (q.slot === 'near' ? 0.45 : -0.45), 3.85), a = prog(f, ARR[i] - 0.3, ARR[i]); return <g key={'sg' + i} transform={`translate(${c[0]} ${c[1]}) scale(1.4)`} opacity={a}><rect x={-74} y={-24} width={148} height={44} rx={12} fill="#ff6f91" /><text y={7} textAnchor="middle" style={{ font: `800 25px ${FONT.ui}` }} fill="#fff">{q.name}</text></g>; })}
            {/* the router rises in the middle; one wire per house, like a web around it */}
            {rise > 0 && <g opacity={rise}>
              <line x1={RB[0]} y1={RB[1]} x2={RT[0]} y2={RT[1] + (1 - rise) * 120} stroke="#2b2e3a" strokeWidth={11} strokeLinecap="round" />
              {star.map(([q], i) => { const u = prog(f, 7.5 + i * 0.07, 8.0 + i * 0.07, easeOut); if (u <= 0) return null; const kk = (t * 0.8 + i * 0.37) % 1, live = prog(f, 8.3, 8.6) * (t > 14.4 && t < 15.15 ? 0.25 : 1);
                return <g key={i}><polyline points={curve(q, RT, 22, u)} fill="none" stroke="#5fe3ff" strokeWidth={15} opacity={0.22} filter="url(#iB)" /><polyline points={curve(q, RT, 22, u)} fill="none" stroke="#9fe9ff" strokeWidth={5} strokeLinecap="round" />
                  {live > 0 && <circle cx={lerp(q[0], RT[0], kk)} cy={lerp(q[1], RT[1], kk) + 22 * Math.sin(Math.PI * kk)} r={7} fill="#fff" opacity={live} />}{i > 4 && <circle cx={q[0]} cy={q[1]} r={9} fill="#0e1430" stroke="#5fe3ff" strokeWidth={3} />}</g>; })}
              {/* the network mesh: glowing dots on every house, thin lines to their nearest neighbours, soft bokeh */}
              {(() => { const mesh = MESH_ON ? prog(f, 8.1, 9.6) : 0;   // full web look is kept for a later scene
                if (mesh <= 0) return null;
                const pts: number[][] = [RT as unknown as number[], ...star.map(([q]) => q as unknown as number[])];
                [-19.5, -16, -12.5, -9.9, -6.5, -3.4, 0, 3.4, 6, 8.6, 11.5, 14.6, 17.5, 20.5].forEach((y, r) => { for (let x = -18; x <= 18; x += 2.2) { const xx = x + (r % 2) * 1.5 + (hash(r * 31 + x) - 0.5) * 0.8, q = iso(xx, y + (hash(r * 17 + x * 3) - 0.5) * 1.2, 2.6 + hash(r * 7 + x) * 2.2); if (pts.every((o) => Math.hypot(o[0] - q[0], o[1] - q[1]) > 105)) pts.push([q[0], q[1]]); } });
                const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]); const edges: [number, number][] = [];
                pts.forEach((a, ai) => { pts.map((b, bi) => [dist(a, b), bi]).sort((u, v) => u[0] - v[0]).slice(1, 5).forEach(([, bi]) => { if (!edges.some(([x, y]) => (x === ai && y === bi) || (x === bi && y === ai))) edges.push([ai, bi]); }); });
                const R = mesh * 2600, vis = (q: number[]) => clamp01((R - dist(q, pts[0])) / 260);
                return <g style={{ mixBlendMode: 'screen' }}>
                  <rect x={-3000} y={-3000} width={8000} height={8000} fill="#03061c" opacity={0.55 * Math.min(1, mesh * 2)} style={{ mixBlendMode: 'normal' }} />
                  {Array.from({ length: 130 }).map((_, i) => { const x = -700 + hash(i * 3 + 1) * 3000 + Math.sin(t * 0.5 + i) * 30, y = -500 + hash(i * 5 + 2) * 3200 + Math.cos(t * 0.4 + i * 2) * 30, q = [x, y]; return <circle key={'bk' + i} cx={x} cy={y} r={12 + hash(i * 7) * 34} fill={i % 3 ? '#6f9bff' : '#e8f0ff'} opacity={(0.25 + 0.4 * hash(i * 11)) * vis(q) * (0.7 + 0.3 * Math.sin(t * 2 + i))} filter="url(#iB2)" />; })}
                  {edges.map(([a, b], i) => { const o = Math.min(vis(pts[a]), vis(pts[b])); return o > 0 ? <g key={'e' + i} opacity={o}><line x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="#7fa6ff" strokeWidth={9} opacity={0.35} filter="url(#iB)" /><line x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="#e4eeff" strokeWidth={2.6} opacity={0.9} /></g> : null; })}
                  {edges.map(([a, b], i) => { const far = dist(pts[a], pts[0]) > dist(pts[b], pts[0]) ? a : b, near = far === a ? b : a, k = (t * 0.75 + hash(i) * 3) % 1, o = Math.min(vis(pts[a]), vis(pts[b])) * Math.sin(Math.PI * k);   // every dot runs towards the router
                    return <g key={'tr' + i} opacity={o}><circle cx={lerp(pts[far][0], pts[near][0], k)} cy={lerp(pts[far][1], pts[near][1], k)} r={11} fill="#8fb4ff" opacity={0.6} filter="url(#iB)" /><circle cx={lerp(pts[far][0], pts[near][0], k)} cy={lerp(pts[far][1], pts[near][1], k)} r={4.5} fill="#fff" /></g>; })}
                  {pts.map((q, i) => { const o = vis(q), tw = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.3); return o > 0 ? <g key={'n' + i} opacity={o}><circle cx={q[0]} cy={q[1]} r={26} fill="#8fb4ff" opacity={0.6 * tw} filter="url(#iB)" /><circle cx={q[0]} cy={q[1]} r={i < 10 ? 9 : 6.5} fill="#fff" /></g> : null; })}
                </g>; })()}
              <g transform={`translate(${RT[0]} ${RT[1] + (1 - rise) * 120}) scale(0.85)`}>
                <circle r={80} fill="#5fe3ff" opacity={0.22} filter="url(#iB2)" />
                <line x1={-34} y1={-20} x2={-46} y2={-70} stroke="#d9d6cf" strokeWidth={6} strokeLinecap="round" /><line x1={34} y1={-20} x2={46} y2={-70} stroke="#d9d6cf" strokeWidth={6} strokeLinecap="round" />
                <rect x={-62} y={-26} width={124} height={52} rx={14} fill="#f3f0ea" /><rect x={-62} y={8} width={124} height={18} rx={9} fill="#cfd3de" />
                {[0, 1, 2, 3].map((i) => <circle key={i} cx={-36 + i * 24} cy={-6} r={6} fill={Math.sin(t * 9 + i * 1.7) > 0 ? '#3ddc97' : '#1f6a4c'} />)}
                <text y={-92} textAnchor="middle" style={{ font: `800 70px ${FONT.ui}` }} fill="#fff" stroke="#0a0e24" strokeWidth={12} paintOrder="stroke" opacity={prog(f, 8.9, 9.2)}>ROUTER</text>
              </g>
            </g>}
            {/* door numbers: every house gets its own address */}
            {star.map(([q, n], i) => { const a = prog(f, 10.0 + i * 0.12, 10.25 + i * 0.12, easeOut); if (a <= 0) return null; const her = n === 7, hi = her && t > 14.4 ? 1 : 0, full = prog(f, 12.75, 13.05);
              return <g key={'ip' + i} opacity={a} transform={`translate(${q[0] + (i < 5 ? 10 : 0)} ${q[1] + (i < 5 ? 56 : -48)}) scale(${(1.8 + 0.3 * hi) * (0.7 + 0.3 * a)})`}>
                <rect x={-20 - 62 * full} y={-19} width={40 + 124 * full} height={38} rx={10} fill={her ? '#ffe08a' : '#0e1430'} stroke={her ? '#fff' : '#5fe3ff'} strokeWidth={2.5} />
                <text y={8} textAnchor="middle" style={{ font: `600 ${full > 0.5 ? 20 : 24}px ${FONT.mono}` }} fill={her ? '#3a2a05' : '#dffbff'}>{full > 0.5 ? `192.168.1.${n}` : n}</text></g>; })}
            {/* HELLO goes from him, through the router, to wherever she is now */}
            {hello([bx + 20, by - 235], prog(f, 13.9, 14.05) * (1 - prog(f, 14.45, 14.6)), false)}
            {t > 14.45 && t < 15.1 && <><g transform={`translate(${pkP[0]} ${pkP[1] - 60}) scale(2)`}><rect x={-66} y={-17} width={132} height={32} rx={10} fill="#ffe08a" /><text y={6} textAnchor="middle" style={{ font: `600 19px ${FONT.mono}` }} fill="#3a2a05">To: 192.168.1.7</text></g><circle cx={pkP[0]} cy={pkP[1]} r={26} fill="#ffe08a" opacity={0.5} filter="url(#iB)" /><rect x={pkP[0] - 16} y={pkP[1] - 11} width={32} height={22} rx={5} fill="#ffe08a" /><path d={`M ${pkP[0] - 14} ${pkP[1] - 9} L ${pkP[0]} ${pkP[1] + 2} L ${pkP[0] + 14} ${pkP[1] - 9}`} stroke="#8a5a10" strokeWidth={3} fill="none" /></>}
            {hello([gx + 6, gy - 250 - mGot * 8], mGot, true)}
            {mGot > 0.5 && [0, 1, 2].map((i) => { const u = ((t * 0.5 + i * 0.33) % 1); return <Heart key={'mh' + i} x={gx + 80 + Math.sin(u * 6 + i) * 10} y={gy - 190 - u * 70} s={1.8 - u * 0.5} o={(1 - u) * 0.9} />; })}
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
        {detail && <>
          {/* fireflies in the park, moths at the lamps, bats, distance haze, vignette, film grain */}
          {Array.from({ length: cine ? 16 : 40 }).map((_, i) => { const x = 20 + hash(i * 3) * 520 + Math.sin(t * 0.8 + i) * 16, y = 300 + hash(i * 7) * 460 + Math.cos(t * 0.6 + i * 2) * 14, tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7); return <g key={'ff' + i} opacity={tw}><circle cx={x} cy={y} r={9} fill="#d8ff8a" opacity={0.18} /><circle cx={x} cy={y} r={5} fill="#d8ff8a" opacity={0.3} /><circle cx={x} cy={y} r={2} fill="#f2ffc0" /></g>; })}
          {[[590, 850], [565, 1208], [270, 1560]].map(([lx, ly], i) => [0, 1, 2].map((k) => <circle key={`mo${i}${k}`} cx={lx + Math.sin(t * 5 + k * 2 + i) * 22} cy={ly + Math.cos(t * 6.3 + k * 1.3) * 16} r={2.2} fill="#fff" opacity={0.8} />))}
          {[0, 1, 2].map((i) => { const x = ((t * 60 + i * 420) % 1400) - 150, y = 150 + i * 90 + Math.sin(t * 2 + i) * 20, wv = Math.sin(t * 16 + i) * 7; return <path key={'bat' + i} d={`M ${x - 14} ${y + wv} Q ${x - 6} ${y - 8} ${x} ${y} Q ${x + 6} ${y - 8} ${x + 14} ${y + wv}`} stroke="#05060f" strokeWidth={4} fill="none" strokeLinecap="round" />; })}
          <rect x={fx()} width={fw()} height={1920} fill="url(#hazeT)" style={{ mixBlendMode: 'screen' }} />
          <rect x={fx()} width={fw()} height={1920} fill="url(#vig)" />
          <rect x={fx()} width={fw()} height={1920} filter="url(#grain)" opacity={0.1} style={{ mixBlendMode: 'overlay' }} />
        </>}
        {/* HELLO floats over the park while the count runs */}
        {hook && t > 12.45 && t < 14.3 && 'HELLO'.split('').map((ch, j) => { const a = prog(f, 12.5 + j * 0.2, 12.75 + j * 0.2, easeOut); return (
          <g key={j} opacity={a * (1 - prog(f, 14.1, 14.3))} transform={`translate(${78 + j * 92} ${640 - a * 30})`}>
            <text textAnchor="middle" style={{ font: `800 104px ${FONT.ui}` }} fill="#ffd38a" filter="url(#iB2)" opacity={0.8}>{ch}</text>
            <text textAnchor="middle" style={{ font: `800 104px ${FONT.ui}` }} fill="#fff1d0">{ch}</text>
            <text y={44} textAnchor="middle" style={{ font: `600 17px ${FONT.mono}` }} fill="#b9c4ff">{['01001000', '01000101', '01001100', '01001100', '01001111'][j]}</text>
          </g>); })}
      </svg>
      {cine && <><div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 230, backdropFilter: 'blur(5px)', WebkitMaskImage: 'linear-gradient(#000 20%, transparent)', maskImage: 'linear-gradient(#000 20%, transparent)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 330, backdropFilter: 'blur(5px)', WebkitMaskImage: 'linear-gradient(transparent, #000 80%)', maskImage: 'linear-gradient(transparent, #000 80%)' }} /></>}
      {hook && <HookOverlays f={f} t={t} macro={macro} mute={mute} />}
      {wire && <WireOverlays f={f} t={t} />}
      {net && <NetOverlays f={f} t={t} />}
      {move && (() => { let line: React.ReactNode = null; for (const [a, txt] of MVO) if (t >= a) line = txt; return line ? <><div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 6px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.9)' }}><div className="sub">{line}</div></div><style>{'.sub em{font-style:normal;color:#ffd38a}'}</style><div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: MARK_O }}><Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} /><span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span></div></> : null; })()}
      {concept && <><div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 6px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.9)' }}><div className="sub">{CSUB[concept]}</div></div><style>{'.sub em{font-style:normal;color:#ffd38a}'}</style></>}
    </AbsoluteFill>
  );
};

const HookOverlays: React.FC<{ f: number; t: number; macro: number; mute?: boolean }> = ({ f, t, macro, mute }) => {
  let line: React.ReactNode = null; for (const [a, txt] of VO) if (t >= a) line = txt;
  const SK = '#d6a481', SKS = '#b47f5a';
  return (
    <>
      {!mute && <Audio src={staticFile('hook-mix.wav')} />}
      {macro > 0 && (
        <AbsoluteFill style={{ opacity: macro }}>
          <svg width={1080} height={1920}>
            <defs><filter id="mB"><feGaussianBlur stdDeviation="26" /></filter><filter id="mB2"><feGaussianBlur stdDeviation="9" /></filter><radialGradient id="mG"><stop offset="0" stopColor="#fff8e6" /><stop offset=".3" stopColor="#ffe2a8" stopOpacity=".8" /><stop offset="1" stopColor="#ffcf80" stopOpacity="0" /></radialGradient>
              <linearGradient id="mT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a5266" /><stop offset=".3" stopColor="#8e97ab" /><stop offset=".5" stopColor="#2a2f3c" /><stop offset="1" stopColor="#14161d" /></linearGradient></defs>
            <rect x={fx()} width={fw()} height={1920} fill="#0b1030" />
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
      <div style={{ position: 'absolute', top: 236, left: 90, right: 90, height: 200, borderRadius: 40, background: 'rgba(10,14,36,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 62px/1.12 ${FONT.ui}`, color: TECH.text, opacity: prog(f, 0.1, 0.35) * (1 - prog(f, 3.0, 3.3)) }}>
        <div>This <span style={{ color: '#ffd38a' }}>torch</span> explains<br />the <span style={{ color: '#9fe9ff' }}>internet.</span></div>
      </div>
      <div style={{ position: 'absolute', top: 236, left: 90, right: 90, height: 200, borderRadius: 40, background: 'rgba(10,14,36,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 62px/1.12 ${FONT.ui}`, color: TECH.text, opacity: prog(f, 7.1, 7.4) * (1 - prog(f, 8.2, 8.4)) }}>
        <div>How does the <span style={{ color: '#ffd38a' }}>internet</span><br />reach you?</div>
      </div>
      {line && t >= 0.25 && (
        <div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 6px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.9)' }}>
          <div className="sub">{line}</div>
        </div>
      )}
      <style>{'.sub em{font-style:normal;color:#ffd38a}'}</style>
      <div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: MARK_O }}>
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
          {t < 4.9 ? (
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
      <div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: MARK_O }}>
        <Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} />
        <span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span>
      </div>
    </>
  );
};

const NetOverlays: React.FC<{ f: number; t: number }> = ({ f, t }) => {
  let line: React.ReactNode = null; for (const [a, txt] of NVO) if (t >= a) line = txt;
  const n = Math.min(45, Math.max(0, Math.round((t - 1.9) / 0.035)));
  return (
    <>
      {t > 2.2 && (
        <div style={{ position: 'absolute', top: 236, left: 90, right: 90, height: 200, borderRadius: 40, background: 'rgba(10,14,36,.86)', border: '1px solid rgba(160,176,255,.3)', boxShadow: '0 20px 60px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: prog(f, 2.2, 2.45) }}>
          {t < 5.6 ? (
            <><div style={{ font: `800 70px ${FONT.ui}`, color: TECH.text }}>10 houses = <span style={{ color: '#ff9a7a' }}>{n}</span> wires</div>
              <div style={{ font: `600 26px ${FONT.mono}`, letterSpacing: '0.1em', color: '#a9b4dd' }}>EVERY HOUSE TO EVERY HOUSE</div></>
          ) : (
            <><div style={{ font: `800 70px ${FONT.ui}`, color: TECH.text }}>1 box = <span style={{ color: '#9fe9ff' }}>10</span> wires</div>
              <div style={{ font: `600 26px ${FONT.mono}`, letterSpacing: '0.1em', color: '#a9b4dd' }}>EVERY HOUSE TO THE ROUTER</div></>
          )}
        </div>
      )}
      {line && t >= 0.3 && (
        <div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 6px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.9)' }}>
          <div className="sub">{line}</div>
        </div>
      )}
      <style>{'.sub em{font-style:normal;color:#ffd38a}'}</style>
      <div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: MARK_O }}>
        <Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} />
        <span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span>
      </div>
    </>
  );
};
