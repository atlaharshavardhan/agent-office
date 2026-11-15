import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import '@fontsource/manrope/700.css'; import '@fontsource/manrope/800.css'; import '@fontsource/ibm-plex-mono/600.css';
import { FPS, hash, lerp, prog, clamp01, easeOut, easeInOut } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Adult } from './Adult';
import type { StickPose } from './Dusk';

/* Step 3 (local 0 - 11 s): she moves to another city. One router cannot reach that far, so routers link to routers
   and the message hops along. Zoomed-out isometric map in the same night style. */
const S = 56, OX = 540, OY = 960;
const iso = (x: number, y: number, z = 0) => [OX + (x - y) * 0.866 * S, OY + (x + y) * 0.5 * S - z * S] as const;
const P = (a: (readonly number[])[]) => a.map((q) => `${q[0]},${q[1]}`).join(' ');
const shade = (c: string, k: number) => { const n = parseInt(c.slice(1), 16); const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
type B = { x: number; y: number; w: number; d: number; h: number; c: string; lit?: number };
const Bx: React.FC<{ b: B }> = ({ b }) => { const { x, y, w, d, h, c } = b, x1 = x + w, y1 = y + d; const fl = Math.max(1, Math.round(h / 1.1));
  return <g>
    <polygon points={P([iso(x1, y, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x1, y, h)])} fill={shade(c, 0.62)} />
    <polygon points={P([iso(x, y1, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x, y1, h)])} fill={shade(c, 0.82)} />
    <polygon points={P([iso(x, y, h), iso(x1, y, h), iso(x1, y1, h), iso(x, y1, h)])} fill={c} />
    {Array.from({ length: fl }).map((_, f) => [0.22, 0.6].map((u, i) => { const on = hash(x * 7 + y * 13 + f * 3 + i) < (b.lit ?? 0.7); const z0 = (f + 0.3) * (h / fl), z1 = (f + 0.75) * (h / fl);
      return <g key={`${f}${i}`}><polygon points={P([iso(x + w * u, y1, z0), iso(x + w * (u + 0.2), y1, z0), iso(x + w * (u + 0.2), y1, z1), iso(x + w * u, y1, z1)])} fill={on ? '#ffd27a' : '#151836'} /><polygon points={P([iso(x1, y + d * u, z0), iso(x1, y + d * (u + 0.2), z0), iso(x1, y + d * (u + 0.2), z1), iso(x1, y + d * u, z1)])} fill={on ? '#e8b860' : '#101230'} /></g>; }))}
  </g>; };

/* cities: 0 home town, 1-2 villages on the way, 3 her city, 4+ other cities of the region */
const CT: { c: readonly [number, number]; n: number; cols: string[]; h: [number, number]; r: number; seed: number }[] = [
  { c: [2, 10], n: 12, cols: ['#3f5a8c', '#5a4d94', '#8a4f74', '#a8683a', '#3f7a5c', '#4a3f7a'], h: [1.0, 1.9], r: 2.0, seed: 1 },
  { c: [2.6, 3.8], n: 6, cols: ['#4a3f7a', '#34487a', '#51437c'], h: [0.9, 1.6], r: 1.5, seed: 40 },
  { c: [-2.2, -2.6], n: 6, cols: ['#3d4a82', '#4b3c70', '#34487a'], h: [0.9, 1.6], r: 1.5, seed: 70 },
  { c: [-1.5, -9.5], n: 15, cols: ['#2f8f96', '#7a5ad0', '#c95a8c', '#3a6fd0', '#5a4d94'], h: [2.0, 4.6], r: 2.2, seed: 100 },
  { c: [9.5, 2.5], n: 11, cols: ['#b0703a', '#c98a4a', '#8a4f74', '#7a5ad0'], h: [1.4, 3.2], r: 1.9, seed: 130 },
  { c: [-8.5, 5.5], n: 11, cols: ['#3f7a5c', '#2f8f96', '#4a8a6a', '#3a6fd0'], h: [1.3, 3.0], r: 1.9, seed: 160 },
  { c: [8, -6], n: 10, cols: ['#c95a8c', '#a3688c', '#5a4d94', '#3a6fd0'], h: [1.5, 3.6], r: 1.8, seed: 190 },
  { c: [-9.5, -4.5], n: 10, cols: ['#3a6fd0', '#4a68a0', '#7a5ad0', '#2f8f96'], h: [1.5, 3.4], r: 1.8, seed: 220 },
  { c: [10, 11], n: 8, cols: ['#51437c', '#8a4f74', '#3f5a8c'], h: [1.0, 2.2], r: 1.6, seed: 250 },
  { c: [-6, 13], n: 8, cols: ['#3d4a82', '#3f7a5c', '#a8683a'], h: [1.0, 2.2], r: 1.6, seed: 280 },
  { c: [6.5, -13], n: 8, cols: ['#2f8f96', '#c95a8c', '#5a4d94'], h: [1.2, 2.8], r: 1.6, seed: 310 },
  { c: [-10, -12.5], n: 8, cols: ['#7a5ad0', '#3a6fd0', '#a3688c'], h: [1.2, 2.8], r: 1.6, seed: 340 },
];
const LINKS: [number, number][] = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 6], [6, 3], [0, 5], [5, 7], [7, 3], [2, 7], [0, 8], [8, 4], [0, 9], [9, 5], [6, 10], [10, 3], [7, 11], [11, 3], [2, 6], [1, 5]];
const town = (c: readonly number[], n: number, cols: string[], hMin: number, hMax: number, seed: number, r: number): B[] => Array.from({ length: n }).map((_, i) => { const a = (i / n) * Math.PI * 2 + hash(seed + i) * 0.8, rr = 0.9 + hash(seed + i * 3) * r; return { x: c[0] + Math.cos(a) * rr - 0.55, y: c[1] + Math.sin(a) * rr - 0.55, w: 1.1, d: 1.1, h: hMin + hash(seed + i * 5) * (hMax - hMin), c: cols[i % cols.length], lit: 0.8 }; });
const VO: [number, React.ReactNode][] = [[0.2, <>Then she moves to another <em>city.</em></>], [3.3, <>One router can't reach <em>that far.</em></>], [5.3, <>So routers connect to <em>other routers,</em></>], [8.0, <>and pass the message along, <em>hop by hop.</em></>]];
const Face: React.FC<{ kind: 'man' | 'woman'; x: number; y: number; r?: number; ring: string; id: string; smile?: number }> = ({ kind, x, y, r = 54, ring, id, smile = 0.9 }) => { const p: StickPose = { blink: 0, smile, look: kind === 'man' ? 0.5 : -0.5, armR: [8, 5], armL: [-8, -5] };
  return <g transform={`translate(${x} ${y})`}><defs><clipPath id={`fc${id}`}><circle r={r - 4} /></clipPath></defs><path d={`M -12 ${r - 4} L 0 ${r + 20} L 12 ${r - 4} Z`} fill={ring} /><circle r={r} fill={ring} /><circle r={r - 4} fill="#1b2150" /><g clipPath={`url(#fc${id})`}><g transform={`translate(0 ${296 * 1.15 + 6}) scale(1.15)`}><Adult kind={kind} p={p} id={'f' + id} /></g></g></g>; };

const Person: React.FC<{ x: number; y: number; c: string; step: number; hoe?: boolean }> = ({ x, y, c, step, hoe }) => (
  <g transform={`translate(${x} ${y})`}><ellipse cx={0} cy={2} rx={7} ry={3} fill="#000" opacity={0.3} />
    <line x1={-2.5} y1={-9} x2={-2.5 - step * 4} y2={0} stroke="#1b1f3a" strokeWidth={3.4} strokeLinecap="round" /><line x1={2.5} y1={-9} x2={2.5 + step * 4} y2={0} stroke="#1b1f3a" strokeWidth={3.4} strokeLinecap="round" />
    <rect x={-5} y={-21} width={10} height={13} rx={4} fill={c} /><circle cx={0} cy={-26} r={5} fill="#d6a481" /><path d="M -5 -27 Q 0 -34 5 -27 Z" fill="#1b1520" />
    {hoe && <g transform={`rotate(${-20 + step * 26} 4 -16)`}><line x1={4} y1={-16} x2={18} y2={-2} stroke="#c9a06a" strokeWidth={2.4} strokeLinecap="round" /><rect x={15} y={-4} width={8} height={4} fill="#cfd3de" /></g>}</g>);
const Car: React.FC<{ x: number; y: number; c: string; dx: number; dy: number }> = ({ x, y, c, dx, dy }) => { const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l; return (
  <g transform={`translate(${x} ${y})`}><ellipse cx={0} cy={5} rx={15} ry={6} fill="#000" opacity={0.3} /><rect x={-13} y={-10} width={26} height={14} rx={5} fill={c} /><rect x={-8} y={-15} width={16} height={8} rx={3} fill="#1b1f3a" /><rect x={-6} y={-14} width={12} height={5} rx={2} fill="#9fd0ff" opacity={0.7} />
    <circle cx={ux * 14} cy={uy * 8 - 2} r={11} fill="#fff3d6" opacity={0.45} filter="url(#cB)" /><circle cx={ux * 13} cy={uy * 8 - 2} r={2.6} fill="#fff6d8" /><circle cx={-ux * 13} cy={-uy * 8 - 2} r={2.2} fill="#ff4a5a" /></g>); };
const PCOL = ['#ff8672', '#3fb8a8', '#f6c34a', '#b9a2ec', '#f58fb4', '#7fd0f0'], CCOL = ['#c8553a', '#e0b84a', '#3fa7a0', '#8a6fd8', '#f3f0ea', '#4a6fd0'];
export const IsoCity: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const boxes: B[] = [...CT.flatMap((q) => town(q.c, q.n, q.cols, q.h[0], q.h[1], q.seed, q.r)),
    ...Array.from({ length: 46 }).map((_, i) => ({ x: -17 + hash(i * 9 + 3) * 34, y: -17 + hash(i * 13 + 5) * 34, w: 0.7, d: 0.7, h: 0.6 + hash(i) * 0.4, c: ['#4a3f7a', '#3d4a82', '#51437c'][i % 3], lit: 0.6 })).filter((b) => CT.every((q) => Math.hypot(q.c[0] - b.x, q.c[1] - b.y) > q.r + 2.2)),
  ].sort((a, b) => a.x + a.y - (b.x + b.y));
  const g = (i: number, dx = 0, dy = 0, z = 0) => iso(CT[i].c[0] + dx, CT[i].c[1] + dy, z);
  const road = [0, 1, 2, 3].map((i) => g(i, 0.9, 0.9)); const along = (k: number) => { const seg = Math.min(2, Math.floor(k * 3)), u = k * 3 - seg; return [lerp(road[seg][0], road[seg + 1][0], u), lerp(road[seg][1], road[seg + 1][1], u)]; };
  const RT = CT.map((q, i) => g(i, 0, 0, i === 3 ? 4.9 : 3.0)), RB = CT.map((_, i) => g(i));
  const bus = prog(f, 0.5, 2.9, easeInOut), busP = along(bus);
  const reach = prog(f, 3.5, 4.3, easeOut), fail = prog(f, 4.3, 4.6) * (1 - prog(f, 5.1, 5.4));
  const curve = (a: readonly number[], b: readonly number[], sag: number, u = 1) => Array.from({ length: 17 }).map((_, i) => { const k = (i / 16) * u; return `${lerp(a[0], b[0], k)},${lerp(a[1], b[1], k) + sag * Math.sin(Math.PI * k)}`; }).join(' ');
  const H0 = 8.3, hop = clamp01((t - H0) / 2.4) * 3, hs = Math.min(2, Math.floor(hop)), hu = easeInOut(hop - hs), hp = [lerp(RT[hs][0], RT[hs + 1][0], hu), lerp(RT[hs][1], RT[hs + 1][1], hu) + 26 * Math.sin(Math.PI * hu)];
  const got = prog(f, H0 + 2.5, H0 + 2.75, easeOut);
  const herHome = g(3, -1.9, -0.4, 4.6), herXY = bus < 1 ? [busP[0], busP[1] - 110] : [herHome[0], herHome[1] - got * 8];
  const himXY = g(0, -1.3, 0.4, 2.6);
  // camera: close on home, ride with the bus, pull back to the whole region, then follow the message hop by hop
  const all = { x: 540, y: 950, z: 0.9 }, home = { x: g(0)[0], y: g(0)[1] - 70, z: 1.55 }, city = { x: g(3)[0], y: g(3)[1] - 150, z: 1.4 };
  const keys: [number, { x: number; y: number; z: number }][] = [[0, home], [0.5, home], [1.2, { x: busP[0], y: busP[1] - 60, z: 1.35 }], [2.6, { x: busP[0], y: busP[1] - 60, z: 1.35 }], [3.2, city], [3.5, city], [4.6, all], [7.9, all], [8.5, { x: hp[0], y: hp[1], z: 1.2 }], [10.4, { x: hp[0], y: hp[1], z: 1.25 }], [11.0, city], [12, city]];
  let ki = 0; while (ki < keys.length - 2 && t > keys[ki + 1][0]) ki++;
  const ka = keys[ki], kb = keys[ki + 1], ku = easeInOut(clamp01((t - ka[0]) / (kb[0] - ka[0])));
  const cam = { x: lerp(ka[1].x, kb[1].x, ku), y: lerp(ka[1].y, kb[1].y, ku), z: Math.exp(lerp(Math.log(ka[1].z), Math.log(kb[1].z), ku)) };
  let line: React.ReactNode = null; for (const [a, txt] of VO) if (t >= a) line = txt;
  const router = (i: number, a: number, name: string) => a > 0 ? <g key={'r' + i} opacity={a}>
    <line x1={RB[i][0]} y1={RB[i][1]} x2={RT[i][0]} y2={RT[i][1] + (1 - a) * 60} stroke="#2b2e3a" strokeWidth={7} strokeLinecap="round" />
    <g transform={`translate(${RT[i][0]} ${RT[i][1] + (1 - a) * 60})`}><circle r={60} fill="#5fe3ff" opacity={0.25} filter="url(#cB2)" /><line x1={-20} y1={-10} x2={-27} y2={-42} stroke="#d9d6cf" strokeWidth={4} strokeLinecap="round" /><line x1={20} y1={-10} x2={27} y2={-42} stroke="#d9d6cf" strokeWidth={4} strokeLinecap="round" /><rect x={-36} y={-15} width={72} height={30} rx={8} fill="#f3f0ea" />{[0, 1, 2, 3].map((k) => <circle key={k} cx={-21 + k * 14} cy={0} r={3.6} fill={Math.sin(t * 9 + k * 1.7 + i) > 0 ? '#3ddc97' : '#1f6a4c'} />)}
      {name && <text y={44} textAnchor="middle" style={{ font: `800 22px ${FONT.ui}` }} fill="#dffbff" stroke="#0a0e24" strokeWidth={6} paintOrder="stroke">{name}</text>}</g></g> : null;
  const FC = ['#16303f', '#1a3644', '#14293a', '#1d3a3f', '#182f48'];
  return (
    <AbsoluteFill style={{ backgroundColor: '#0d1830' }}>
      <svg width={1080} height={1920}>
        <defs><filter id="cB"><feGaussianBlur stdDeviation="5" /></filter><filter id="cB2"><feGaussianBlur stdDeviation="12" /></filter>
          <radialGradient id="cG"><stop offset="0" stopColor="#2a4266" /><stop offset="1" stopColor="#1a2d4a" stopOpacity="0" /></radialGradient></defs>
        <g transform={`translate(540 960) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`}>
          <polygon points={P([iso(-60, -60), iso(60, -60), iso(60, 60), iso(-60, 60)])} fill="#122238" />
          {/* countryside: a patchwork of fields with crop rows, lakes, a river, hills, forests, farm roads */}
          {Array.from({ length: 27 * 27 }).map((_, i) => { const cx = -40 + (i % 27) * 3, cy = -40 + Math.floor(i / 27) * 3, w = 2.8, k = Math.floor(hash(i * 7) * 5); return <g key={'fd' + i}><polygon points={P([iso(cx, cy), iso(cx + w, cy), iso(cx + w, cy + w), iso(cx, cy + w)])} fill={FC[k]} />
            {k < 2 && [0.5, 1.1, 1.7, 2.3].map((u) => <line key={u} x1={iso(cx + u, cy + 0.2)[0]} y1={iso(cx + u, cy + 0.2)[1]} x2={iso(cx + u, cy + w - 0.2)[0]} y2={iso(cx + u, cy + w - 0.2)[1]} stroke="#24485a" strokeWidth={3} opacity={0.7} />)}</g>; })}
          {[[-13, 9, 150, 70], [12, -11, 130, 60], [5, 15, 110, 50], [-4, 4.5, 80, 36]].map(([x, y, rx, ry], i) => { const c = iso(x, y); return <g key={'lk' + i}><ellipse cx={c[0]} cy={c[1]} rx={rx} ry={ry} fill="#1d4f80" /><ellipse cx={c[0] - rx * 0.15} cy={c[1] - ry * 0.15} rx={rx * 0.6} ry={ry * 0.5} fill="#2f6ea8" opacity={0.6} /><ellipse cx={c[0] + rx * 0.2} cy={c[1] - ry * 0.3} rx={rx * 0.2} ry={ry * 0.12} fill="#cfe6ff" opacity={0.35} /></g>; })}
          {(() => { const rv = P([iso(-24, 9), iso(-13, 9), iso(-8, 2.5), iso(-1, 0.6), iso(5, -1.5), iso(12, -11), iso(22, -14)]); return <><polyline points={rv} fill="none" stroke="#1d4f80" strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" /><polyline points={rv} fill="none" stroke="#2f6ea8" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} /></>; })()}
          {[[-15, -8], [14, 6], [-3, 17], [14, -2], [-16, 0], [1, -16]].map(([x, y], i) => { const c = iso(x, y); return <g key={'hl' + i}><ellipse cx={c[0]} cy={c[1]} rx={130} ry={56} fill="#1c3a4a" /><ellipse cx={c[0] - 14} cy={c[1] - 26} rx={96} ry={46} fill="#234b58" /><ellipse cx={c[0] - 26} cy={c[1] - 48} rx={56} ry={28} fill="#2c5c66" /></g>; })}
          {/* town ground glow, roads between every pair of linked cities */}
          {CT.map((q, i) => { const c = g(i), r = (q.r + 2.6) * S * 0.9; return <ellipse key={'gl' + i} cx={c[0]} cy={c[1]} rx={r} ry={r * 0.58} fill="url(#cG)" />; })}
          {LINKS.map(([a, b], i) => { const pa = g(a, 0.9, 0.9), pb = g(b, 0.9, 0.9), main = i < 3; return <g key={'rd' + i}><line x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} stroke="#3a4280" strokeWidth={main ? 36 : 20} strokeLinecap="round" /><line x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} stroke="#161a3c" strokeWidth={main ? 25 : 12} strokeLinecap="round" /><line x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]} stroke="#8e8cc0" strokeWidth={2} strokeDasharray="12 14" opacity={0.6} />
            {[0, 1, 2].map((c) => { const k = (t * (0.045 + 0.015 * c) + hash(i * 3 + c)) % 1, kk = c % 2 ? 1 - k : k, sg = c % 2 ? -1 : 1, nx = -(pb[1] - pa[1]), ny = pb[0] - pa[0], nl = Math.hypot(nx, ny) || 1, off = (main ? 7 : 4) * sg; return <Car key={c} x={lerp(pa[0], pb[0], kk) + nx / nl * off} y={lerp(pa[1], pb[1], kk) + ny / nl * off} c={CCOL[(i + c) % 6]} dx={(pb[0] - pa[0]) * sg} dy={(pb[1] - pa[1]) * sg} />; })}</g>; })}
          {Array.from({ length: 520 }).map((_, i) => { const cl = Math.floor(hash(i * 17) * 44), bx0 = -32 + hash(cl * 5 + 1) * 64, by0 = -32 + hash(cl * 7 + 2) * 64, x = bx0 + (hash(i * 3) - 0.5) * 6, y = by0 + (hash(i * 5 + 9) - 0.5) * 6; if (CT.some((q) => Math.hypot(q.c[0] - x, q.c[1] - y) < q.r + 1.6)) return null; const q = iso(x, y); return <g key={'t' + i}><ellipse cx={q[0]} cy={q[1] + 3} rx={9} ry={4} fill="#000" opacity={0.25} /><circle cx={q[0]} cy={q[1] - 9} r={9 + hash(i) * 5} fill={i % 4 ? '#1f5a44' : '#2a6a3a'} /><circle cx={q[0] - 3} cy={q[1] - 12} r={5} fill="#34805e" /></g>; })}
          {/* farming: farmers hoeing the crop rows, tractors, haystacks, cows */}
          {Array.from({ length: 27 * 27 }).map((_, i) => { const cx = -40 + (i % 27) * 3, cy = -40 + Math.floor(i / 27) * 3, k = Math.floor(hash(i * 7) * 5); if (Math.abs(cx) > 20 || Math.abs(cy) > 22 || CT.some((q) => Math.hypot(q.c[0] - cx - 1.4, q.c[1] - cy - 1.4) < q.r + 2.4)) return null; const r = hash(i * 23 + 4);
            if (k < 2 && r < 0.5) { const a = iso(cx + 0.8, cy + 0.6 + ((t * 0.12 + r) % 1) * 1.6), st = Math.sin(t * 7 + i); return <g key={'fm' + i}><Person x={a[0]} y={a[1]} c={PCOL[i % 6]} step={st} hoe />{r < 0.22 && <Person x={iso(cx + 2, cy + 1.6)[0]} y={iso(cx + 2, cy + 1.6)[1]} c={PCOL[(i + 2) % 6]} step={Math.sin(t * 7 + i + 2)} hoe />}</g>; }
            if (k < 2 && r < 0.72) { const u = (t * 0.07 + r * 5) % 1, q = iso(cx + 1.7, cy + 0.3 + u * 2.2); return <g key={'tr' + i} transform={`translate(${q[0]} ${q[1]})`}><ellipse cx={0} cy={6} rx={17} ry={7} fill="#000" opacity={0.3} /><rect x={-13} y={-10} width={24} height={13} rx={3} fill="#e0503a" /><rect x={-1} y={-20} width={12} height={12} rx={2} fill="#f3f0ea" /><circle cx={-9} cy={5} r={5} fill="#1b1520" /><circle cx={8} cy={3} r={7.5} fill="#1b1520" /><circle cx={8} cy={3} r={3} fill="#cfd3de" /><circle cx={-14} cy={-3} r={9} fill="#fff3d6" opacity={0.4} filter="url(#cB)" /></g>; }
            if (k === 2 && r < 0.45) return <g key={'hy' + i}>{[0, 1, 2].map((h) => { const q = iso(cx + 0.6 + h * 0.8, cy + 0.8 + (h % 2) * 0.9); return <g key={h}><ellipse cx={q[0]} cy={q[1]} rx={13} ry={6} fill="#b98a2a" /><path d={`M ${q[0] - 13} ${q[1]} Q ${q[0]} ${q[1] - 30} ${q[0] + 13} ${q[1]} Z`} fill="#e0b84a" /></g>; })}</g>;
            if (k === 3 && r < 0.5) return <g key={'cw' + i}>{[0, 1, 2].map((h) => { const q = iso(cx + 0.5 + hash(i + h) * 1.8 + Math.sin(t * 0.3 + h) * 0.1, cy + 0.5 + hash(i * 3 + h) * 1.8); return <g key={h} transform={`translate(${q[0]} ${q[1]})`}><ellipse cx={0} cy={4} rx={11} ry={4} fill="#000" opacity={0.3} /><rect x={-10} y={-9} width={20} height={11} rx={5} fill="#f3f0ea" /><circle cx={-3} cy={-5} r={3.4} fill="#5a3a2a" /><circle cx={11} cy={-8} r={4.5} fill="#f3f0ea" /><rect x={-8} y={1} width={3} height={5} fill="#3a2a22" /><rect x={5} y={1} width={3} height={5} fill="#3a2a22" /></g>; })}</g>;
            return null; })}
          {boxes.map((b, i) => <Bx key={i} b={b} />)}
          {/* people out on the streets around every town */}
          {CT.flatMap((q, ci) => Array.from({ length: ci === 0 || ci === 3 ? 12 : 7 }).map((_, i) => { const a0 = hash(ci * 31 + i * 7) * Math.PI * 2, rr = q.r + 1.5 + hash(ci * 13 + i) * 1.3, a = a0 + Math.sin(t * 0.35 + i * 1.9 + ci) * 0.28, c = iso(q.c[0] + Math.cos(a) * rr, q.c[1] + Math.sin(a) * rr); return <Person key={`p${ci}_${i}`} x={c[0]} y={c[1]} c={PCOL[(ci + i) % 6]} step={Math.sin(t * 8 + i * 2 + ci)} />; }))}
          {/* her bus */}
          {bus > 0 && bus < 1 && <g transform={`translate(${busP[0]} ${busP[1]})`}><ellipse cx={0} cy={10} rx={34} ry={12} fill="#000" opacity={0.3} /><rect x={-30} y={-22} width={60} height={30} rx={8} fill="#f6c34a" /><rect x={-24} y={-17} width={48} height={11} rx={3} fill="#9fd0ff" /><circle cx={-16} cy={9} r={6} fill="#1b1520" /><circle cx={16} cy={9} r={6} fill="#1b1520" /><circle cx={30} cy={0} r={16} fill="#fff3d6" opacity={0.5} filter="url(#cB)" /></g>}
          {/* one long wire from the home router: it cannot reach */}
          {reach > 0 && t < 5.4 && <g opacity={1 - prog(f, 5.1, 5.4)}><polyline points={curve(RT[0], RT[3], 60 + 80 * fail, reach * 0.55)} fill="none" stroke={fail > 0.5 ? '#ff6a5a' : '#9fe9ff'} strokeWidth={6} strokeLinecap="round" strokeDasharray={fail > 0.5 ? '10 12' : undefined} />
            {fail > 0 && (() => { const q = [lerp(RT[0][0], RT[3][0], 0.55), lerp(RT[0][1], RT[3][1], 0.55) + (60 + 80 * fail) * Math.sin(Math.PI * 0.55)]; return <g opacity={fail} transform={`translate(${q[0]} ${q[1]}) scale(1.3)`}><circle r={34} fill="#ff5a4a" /><path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke="#fff" strokeWidth={8} strokeLinecap="round" /><text y={-52} textAnchor="middle" style={{ font: `800 44px ${FONT.ui}` }} fill="#ffb3a8" stroke="#0a0e24" strokeWidth={8} paintOrder="stroke">too far!</text></g>; })()}</g>}
          {/* router to router links: the main chain bright, the rest of the region joining in */}
          {LINKS.map(([a, b], i) => { const main = i < 3, u = prog(f, (main ? 5.9 + i * 0.4 : 6.6 + (i - 3) * 0.07), (main ? 6.4 + i * 0.4 : 7.2 + (i - 3) * 0.07), easeOut); if (u <= 0) return null; const k = (t * 0.6 + i * 0.3) % 1;
            return <g key={'l' + i} opacity={main ? 1 : 0.75}><polyline points={curve(RT[a], RT[b], 26, u)} fill="none" stroke="#5fe3ff" strokeWidth={main ? 20 : 12} opacity={0.25} filter="url(#cB)" /><polyline points={curve(RT[a], RT[b], 26, u)} fill="none" stroke={main ? '#bff3ff' : '#7fd0f0'} strokeWidth={main ? 6 : 3} strokeLinecap="round" />
              {u >= 1 && <circle cx={lerp(RT[a][0], RT[b][0], k)} cy={lerp(RT[a][1], RT[b][1], k) + 26 * Math.sin(Math.PI * k)} r={main ? 6 : 4.5} fill="#fff" opacity={main && t > H0 && t < H0 + 2.5 ? 0 : 1} />}</g>; })}
          {CT.map((_, i) => router(i, i === 0 ? 1 : prog(f, 5.3 + (i % 6) * 0.1, 5.7 + (i % 6) * 0.1, easeOut), i === 0 ? 'HOME ROUTER' : i === 3 ? 'CITY ROUTER' : ''))}
          {/* hop counters and the travelling HELLO */}
          {[0, 1, 2].map((i) => { const a = prog(f, H0 + i * 0.8 + 0.6, H0 + i * 0.8 + 0.8, easeOut); return a > 0 ? <g key={'h' + i} opacity={a} transform={`translate(${(RT[i][0] + RT[i + 1][0]) / 2 - 80} ${(RT[i][1] + RT[i + 1][1]) / 2 - 24}) scale(${0.8 + 0.2 * a})`}><rect x={-58} y={-24} width={116} height={46} rx={14} fill="#ffe08a" /><text y={9} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#3a2a05">hop {i + 1}</text></g> : null; })}
          {t > H0 && t < H0 + 2.5 && <g transform={`translate(${hp[0]} ${hp[1]})`}><circle r={38} fill="#ffe08a" opacity={0.55} filter="url(#cB)" /><rect x={-26} y={-17} width={52} height={34} rx={7} fill="#ffe08a" /><path d="M -22 -13 L 0 5 L 22 -13" stroke="#8a5a10" strokeWidth={4} fill="none" /></g>}
          {/* the two of them, as portrait pins */}
          <Face kind="man" x={himXY[0]} y={himXY[1] - 60} ring="#3fb8a8" id="m" />
          <Face kind="woman" x={herXY[0]} y={herXY[1] - 60} ring="#ff8672" id="w" smile={bus < 1 ? 0.6 : 1} />
          {t > H0 - 0.6 && t < H0 + 0.1 && <g opacity={prog(f, H0 - 0.6, H0 - 0.45) * (1 - prog(f, H0 - 0.05, H0 + 0.1))} transform={`translate(${himXY[0]} ${himXY[1] - 150}) scale(1.3)`}><rect x={-64} y={-30} width={128} height={44} rx={14} fill="#0e1430" stroke="#5fe3ff" strokeWidth={2} /><text y={3} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#fff">HELLO</text></g>}
          {got > 0 && <g opacity={got} transform={`translate(${herXY[0]} ${herXY[1] - 150}) scale(1.3)`}><rect x={-64} y={-30} width={128} height={44} rx={14} fill="#0e1430" stroke="#5fe3ff" strokeWidth={2} /><text y={3} textAnchor="middle" style={{ font: `800 28px ${FONT.ui}` }} fill="#fff">HELLO</text><circle cx={64} cy={-30} r={13} fill="#3ddc97" /><path d="M 58 -30 L 62 -25 L 70 -35" stroke="#06261a" strokeWidth={3.5} fill="none" strokeLinecap="round" /></g>}
          {/* town name plates */}
          {([[0, 'HOME TOWN', 200, 30], [3, 'HER NEW CITY', -250, -60]] as [number, string, number, number][]).map(([i, n, dx, dy]) => { const c = g(i); return <g key={n} transform={`translate(${c[0] + dx} ${c[1] + dy})`}><rect x={-112} y={-24} width={224} height={46} rx={14} fill={i ? '#ff6f91' : '#3f78c8'} /><text y={8} textAnchor="middle" style={{ font: `800 27px ${FONT.ui}` }} fill="#fff">{n}</text></g>; })}
        </g>
      </svg>
      {line && <div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 6px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.9)' }}><div className="sub">{line}</div></div>}
      <style>{'.sub em{font-style:normal;color:#ffd38a}'}</style>
      <div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.8 }}>
        <Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} /><span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span>
      </div>
    </AbsoluteFill>
  );
};
