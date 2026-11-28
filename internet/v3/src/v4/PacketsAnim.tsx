import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { DogPhoto } from './Story';
import { Block } from './Encrypt';
import { blockAt } from './StartAnim';
/* Part 2, segment B animation: (A) about 2,000 packets gather, the counter runs; (B) one packet comes close, its address and number appear, then the label card. 9:16. */
const GOLD = '#ffb454', GOLD2 = '#ffd38a';
const sm = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); }, eo = (u: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3), lp = (a: number, b: number, u: number) => a + (b - a) * u;
const Bg: React.FC = () => <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><defs><radialGradient id="eb" cx="50%" cy="42%" r="75%"><stop offset="0" stopColor="#101a4a" /><stop offset="1" stopColor="#04061a" /></radialGradient><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd38a" /><stop offset="1" stopColor="#e08a1e" /></linearGradient><linearGradient id="gp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd38a" /><stop offset="1" stopColor="#e8962a" /></linearGradient></defs><rect width={1080} height={1920} fill="url(#eb)" />{[...Array(50)].map((_, k) => <circle key={k} cx={hash(k) * 1080} cy={hash(k + 40) * 1920} r={1 + hash(k + 3) * 1.4} fill="#cfd8ff" opacity={0.35} />)}</svg>;
const Ms: React.FC<{ v: number }> = ({ v }) => <div style={{ position: 'absolute', right: 70, top: 150, display: 'flex', alignItems: 'baseline', gap: 8, font: `800 120px/1 ${FONT.ui}`, color: '#7fd4ff', textShadow: '0 0 30px rgba(127,212,255,.6)' }}>{String(v).padStart(3, '0')}<span style={{ font: `800 40px ${FONT.ui}` }}>ms</span></div>;
const NP = 150;
const Pk: React.FC<{ x: number; y: number; w: number; rot: number; o: number }> = ({ x, y, w, rot, o }) => { const h = w * 0.58; return <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o} style={{ filter: 'drop-shadow(8px 10px 8px rgba(0,0,0,.5))' }}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="url(#gp)" /><rect x={-w / 2} y={-h / 2} width={w} height={h * 0.28} rx={6} fill="#2a1630" opacity={0.85} /></g>; };
/* free 3D-looking orbit: every packet circles the middle on its own tilted loop, tumbling, nearer ones bigger */
export const orbit = (k: number, t: number) => { const sp = (0.5 + hash(k + 11) * 1.1) * (hash(k + 13) > 0.5 ? 1 : -1), th = hash(k + 100) * 6.283 + sp * t, tilt = 0.4 + hash(k + 17) * 1.0, R = 160 + Math.pow(hash(k + 5), 0.7) * 470, z = Math.sin(th) * Math.sin(tilt), wob = Math.sin(t * 0.9 + k) * 18; return { x: 540 + Math.cos(th) * R * 1.05 + wob, y: 900 + Math.sin(th) * Math.cos(tilt) * R * 1.2 + Math.cos(t * 0.7 + k) * 18, z, rot: t * (40 + hash(k + 3) * 160) * (hash(k + 4) > 0.5 ? 1 : -1) }; };
/* vertical circle: every packet runs round one big ring that stands up in front of the viewer (Harsh) */
export const ring = (k: number, t: number) => { const sp = 0.55 + hash(k + 11) * 0.5, th = hash(k + 100) * 6.283 + sp * t, R = 380 + (hash(k + 5) - 0.5) * 170 + Math.sin(t * 1.2 + k) * 14; return { x: 540 + Math.cos(th) * R, y: 900 + Math.sin(th) * R, z: Math.sin(th * 2 + k) * 0.6, rot: th * 57.3 + 90 + Math.sin(t * 2 + k) * 25 }; };
const cloud = (k: number) => { const a = hash(k + 100) * 6.283, r = 120 + Math.pow(hash(k + 5), 0.7) * 520; return [540 + Math.cos(a) * r * 1.05, 900 + Math.sin(a) * r * 1.15]; };
export const PACKETS_A_FRAMES = 200;
export const PacketsA: React.FC = () => { const f = useCurrentFrame(), t = f / 30, count = Math.round(2000 * eo((t - 0.2) / 2.0) / 10) * 10, out = eo((t - 5.3) / 1.2);
  const order = Array.from({ length: NP }).map((_, k) => ({ k, o: ring(k, t) })).sort((p, q) => p.o.z - q.o.z);
  return (<AbsoluteFill><Bg /><svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    {order.map(({ k, o }) => { const d = hash(k) * 1.0, u = eo((t - d) / 0.9), a = hash(k + 7) * 6.283, sx = 540 + Math.cos(a) * 1100, sy = 900 + Math.sin(a) * 1300, w = lp(40, (62 + hash(k + 9) * 90) * (0.7 + 0.45 * o.z), u), x = lp(sx, o.x, u) + out * (1300 - o.x + hash(k) * 300), y = lp(sy, o.y, u) - out * (700 + hash(k + 2) * 500);
      return <g key={k}>{[3, 2, 1].map((g) => { const p = ring(k, t - g * 0.045); return <Pk key={g} x={lp(sx, p.x, u)} y={lp(sy, p.y, u)} w={w * 0.9} rot={p.rot} o={0.12 * u * (4 - g) / 3} />; })}<Pk x={x} y={y} w={w} rot={lp(hash(k + 4) * 300, o.rot, u)} o={Math.min(1, u * 2) * (0.55 + 0.45 * hash(k + 2)) * (1 - out)} /></g>; })}</svg>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', font: `900 190px/1 ${FONT.ui}`, color: GOLD, textShadow: '0 0 40px rgba(255,180,84,.55), 0 8px 18px rgba(0,0,0,.7)', opacity: sm(t / 0.4) * (1 - out) }}>{count.toLocaleString('en-US')}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 950, textAlign: 'center', font: `800 60px ${FONT.ui}`, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,.8)', opacity: sm(t / 0.4) * (1 - out) }}>packets</div>
    <Ms v={2} /></AbsoluteFill>); };
export const PACKETS_B_FRAMES = 170;
/* the address lives ON the packet: one gold packet, dark strip with its number, the label rows inside (Harsh: no separate #1204 box, no separate top box) */
export const LabelB: React.FC = () => { const f = useCurrentFrame(), t0 = f / 30, t = t0 * 1.4, grow = eo(t / 1.5), rows = [sm((t - 1.7) / 0.5), sm((t - 2.3) / 0.5), sm((t - 2.9) / 0.5)];
  const items: [string, string, string, string][] = [['TO', '86.14.203.57', 'London', '#c2412b'], ['FROM', '49.37.118.202', 'Hyderabad', '#2a6fb0'], ['PIECE', '1,204 of 2,000', '1,500 bytes', '#9a6a14']];
  return (<AbsoluteFill><Bg /><svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    {Array.from({ length: 70 }).map((_, k) => { const o = orbit(k, t0); return <Pk key={k} x={o.x} y={o.y} w={(50 + hash(k + 9) * 90) * (0.7 + 0.45 * o.z)} rot={o.rot} o={0.3 * (1 - grow * 0.5)} />; })}
    <g transform={`translate(540 880) scale(${lp(0.16, 1, grow)}) rotate(${lp(-25, 0, grow)})`} style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.7)) drop-shadow(0 0 50px rgba(255,180,84,.4))' }}>
      <rect x={-440} y={-290} width={880} height={580} rx={44} fill="url(#gp2)" stroke="#ffe3a0" strokeWidth={5} />
      <path d="M -440 -246 Q -440 -290 -396 -290 L 396 -290 Q 440 -290 440 -246 L 440 -170 L -440 -170 Z" fill="#2a1630" />
      <text x={-400} y={-215} fill={GOLD2} style={{ font: `900 44px ${FONT.ui}`, letterSpacing: '0.12em' }}>PACKET</text><text x={400} y={-215} textAnchor="end" fill="#fff1dc" style={{ font: `900 56px ${FONT.mono}` }}>#1204</text>
      <rect x={-405} y={-140} width={810} height={400} rx={26} fill="#fff6e6" />
      {items.map(([k, v, sub, c], r) => <g key={k} opacity={rows[r]} transform={`translate(0 ${r * 125 - 100 + lp(24, 0, rows[r])})`}>
        <circle cx={-366} cy={46} r={10} fill={c} /><text x={-338} y={62} fill={c} style={{ font: `900 38px ${FONT.ui}`, letterSpacing: '0.06em' }}>{k}</text>
        <text x={-190} y={62} fill="#2a1630" style={{ font: `800 38px ${FONT.mono}` }}>{v}</text><g transform="translate(140 0)"><rect x={0} y={12} width={sub.length * 16 + 36} height={62} rx={31} fill={c} /><text x={18} y={55} fill="#fff" style={{ font: `800 30px ${FONT.ui}` }}>{sub}</text></g>
        {r < 2 && <line x1={-370} x2={370} y1={100} y2={100} stroke="#e3c9a0" strokeWidth={2} />}</g>)}</g>
  </svg><Ms v={3} /></AbsoluteFill>); };

/* ONE continuous scene (Harsh): the packets circle in a vertical ring, then ONE packet (#1204) flies out of the ring to the front, grows to fill the screen and becomes its address card */
export const PACKETS_RING_FRAMES = 270;
export const PacketsRing: React.FC = () => { const f = useCurrentFrame(), t = f / 30, HERO = 11, tf = 4.5, g = eo((t - tf) / 1.3), dm = 1 - 0.75 * eo((t - tf) / 0.8), count = Math.round(2000 * eo((t - 0.2) / 2.0) / 10) * 10, rows = [sm((t - 5.9) / 0.5), sm((t - 6.6) / 0.5), sm((t - 7.3) / 0.5)];
  const items: [string, string, string, string][] = [['TO', '86.14.203.57', 'London', '#c2412b'], ['FROM', '49.37.118.202', 'Hyderabad', '#2a6fb0'], ['PIECE', '1,204 of 2,000', '1,500 bytes', '#9a6a14']];
  const order = Array.from({ length: NP }).map((_, k) => ({ k, o: ring(k, t) })).sort((p, q) => p.o.z - q.o.z), h0 = ring(HERO, tf);
  return (<AbsoluteFill><Bg /><svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    {order.map(({ k, o }) => { if (k === HERO && t >= tf) return null; const d = hash(k) * 1.0, u = eo((t - d) / 0.9), a = hash(k + 7) * 6.283, sx = 540 + Math.cos(a) * 1100, sy = 900 + Math.sin(a) * 1300, w = lp(40, (62 + hash(k + 9) * 90) * (0.7 + 0.45 * o.z), u);
      return <g key={k}>{[3, 2, 1].map((gg) => { const p = ring(k, t - gg * 0.045); return <Pk key={gg} x={lp(sx, p.x, u)} y={lp(sy, p.y, u)} w={w * 0.9} rot={p.rot} o={0.12 * u * (4 - gg) / 3 * dm} />; })}<Pk x={lp(sx, o.x, u)} y={lp(sy, o.y, u)} w={w} rot={lp(hash(k + 4) * 300, o.rot, u)} o={Math.min(1, u * 2) * (0.55 + 0.45 * hash(k + 2)) * dm} /></g>; })}
    {t >= tf && <g transform={`translate(${lp(h0.x, 540, g)} ${lp(h0.y, 880, g)}) scale(${lp(0.13, 1, g)}) rotate(${lp((((h0.rot % 360) + 540) % 360) - 180, 0, g)})`} style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.7)) drop-shadow(0 0 50px rgba(255,180,84,.45))' }}>
      <rect x={-440} y={-290} width={880} height={580} rx={44} fill="url(#gp2)" stroke="#ffe3a0" strokeWidth={5} />
      <path d="M -440 -246 Q -440 -290 -396 -290 L 396 -290 Q 440 -290 440 -246 L 440 -170 L -440 -170 Z" fill="#2a1630" />
      <g opacity={sm((g - 0.5) / 0.4)}><text x={-400} y={-215} fill={GOLD2} style={{ font: `900 44px ${FONT.ui}`, letterSpacing: '0.12em' }}>PACKET</text><text x={400} y={-215} textAnchor="end" fill="#fff1dc" style={{ font: `900 56px ${FONT.mono}` }}>#1204</text></g>
      <g opacity={sm((g - 0.7) / 0.3)}><rect x={-405} y={-140} width={810} height={400} rx={26} fill="#fff6e6" /></g>
      {items.map(([k, v, sub, c], r) => <g key={k} opacity={rows[r]} transform={`translate(0 ${r * 125 - 100 + lp(24, 0, rows[r])})`}>
        <circle cx={-366} cy={46} r={10} fill={c} /><text x={-338} y={62} fill={c} style={{ font: `900 38px ${FONT.ui}`, letterSpacing: '0.06em' }}>{k}</text>
        <text x={-190} y={62} fill="#2a1630" style={{ font: `800 38px ${FONT.mono}` }}>{v}</text><g transform="translate(140 0)"><rect x={0} y={12} width={sub.length * 16 + 36} height={62} rx={31} fill={c} /><text x={18} y={55} fill="#fff" style={{ font: `800 30px ${FONT.ui}` }}>{sub}</text></g>
        {r < 2 && <line x1={-370} x2={370} y1={100} y2={100} stroke="#e3c9a0" strokeWidth={2} />}</g>)}</g>}</svg>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', font: `900 190px/1 ${FONT.ui}`, color: GOLD, textShadow: '0 0 40px rgba(255,180,84,.55), 0 8px 18px rgba(0,0,0,.7)', opacity: sm(t / 0.4) * (1 - eo((t - 4.3) / 0.4)) }}>{count.toLocaleString('en-US')}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 950, textAlign: 'center', font: `800 60px ${FONT.ui}`, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,.8)', opacity: sm(t / 0.4) * (1 - eo((t - 4.3) / 0.4)) }}>packets</div>
    <Ms v={t < 5 ? 2 : 3} /></AbsoluteFill>); };

/* v5 scene: the same photo breaks into blocks, each block becomes a gold packet with a tiny lock and its piece of the dog, the packets circle in a vertical ring, then ONE packet (#1204) flies to the front and becomes its address card */
/* the photo breaks into wide RECTANGLES (Harsh): 11 columns x 17 rows */
const NC = 11, NR = 17, BPW = 80, BPH = 52;
const BlockR: React.FC<{ x: number; y: number; w: number; h: number; rot: number; i: number; j: number }> = ({ x, y, w, h, rot, i, j }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} style={{ filter: 'drop-shadow(12px 16px 12px rgba(0,0,0,.65))' }}>
    <rect x={-w / 2 + 8} y={-h / 2 + 10} width={w} height={h} rx={5} fill="#3a2418" />
    <svg x={-w / 2} y={-h / 2} width={w} height={h} viewBox={`${(j * 190) / NC} ${(i * 190) / NR} ${190 / NC} ${190 / NR}`} preserveAspectRatio="none" overflow="hidden"><DogPhoto /></svg>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill="none" stroke="#1a0f08" strokeWidth={2.5} />
  </g>);
const blockAtR = (i: number, j: number, u: number, t: number) => { const k = i * NC + j, dx = j - (NC - 1) / 2, dy = i - (NR - 1) / 2, d = Math.hypot(dx, dy) + 0.4;
  const x1 = 540 + dx * (BPW + 6) * (1 + 0.012 * d) + (hash(k) - 0.5) * 24, y1 = 880 + dy * (BPH + 5) * (1 + 0.012 * d) + (hash(k + 3) - 0.5) * 24, r1 = (hash(k + 7) - 0.5) * 60 * Math.min(1, d / 3);
  return { x: lp(540 + dx * BPW, x1, u) + (Math.sin(t * 2.3 + k * 1.7) * 20) * u, y: lp(880 + dy * BPH, y1, u) + (Math.cos(t * 2.0 + k * 1.3) * 20) * u, rot: lp(0, r1, u) + Math.sin(t * 1.9 + k) * 20 * u, w: lp(BPW, 70, u), h: lp(BPH, 44, u) }; };
const PkD: React.FC<{ x: number; y: number; w: number; rot: number; o: number; i: number; j: number }> = ({ x, y, w, rot, o, i, j }) => { const h = w * 0.62, ps = h * 0.62;
  return <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o} style={{ filter: 'drop-shadow(8px 10px 8px rgba(0,0,0,.5))' }}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="url(#gp)" /><rect x={-w / 2} y={-h / 2} width={w} height={h * 0.28} rx={6} fill="#2a1630" opacity={0.9} />
    <svg x={-w / 2 + w * 0.07} y={-h / 2 + h * 0.3} width={ps * 1.5} height={ps} viewBox={`${(j * 190) / NC} ${(i * 190) / NR} ${190 / NC} ${190 / NR}`} preserveAspectRatio="none" overflow="hidden"><DogPhoto /></svg>
    {w > 56 && <g transform={`translate(${w / 2 - w * 0.12} ${-h / 2 + h * 0.14})`}><rect x={-w * 0.035} y={-h * 0.02} width={w * 0.07} height={h * 0.09} rx={1.5} fill="#ffd38a" /><path d={`M ${-w * 0.022} ${-h * 0.02} v ${-h * 0.05} a ${w * 0.022} ${w * 0.022} 0 0 1 ${w * 0.044} 0 v ${h * 0.05}`} fill="none" stroke="#ffd38a" strokeWidth={Math.max(1, w * 0.012)} /></g>}
  </g>; };
export const PACKETS_STORY_FRAMES = 260;
export const PacketsStory: React.FC = () => { const f = useCurrentFrame(), t = f / 30, NN = 187, HERO = 11, tf = 4.2, g = eo((t - tf) / 1.2), dm = 1 - 0.75 * eo((t - tf) / 0.8), count = Math.round(2000 * eo((t - 2.0) / 1.6) / 10) * 10, rows = [sm((t - 5.5) / 0.5), sm((t - 6.1) / 0.5), sm((t - 6.7) / 0.5)];
  const items: [string, string, string, string][] = [['TO', '86.14.203.57', 'London', '#c2412b'], ['FROM', '49.37.118.202', 'Hyderabad', '#2a6fb0'], ['PIECE', '1,204 of 2,000', '1,500 bytes', '#9a6a14']];
  const pos = (k: number) => { const i = Math.floor(k / NC), j = k % NC, bt = eo((t - 0.35 - hash(k + 50) * 0.35) / 1.0), mt = eo((t - 1.3 - hash(k + 60) * 0.35) / 1.1), b = blockAtR(i, j, bt, t), r = ring(k, t), w = 52 + hash(k + 9) * 56 + 14 * r.z;
    return { i, j, mt, bx: b.x, by: b.y, br: b.rot, bw: b.w, bh: b.h, x: lp(b.x, r.x, mt), y: lp(b.y, r.y, mt), rot: lp(b.rot, r.rot, mt), w: lp(b.w, w, mt), z: r.z }; };
  const all = Array.from({ length: NN }).map((_, k) => ({ k, p: pos(k) })).sort((p, q) => p.p.z - q.p.z), h0 = ring(HERO, tf), photo = 1 - sm((t - 0.3) / 0.3);
  return (<AbsoluteFill><Bg /><svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    <svg x={92} y={432} width={896} height={896} viewBox="0 0 190 190" opacity={photo}><DogPhoto /></svg>
    {all.map(({ k, p }) => { if (k === HERO && t >= tf) return null; return <g key={k} opacity={dm}>
      {p.mt < 1 && <BlockR x={p.x} y={p.y} w={p.bw} h={p.bh} rot={p.rot} i={p.i} j={p.j} />}
      {p.mt > 0 && <>{[3, 2, 1].map((gg) => { const q = ring(k, t - gg * 0.045); return p.mt > 0.95 ? <Pk key={gg} x={q.x} y={q.y} w={p.w * 0.9} rot={q.rot} o={0.12 * (4 - gg) / 3} /> : null; })}<PkD x={p.x} y={p.y} w={Math.max(20, p.w * (0.75 + 0.25 * p.mt))} rot={p.rot} o={p.mt} i={p.i} j={p.j} /></>}</g>; })}
    {t >= tf && <g transform={`translate(${lp(h0.x, 540, g)} ${lp(h0.y, 880, g)}) scale(${lp(0.13, 1, g)}) rotate(${lp((((h0.rot % 360) + 540) % 360) - 180, 0, g)})`} style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.7)) drop-shadow(0 0 50px rgba(255,180,84,.45))' }}>
      <rect x={-440} y={-290} width={880} height={580} rx={44} fill="url(#gp2)" stroke="#ffe3a0" strokeWidth={5} />
      <path d="M -440 -246 Q -440 -290 -396 -290 L 396 -290 Q 440 -290 440 -246 L 440 -170 L -440 -170 Z" fill="#2a1630" />
      <g opacity={sm((g - 0.5) / 0.4)}><text x={-400} y={-215} fill={GOLD2} style={{ font: `900 44px ${FONT.ui}`, letterSpacing: '0.12em' }}>PACKET</text><text x={400} y={-215} textAnchor="end" fill="#fff1dc" style={{ font: `900 56px ${FONT.mono}` }}>#1204</text></g>
      <g opacity={sm((g - 0.7) / 0.3)}><rect x={-405} y={-140} width={810} height={400} rx={26} fill="#fff6e6" /></g>
      {items.map(([k, v, sub, c], r) => <g key={k} opacity={rows[r]} transform={`translate(0 ${r * 125 - 100 + lp(24, 0, rows[r])})`}>
        <circle cx={-366} cy={46} r={10} fill={c} /><text x={-338} y={62} fill={c} style={{ font: `900 38px ${FONT.ui}`, letterSpacing: '0.06em' }}>{k}</text>
        <text x={-190} y={62} fill="#2a1630" style={{ font: `800 38px ${FONT.mono}` }}>{v}</text><g transform="translate(140 0)"><rect x={0} y={12} width={sub.length * 16 + 36} height={62} rx={31} fill={c} /><text x={18} y={55} fill="#fff" style={{ font: `800 30px ${FONT.ui}` }}>{sub}</text></g>
        {r < 2 && <line x1={-370} x2={370} y1={100} y2={100} stroke="#e3c9a0" strokeWidth={2} />}</g>)}</g>}</svg>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', font: `900 190px/1 ${FONT.ui}`, color: GOLD, textShadow: '0 0 40px rgba(255,180,84,.55), 0 8px 18px rgba(0,0,0,.7)', opacity: sm((t - 2.0) / 0.4) * (1 - eo((t - 3.9) / 0.4)) }}>{count.toLocaleString('en-US')}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 950, textAlign: 'center', font: `800 60px ${FONT.ui}`, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,.8)', opacity: sm((t - 2.0) / 0.4) * (1 - eo((t - 3.9) / 0.4)) }}>packets</div>
    <Ms v={t < 1.3 ? 1 : t < tf ? 2 : 3} /></AbsoluteFill>); };
