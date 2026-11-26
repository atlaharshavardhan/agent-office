import React from 'react';
import { fx, fw } from '../lib/wide';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { FPS, hash, prog, lerp, easeOut, easeInOut, clamp01 } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Adult, A_SHOULDER, A_UPPER, A_FORE } from '../dusk/Adult';
import type { StickPose } from '../dusk/Dusk';
import { Night } from '../dusk/Extras';
import { Globe, MAIN, ALT, WEB, routePts, GlobeApi } from './Globe';

/* ---------- Packets: his video is cut into numbered pieces, each takes its own road, her phone puts them back in order ---------- */
const Thumb: React.FC = () => (<g>
  <rect width={240} height={180} fill="#141a52" /><circle cx={200} cy={34} r={14} fill="#fff3d6" />{[20, 60, 96, 150, 176].map((x, i) => <circle key={i} cx={x} cy={14 + (i * 13) % 40} r={1.6} fill="#fff" />)}
  <rect x={120} y={50} width={120} height={130} fill="#6a5cc8" /><rect x={112} y={44} width={136} height={10} fill="#9a8cf0" /><rect x={160} y={74} width={40} height={60} fill="#fff1d0" /><rect x={164} y={78} width={32} height={56} fill="#33266e" />
  <rect x={130} y={72} width={22} height={30} fill="#ffd88a" /><rect x={208} y={72} width={22} height={30} fill="#ffd88a" /><circle cx={180} cy={92} r={8} fill="#e0b08f" /><rect x={172} y={100} width={16} height={26} rx={4} fill="#ff8672" /><path d="M 172 86 q 8 -12 16 0 l 2 22 l -4 0 l 0 -18 l -12 0 l 0 18 l -4 0 Z" fill="#1b1520" />
  <rect x={150} y={130} width={60} height={4} fill="#14152a" /><path d="M 0 180 L 30 120 L 180 96 L 180 104 L 60 180 Z" fill="#fff6dc" opacity={0.5} /><rect x={0} y={150} width={240} height={30} fill="#15183a" /><rect x={8} y={126} width={36} height={18} rx={5} fill="#3a3f5c" transform="rotate(-24 26 135)" /><path d="M 40 118 l 14 -10 l 6 22 l -14 8 Z" fill="#d24a30" />
</g>);
const Tile: React.FC<{ c: number; r: number; x: number; y: number; w: number; h: number; o?: number }> = ({ c, r, x, y, w, h, o = 1 }) => (<svg x={x} y={y} width={w} height={h} viewBox={`${c * 60} ${r * 60} 60 60`} preserveAspectRatio="none" opacity={o}><Thumb /></svg>);
const Phone: React.FC<{ x: number; y: number; w: number; h: number; rot: number; glow?: number; name: string; col: string; children?: React.ReactNode }> = ({ x, y, w, h, rot, glow = 0, name, col, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 - 30} y={-h / 2 - 30} width={w + 60} height={h + 60} rx={70} fill="#5fe3ff" opacity={0.1 + 0.16 * glow} />
    <rect x={-w / 2 + 10} y={-h / 2 + 16} width={w} height={h} rx={44} fill="#000" opacity={0.4} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} fill="#0b0d1c" stroke="#5a6088" strokeWidth={5} /><rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={32} fill="#141a40" />
    <rect x={-46} y={-h / 2 + 24} width={92} height={18} rx={9} fill="#0b0d1c" />
    <circle cx={-w / 2 + 52} cy={-h / 2 + 84} r={20} fill={col} /><text x={-w / 2 + 84} y={-h / 2 + 94} style={{ font: `700 28px ${FONT.ui}` }} fill="#eef1ff">{name}</text><line x1={-w / 2 + 14} y1={-h / 2 + 118} x2={w / 2 - 14} y2={-h / 2 + 118} stroke="#2a3068" strokeWidth={2} />
    {children}
    <path d={`M ${-w / 2 + 30} ${-h / 2 + 40} L ${-w / 2 + 110} ${-h / 2 + 20} L ${-w / 2 + 40} ${h / 2 - 60} Z`} fill="#fff" opacity={0.03} />
  </g>);
const NODES: [number, number][] = [[260, 880], [500, 1000], [760, 1120], [400, 700], [660, 860], [900, 960]];
const SRC: [number, number] = [330, 1150], DST: [number, number] = [760, 560];
const ROUTES: [number, number][][] = [[SRC, NODES[0], NODES[3], DST], [SRC, NODES[1], NODES[4], DST], [SRC, NODES[2], NODES[5], NODES[4], DST]];
const along = (r: [number, number][], u: number): [number, number] => { const L = r.slice(1).map((p, i) => Math.hypot(p[0] - r[i][0], p[1] - r[i][1])), tot = L.reduce((a, b) => a + b, 0); let d = clamp01(u) * tot; for (let i = 0; i < L.length; i++) { if (d <= L[i]) return [lerp(r[i][0], r[i + 1][0], d / L[i]), lerp(r[i][1], r[i + 1][1], d / L[i])]; d -= L[i]; } return r[r.length - 1]; };
export const Packets: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const lift = prog(f, 0.6, 1.1, easeOut), chop = prog(f, 1.1, 1.5, easeOut), pack = prog(f, 1.6, 2.0);
  const TW = 112, TH = 84, GX = 90, GY = 1010;   // tile grid as it floats above his phone
  const order = [4, 9, 0, 7, 2, 11, 5, 1, 10, 3, 8, 6];   // the order the pieces leave (and so, roughly, arrive)
  const dep = (i: number) => 2.0 + order.indexOf(i) * 0.09, dur = (i: number) => 1.0 + (i % 3) * 0.2, arr = (i: number) => dep(i) + dur(i);
  const done = prog(f, 4.45, 4.7, easeOut), tag = prog(f, 2.9, 3.15, easeOut) * (1 - prog(f, 4.0, 4.2));
  const HP = { x: 880, y: 560, w: 300, h: 520, rot: 5 }, slot = (i: number): [number, number] => [-108 + (i % 4) * 54, -110 + Math.floor(i / 4) * 41];
  const rad = HP.rot * Math.PI / 180, toHer = (p: [number, number]): [number, number] => [HP.x + p[0] * Math.cos(rad) - p[1] * Math.sin(rad), HP.y + p[0] * Math.sin(rad) + p[1] * Math.cos(rad)];
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      <svg width={1080} height={1920}>
        <Night id="pk" f={f} stars={50} />
        {/* the city, far below */}
        {Array.from({ length: 20 }).map((_, i) => { const x = -40 + i * 60, h = 90 + hash(i * 3) * 190; return <g key={i} opacity={0.55}><rect x={x} y={1560 - h} width={52} height={h + 400} fill={['#1c1f5a', '#231d5e', '#1a2760'][i % 3]} />{Array.from({ length: Math.floor(h / 30) }).map((_, r) => [0, 1].map((c) => hash(i * 13 + r * 5 + c) > 0.5 ? <rect key={`${r}${c}`} x={x + 10 + c * 20} y={1560 - h + 12 + r * 30} width={9} height={13} fill="#ffd88a" opacity={0.6} /> : null))}</g>; })}
        {/* the network: quiet links, routers that wake as a piece passes */}
        {ROUTES.map((r, i) => <polyline key={i} points={r.map((p) => p.join(',')).join(' ')} fill="none" stroke="#5f73b8" strokeWidth={4} opacity={0.4} strokeLinejoin="round" />)}
        {ROUTES.map((r, i) => { const live = t > 2.0 && t < 4.5; return live ? <g key={'l' + i}><polyline points={r.map((p) => p.join(',')).join(' ')} fill="none" stroke="#5fe3ff" strokeWidth={22} opacity={0.08} strokeLinejoin="round" /><polyline points={r.map((p) => p.join(',')).join(' ')} fill="none" stroke="#5fe3ff" strokeWidth={5} opacity={0.5} strokeLinejoin="round" strokeDasharray="14 16" strokeDashoffset={-t * 120} /></g> : null; })}
        {NODES.map(([x, y], i) => { const hot = Math.max(...Array.from({ length: 12 }).map((_, k) => { const r = ROUTES[k % 3]; const ni = r.findIndex((p) => p[0] === x && p[1] === y); if (ni < 0) return 0; const u = (t - dep(k)) / dur(k), at = ni / (r.length - 1); return Math.max(0, 1 - Math.abs(u - at) / 0.14); }));
          return <g key={i} transform={`translate(${x} ${y})`}><ellipse cx={0} cy={26} rx={56} ry={12} fill="#000" opacity={0.4} /><circle r={70} fill="url(#pkC)" opacity={0.5 * hot} />{[-26, 26].map((d) => <line key={d} x1={d} y1={-14} x2={d * 1.3} y2={-56} stroke="#1b1e3a" strokeWidth={7} strokeLinecap="round" />)}<rect x={-50} y={-20} width={100} height={44} rx={11} fill="#1a2050" stroke={hot > 0.2 ? '#5fe3ff' : '#3a4380'} strokeWidth={3} /><rect x={-50} y={-20} width={100} height={12} rx={6} fill="#2c3680" />{[0, 1, 2, 3].map((k) => <circle key={k} cx={-27 + k * 18} cy={8} r={4.5} fill={hot > 0.2 ? '#9ff6ff' : '#2d3a6a'} />)}</g>; })}
        {/* his phone, with the video he is sending */}
        <Phone x={250} y={1250} w={320} h={540} rot={-6} name="Her" col="#ff8672" glow={1 - lift}>
          <g opacity={1 - lift}><svg x={-126} y={-110} width={252} height={189} viewBox="0 0 240 180"><Thumb /></svg><circle cx={0} cy={-16} r={30} fill="#000" opacity={0.45} /><path d="M -9 -30 L 14 -16 L -9 -2 Z" fill="#fff" /></g>
          <rect x={-126} y={-110} width={252} height={189} rx={8} fill="none" stroke="#3a4380" strokeWidth={2} strokeDasharray="8 8" opacity={lift} />
          <rect x={-132} y={150} width={196} height={50} rx={25} fill="#0b0d1c" stroke="#2a3068" strokeWidth={2} /><circle cx={104} cy={175} r={27} fill="#5fe3ff" /><path d="M 94 164 L 118 175 L 94 186 L 99 175 Z" fill="#0a2a44" />
          {[0, 0.5].map((d) => { const u = clamp01((t - 0.35 - d * 0.2) / 0.5); return u > 0 && u < 1 ? <circle key={d} cx={104} cy={175} r={27 + u * 50} fill="none" stroke="#5fe3ff" strokeWidth={5 * (1 - u)} opacity={1 - u} /> : null; })}
        </Phone>
        {/* her phone, filling in */}
        <Phone x={HP.x} y={HP.y} w={HP.w} h={HP.h} rot={HP.rot} name="Him" col="#2f9c95" glow={done}>
          <rect x={-112} y={-114} width={224} height={172} rx={8} fill="#0b0d1c" stroke="#3a4380" strokeWidth={2} />
          {Array.from({ length: 12 }).map((_, i) => { const a = prog(f, arr(i) - 0.02, arr(i) + 0.12, easeOut); const [sx, sy] = slot(i); return <g key={i}><rect x={sx} y={sy} width={52} height={39} fill="none" stroke="#2a3068" strokeWidth={1.5} strokeDasharray="4 4" />{a > 0 && <g opacity={a}><Tile c={i % 4} r={Math.floor(i / 4)} x={sx} y={sy} w={52 + 2 * done} h={39 + 2 * done} /><rect x={sx} y={sy} width={52} height={39} fill="#5fe3ff" opacity={(1 - a) * 0.8 + 0.25 * (1 - done) * (1 - clamp01((t - arr(i)) / 0.4))} /></g>}</g>; })}
          {done > 0 && <g opacity={done}><circle cx={0} cy={-28} r={30 * (0.6 + 0.4 * done)} fill="#000" opacity={0.45} /><path d="M -9 -42 L 14 -28 L -9 -14 Z" fill="#fff" /><g transform="translate(84 84)"><circle r={20} fill="#5fe3ff" /><path d="M -9 0 L -3 7 L 10 -7" stroke="#0a2a44" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g></g>}
          <text x={-112} y={98} style={{ font: `600 22px ${FONT.mono}`, letterSpacing: '0.08em' }} fill="#9fb0ff">{Math.min(12, Array.from({ length: 12 }).filter((_, i) => t > arr(i)).length)} / 12 pieces</text>
        </Phone>
        {/* the pieces themselves */}
        {Array.from({ length: 12 }).map((_, i) => { const c = i % 4, r = Math.floor(i / 4), u = (t - dep(i)) / dur(i); if (u >= 1) return null;
          const gx = GX + c * (TW + 14 * chop), gy = GY - 260 * lift + r * (TH + 14 * chop) - 10 * chop, here: [number, number] = [gx + TW / 2, gy + TH / 2];
          if (lift <= 0) return null;
          if (u < 0) { const s = 1 - 0.38 * pack; return <g key={i} transform={`translate(${here[0]} ${here[1]}) scale(${s})`} opacity={lift}>
            <rect x={-TW / 2 - 5 * pack} y={-TH / 2 - 5 * pack} width={TW + 10 * pack} height={TH + 26 * pack} rx={8 * pack} fill="#0e1430" stroke="#5fe3ff" strokeWidth={3 * pack} opacity={pack} />
            <Tile c={c} r={r} x={-TW / 2} y={-TH / 2} w={TW} h={TH} />{pack > 0 && <text x={0} y={TH / 2 + 17} textAnchor="middle" style={{ font: `700 18px ${FONT.mono}` }} fill="#9fe9ff" opacity={pack}>#{i + 1}</text>}</g>; }
          const st = along([here, ...ROUTES[i % 3].slice(1, -1), toHer([slot(i)[0] + 26, slot(i)[1] + 20])], easeInOut(u)), s = lerp(0.62, 0.82, Math.sin(Math.PI * u));
          return <g key={i} transform={`translate(${st[0]} ${st[1]}) scale(${s})`}><circle r={74} fill="url(#pkC)" opacity={0.7} />
            <rect x={-TW / 2 - 5} y={-TH / 2 - 5} width={TW + 10} height={TH + 26} rx={8} fill="#0e1430" stroke="#5fe3ff" strokeWidth={3} /><Tile c={c} r={r} x={-TW / 2} y={-TH / 2} w={TW} h={TH} /><text x={0} y={TH / 2 + 17} textAnchor="middle" style={{ font: `700 18px ${FONT.mono}` }} fill="#9fe9ff">#{i + 1}</text>
            {tag > 0 && <g transform={`translate(0 ${-TH / 2 - 26}) scale(${0.7 + 0.3 * tag})`} opacity={tag}><rect x={-62} y={-17} width={124} height={34} rx={10} fill="#ffe08a" /><text y={7} textAnchor="middle" style={{ font: `700 18px ${FONT.mono}` }} fill="#3a2a05">To: …1.7</text></g>}</g>; })}
        <rect x={fx()} width={fw()} height={1920} fill="url(#pkV)" />
      </svg>
      <div style={{ position: 'absolute', top: 226, left: 70, width: 520, height: 150, borderRadius: 36, background: 'rgba(10,14,36,.86)', border: '1px solid rgba(160,176,255,.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: prog(f, 1.2, 1.45) }}>
        <div style={{ font: `800 50px/1 ${FONT.ui}`, color: '#eef1ff' }}>1 video = <span style={{ color: '#9fe9ff' }}>12 packets</span></div><div style={{ font: `600 23px ${FONT.mono}`, letterSpacing: '0.14em', color: '#a9b4dd' }}>{t < 2.9 ? 'NUMBERED, SO THEY FIT BACK' : t < 4.4 ? 'EACH ONE KNOWS HER ADDRESS' : 'BACK IN ORDER'}</div></div>
    </AbsoluteFill>
  );
};

/* ---------- London: her new balcony. His message lands; she answers. ---------- */
export const London: React.FC = () => {
  const f = useCurrentFrame(), k = f / FPS;
  const got = prog(f, 0.75, 0.9, easeOut), typing = prog(f, 1.3, 1.5) * (1 - prog(f, 2.2, 2.35)), sent = prog(f, 2.35, 2.5, easeOut), joy = prog(f, 2.6, 2.9, easeOut);
  const lm = (x: number, y: number, a: number, l: number) => { const r = a * Math.PI / 180; return [x + Math.sin(r) * l, y + Math.cos(r) * l]; };
  const armR: [number, number] = [lerp(40, 44, typing) + Math.sin(k * 30) * 1.5 * typing, lerp(150, 146, typing)];
  const her: StickPose = { blink: Math.max(0, 1 - Math.abs(k - 0.5) / 0.07, 1 - Math.abs(k - 2.0) / 0.07), smile: lerp(0.5, 1, got), look: lerp(0.6, 0.1, joy), armR, armL: [lerp(-10, -150, joy) + Math.sin(k * 10) * 10 * joy, lerp(-6, -172, joy) + Math.sin(k * 10 + 1) * 12 * joy], tilt: 2 + Math.sin(k * 9) * 2 * joy };
  const sxw = 26, [ex, ey] = lm(sxw, A_SHOULDER.y, armR[0], A_UPPER), [wx, wy] = lm(ex, ey, armR[1], A_FORE);
  const HX = 520, HY = 1150, S = 1.5, hop = Math.abs(Math.sin((k - 2.6) * 8)) * 18 * joy, ph = { x: HX + wx * S, y: HY - hop + (wy - 18) * S };
  const uIn = easeInOut(clamp01((k - 0.1) / 0.65)), uOut = easeInOut(clamp01((k - 2.4) / 0.7)), far = { x: -80, y: 420 };
  const env = (x: number, y: number) => <g transform={`translate(${x} ${y})`}><circle r={70} fill="url(#lnC)" /><rect x={-26} y={-18} width={52} height={36} rx={7} fill="#f2feff" stroke="#5fe3ff" strokeWidth={3} /><path d="M -22 -14 L 0 3 L 22 -14" stroke="#1d8fb0" strokeWidth={3.5} fill="none" /></g>;
  const BR = '#7a4a6a', BRD = '#4a2a4e';
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      <svg width={1080} height={1920}>
        <Night id="ln" f={f} stars={50} />
        <defs><linearGradient id="lnWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a587a" /><stop offset="1" stopColor="#4e2f5c" /></linearGradient></defs>
        <g transform={`translate(540 960) scale(${1.02 + k * 0.01}) translate(-540 -960)`}>
          {/* London, far off: the clock tower and the wheel */}
          <g opacity={0.9}><circle cx={880} cy={330} r={150} fill="none" stroke="#2a2f7a" strokeWidth={9} />{Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * Math.PI * 2 + k * 0.1; return <g key={i}><line x1={880} y1={330} x2={880 + Math.cos(a) * 150} y2={330 + Math.sin(a) * 150} stroke="#2a2f7a" strokeWidth={3} /><circle cx={880 + Math.cos(a) * 150} cy={330 + Math.sin(a) * 150} r={9} fill="#5fe3ff" opacity={0.55} /></g>; })}<path d="M 850 480 L 880 330 L 910 480 Z" fill="#20246a" />
            <rect x={96} y={250} width={72} height={300} fill="#20246a" /><rect x={86} y={236} width={92} height={90} fill="#262b78" /><circle cx={132} cy={282} r={30} fill="#ffe9b8" /><circle cx={132} cy={282} r={30} fill="url(#lnW)" /><line x1={132} y1={282} x2={132} y2={262} stroke="#3a2a05" strokeWidth={4} /><line x1={132} y1={282} x2={146} y2={290} stroke="#3a2a05" strokeWidth={4} /><path d="M 86 236 L 132 130 L 178 236 Z" fill="#20246a" /><rect x={128} y={96} width={8} height={40} fill="#20246a" /></g>
          {/* drizzle */}
          {Array.from({ length: 34 }).map((_, i) => { const y = ((hash(i * 3) * 2000 + k * 900) % 2000) - 40, x = hash(i * 7) * 1080 - (y * 0.12); return <line key={i} x1={x} y1={y} x2={x - 5} y2={y + 34} stroke="#bcd0ff" strokeWidth={2} opacity={0.16} />; })}
          {/* her brick terrace house */}
          <rect x={60} y={470} width={960} height={1500} fill="url(#lnWall)" />
          {Array.from({ length: 60 }).map((_, i) => <line key={i} x1={60} y1={490 + i * 25} x2={1020} y2={490 + i * 25} stroke="#000" strokeWidth={2} opacity={0.13} />)}
          {Array.from({ length: 60 * 8 }).map((_, i) => { const r = Math.floor(i / 8), c = i % 8; return <line key={i} x1={60 + c * 120 + (r % 2) * 60} y1={490 + r * 25} x2={60 + c * 120 + (r % 2) * 60} y2={515 + r * 25} stroke="#000" strokeWidth={1.6} opacity={0.1} />; })}
          <rect x={30} y={424} width={1020} height={54} fill="#f3e9d6" /><rect x={30} y={472} width={1020} height={12} fill={BRD} />
          {[180, 540, 900].map((x) => <g key={x}><rect x={x - 34} y={330} width={68} height={96} fill={BR} /><rect x={x - 40} y={320} width={80} height={14} fill="#f3e9d6" />{[-16, 16].map((d) => <rect key={d} x={x + d - 9} y={292} width={18} height={30} rx={4} fill="#c96a4a" />)}</g>)}
          {[[120, 660], [800, 660], [120, 1400], [800, 1400]].map(([x, y], i) => <g key={i}><rect x={x - 12} y={y - 12} width={194} height={274} fill="#f3e9d6" /><rect x={x} y={y} width={170} height={250} fill={i === 1 ? '#141736' : '#ffd88a'} />{i !== 1 && <rect x={x} y={y} width={58} height={250} fill="#e98f6a" opacity={0.75} />}<line x1={x + 85} y1={y} x2={x + 85} y2={y + 250} stroke="#f3e9d6" strokeWidth={7} /><line x1={x} y1={y + 125} x2={x + 170} y2={y + 125} stroke="#f3e9d6" strokeWidth={7} /><rect x={x - 22} y={y + 256} width={214} height={16} fill="#f3e9d6" />{i === 0 && <g><rect x={x + 6} y={y + 232} width={158} height={26} fill="#2a1f3a" />{[0, 1, 2, 3, 4].map((j) => <circle key={j} cx={x + 24 + j * 30} cy={y + 226 - (j % 2) * 8} r={12} fill={['#ff8672', '#f58fb4', '#ffd36b'][j % 3]} />)}</g>}</g>)}
          <rect x={390} y={620} width={260} height={540} fill="#f3e9d6" /><rect x={404} y={634} width={232} height={526} fill="#2b1c44" /><path d="M 390 620 A 130 60 0 0 1 650 620 Z" fill="#f3e9d6" />
          <rect x={430} y={1420} width={200} height={500} fill="#b03a3a" stroke="#f3e9d6" strokeWidth={10} /><circle cx={530} cy={1600} r={12} fill="#ffd38a" /><rect x={500} y={1470} width={60} height={12} rx={4} fill="#ffd38a" />
          <ellipse cx={HX} cy={HY - 250} rx={330} ry={360} fill="url(#lnC)" opacity={0.08 + 0.16 * got} /><ellipse cx={HX} cy={HY - 260} rx={280} ry={330} fill="url(#lnW)" opacity={0.25} />
          {/* her */}
          <g transform={`translate(${HX} ${HY - hop}) scale(${S})`}><Adult kind="woman" p={her} id="lon" /></g>
          <g transform={`translate(${ph.x} ${ph.y}) rotate(-10)`}><circle r={70} fill="url(#lnC)" opacity={0.7 * got} /><rect x={-20} y={-38} width={40} height={76} rx={9} fill="#0b0d1c" stroke="#5a6088" strokeWidth={3} /><rect x={-15} y={-31} width={30} height={60} rx={5} fill={got > 0.5 ? '#bff4ff' : '#27305e'} /></g>
          {/* balcony */}
          <rect x={170} y={HY} width={740} height={34} fill="#f3e9d6" /><rect x={170} y={HY + 34} width={740} height={16} fill={BRD} />
          <line x1={180} y1={HY - 170} x2={900} y2={HY - 170} stroke="#0c1020" strokeWidth={12} strokeLinecap="round" />
          {Array.from({ length: 15 }).map((_, i) => <g key={i}><line x1={186 + i * 50.6} y1={HY - 170} x2={186 + i * 50.6} y2={HY} stroke="#0c1020" strokeWidth={7} /><circle cx={186 + i * 50.6} cy={HY - 86} r={9} fill="none" stroke="#0c1020" strokeWidth={5} /></g>)}
          <g transform={`translate(800 ${HY - 176})`}><rect x={-44} y={-8} width={88} height={40} rx={6} fill="#c96a4a" />{[0, 1, 2].map((j) => <g key={j}><line x1={-24 + j * 24} y1={-8} x2={-24 + j * 24 + Math.sin(k * 2 + j) * 4} y2={-50} stroke="#2a9a7a" strokeWidth={6} strokeLinecap="round" /><circle cx={-24 + j * 24 + Math.sin(k * 2 + j) * 4} cy={-54} r={13} fill={['#ff8672', '#ffd36b', '#f58fb4'][j]} /></g>)}</g>
          {/* his message arrives, hers leaves */}
          {uIn < 1 && env(lerp(far.x, ph.x, uIn), lerp(far.y, ph.y, uIn) - 150 * Math.sin(Math.PI * uIn))}
          {sent > 0 && uOut < 1 && env(lerp(ph.x, far.x, uOut), lerp(ph.y, far.y, uOut) - 150 * Math.sin(Math.PI * uOut))}
          {got > 0 && <g transform={`translate(${HX - 150} ${HY - 700}) scale(${0.6 + 0.4 * got})`} opacity={got}>
            <path d="M -170 -70 h 340 a 30 30 0 0 1 30 30 v 80 a 30 30 0 0 1 -30 30 h -200 l -30 44 l -14 -44 h -96 a 30 30 0 0 1 -30 -30 v -80 a 30 30 0 0 1 30 -30 Z" fill="#0e1430" stroke="#5fe3ff" strokeWidth={5} />
            <text x={-150} y={-22} style={{ font: `600 26px ${FONT.mono}`, letterSpacing: '0.1em' }} fill="#9fe9ff">HIM · HYDERABAD</text><text x={-150} y={44} style={{ font: `800 62px ${FONT.ui}` }} fill="#fff">Hello</text></g>}
          {(typing > 0 || sent > 0) && <g transform={`translate(${HX + 250} ${HY - 560}) scale(${0.6 + 0.4 * Math.max(typing, sent)})`} opacity={Math.max(typing, sent)}>
            <path d="M -110 -56 h 220 a 28 28 0 0 1 28 28 v 56 a 28 28 0 0 1 -28 28 h -40 l 30 40 l -70 -40 h -140 a 28 28 0 0 1 -28 -28 v -56 a 28 28 0 0 1 28 -28 Z" fill="#ff8672" />
            {sent > 0 ? <text x={0} y={22} textAnchor="middle" style={{ font: `800 62px ${FONT.ui}` }} fill="#fff">Hi!</text> : [0, 1, 2].map((j) => <circle key={j} cx={-36 + j * 36} cy={0 - Math.abs(Math.sin(k * 9 - j * 0.9)) * 12} r={11} fill="#fff" />)}</g>}
          {joy > 0 && [0, 1, 2].map((i) => { const v = ((k - 2.6) * 0.9 + i / 3) % 1, x = HX + 110 + i * 60 + Math.sin(k * 2 + i) * 10, y = HY - 520 - v * 200; return <path key={i} d={`M ${x} ${y} c -14 -16 -34 2 0 26 c 34 -24 14 -42 0 -26 Z`} fill="#ff6f91" opacity={(1 - v) * 0.9 * joy} />; })}
        </g>
        <rect x={fx()} width={fw()} height={1920} fill="url(#lnV)" />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- End card: the torch from the first shot, the planet it turned into, and the channel ---------- */
/* p2: the Part 1 end card: smaller logo and handle under the globe (never on it), a "Part 2 coming soon" line, everything above y 1480 */
export const EndCard: React.FC<{ p2?: boolean }> = ({ p2 }) => {
  const f = useCurrentFrame(), k = f / FPS, a = prog(f, 0.1, 0.5, easeOut), b = prog(f, 0.5, 0.9, easeOut);
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      <svg width={1080} height={1920}>
        <Night id="ec" f={f} stars={110} />
        <defs><linearGradient id="ecBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff6dc" stopOpacity=".7" /><stop offset="1" stopColor="#ffe2a8" stopOpacity="0" /></linearGradient></defs>
        <g opacity={a}><Globe id="eg" rot={[30 + k * 9, 22]} R={(p2 ? 270 : 330) * (0.9 + 0.1 * a)} cy={p2 ? 700 : 760} f={f}>{(g: GlobeApi) => <>
          {[...WEB, MAIN, ALT].map((r, i) => { const d = g.line(routePts(r)); return <g key={i}><path d={d} fill="none" stroke="#5fe3ff" strokeWidth={7} strokeLinecap="round" opacity={0.14} /><path d={d} fill="none" stroke="#9fe9ff" strokeWidth={1.8} strokeLinecap="round" opacity={0.8} /></g>; })}</>}</Globe></g>
        {/* the torch, still shining */}
        <g transform={p2 ? "translate(540 1425) scale(0.42)" : "translate(540 1530) scale(0.8)"} opacity={b}><path d="M -46 -96 L -250 -1100 L 250 -1100 L 46 -96 Z" fill="url(#ecBeam)" opacity={0.28 + 0.05 * Math.sin(k * 5)} style={{ mixBlendMode: 'screen' }} />
          <circle cx={0} cy={-100} r={110} fill="url(#ecW)" opacity={0.8} /><rect x={-30} y={-10} width={60} height={150} rx={14} fill="#2a2f4c" /><rect x={-30} y={-10} width={20} height={150} rx={10} fill="#5a6088" opacity={0.7} />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-30} y={40 + i * 16} width={60} height={5} fill="#0a0c14" opacity={0.5} />)}
          <polygon points="-30,-10 -56,-84 56,-84 30,-10" fill="#d24a30" /><polygon points="-30,-10 -56,-84 -30,-84 -14,-10" fill="#ff8a6a" opacity={0.6} /><rect x={-60} y={-98} width={120} height={16} rx={7} fill="#e3e7f2" /><ellipse cx={0} cy={-98} rx={54} ry={9} fill="#fffbe8" /></g>
        <rect x={fx()} width={fw()} height={1920} fill="url(#ecV)" />
      </svg>
      <div style={{ position: 'absolute', top: p2 ? 1010 : 1090, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: p2 ? 12 : 18, opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>
        <Img src={staticFile('logo.png')} style={{ width: p2 ? 84 : 150, height: p2 ? 84 : 150, borderRadius: 75, boxShadow: '0 0 0 4px rgba(95,227,255,.6), 0 0 40px rgba(95,227,255,.5)' }} />
        <div style={{ font: `800 ${p2 ? 42 : 74}px/1 ${FONT.ui}`, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,.8)' }}>@TheInvisiTech</div>
        <div style={{ font: `700 ${p2 ? 26 : 34}px/1 ${FONT.ui}`, color: '#0a2a44', background: '#5fe3ff', padding: p2 ? '11px 28px' : '14px 34px', borderRadius: 40, transform: `scale(${1 + 0.04 * Math.sin(k * 6)})` }}>Follow for more</div>
      </div>
      {p2 && <div style={{ position: 'absolute', top: 1262, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}><div style={{ padding: '14px 36px', borderRadius: 30, background: 'rgba(10,14,36,.88)', border: '3px solid #ffd38a', boxShadow: '0 12px 36px rgba(0,0,0,.5)', font: `800 44px/1 ${FONT.ui}`, color: '#fff', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>PART 2 <span style={{ color: '#ffd38a' }}>coming soon</span></div></div>}
      <div style={{ position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', font: `800 60px/1.15 ${FONT.ui}`, color: '#eef1ff', opacity: a, textShadow: '0 4px 20px rgba(0,0,0,.8)' }}>From one <span style={{ color: '#ffd38a' }}>torch</span><br />to the whole <span style={{ color: '#9fe9ff' }}>world.</span></div>
    </AbsoluteFill>
  );
};
