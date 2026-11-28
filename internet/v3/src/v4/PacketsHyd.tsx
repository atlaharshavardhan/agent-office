import React from 'react';
import { AbsoluteFill } from 'remotion';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { DogPhoto } from './Story';
/* Part 2, scene after the hook: your phone cuts the dog photo into packets (STILL STORYBOARD, 9:16). Beats: 0 send, 1 the photo splits live, 2 packets ready and flying, 3 one packet picked and its label, 4 radio waves to the router and the tower. */
const GOLD = '#ffb454', GOLD2 = '#ffd38a', INK = '#2a1630', CREAM = '#fff1dc';
const num = (n: number) => '#' + String(n).padStart(4, '0');
const Tile: React.FC<{ x: number; y: number; s: number; rot?: number; i: number; j: number; n: number; tag?: string; hl?: boolean }> = ({ x, y, s, rot = 0, i, j, n, tag, hl }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {hl && <rect x={-s / 2 - 14} y={-s / 2 - 14} width={s + 28} height={s + 28} rx={14} fill="none" stroke="#fff" strokeWidth={5} opacity={0.9} />}
    <rect x={-s / 2 - 4} y={-s / 2 - 4} width={s + 8} height={s + 8} rx={8} fill={GOLD} />
    <svg x={-s / 2} y={-s / 2} width={s} height={s} viewBox={`${(j * 190) / n} ${(i * 190) / n} ${190 / n} ${190 / n}`} overflow="hidden"><DogPhoto /></svg>
    {tag && <g transform={`translate(0 ${-s / 2 - 16})`}><rect x={-34} y={-14} width={68} height={26} rx={6} fill={GOLD2} /><text y={6} textAnchor="middle" fill={INK} style={{ font: `800 18px ${FONT.ui}` }}>{tag}</text></g>}
  </g>);
const Phone: React.FC<{ cx: number; cy: number; s: number; children?: React.ReactNode }> = ({ cx, cy, s, children }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s})`}>
    <rect x={-190} y={-390} width={380} height={780} rx={56} fill="#17141c" stroke="#4a4256" strokeWidth={6} /><rect x={-176} y={-376} width={352} height={752} rx={44} fill="#0f0d14" />
    <rect x={-52} y={-356} width={104} height={28} rx={14} fill="#000" />{children}
  </g>);
const Cap: React.FC<{ t: string; y?: number }> = ({ t, y = 1640 }) => <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center' }}><div style={{ padding: '16px 36px', borderRadius: 40, background: '#2a1630', border: '3px solid #ffb454', font: `800 46px/1 ${FONT.ui}`, color: CREAM }}>{t}</div></div>;
const Label: React.FC<{ y: number }> = ({ y }) => (
  <g transform={`translate(540 ${y})`}>
    <rect x={-400} y={0} width={800} height={330} rx={30} fill="#fff1dc" stroke={GOLD} strokeWidth={6} />
    {[['TO', 'your girlfriend · London', '#c2412b'], ['FROM', 'you · Hyderabad', '#2a6fb0'], ['PIECE', `${num(1204)} of 2,000`, '#7a4a10']].map(([k, v, c], r) => <g key={k} transform={`translate(0 ${r * 100 + 60})`}>
      <text x={-360} y={0} fill={c as string} style={{ font: `900 34px ${FONT.ui}`, letterSpacing: '0.08em' }}>{k}</text><text x={-190} y={0} fill={INK} style={{ font: `800 42px ${FONT.ui}` }}>{v}</text>{r < 2 && <line x1={-360} x2={360} y1={34} y2={34} stroke="#e3c9a0" strokeWidth={2} />}</g>)}
  </g>);
const Scene: React.FC<{ beat: number }> = ({ beat }) => {
  const N = 8, tiles: React.ReactNode[] = [];
  if (beat === 1) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const k = i * N + j, s = 66, dx = (j - 3.5) * 1.18, dy = (i - 3.5) * 1.18; tiles.push(<Tile key={k} x={540 + dx * s + (hash(k) - 0.5) * 22} y={900 + dy * s + (hash(k + 9) - 0.5) * 22} s={s - 6} rot={(hash(k + 3) - 0.5) * 26} i={i} j={j} n={N} />); }
  if (beat === 2) for (let k = 0; k < 46; k++) { const a = hash(k) * 6.283, r = 220 + hash(k + 5) * 380, i = Math.floor(hash(k + 2) * N), j = Math.floor(hash(k + 7) * N); tiles.push(<Tile key={k} x={540 + Math.cos(a) * r} y={880 + Math.sin(a) * r * 1.15} s={50 + hash(k + 4) * 36} rot={(hash(k + 1) - 0.5) * 70} i={i} j={j} n={N} tag={num(Math.floor(hash(k + 8) * 2000))} hl={k === 11} />); }
  return (<AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #3b1f3d 0%, #1b0f26 70%, #12091a 100%)' }}>
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      {[...Array(60)].map((_, k) => <circle key={k} cx={hash(k) * 1080} cy={hash(k + 40) * 1500} r={1 + hash(k + 3) * 1.6} fill="#e6ebff" opacity={0.5} />)}
      {beat === 0 && <Phone cx={540} cy={960} s={1.2}><rect x={-150} y={-250} width={300} height={44} rx={22} fill="#26252a" /><text x={-120} y={-221} fill="#fff" style={{ font: `700 22px ${FONT.ui}` }}>My girlfriend · London</text>
        <g transform="translate(40 -120)"><rect x={-2} y={-2} width={124} height={124} rx={16} fill="#0a84ff" /><svg x={4} y={4} width={112} height={112} viewBox="0 0 190 190"><DogPhoto /></svg></g>
        <rect x={-150} y={290} width={230} height={56} rx={28} fill="#26252a" /><circle cx={118} cy={318} r={30} fill="#0a84ff" /><path d="M 108 330 L 118 304 L 128 330 L 118 324 Z" fill="#fff" /><circle cx={118} cy={318} r={44} fill="none" stroke="#fff" strokeWidth={4} opacity={0.7} /></Phone>}
      {beat === 1 && <><Phone cx={540} cy={1000} s={1.35}><rect x={-176} y={-376} width={352} height={752} rx={44} fill="#0b0912" /></Phone><g>{tiles}</g></>}
      {beat === 2 && <><Phone cx={540} cy={1300} s={0.62}><rect x={-176} y={-376} width={352} height={752} rx={44} fill="#0b0912" /></Phone>{tiles}</>}
      {beat === 3 && <><Tile x={540} y={640} s={380} i={3} j={4} n={N} tag={num(1204)} hl /><Label y={960} /></>}
      {beat === 4 && <>
        <Phone cx={540} cy={1340} s={0.7}><rect x={-176} y={-376} width={352} height={752} rx={44} fill="#0b0912" /></Phone>
        {[0, 1, 2, 3].map((r) => <circle key={r} cx={540} cy={1010} r={70 + r * 46} fill="none" stroke={GOLD2} strokeWidth={4} opacity={0.75 - r * 0.17} />)}
        <g transform="translate(220 560)"><rect x={-120} y={20} width={240} height={60} rx={14} fill="#3a2a4a" stroke={GOLD} strokeWidth={4} />{[0, 1, 2].map((a) => <path key={a} d={`M -40 -${10 + a * 26} A ${50 + a * 26} ${50 + a * 26} 0 0 1 40 -${10 + a * 26}`} fill="none" stroke="#7fd4ff" strokeWidth={7} strokeLinecap="round" transform="translate(0 -4)" opacity={1 - a * 0.22} />)}<line x1={-80} y1={20} x2={-110} y2={-100} stroke="#4a4256" strokeWidth={8} /><line x1={80} y1={20} x2={110} y2={-100} stroke="#4a4256" strokeWidth={8} /></g>
        <g transform="translate(850 560)"><path d="M 0 -250 L -50 140 L 50 140 Z" fill="none" stroke="#7fd4ff" strokeWidth={8} /><line x1={-26} y1={-30} x2={26} y2={-30} stroke="#7fd4ff" strokeWidth={6} /><line x1={-38} y1={60} x2={38} y2={60} stroke="#7fd4ff" strokeWidth={6} /><circle cx={0} cy={-262} r={14} fill={GOLD} /></g>
        {[[330, 880], [400, 800], [460, 730]].map(([x, y], k) => <Tile key={'l' + k} x={x} y={y} s={44} rot={-20 + k * 14} i={k + 2} j={k + 1} n={N} />)}{[[700, 880], [770, 790], [820, 700]].map(([x, y], k) => <Tile key={'r' + k} x={x} y={y} s={44} rot={20 - k * 12} i={k + 1} j={k + 4} n={N} />)}</>}
    </svg>
    {beat === 0 && <Cap t="You tap send" y={1590} />}
    {beat === 1 && <Cap t="The photo splits into pieces" y={1640} />}
    {beat === 2 && <Cap t="About 2,000 packets, ready" y={1640} />}
    {beat === 3 && <Cap t="Every packet gets an address label" y={1640} />}
    {beat === 4 && <Cap t="Radio waves to the Wi-Fi router or the tower" y={1640} />}
  </AbsoluteFill>);
};
export const PktB0 = () => <Scene beat={0} />; export const PktB1 = () => <Scene beat={1} />; export const PktB2 = () => <Scene beat={2} />; export const PktB3 = () => <Scene beat={3} />; export const PktB4 = () => <Scene beat={4} />;
