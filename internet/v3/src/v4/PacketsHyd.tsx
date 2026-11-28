import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { HydRoom, WIN_PANE } from './HydRoom';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { DogPhoto } from './Story';
import { IPhone, Compose, PW, PH } from '../dusk/Phone';
/* Part 2, scene after the hook: your phone cuts the dog photo into packets (STILL STORYBOARD, 9:16). Beats: 0 send, 1 the photo splits live, 2 packets ready and flying, 3 one packet picked and its label, 4 radio waves to the router and the tower. */
const GOLD = '#ffb454', GOLD2 = '#ffd38a', INK = '#2a1630', CREAM = '#fff1dc';
const num = (n: number) => '#' + String(n).padStart(4, '0');
const Tile: React.FC<{ x: number; y: number; s: number; rot?: number; i: number; j: number; n: number; tag?: string; hl?: boolean; glow?: number }> = ({ x, y, s, rot = 0, i, j, n, tag, hl, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} style={{ filter: `drop-shadow(0 ${s * 0.12}px ${s * 0.18}px rgba(0,0,0,.55)) drop-shadow(0 0 ${s * 0.3 * glow}px rgba(255,180,84,.55))` }}>
    {hl && <rect x={-s / 2 - 16} y={-s / 2 - 16} width={s + 32} height={s + 32} rx={16} fill="none" stroke="#fff" strokeWidth={5} opacity={0.95} />}
    <rect x={-s / 2 - 5} y={-s / 2 - 5} width={s + 10} height={s + 22} rx={9} fill="url(#pkG)" stroke="#ffe3a0" strokeWidth={1.5} />
    <svg x={-s / 2} y={-s / 2} width={s} height={s} viewBox={`${(j * 190) / n} ${(i * 190) / n} ${190 / n} ${190 / n}`} overflow="hidden"><DogPhoto /></svg>
    <rect x={-s / 2} y={s / 2 + 2} width={s} height={9} rx={3} fill="#2a1630" opacity={0.8} /><rect x={-s / 2 + 3} y={s / 2 + 5} width={s * 0.55} height={3} rx={1.5} fill="#ffd38a" />
    {tag && <g transform={`translate(0 ${-s / 2 - 18})`}><rect x={-36} y={-14} width={72} height={26} rx={6} fill="#ffd38a" /><text y={6} textAnchor="middle" fill={INK} style={{ font: `800 18px ${FONT.ui}` }}>{tag}</text></g>}
  </g>);
const City: React.FC = () => (<g>
  <defs><linearGradient id="pkG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd38a" /><stop offset="1" stopColor="#d98a2a" /></linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0e2c" /><stop offset="0.6" stopColor="#1a2250" /><stop offset="1" stopColor="#2a2a5a" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#sky)" />
  {[...Array(70)].map((_, k) => <circle key={k} cx={hash(k) * 1080} cy={hash(k + 40) * 1000} r={1 + hash(k + 3) * 1.8} fill="#e6ebff" opacity={0.6} />)}
  {[...Array(15)].map((_, b) => { const w = 90 + hash(b) * 70, x = b * 74 - 20, h = 300 + hash(b + 5) * 520, y = 1920 - h; return <g key={b}><rect x={x} y={y} width={w} height={h} fill={b % 2 ? '#10153a' : '#0c1030'} />{[...Array(Math.floor(h / 46))].map((_, r) => [0, 1, 2].map((c) => hash(b * 99 + r * 7 + c) > 0.55 && <rect key={r + '-' + c} x={x + 12 + c * 26} y={y + 18 + r * 40} width={14} height={20} fill={hash(b + r + c) > 0.7 ? '#ffd38a' : '#7fa8ff'} opacity={0.75} />))}</g>; })}
  <rect x={0} y={1420} width={1080} height={500} fill="#0a0d26" opacity={0.65} />
</g>);
const PK = 2.3, PL = (1080 - PW * PK) / 2, PT = 250;      // our iPhone, big, centred
const Ph: React.FC<{ k?: number; left?: number; top?: number; photo?: boolean; press?: boolean }> = ({ k = PK, left = PL, top = PT, photo = true, press }) => (
  <IPhone v18 left={left} top={top} o={1} name="Meera" avatar="#e0705a" k={k}>
    <div style={{ position: 'absolute', left: 8, top: 6, background: '#26252a', color: '#fff', borderRadius: '14px 14px 14px 4px', padding: '5px 10px', font: `700 15px ${FONT.ui}` }}>Send me a photo!</div>
    {photo && <div style={{ position: 'absolute', left: 36, top: 52, width: 176, height: 176, borderRadius: 14, overflow: 'hidden', border: '2px solid #0a84ff' }}><svg width={176} height={176} viewBox="0 0 190 190"><DogPhoto /></svg></div>}
    <Compose bottom={8} text={<span style={{ color: '#8e8e93' }}>Message</span>} press={press} ready />
  </IPhone>);
const Cap: React.FC<{ t: string; y?: number }> = ({ t, y = 1640 }) => <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center' }}><div style={{ padding: '16px 36px', borderRadius: 40, background: '#2a1630', border: '3px solid #ffb454', font: `800 46px/1 ${FONT.ui}`, color: CREAM }}>{t}</div></div>;
const Label: React.FC<{ y: number }> = ({ y }) => (
  <g transform={`translate(540 ${y})`}>
    <rect x={-400} y={0} width={800} height={330} rx={30} fill="#fff1dc" stroke={GOLD} strokeWidth={6} />
    {[['TO', '86.14.203.57  (London)', '#c2412b'], ['FROM', '49.37.118.202  (Hyderabad)', '#2a6fb0'], ['PIECE', '1,204 of 2,000 · 1,500 bytes', '#7a4a10']].map(([k, v, c], r) => <g key={k} transform={`translate(0 ${r * 100 + 60})`}>
      <text x={-360} y={0} fill={c as string} style={{ font: `900 34px ${FONT.ui}`, letterSpacing: '0.08em' }}>{k}</text><text x={-230} y={0} fill={INK} style={{ font: `800 38px ${FONT.ui}` }}>{v}</text>{r < 2 && <line x1={-360} x2={360} y1={34} y2={34} stroke="#e3c9a0" strokeWidth={2} />}</g>)}
  </g>);
const stream = (x0: number, y0: number, x1: number, y1: number, cn: number, bend: number) => Array.from({ length: cn }).map((_, q) => { const u = (q + 0.5) / cn, x = x0 + (x1 - x0) * u + Math.sin(u * 3.14) * bend, y = y0 + (y1 - y0) * u, i = (q * 3) % 8, j = (q * 5) % 8; return <Tile key={q} x={x} y={y} s={26 + 12 * (1 - u)} rot={-30 + q * 17} i={i} j={j} n={8} glow={0.8} />; });
const Scene: React.FC<{ beat: number }> = ({ beat }) => {
  const N = 8, tiles: React.ReactNode[] = [];
  const ox = PL + 86 * (PK / 1), oy = PT + 125;                 // the photo on the phone screen (top-left), 176 x 176 at the phone's scale
  const pcx = PL + (36 + 88) * PK, pcy = PT + (52 + 88) * PK, ps = 176 * PK;
  if (beat === 1) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const k = i * N + j, s = ps / N, g = 1.22 + hash(k) * 0.12; tiles.push(<Tile key={k} x={pcx + (j - 3.5) * s * g + (hash(k + 9) - 0.5) * 16} y={pcy + (i - 3.5) * s * g + (hash(k + 5) - 0.5) * 16} s={s - 2} rot={(hash(k + 3) - 0.5) * 18} i={i} j={j} n={N} glow={0.6} />); }
  if (beat === 2) for (let k = 0; k < 40; k++) { const a = hash(k) * 6.283, r = 300 + hash(k + 5) * 330, i = Math.floor(hash(k + 2) * N), j = Math.floor(hash(k + 7) * N), x = 540 + Math.cos(a) * r * 0.95, y = 960 + Math.sin(a) * r * 1.25; if (x < 90 || x > 990 || y < 160 || y > 1560) continue; tiles.push(<Tile key={k} x={x} y={y} s={50 + hash(k + 4) * 36} rot={(hash(k + 1) - 0.5) * 70} i={i} j={j} n={N} tag={num(Math.floor(hash(k + 8) * 2000))} hl={k === 11} />); }
  const room = beat === 4;
  return (<AbsoluteFill>
    {beat < 4 && <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><City /></svg>}
    {room && <Sequence from={-14}><HydRoom /></Sequence>}
    {beat <= 1 && <Ph photo={beat === 0} press={beat === 0} />}
    {beat === 2 && <Ph k={1.1} left={(1080 - PW * 1.1) / 2} top={1140} photo={false} />}
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      {!room && beat !== 5 && null}
      {(beat === 1 || beat === 2) && <g>{tiles}</g>}
      {beat === 3 && <><Tile x={540} y={560} s={360} i={3} j={4} n={N} tag={num(1204)} hl /><Label y={880} /></>}
      {room && <g>{stream(560, 1250, WIN_PANE.cx, WIN_PANE.cy + 40, 9, -120)}<circle cx={WIN_PANE.cx} cy={WIN_PANE.cy} r={90} fill="none" stroke="#ffd38a" strokeWidth={4} opacity={0.6} /></g>}
    </svg>
    {beat === 5 && <Outside />}
    {beat === 0 && <Cap t="You tap send" y={1640} />}
    {beat === 1 && <Cap t="The photo splits into pieces" y={1640} />}
    {beat === 2 && <Cap t="About 2,000 packets, ready" y={1640} />}
    {beat === 3 && <Cap t="Every packet gets an address label" y={1640} />}
    {beat === 4 && <Cap t="Out of the window, as radio waves" y={1640} />}
    {beat === 5 && <Cap t="To the Wi-Fi box and the mobile tower" y={1640} />}
  </AbsoluteFill>);
};
/* outside the window: the night city, a rooftop Wi-Fi box and the mobile tower; the packets fly in as radio waves */
const Outside: React.FC = () => (<svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
  <City />
  <g transform="translate(830 1060)"><path d="M 0 -520 L -90 360 L 90 360 Z" fill="#0c1030" stroke="#7fd4ff" strokeWidth={6} />{[-380, -250, -120, 10, 140, 260].map((y, k) => <g key={k}><line x1={-18 - (y + 520) * 0.1} x2={18 + (y + 520) * 0.1} y1={y} y2={y} stroke="#7fd4ff" strokeWidth={4} /></g>)}
    <circle cx={0} cy={-540} r={16} fill="#ff5a5a" /><circle cx={0} cy={-540} r={34} fill="#ff5a5a" opacity={0.3} />{[0, 1, 2].map((r) => <path key={r} d={`M -${60 + r * 38} -${440 - r * 20} A ${60 + r * 38} ${60 + r * 38} 0 0 1 -${60 + r * 38} -${360 + r * 20}`} fill="none" stroke="#ffd38a" strokeWidth={6} strokeLinecap="round" opacity={0.9 - r * 0.25} />)}</g>
  <g transform="translate(250 1180)"><rect x={-130} y={0} width={260} height={90} rx={12} fill="#3a2a4a" stroke="#ffb454" strokeWidth={5} /><rect x={-100} y={30} width={14} height={14} rx={7} fill="#7dffb0" /><rect x={-70} y={30} width={14} height={14} rx={7} fill="#7dffb0" />{[0, 1, 2].map((a) => <path key={a} d={`M -${50 + a * 34} -${20 + a * 30} A ${70 + a * 34} ${70 + a * 34} 0 0 1 ${50 + a * 34} -${20 + a * 30}`} fill="none" stroke="#7fd4ff" strokeWidth={8} strokeLinecap="round" opacity={1 - a * 0.25} />)}
    <text y={150} x={0} textAnchor="middle" fill={CREAM} style={{ font: `800 34px ${FONT.ui}` }}>Wi-Fi router</text></g>
  <text x={830} y={1460} textAnchor="middle" fill={CREAM} style={{ font: `800 34px ${FONT.ui}` }}>Mobile tower</text>
  {stream(560, 120, 270, 1110, 9, 110)}{stream(560, 120, 820, 560, 8, -90)}
</svg>);
export const PktB0 = () => <Scene beat={0} />; export const PktB1 = () => <Scene beat={1} />; export const PktB2 = () => <Scene beat={2} />; export const PktB3 = () => <Scene beat={3} />; export const PktB4 = () => <Scene beat={4} />; export const PktB5 = () => <Scene beat={5} />;
