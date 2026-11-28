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
  <rect x={1010} y={110} width={80} height={900} fill="#2bb5a3" opacity={0.85} /><rect x={1036} y={110} width={6} height={900} fill="#1a8a7b" opacity={0.7} />
</g>);

export const LondonRoom: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const lit = prog(f, 1.4, 1.6), banner = prog(f, 1.7, 2.1, easeOut), pulse = 0.5 + 0.5 * Math.sin(t * 9);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#3a2230 0%,#5a3030 55%,#2a1a20 100%)' }}>
      {/* wall light and a lamp glow */}
      <div style={{ position: 'absolute', left: -140, top: 520, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,176,84,.55),rgba(255,176,84,0) 65%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Window t={t} />
        {/* wall socket and a plug */}
        <rect x={100} y={930} width={70} height={90} rx={10} fill="#f3ece0" /><circle cx={135} cy={965} r={6} fill="#cfc4b0" /><circle cx={135} cy={992} r={6} fill="#cfc4b0" />
        {/* lamp on the wall side */}
        <path d="M 230 640 L 330 640 L 360 760 L 200 760 Z" fill="#ffb454" /><rect x={276} y={760} width={8} height={150} fill="#4a3a30" /><ellipse cx={280} cy={916} rx={50} ry={10} fill="#4a3a30" />
        <ellipse cx={280} cy={700} rx={150} ry={150} fill="#ffb454" opacity={0.18} />
        {/* the table */}
        <defs><linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b57a45" /><stop offset="1" stopColor="#6b4125" /></linearGradient></defs>
        <polygon points="0,1060 1080,1060 1080,1920 0,1920" fill="url(#wood)" />{Array.from({ length: 14 }).map((_, i) => <path key={i} d={`M 0 ${1090 + i * 62} Q 540 ${1070 + i * 62 + (i % 3) * 8} 1080 ${1090 + i * 62}`} stroke="#4a2a14" strokeWidth={2} fill="none" opacity={0.3} />)}
        <rect x={0} y={1052} width={1080} height={16} fill="#d29a62" />
        {/* charging cable from the socket across the table to the phone */}
        <path d="M 135 1010 C 135 1150 160 1230 330 1360 S 470 1470 520 1500" stroke="#f1ede6" strokeWidth={9} fill="none" strokeLinecap="round" /><rect x={118} y={1004} width={34} height={46} rx={6} fill="#fff" />
        {/* mug with steam */}
        <rect x={780} y={1230} width={110} height={120} rx={14} fill="#f3ece0" /><path d="M 890 1262 q 44 6 -4 70" stroke="#f3ece0" strokeWidth={12} fill="none" /><ellipse cx={835} cy={1236} rx={50} ry={9} fill="#6a3d22" />
        {[0, 1, 2].map((i) => <path key={i} d={`M ${815 + i * 22} 1200 q 14 -30 0 -60 q -14 -30 0 -50`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.25 - i * 0.04} strokeLinecap="round" transform={`translate(0 ${-(t * 20 + i * 8) % 30})`} />)}
        {/* the glow the lit screen throws on the table */}
        <ellipse cx={560} cy={1560} rx={320} ry={120} fill="#ffd89a" opacity={lit * (0.18 + 0.12 * pulse)} />
      </svg>
      {/* her phone, lying on the table, plugged in */}
      <div style={{ position: 'absolute', left: 300, top: 1060, width: 236 * 1.8, height: 484 * 1.8, transform: 'perspective(1500px) rotateX(58deg) rotateZ(-14deg)', transformOrigin: '50% 50%' }}>
        <IPhone v18 left={0} top={0} o={1} name="" avatar="#000" k={1.8}><Lock banner={banner} lit={lit} /></IPhone>
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
