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
    {tag && <g transform={`translate(0 ${-s / 2 - 18 * Math.max(1, s / 110)}) scale(${Math.max(1, s / 110)})`}><rect x={-36} y={-14} width={72} height={26} rx={6} fill="#ffd38a" /><text y={6} textAnchor="middle" fill={INK} style={{ font: `800 18px ${FONT.ui}` }}>{tag}</text></g>}
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
  <IPhone v18 left={left} top={top} o={1} name="Girlfriend" avatar="#e0705a" k={k}>
    <div style={{ position: 'absolute', left: 8, top: 6, background: '#26252a', color: '#fff', borderRadius: '14px 14px 14px 4px', padding: '5px 10px', font: `700 15px ${FONT.ui}` }}>Send me a photo!</div>
    {photo && <div style={{ position: 'absolute', left: 36, top: 52, width: 176, height: 176, borderRadius: 14, overflow: 'hidden', border: '2px solid #0a84ff' }}><svg width={176} height={176} viewBox="0 0 190 190"><DogPhoto /></svg></div>}
    <Compose bottom={8} text={<span style={{ color: '#8e8e93' }}>Message</span>} press={press} ready />
  </IPhone>);
const Cap: React.FC<{ t: string; y?: number }> = ({ t, y = 1640 }) => <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center' }}><div style={{ padding: '16px 36px', borderRadius: 40, background: '#2a1630', border: '3px solid #ffb454', font: `800 46px/1 ${FONT.ui}`, color: CREAM }}>{t}</div></div>;
const Label: React.FC<{ y: number }> = ({ y }) => {
  const rows: [string, string, string, string][] = [['TO', '86.14.203.57', '(London)', '#c2412b'], ['FROM', '49.37.118.202', '(Hyderabad)', '#2a6fb0'], ['PIECE', '1,204 of 2,000', '1,500 bytes', '#9a6a14']];
  return (<g transform={`translate(540 ${y})`} style={{ filter: 'drop-shadow(0 16px 28px rgba(0,0,0,.5)) drop-shadow(0 0 26px rgba(255,180,84,.35))' }}>
    <rect x={-430} y={0} width={860} height={380} rx={36} fill="#fff6e6" stroke={GOLD} strokeWidth={6} />
    <rect x={-430} y={0} width={20} height={380} rx={10} fill={GOLD} /><rect x={-418} y={0} width={14} height={380} fill="#fff6e6" />
    {rows.map(([k, v, sub, c], r) => <g key={k} transform={`translate(0 ${r * 116 + 30})`}>
      <circle cx={-372} cy={46} r={9} fill={c} /><text x={-345} y={62} fill={c} style={{ font: `900 38px ${FONT.ui}`, letterSpacing: '0.08em' }}>{k}</text>
      <text x={-200} y={62} fill="#2a1630" style={{ font: `800 40px ${FONT.mono}` }}>{v}</text><text x={r < 2 ? 150 : 160} y={62} fill={c} style={{ font: `800 ${r < 2 ? 38 : 32}px ${FONT.ui}` }}>{sub}</text>
      {r < 2 && <line x1={-380} x2={390} y1={104} y2={104} stroke="#e3c9a0" strokeWidth={2} />}</g>)}
  </g>);
};
const stream = (x0: number, y0: number, x1: number, y1: number, cn: number, bend: number) => Array.from({ length: cn }).map((_, q) => { const u = (q + 0.5) / cn, x = x0 + (x1 - x0) * u + Math.sin(u * 3.14) * bend, y = y0 + (y1 - y0) * u, i = (q * 3) % 8, j = (q * 5) % 8; return <Tile key={q} x={x} y={y} s={26 + 12 * (1 - u)} rot={-30 + q * 17} i={i} j={j} n={8} glow={0.8} />; });
const Scene: React.FC<{ beat: number }> = ({ beat }) => {
  const N = 12, tiles: React.ReactNode[] = [];
  const ox = PL + 86 * (PK / 1), oy = PT + 125;                 // the photo on the phone screen (top-left), 176 x 176 at the phone's scale
  const pcx = PL + 133 * PK, pcy = PT + 246 * PK, ps = 176 * PK;
  if (beat === 1) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const k = i * N + j, s = ps / N, g = 1.18 + hash(k) * 0.1; tiles.push(<Tile key={k} x={pcx + (j - 5.5) * s * g + (hash(k + 9) - 0.5) * 16} y={pcy + (i - 5.5) * s * g + (hash(k + 5) - 0.5) * 16} s={s - 2} rot={(hash(k + 3) - 0.5) * 18} i={i} j={j} n={N} glow={0.6} />); }
  if (beat === 2) for (let k = 0; k < 150; k++) { const a = hash(k) * 6.283, r = 200 + hash(k + 5) * 460, i = Math.floor(hash(k + 2) * N), j = Math.floor(hash(k + 7) * N), x = 540 + Math.cos(a) * r * 0.95, y = 960 + Math.sin(a) * r * 1.25; if (x < 70 || x > 1010 || y < 140 || y > 1580) continue; tiles.push(<Tile key={k} x={x} y={y} s={34 + hash(k + 4) * 34} rot={(hash(k + 1) - 0.5) * 70} i={i} j={j} n={N} tag={k % 3 === 0 ? num(Math.floor(hash(k + 8) * 2000)) : undefined} hl={k === 11} />); }
  const room = beat === 4;
  return (<AbsoluteFill>
    {beat < 4 && <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><City /></svg>}
    {room && <Sequence from={-14}><HydRoom /></Sequence>}
    {beat <= 1 && <Ph photo={beat === 0} press={beat === 0} />}
    {beat === 2 && <Ph k={1.1} left={(1080 - PW * 1.1) / 2} top={1140} photo={false} />}
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      {!room && beat !== 5 && null}
      {(beat === 1 || beat === 2) && <g>{tiles}</g>}
      {beat === 3 && <><Tile x={540} y={470} s={300} i={6} j={5} n={N} tag={num(1204)} hl /><Label y={860} /></>}
      {room && <g>{stream(560, 1250, WIN_PANE.cx, WIN_PANE.cy + 40, 9, -120)}<circle cx={WIN_PANE.cx} cy={WIN_PANE.cy} r={90} fill="none" stroke="#ffd38a" strokeWidth={4} opacity={0.6} /></g>}
    </svg>
    {beat === 5 && <Outside />}
    {beat === 0 && <Cap t="You tap send" y={1640} />}
    {beat === 1 && <Cap t="The photo splits into pieces" y={1640} />}
    {beat === 2 && <Cap t="About 2,000 packets, ready" y={1640} />}
    {beat === 3 && <Cap t="Every packet gets an address label" y={1640} />}
    {false && <Cap t="Out of the window, as radio waves" y={1640} />}
    {beat === 5 && <Cap t="Radio waves to the router or the tower" y={1640} />}
  </AbsoluteFill>);
};
/* outside the window: the night city, a rooftop Wi-Fi box and the mobile tower; the packets fly in as radio waves */
const Lattice: React.FC<{ h: number; bw: number; tw: number; seg: number }> = ({ h, bw, tw, seg }) => {   // a real mobile mast: three legs' look, cross braces, platform, antenna panels, dish, light, cabin
  const rows = Array.from({ length: seg + 1 }).map((_, k) => { const y = -h + (h * k) / seg, w = tw + ((bw - tw) * k) / seg; return { y, w }; });
  return (<g stroke="#9fb4d6" strokeLinecap="round" fill="none">
    <line x1={-tw} y1={-h} x2={-bw} y2={0} strokeWidth={9} /><line x1={tw} y1={-h} x2={bw} y2={0} strokeWidth={9} /><line x1={0} y1={-h} x2={0} y2={0} strokeWidth={5} opacity={0.5} />
    {rows.map((r, k) => <line key={'h' + k} x1={-r.w} x2={r.w} y1={r.y} y2={r.y} strokeWidth={5} />)}
    {rows.slice(0, -1).map((r, k) => { const n = rows[k + 1]; return <g key={'x' + k} strokeWidth={3.5}><line x1={-r.w} y1={r.y} x2={n.w} y2={n.y} /><line x1={r.w} y1={r.y} x2={-n.w} y2={n.y} /></g>; })}
    <rect x={-tw - 26} y={-h - 8} width={(tw + 26) * 2} height={12} rx={4} fill="#4a5878" stroke="#9fb4d6" strokeWidth={2} />
    {[-tw - 20, 0, tw + 20].map((x, k) => <g key={k}><rect x={x - 11} y={-h - 130} width={22} height={118} rx={5} fill="#e8eefc" stroke="#9fb4d6" strokeWidth={3} /><rect x={x - 5} y={-h - 118} width={10} height={90} rx={3} fill="#c8d4ee" /></g>)}
    <circle cx={tw + 64} cy={-h + 60} r={34} fill="#e8eefc" stroke="#9fb4d6" strokeWidth={4} /><circle cx={tw + 64} cy={-h + 60} r={10} fill="#4a5878" /><line x1={tw + 30} y1={-h + 76} x2={tw - 6} y2={-h + 100} stroke="#9fb4d6" strokeWidth={5} />
    <line x1={0} y1={-h - 130} x2={0} y2={-h - 190} stroke="#9fb4d6" strokeWidth={6} /><circle cx={0} cy={-h - 198} r={13} fill="#ff4a3a" /><circle cx={0} cy={-h - 198} r={34} fill="#ff4a3a" opacity={0.25} stroke="none" />
    <rect x={-bw - 40} y={-70} width={110} height={70} rx={6} fill="#26304f" stroke="#9fb4d6" strokeWidth={3} /><line x1={-bw + 10} y1={-70} x2={-tw - 40} y2={-h * 0.25} stroke="#9fb4d6" strokeWidth={3} opacity={0.6} />
  </g>);
};
const Outside: React.FC = () => (<svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
  <City />
  <g transform="translate(800 1380)"><Lattice h={780} bw={170} tw={34} seg={9} />{[0, 1, 2, 3].map((r) => <path key={r} d={`M -${130 + r * 54} -${860 - r * 18} A ${130 + r * 54} ${130 + r * 54} 0 0 0 -${130 + r * 54} -${690 + r * 18}`} fill="none" stroke="#ffd38a" strokeWidth={7} strokeLinecap="round" opacity={0.95 - r * 0.2} />)}</g>
  <text x={800} y={1520} textAnchor="middle" fill={CREAM} style={{ font: `800 36px ${FONT.ui}`, paintOrder: 'stroke', stroke: '#070a22', strokeWidth: 8 }}>Mobile tower</text>
  <g transform="translate(250 1180)"><rect x={-140} y={0} width={280} height={96} rx={12} fill="#2d2540" stroke="#ffb454" strokeWidth={5} /><rect x={-110} y={34} width={14} height={14} rx={7} fill="#7dffb0" /><rect x={-80} y={34} width={14} height={14} rx={7} fill="#7dffb0" /><rect x={-50} y={34} width={14} height={14} rx={7} fill="#ffd38a" />
    <line x1={-100} y1={0} x2={-122} y2={-90} stroke="#222" strokeWidth={9} strokeLinecap="round" /><line x1={100} y1={0} x2={122} y2={-90} stroke="#222" strokeWidth={9} strokeLinecap="round" />{[0, 1, 2].map((a) => <path key={a} d={`M -${50 + a * 34} -${40 + a * 30} A ${70 + a * 34} ${70 + a * 34} 0 0 1 ${50 + a * 34} -${40 + a * 30}`} fill="none" stroke="#7fd4ff" strokeWidth={8} strokeLinecap="round" opacity={1 - a * 0.25} />)}
    <text y={196} textAnchor="middle" fill={CREAM} style={{ font: `800 36px ${FONT.ui}`, paintOrder: 'stroke', stroke: '#070a22', strokeWidth: 8 }}>Wi-Fi router</text></g>
  {stream(540, 1760, 270, 1110, 14, -90)}{stream(560, 1760, 780, 560, 30, 120)}{stream(520, 1760, 330, 1110, 9, 60)}{stream(580, 1760, 840, 600, 12, -60)}
</svg>);
export const PktB0 = () => <Scene beat={0} />; export const PktB1 = () => <Scene beat={1} />; export const PktB2 = () => <Scene beat={2} />; export const PktB3 = () => <Scene beat={3} />; export const PktB4 = () => <Scene beat={4} />; export const PktB5 = () => <Scene beat={5} />;
