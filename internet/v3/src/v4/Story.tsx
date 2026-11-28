import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { FPS, prog, lerp, easeOut, easeInOut, hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { IPhone } from '../dusk/Phone';
import { Compose } from '../dusk/Phone';
import { Planet, ov, project, ll, R, MAIN } from './Planet';
import { routeAt, LL } from '../tail/Globe';

/* Part 2 hook story (9:16 only), warm colours: Arjun in Hyderabad taps send; the photo flies over the globe (a few milliseconds); Meera's phone lies charging
   on a table in London, window beside it shows London; the phone lights up with a notification and we zoom in. Everything drawn in code. */
const WARM = { amber: '#ffb454', coral: '#ff7a59', plum: '#3a1f3d', teal: '#2bb5a3', cream: '#fff1dc' };

/* ---- the photo he sends: the Charminar at dusk (Hyderabad) ---- */
export const Charminar: React.FC = () => (<g>
  <defs><linearGradient id="chSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b2a6a" /><stop offset="0.6" stopColor="#d96b5a" /><stop offset="1" stopColor="#ffb454" /></linearGradient></defs>
  <rect width={190} height={190} fill="url(#chSky)" /><circle cx={30} cy={34} r={11} fill="#fff1d0" />
  {[100, 140, 168, 20, 60].map((x, i) => <circle key={i} cx={x} cy={8 + (i * 9) % 30} r={1.2} fill="#fff" opacity={0.8} />)}
  <g fill="#3a1830">
    <rect x={52} y={92} width={86} height={80} /><rect x={48} y={86} width={94} height={8} />
    {[56, 134].map((x) => <g key={x}><rect x={x - 6} y={34} width={12} height={58} /><rect x={x - 9} y={50} width={18} height={4} /><rect x={x - 9} y={68} width={18} height={4} /><ellipse cx={x} cy={32} rx={8} ry={9} /><rect x={x - 1.2} y={14} width={2.4} height={12} /></g>)}
    {[78, 112].map((x) => <g key={x}><rect x={x - 6} y={50} width={12} height={42} /><ellipse cx={x} cy={48} rx={7} ry={8} /><rect x={x - 1.2} y={32} width={2.4} height={12} /></g>)}
    <ellipse cx={95} cy={90} rx={14} ry={10} />
  </g>
  <g fill="#ffcf7a">{[0, 1, 2].map((i) => <path key={i} d={`M ${70 + i * 24} 172 L ${70 + i * 24} 126 A 12 12 0 0 1 ${82 + i * 24} 126 L ${82 + i * 24} 172 Z`} />)}</g>
  <rect y={172} width={190} height={18} fill="#1a0c1c" />
</g>);

const Bokeh: React.FC<{ n: number; seed: number; cols: string[]; y0: number; y1: number }> = ({ n, seed, cols, y0, y1 }) => (<>
  {Array.from({ length: n }).map((_, i) => <div key={i} style={{ position: 'absolute', left: hash(i + seed) * 1080 - 60, top: lerp(y0, y1, hash(i + seed + 9)), width: 60 + hash(i + seed + 3) * 120, height: 60 + hash(i + seed + 3) * 120, borderRadius: '50%', background: cols[i % cols.length], opacity: 0.16 + hash(i + seed + 5) * 0.2, filter: 'blur(10px)' }} />)}
</>);
const Chip: React.FC<{ text: string; col: string; top: number; o?: number; size?: number }> = ({ text, col, top, o = 1, size = 38 }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center', opacity: o }}><div style={{ padding: '12px 30px', borderRadius: 30, background: 'rgba(32,16,34,.88)', border: `3px solid ${col}`, font: `800 ${size}px/1 ${FONT.ui}`, color: '#fff', whiteSpace: 'nowrap' }}>{text}</div></div>);

/* ================= 1. Hyderabad: his finger taps send ================= */
export const HYD_SEND_FRAMES = 120;
export const HydSend: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const reach = prog(f, 0.2, 1.3, easeInOut), tap = prog(f, 1.35, 1.5) * (1 - prog(f, 1.5, 1.7)), sent = prog(f, 1.6, 2.0, easeOut), fly = prog(f, 2.0, 3.0, easeInOut);
  const K = 2.5, LEFT = 245, TOP = 380, tipX = lerp(1010, 770, reach), tipY = lerp(1960, 1505 + tap * 10, reach);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #2a1230 0%, #6b2c43 38%, #c4603f 70%, #e8934a 100%)` }}>
      <Bokeh n={16} seed={5} cols={['#ffb454', '#ff7a59', '#ffd89a', '#c75a8a']} y0={80} y1={1500} />
      <Chip text="HYDERABAD · 9:12 pm" col={WARM.amber} top={236} />
      <IPhone v18 left={LEFT} top={TOP} o={1} name="Meera" avatar="#e0705a" k={K}>
        <div style={{ position: 'absolute', left: 8, top: 6, background: '#26252a', color: '#fff', borderRadius: '14px 14px 14px 4px', padding: '5px 10px', font: `700 15px ${FONT.ui}` }}>Miss you! 🙂</div>
        <div style={{ position: 'absolute', left: 36, top: 52, width: 176, height: 176, borderRadius: 14, overflow: 'hidden', border: `2px solid #0a84ff`, opacity: 1 - sent * 0.0 }}>
          <svg width={176} height={176} viewBox="0 0 190 190"><Charminar /></svg>
          <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: (1 - sent) * 0.0 }} /></div>
        <div style={{ position: 'absolute', right: 10, top: 232, font: `700 11px ${FONT.ui}`, color: '#8e8e93' }}>{sent > 0.5 ? 'Delivered' : 'Sending…'}</div>
        <Compose bottom={8} text={sent > 0.5 ? '' : <span style={{ color: '#8e8e93' }}>Message</span>} press={tap > 0.2} ready />
      </IPhone>
      {/* ripple where the finger lands */}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {[0, 1, 2].map((i) => { const p = prog(f, 1.4 + i * 0.12, 1.9 + i * 0.12); return p > 0 && p < 1 ? <circle key={i} cx={770} cy={1505} r={20 + p * 90} fill="none" stroke="#fff" strokeWidth={5 * (1 - p)} opacity={0.8 * (1 - p)} /> : null; })}
        {/* his hand: a finger coming up from the bottom right, warm brown skin */}
        <defs><linearGradient id="skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#a8683f" /><stop offset="0.5" stopColor="#c98a5e" /><stop offset="1" stopColor="#8c5430" /></linearGradient></defs>
        <g transform={`translate(${tipX} ${tipY}) rotate(-22)`}>
          <rect x={-48} y={0} width={96} height={760} rx={48} fill="url(#skin)" />
          <rect x={-30} y={8} width={60} height={52} rx={26} fill="#e9c3a8" opacity={0.85} />
          <ellipse cx={-6} cy={120} rx={14} ry={50} fill="#fff" opacity={0.08} />
          <path d="M -48 280 Q 0 300 48 280" stroke="#7a4626" strokeWidth={3} fill="none" opacity={0.5} /><path d="M -48 420 Q 0 440 48 420" stroke="#7a4626" strokeWidth={3} fill="none" opacity={0.4} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---- the lock screen shown on Meera's phone (children of IPhone, drawn over its header) ---- */
const Lock: React.FC<{ banner: number; lit: number }> = ({ banner, lit }) => (<>
  <div style={{ position: 'absolute', left: -9, right: -9, top: -62, bottom: -9, background: 'linear-gradient(170deg,#3a1f4d,#a84a4a 55%,#f09a4a)', opacity: lit }} />
  <div style={{ position: 'absolute', left: -9, right: -9, top: -62, bottom: -9, background: '#050507', opacity: 1 - lit }} />
  <div style={{ opacity: lit }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: -30, textAlign: 'center', font: `600 11px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>Saturday, 28 November</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: -16, textAlign: 'center', font: `700 56px/1.1 ${FONT.ui}`, color: '#fff' }}>3:42</div>
    <div style={{ position: 'absolute', left: 6, right: 6, top: 120 + (1 - banner) * -60, height: 66, borderRadius: 16, background: 'rgba(255,255,255,.28)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.35)', opacity: banner, transform: `scale(${0.92 + 0.08 * banner})`, boxShadow: '0 8px 24px rgba(0,0,0,.35)' }}>
      <div style={{ position: 'absolute', left: 9, top: 9, width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(#5fe05f,#25b745)', display: 'grid', placeItems: 'center' }}><svg width={17} height={15} viewBox="0 0 17 15"><path d="M8.5 1C4.4 1 1 3.6 1 6.8c0 1.8 1 3.4 2.7 4.4L3 14l3.1-1.6c.8.2 1.5.3 2.4.3 4.1 0 7.5-2.6 7.5-5.9S12.6 1 8.5 1z" fill="#fff" /></svg></div>
      <div style={{ position: 'absolute', left: 44, top: 8, font: `700 11px ${FONT.ui}`, color: '#fff' }}>Arjun</div>
      <div style={{ position: 'absolute', right: 56, top: 8, font: `500 9px ${FONT.ui}`, color: 'rgba(255,255,255,.8)' }}>now</div>
      <div style={{ position: 'absolute', left: 44, top: 26, font: `500 11px ${FONT.ui}`, color: '#fff' }}>📷 Photo</div>
      <div style={{ position: 'absolute', left: 44, top: 43, font: `500 9px ${FONT.ui}`, color: 'rgba(255,255,255,.8)' }}>Charminar tonight!</div>
      <div style={{ position: 'absolute', right: 8, top: 8, width: 44, height: 50, borderRadius: 8, overflow: 'hidden' }}><svg width={44} height={50} viewBox="0 0 190 190" preserveAspectRatio="xMidYMid slice"><Charminar /></svg></div>
    </div>
  </div>
</>);

/* ================= 2. London: her flat, the phone lies charging on the table, the window shows London ================= */
export const LONDON_ROOM_FRAMES = 150;
const Window: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs>
    <linearGradient id="lnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a3170" /><stop offset="0.55" stopColor="#d9694f" /><stop offset="1" stopColor="#ffb870" /></linearGradient>
    <clipPath id="lnWin"><rect x={540} y={130} width={500} height={860} rx={6} /></clipPath>
  </defs>
  <g clipPath="url(#lnWin)">
    <rect x={540} y={130} width={500} height={860} fill="url(#lnSky)" /><circle cx={620} cy={330} r={34} fill="#ffe7b0" opacity={0.8} />
    {Array.from({ length: 5 }).map((_, i) => <ellipse key={i} cx={640 + i * 110} cy={300 + (i % 3) * 70} rx={90} ry={16} fill="#f5a07a" opacity={0.28} />)}
    {/* Houses of Parliament and Big Ben */}
    <g fill="#33203a"><rect x={560} y={640} width={250} height={150} /><rect x={560} y={610} width={60} height={30} />{[600, 660, 720, 780].map((x) => <rect key={x} x={x} y={600} width={8} height={40} />)}
      <rect x={810} y={400} width={68} height={390} /><rect x={802} y={392} width={84} height={14} /><polygon points="810,392 844,300 878,392" /><rect x={842} y={268} width={4} height={34} />
      <circle cx={844} cy={452} r={26} fill="#ffe7a8" /><circle cx={844} cy={452} r={22} fill="#fff6dc" /><path d="M 844 452 L 844 436 M 844 452 L 856 456" stroke="#33203a" strokeWidth={3} /></g>
    {/* London Eye */}
    <g transform="translate(960 640)"><circle r={150} fill="none" stroke="#2a1830" strokeWidth={5} /><circle r={116} fill="none" stroke="#2a1830" strokeWidth={2} />
      {Array.from({ length: 18 }).map((_, i) => { const a = (i / 18) * 6.283 + t * 0.05; return <g key={i}><line x1={0} y1={0} x2={150 * Math.cos(a)} y2={150 * Math.sin(a)} stroke="#2a1830" strokeWidth={1.6} /><circle cx={150 * Math.cos(a)} cy={150 * Math.sin(a)} r={7} fill="#ffd89a" /></g>; })}
      <polygon points="-14,0 14,0 40,180 -40,180" fill="#2a1830" /></g>
    {/* river and road with a red double-decker bus */}
    <rect x={540} y={790} width={500} height={70} fill="#7a3a50" /><rect x={540} y={800} width={500} height={6} fill="#ffb870" opacity={0.6} />
    <rect x={540} y={860} width={500} height={130} fill="#2a1a2a" />
    <g transform={`translate(${lerp(1080, 520, ((t * 0.08) % 1))} 842)`}><rect width={190} height={80} rx={8} fill="#d6252d" /><rect y={38} width={190} height={5} fill="#a01a20" />{[14, 50, 86, 122, 158].map((x) => <g key={x}><rect x={x} y={10} width={26} height={22} rx={3} fill="#ffe7a8" /><rect x={x} y={48} width={26} height={22} rx={3} fill="#ffe7a8" /></g>)}<circle cx={36} cy={80} r={13} fill="#111" /><circle cx={150} cy={80} r={13} fill="#111" /></g>
    {/* rain on the glass */}
    {Array.from({ length: 40 }).map((_, i) => { const x = 540 + hash(i + 70) * 500, y = 130 + ((hash(i + 80) * 860 + t * (40 + hash(i) * 60)) % 860); return <line key={i} x1={x} y1={y} x2={x - 3} y2={y + 22} stroke="#fff" strokeWidth={1.6} opacity={0.35} />; })}
  </g>
  {/* frame and mullions */}
  <rect x={540} y={130} width={500} height={860} rx={6} fill="none" stroke="#f3e6d0" strokeWidth={22} /><rect x={786} y={130} width={14} height={860} fill="#f3e6d0" /><rect x={540} y={512} width={500} height={14} fill="#f3e6d0" /><rect x={520} y={990} width={540} height={26} fill="#e6d6bc" />
  <rect x={1010} y={110} width={80} height={900} fill="#d9a13a" opacity={0.95} /><rect x={1036} y={110} width={6} height={900} fill="#a87420" opacity={0.7} />
</g>);

const PY = 0.66, TB = 905, S = (py: number) => TB + py * PY;       // the tabletop seen from above and behind her: back edge at y 905, front edge at y 1500
/* a hand on the table (plane x, y; fingertips about 118 above y). The arm goes down to the bottom of the picture, to her. type = fingers tapping */
const Hand: React.FC<{ x: number; y: number; rot: number; skin?: string; type?: number; t?: number; lean?: number }> = ({ x, y, rot, skin = '#c98a5e', type = 0, t = 0, lean = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-40} y={70} width={80} height={1100} rx={34} fill="#ff7a59" /><rect x={-40} y={70} width={80} height={18} fill="#ffd38a" opacity={0.9} /><path d="M -32 170 H 32 M -32 330 H 32" stroke="#c9543a" strokeWidth={4} opacity={0.5} />
    <rect x={-36} y={-62} width={72} height={170} rx={30} fill={skin} /><rect x={-42} y={-62} width={84} height={26} rx={13} fill="#e9c3a8" opacity={0.25} />
    {[-26, -9, 9, 26].map((fx, i) => { const dy = type * Math.max(0, Math.sin(t * 16 + i * 1.7 + lean * 2)) * 11; return <g key={i}><rect x={fx - 8} y={-118 + (i % 2) * 6 + dy} width={16} height={64} rx={8} fill={skin} /><rect x={fx - 5} y={-118 + (i % 2) * 6 + dy} width={10} height={14} rx={5} fill="#f2d3c3" opacity={0.7} /></g>; })}
    <rect x={lean > 0 ? -72 : 40} y={-20} width={34} height={22} rx={11} fill={skin} transform={`rotate(${lean > 0 ? -30 : 30} ${lean > 0 ? -55 : 57} -10)`} />
    <rect x={-38} y={96} width={76} height={14} rx={6} fill="#ffd38a" />
  </g>);

export const LondonRoom: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const ring = 1.4, lit = prog(f, ring, ring + 0.1), banner = prog(f, ring + 0.2, ring + 0.6, easeOut), buzz = f >= ring * FPS && f < (ring + 1.0) * FPS ? Math.sin(f * 2.9) * 5 * (1 - prog(f, ring, ring + 1.0)) : 0;
  const reach = prog(f, 2.4, 3.3, easeInOut), typing = (1 - prog(f, ring, ring + 0.25)), tt = t;
  // the phone lies on the table: small, silver (a 6.3 inch phone is about half as long as a 14 inch laptop is wide)
  const PK = 0.52, PW2 = 236 * PK, PH2 = 484 * PK, cx = 650, cy = 1345, th = 14 * Math.PI / 180, pcy = (cy - TB) / PY;
  const LX = 325, LB = 1170;   // laptop: centre x and the line where its base meets the table; 560 wide
  const yk = (LB + 44 - TB) / PY + 118, rx = lerp(LX + 92, cx + 4, reach), ry = lerp(yk, pcy + 112, reach);   // right hand: from the keyboard to the phone
  return (
    <AbsoluteFill style={{ background: '#3a2230' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 860, background: 'linear-gradient(180deg,#4a2c38 0%,#5a3436 70%,#43282c 100%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <linearGradient id="wood2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9794a" /><stop offset="1" stopColor="#9a5e34" /></linearGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a2e24" /><stop offset="1" stopColor="#2e1a16" /></linearGradient>
          <radialGradient id="lampPool"><stop offset="0" stopColor="#ffd89a" stopOpacity={0.65} /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient>
          <radialGradient id="scrGlow"><stop offset="0" stopColor="#bfe3ff" stopOpacity={0.5} /><stop offset="1" stopColor="#bfe3ff" stopOpacity={0} /></radialGradient>
          <filter id="blur6"><feGaussianBlur stdDeviation="7" /></filter></defs>
        <g transform="translate(300 40) scale(0.66)"><Window t={t} /></g>
        <rect x={286} y={700} width={400} height={20} fill="#e6d6bc" />
        {/* wall, baseboard, floor and a warm rug */}
        <rect x={0} y={840} width={1080} height={26} fill="#e8d9c0" />
        <rect x={0} y={866} width={1080} height={1054} fill="url(#floor)" />{Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M 0 ${880 + i * 105} L 1080 ${880 + i * 105}`} stroke="#1e100c" strokeWidth={2} opacity={0.5} />)}
        <polygon points="-40,1700 1120,1700 1160,1920 -80,1920" fill="#a8452f" /><polygon points="-20,1730 1100,1730 1130,1920 -50,1920" fill="none" stroke="#f1d9a8" strokeWidth={6} opacity={0.85} />{Array.from({ length: 9 }).map((_, i) => <polygon key={i} points={`${60 + i * 120},1780 ${84 + i * 120},1806 ${60 + i * 120},1832 ${36 + i * 120},1806`} fill="#e8b04a" opacity={0.85} />)}
        {/* the table: a long desk with a drawer, shadow on the rug, the top, its front edge */}
        <ellipse cx={540} cy={1700} rx={640} ry={46} fill="#000" opacity={0.45} filter="url(#blur6)" />
        <polygon points="-40,905 1120,905 1260,1500 -180,1500" fill="url(#wood2)" />{Array.from({ length: 9 }).map((_, i) => { const y = 935 + i * 66; return <path key={i} d={`M -40 ${y} Q 540 ${y + 6} 1120 ${y}`} stroke="#6a3c1c" strokeWidth={2} fill="none" opacity={0.3} />; })}
        <rect x={-180} y={1500} width={1440} height={50} fill="#7a4624" /><rect x={-180} y={1500} width={1440} height={5} fill="#e0a56e" />
        <rect x={-180} y={1550} width={1440} height={150} fill="#5a3218" /><rect x={300} y={1572} width={480} height={104} rx={8} fill="#6a3c1c" stroke="#8a5530" strokeWidth={4} /><rect x={500} y={1612} width={80} height={14} rx={7} fill="#e0b07a" />
        <ellipse cx={700} cy={1130} rx={320} ry={110} fill="url(#lampPool)" />
        <ellipse cx={LX} cy={LB + 130} rx={320} ry={120} fill="url(#scrGlow)" opacity={0.7} />
      </svg>
      {/* everything lying flat sits in the table plane */}
      <div style={{ position: 'absolute', left: 0, top: TB, width: 1080, height: 1300, transformOrigin: '0 0', transform: `scale(1, ${PY})` }}>
        <svg width={1080} height={1300} style={{ position: 'absolute', left: 0, top: 0 }}>
          {/* notebook, pen lying beside it, glasses */}
          <g transform="translate(880 700) rotate(6)"><rect x={-150} y={-105} width={300} height={226} rx={10} fill="#00000040" transform="translate(10 14)" /><rect x={-150} y={-105} width={300} height={226} rx={10} fill="#f6efe0" /><rect x={-150} y={-105} width={20} height={226} fill="#c0504a" />{Array.from({ length: 7 }).map((_, i) => <line key={i} x1={-112} y1={-78 + i * 28} x2={130} y2={-78 + i * 28} stroke="#9fb4d0" strokeWidth={2} />)}<path d="M -96 -76 q 24 -12 48 0 t 48 0 t 48 0" stroke="#2a3a7a" strokeWidth={4} fill="none" opacity={0.7} /></g>
          <g transform="translate(770 840) rotate(-20)"><rect x={-90} y={-7} width={180} height={14} rx={7} fill="#00000040" transform="translate(5 8)" /><rect x={-90} y={-7} width={180} height={14} rx={7} fill="#2a3a7a" /><rect x={-90} y={-7} width={46} height={14} rx={7} fill="#c9a15a" /><polygon points="90,-5 108,0 90,5" fill="#e8c9a0" /></g>
          <g transform="translate(560 900) rotate(-8)"><circle cx={-44} cy={0} r={26} fill="none" stroke="#2a1a14" strokeWidth={6} /><circle cx={44} cy={0} r={26} fill="none" stroke="#2a1a14" strokeWidth={6} /><path d="M -18 -4 q 18 -12 36 0" stroke="#2a1a14" strokeWidth={5} fill="none" /></g>
          {/* coaster under the mug */}
          <ellipse cx={982} cy={190} rx={52} ry={52} fill="#e8d9c0" opacity={0.9} />
        </svg>
        {/* her phone, small, silver, lying on the table, buzzing */}
        <div style={{ position: 'absolute', left: cx - PW2 / 2 + buzz, top: pcy - PH2 / 2, width: PW2, height: PH2, transform: `rotate(${th * 180 / Math.PI}deg)`, transformOrigin: '50% 50%', filter: 'drop-shadow(8px 12px 9px rgba(0,0,0,.5))' }}>
          <IPhone v18="silver" left={0} top={0} o={1} name="" avatar="#000" k={PK}><Lock banner={banner} lit={lit} /></IPhone>
        </div>
        <svg width={1080} height={1300} style={{ position: 'absolute', left: 0, top: 0 }}>
        </svg>
      </div>
      {/* things that stand up: shadow first, then the object */}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
        {/* the laptop: open, facing her, so we see its screen and keyboard */}
        <ellipse cx={LX} cy={LB + 90} rx={330} ry={34} fill="#000" opacity={0.45} filter="url(#blur6)" />
        <polygon points={`${LX - 270},${LB - 340} ${LX + 270},${LB - 340} ${LX + 290},${LB} ${LX - 290},${LB}`} fill="#1b1d26" stroke="#8a8d96" strokeWidth={6} />
        <polygon points={`${LX - 252},${LB - 322} ${LX + 252},${LB - 322} ${LX + 272},${LB - 16} ${LX - 272},${LB - 16}`} fill="#fdf3e4" />
        <rect x={LX - 252} y={LB - 322} width={504} height={26} fill="#e8d9c0" /><circle cx={LX - 232} cy={LB - 309} r={5} fill="#ff6b5e" /><circle cx={LX - 214} cy={LB - 309} r={5} fill="#ffbd44" /><circle cx={LX - 196} cy={LB - 309} r={5} fill="#3ec65a" />
        <rect x={LX - 230} y={LB - 280} width={150} height={18} fill="#d9694f" />{[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={LX - 230} y={LB - 240 + i * 26} width={i % 3 === 2 ? 250 : 440} height={9} rx={4} fill="#c9b8a0" />)}
        <rect x={LX + 40} y={LB - 280} width={160} height={96} rx={8} fill="#ffb454" opacity={0.9} /><polyline points={`${LX + 52},${LB - 206} ${LX + 90},${LB - 236} ${LX + 124},${LB - 216} ${LX + 188},${LB - 262}`} stroke="#fff" strokeWidth={5} fill="none" strokeLinejoin="round" />
        <polygon points={`${LX - 290},${LB} ${LX + 290},${LB} ${LX + 326},${LB + 86} ${LX - 326},${LB + 86}`} fill="#c9ccd2" stroke="#8a8d96" strokeWidth={3} />
        {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 15 }).map((_, c) => <rect key={r + '-' + c} x={LX - 300 + c * 40 - r * 3} y={LB + 8 + r * 16} width={33} height={11} rx={3} fill="#8a8d96" />))}
        <rect x={LX - 56} y={LB + 70} width={112} height={13} rx={4} fill="#aeb1ba" />
        <rect x={LX - 296} y={LB - 330} width={48} height={48} fill="#ffe27a" transform={`rotate(-6 ${LX - 272} ${LB - 306})`} /><path d={`M ${LX - 286} ${LB - 316} h 28 M ${LX - 286} ${LB - 304} h 22`} stroke="#c98a2a" strokeWidth={3} />
        {/* a small plant, back left */}
        <ellipse cx={815} cy={1090} rx={60} ry={13} fill="#000" opacity={0.45} filter="url(#blur6)" />
        <path d="M 777 1030 L 853 1030 L 843 1090 L 787 1090 Z" fill="#c0634a" /><rect x={773} y={1022} width={84} height={14} rx={5} fill="#d6785a" />
        {[-40, -18, 6, 28, 44].map((a, i) => <path key={i} d={`M 815 1024 Q ${815 + a * 1.4} ${960 - (i % 2) * 20} ${815 + a * 2} ${930 + (i % 3) * 14}`} stroke="#3f8a4a" strokeWidth={9} fill="none" strokeLinecap="round" />)}
        {[-40, -18, 6, 28, 44].map((a, i) => <ellipse key={i} cx={815 + a * 2} cy={930 + (i % 3) * 14} rx={20} ry={11} fill="#4fa05a" transform={`rotate(${a * 1.4} ${815 + a * 2} ${930 + (i % 3) * 14})`} />)}
        {/* lamp on the table */}
        <ellipse cx={700} cy={1070} rx={70} ry={15} fill="#000" opacity={0.5} filter="url(#blur6)" />
        <ellipse cx={700} cy={1060} rx={44} ry={10} fill="#3a2a22" /><rect x={694} y={800} width={12} height={260} fill="#4a3a30" />
        <path d="M 640 800 L 760 800 L 790 712 L 610 712 Z" fill="#ff9e5e" /><ellipse cx={700} cy={800} rx={60} ry={9} fill="#ffe7b0" />
        {/* mug that says LONDON on its coaster */}
        <ellipse cx={970} cy={1112} rx={64} ry={13} fill="#000" opacity={0.45} filter="url(#blur6)" />
        <rect x={929} y={1010} width={82} height={100} rx={12} fill="#c0392b" /><ellipse cx={970} cy={1010} rx={41} ry={10} fill="#7a1e16" /><ellipse cx={970} cy={1009} rx={34} ry={6} fill="#5a3320" />
        <path d="M 1011 1030 q 30 6 -4 52" stroke="#c0392b" strokeWidth={10} fill="none" />
        <text x={970} y={1062} textAnchor="middle" fill="#fff" style={{ font: `800 14px ${FONT.ui}`, letterSpacing: '0.08em' }}>LONDON</text><text x={970} y={1082} textAnchor="middle" fill="#ffd38a" style={{ font: `800 14px ${FONT.ui}` }}>♥</text>
        {[0, 1, 2].map((i) => <path key={i} d={`M ${955 + i * 16} 990 q 12 -26 0 -52 q -12 -26 0 -44`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.22 - i * 0.04} strokeLinecap="round" transform={`translate(0 ${-((t * 18 + i * 8) % 26)})`} />)}
        {/* ding and vibration marks next to the phone */}
        {f >= ring * FPS && f < (ring + 1.6) * FPS ? <g opacity={1 - prog(f, ring + 1.0, ring + 1.6)}>
          {[0, 1, 2].map((i) => { const p = ((t - ring) * 2 + i * 0.33) % 1; return <path key={i} d={`M ${cx + 110 + p * 36} ${cy - 30 - p * 8} q 18 34 0 68`} stroke="#ffd38a" strokeWidth={6} fill="none" strokeLinecap="round" opacity={1 - p} />; })}
          {[0, 1, 2].map((i) => { const p = ((t - ring) * 2 + i * 0.33) % 1; return <path key={'l' + i} d={`M ${cx - 110 - p * 36} ${cy - 30 - p * 8} q -18 34 0 68`} stroke="#ffd38a" strokeWidth={6} fill="none" strokeLinecap="round" opacity={1 - p} />; })}
          <text x={cx} y={cy - 150} textAnchor="middle" fill="#fff" style={{ font: `800 40px ${FONT.ui}`, paintOrder: 'stroke', stroke: '#2a1a20', strokeWidth: 8 }}>ding!  bzzzt</text></g> : null}
      </svg>
      {/* her hands, in front of the laptop: on the keyboard, typing; the right one goes to the phone when it rings */}
      <div style={{ position: 'absolute', left: 0, top: TB, width: 1080, height: 1300, transformOrigin: '0 0', transform: `scale(1, ${PY})` }}>
        <svg width={1080} height={1300} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Hand x={LX - 92} y={yk} rot={-2} type={typing} t={tt} lean={1} />
          <Hand x={rx} y={ry} rot={lerp(2, 22, reach)} type={typing} t={tt + 0.3} lean={-1} />
        </svg>
      </div>
      <Chip text="LONDON · 3:42 pm" col="#ffb454" top={236} />
    </AbsoluteFill>
  );
};

/* ================= 3. the notification, zoomed ================= */
export const NOTIF_FRAMES = 90;
export const Notif: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const banner = prog(f, 0.2, 0.6, easeOut), zoom = lerp(0.92, 1, easeOut(Math.min(1, t / 1.2)));
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#2a1a20 0%,#7a3f3a 50%,#2a1a20 100%)' }}>
      <Bokeh n={12} seed={31} cols={['#ffb454', '#ff7a59', '#ffd89a', '#2bb5a3']} y0={100} y1={1600} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${zoom})`, transformOrigin: '540px 900px' }}>
        <IPhone v18 left={186} top={250} o={1} name="" avatar="#000" k={3.0}><Lock banner={banner} lit={1} /></IPhone>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          {[0, 1, 2].map((i) => { const p = prog(f, 0.3 + i * 0.12, 0.9 + i * 0.12); return p > 0 && p < 1 ? <rect key={i} x={186 - 20 * p} y={250 - 20 * p} width={708 + 40 * p} height={1452 + 40 * p} rx={130} fill="none" stroke="#ffd89a" strokeWidth={5 * (1 - p)} opacity={0.5 * (1 - p)} /> : null; })}
        </svg>
      </div>
      <Chip text="Meera gets it: about 65 ms across the ocean" col="#ffb454" top={236} size={34} />
    </AbsoluteFill>
  );
};

/* ================= 4. the photo flies over the globe, with the milliseconds ================= */
export const FLY_GLOBE_FRAMES = 150;
const T0F = 300 / FPS;
export const FlyGlobe: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  ov.lon = () => 40; ov.show = () => 1; ov.pins = T0F + 0.1;
  const u = easeInOut(Math.min(1, Math.max(0, (t - 0.6) / 3.6))), pt = T0F + t, [lon, lat] = routeAt(MAIN, u) as unknown as [number, number];
  const [x, y, front] = project(pt, ll([lon, lat] as LL, R * 1.012));
  const ms = Math.round(65 * u);
  return (
    <AbsoluteFill style={{ backgroundColor: '#14091c' }}>
      <Sequence from={-300}><Planet /></Sequence>
      <AbsoluteFill><svg width={1080} height={1920}>
        <defs><radialGradient id="fg"><stop offset="0" stopColor="#ffe3a0" stopOpacity={0.9} /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient></defs>
        {front && <g transform={`translate(${x} ${y})`}><circle r={96} fill="url(#fg)" /><rect x={-44} y={-44} width={88} height={88} rx={12} fill="#fff" stroke="#ffb454" strokeWidth={5} /><svg x={-38} y={-38} width={76} height={76} viewBox="0 0 190 190"><Charminar /></svg></g>}
      </svg></AbsoluteFill>
      <Chip text="Hyderabad → London" col="#ffb454" top={236} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center' }}>
        <div style={{ font: `800 96px/1 ${FONT.mono}`, color: '#ffe3a0', textShadow: '0 4px 20px rgba(0,0,0,.8)' }}>{ms}<span style={{ fontSize: 44, color: '#fff' }}> ms</span></div></div>
    </AbsoluteFill>
  );
};
