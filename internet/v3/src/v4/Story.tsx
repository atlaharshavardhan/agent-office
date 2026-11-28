import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { FPS, prog, lerp, easeOut, easeInOut, hash, clamp01 } from '../lib/anim';
import { FONT } from '../lib/palette';
import { IPhone } from '../dusk/Phone';
import { Compose } from '../dusk/Phone';
import { Planet, ov, project, ll, R, MAIN } from './Planet';
import { routeAt, LL, HYD as HYD_LL, LONDON as LONDON_LL } from '../tail/Globe';

/* Part 2 hook story (9:16 only), warm colours: Arjun in Hyderabad taps send; the photo flies over the globe (a few milliseconds); Meera's phone lies charging
   on a table in London, window beside it shows London; the phone lights up with a notification and we zoom in. Everything drawn in code. */
const WARM = { amber: '#ffb454', coral: '#ff7a59', plum: '#3a1f3d', teal: '#2bb5a3', cream: '#fff1dc' };

/* ---- the Charminar: four minarets with balconies and domes, a big central arch, small arched windows, a parapet. Drawn in a 200 x 240 box (x 0..200, y -20..220, base at y 220) ---- */
export const CharminarArt: React.FC<{ stone?: string; shade?: string; glow?: string }> = ({ stone = '#d9a05a', shade = '#8a5a34', glow = '#ffe7a8' }) => {
  const mino = (x: number, top: number, w: number) => {
    const h = 220 - top - 30;
    return (<g key={x}>
      <rect x={x - w / 2} y={top + 30} width={w} height={h} fill={stone} /><rect x={x - w / 2} y={top + 30} width={w * 0.36} height={h} fill={shade} opacity={0.5} />
      {[0.3, 0.55, 0.78].map((k, i) => { const by = top + 30 + h * k; return <g key={i}><rect x={x - w * 0.95} y={by} width={w * 1.9} height={5} rx={1.5} fill={stone} /><rect x={x - w * 0.95} y={by + 5} width={w * 1.9} height={3} fill={shade} opacity={0.6} />{[-0.7, -0.25, 0.2, 0.65].map((o, j) => <rect key={j} x={x + o * w - 0.8} y={by - 5} width={1.6} height={5} fill={shade} />)}</g>; })}
      <rect x={x - w * 0.72} y={top + 20} width={w * 1.44} height={10} rx={2} fill={stone} /><rect x={x - w * 0.72} y={top + 27} width={w * 1.44} height={3} fill={shade} opacity={0.6} />
      <path d={`M ${x - w * 0.62} ${top + 20} Q ${x - w * 1.0} ${top + 2} ${x} ${top - 8} Q ${x + w * 1.0} ${top + 2} ${x + w * 0.62} ${top + 20} Z`} fill={stone} /><path d={`M ${x} ${top - 8} Q ${x + w * 1.0} ${top + 2} ${x + w * 0.62} ${top + 20} L ${x} ${top + 20} Z`} fill={shade} opacity={0.35} />
      <rect x={x - 1.1} y={top - 22} width={2.2} height={16} fill={shade} /><circle cx={x} cy={top - 23} r={2.4} fill={glow} />
    </g>);
  };
  return (<g>
    {mino(56, 22, 11)}{mino(144, 22, 11)}
    <rect x={32} y={100} width={136} height={120} fill={stone} /><rect x={32} y={100} width={24} height={120} fill={shade} opacity={0.35} /><rect x={32} y={212} width={136} height={8} fill={shade} opacity={0.6} />
    <rect x={28} y={70} width={144} height={32} fill={stone} /><rect x={28} y={96} width={144} height={6} fill={shade} opacity={0.55} /><rect x={28} y={70} width={144} height={4} fill={shade} opacity={0.4} />
    {Array.from({ length: 7 }).map((_, i) => <path key={i} d={`M ${40 + i * 19} 98 L ${40 + i * 19} 84 Q ${40 + i * 19 + 5.5} 74 ${40 + i * 19 + 11} 84 L ${40 + i * 19 + 11} 98 Z`} fill={glow} />)}
    {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M ${28 + i * 9.1} 70 L ${31 + i * 9.1} 60 L ${34 + i * 9.1} 70 Z`} fill={stone} />)}
    <ellipse cx={100} cy={56} rx={22} ry={16} fill={stone} /><path d="M 100 40 Q 122 44 122 56 L 100 56 Z" fill={shade} opacity={0.35} /><rect x={99} y={20} width={2} height={20} fill={shade} /><circle cx={100} cy={19} r={2.6} fill={glow} />
    {[66, 134].map((x) => <g key={x}><rect x={x - 8} y={58} width={16} height={12} fill={stone} /><ellipse cx={x} cy={58} rx={10} ry={8} fill={stone} /><rect x={x - 0.8} y={44} width={1.6} height={12} fill={shade} /></g>)}
    <path d="M 70 220 L 70 156 Q 70 120 100 108 Q 130 120 130 156 L 130 220 Z" fill="#3a1a10" /><path d="M 78 220 L 78 158 Q 78 128 100 118 Q 122 128 122 158 L 122 220 Z" fill={glow} opacity={0.9} />
    {[[38, 60], [140, 162]].map(([x0, x1], i) => <g key={i}><path d={`M ${x0 + 2} 220 L ${x0 + 2} 168 Q ${x0 + 2} 146 ${(x0 + x1) / 2 - 1 + 0} 140 Q ${x1 - 2} 146 ${x1 - 2} 168 L ${x1 - 2} 220 Z`} fill="#3a1a10" opacity={0.85} /><path d={`M ${x0 + 6} 220 L ${x0 + 6} 170 Q ${x0 + 6} 152 ${(x0 + x1) / 2} 147 Q ${x1 - 6} 152 ${x1 - 6} 170 L ${x1 - 6} 220 Z`} fill={glow} opacity={0.7} /></g>)}
    {mino(14, 8, 15)}{mino(186, 8, 15)}
  </g>);
};
/* ---- the photo he sends: the Charminar at dusk (Hyderabad) ---- */
export const CharminarPhoto: React.FC = () => (<g>
  <defs><linearGradient id="chSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b2a6a" /><stop offset="0.6" stopColor="#d96b5a" /><stop offset="1" stopColor="#ffb454" /></linearGradient></defs>
  <rect width={190} height={190} fill="url(#chSky)" /><circle cx={30} cy={34} r={11} fill="#fff1d0" />
  {[100, 140, 168, 20, 60].map((x, i) => <circle key={i} cx={x} cy={8 + (i * 9) % 30} r={1.2} fill="#fff" opacity={0.8} />)}
  <g transform="translate(27 32) scale(0.68)"><CharminarArt stone="#c8785a" shade="#6a3030" glow="#ffd98a" /></g>
  <rect y={178} width={190} height={12} fill="#1a0c1c" />
</g>);

/* ---- a dog's portrait for a framed picture on the desk ---- */
export const DogPhoto: React.FC = () => (<g>
  <defs><linearGradient id="dgBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbe8c8" /><stop offset="1" stopColor="#f2b88a" /></linearGradient></defs>
  <rect width={190} height={190} fill="url(#dgBg)" />{[[28, 30], [160, 44], [150, 150], [34, 148]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5 + i} fill="#fff" opacity={0.35} />)}
  <ellipse cx={46} cy={96} rx={22} ry={40} fill="#9a5a2e" transform="rotate(14 46 96)" /><ellipse cx={144} cy={96} rx={22} ry={40} fill="#9a5a2e" transform="rotate(-14 144 96)" />
  <ellipse cx={95} cy={96} rx={52} ry={48} fill="#d9a05a" /><ellipse cx={95} cy={62} rx={20} ry={12} fill="#e8b878" opacity={0.7} />
  <ellipse cx={95} cy={122} rx={28} ry={22} fill="#f6e3c2" />
  <circle cx={75} cy={90} r={7.5} fill="#2a1a18" /><circle cx={115} cy={90} r={7.5} fill="#2a1a18" /><circle cx={77.5} cy={87.5} r={2.6} fill="#fff" /><circle cx={117.5} cy={87.5} r={2.6} fill="#fff" />
  <path d="M 64 78 Q 75 72 86 78 M 104 78 Q 115 72 126 78" stroke="#8a5a2e" strokeWidth={3} fill="none" strokeLinecap="round" />
  <ellipse cx={95} cy={112} rx={11} ry={8} fill="#2a1a18" /><ellipse cx={92} cy={110} rx={3.4} ry={2} fill="#fff" opacity={0.6} />
  <path d="M 95 120 V 128 M 95 128 Q 84 138 75 130 M 95 128 Q 106 138 115 130" stroke="#2a1a18" strokeWidth={2.6} fill="none" strokeLinecap="round" />
  <path d="M 87 134 Q 95 158 103 134 Z" fill="#ef7f8f" /><path d="M 95 136 V 148" stroke="#c9586a" strokeWidth={1.6} />
  <path d="M 52 160 Q 95 182 138 160 L 138 176 Q 95 198 52 176 Z" fill="#d6252d" /><circle cx={95} cy={184} r={9} fill="#e8c46a" stroke="#a87420" strokeWidth={2} />
</g>);

/* Harsh, 28 Nov 2026: the photo he sends, the framed picture on his desk and the notification thumbnail are the DOG, not the Charminar. */
export const Charminar: React.FC = DogPhoto;

/* the photo as a FLEXIBLE sheet of paper (Harsh, 28 Nov 2026: "like paper, not a card", "flexible"): a thin print with a white border that bends and ripples in waves along its length as it flies, curls at the corner, and tumbles a little.
   It is drawn as 16 thin vertical strips; each strip is moved up or down and tilted by a travelling sine wave, and shaded darker where the paper bends away from the light. size = width in px, t = seconds (drives the wave), spin = extra rotation in degrees. */
export const PaperPhoto: React.FC<{ size?: number; t: number; spin?: number; id?: string }> = ({ size = 100, t, spin = 0, id = 'pp' }) => {
  const N = 32, W = 108, H = 118, sw = W / N, k = size / 100, wob = Math.sin(t * 2.2) * 3 + spin, amp = 7, w1 = 1.35, sp = 5.5;   // magic-carpet glide: almost level, a calm wave runs through it
  const off = (x: number) => Math.sin((x / W) * w1 * 6.283 - t * sp) * amp * (0.45 + 0.55 * (1 - x / W));                  // the wave starts at the front and flows back, bigger at the tail
  return (<g transform={`rotate(${wob}) scale(${k})`}>
    <ellipse cx={4} cy={H / 2 + 20} rx={46} ry={6} fill="#000" opacity={0.22} />
    {Array.from({ length: N }).map((_, i) => {
      const x0 = -W / 2 + i * sw, d0 = off(i * sw), d1 = off((i + 1) * sw), slope = (d1 - d0) / sw, shade = Math.max(0, Math.min(0.5, 0.18 + slope * 0.55)), cid = `${id}${i}`;
      return (<g key={i} transform={`translate(0 ${(d0 + d1) / 2})`}>
        <clipPath id={cid}><rect x={x0} y={-H / 2 - 20} width={sw + 0.8} height={H + 40} /></clipPath>
        <g clipPath={`url(#${cid})`}>
          <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#fbf8f0" /><svg x={-W / 2 + 7} y={-H / 2 + 7} width={W - 14} height={W - 14} viewBox="0 0 190 190"><Charminar /></svg>
          <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#1a1020" opacity={shade} />
        </g></g>);
    })}
    {[-1, 1].map((sd) => Array.from({ length: 9 }).map((_, j) => { const y0 = -H / 2 + 8 + j * ((H - 16) / 8), xe = sd * (W / 2), dy = off(sd < 0 ? 0 : W); return <path key={sd + '-' + j} d={`M ${xe} ${y0 + dy} q ${sd * 5} ${3 + Math.sin(t * 7 + j) * 2} ${sd * 11} ${Math.sin(t * 6 + j * 1.3) * 3}`} stroke="#d9a13a" strokeWidth={2.2} fill="none" strokeLinecap="round" />; }))}
    <path d={`M ${W / 2 - 22} ${H / 2 + off(W)} L ${W / 2} ${H / 2 - 24 + off(W)} L ${W / 2} ${H / 2 + off(W)} Z`} fill="#e8e0cc" stroke="#cfc6b0" strokeWidth={0.8} opacity={0.9} />
  </g>);
};

/* ---- a small desk flag on a pole, waving a little (kind: the Indian tricolour or the Union Jack); the cloth always extends to the right ---- */
export const DeskFlag: React.FC<{ x: number; y: number; kind: 'in' | 'uk'; t: number; id: string }> = ({ x, y, kind, t, id }) => {
  const W = 94, H = 62, top = y - 150;
  const pts = Array.from({ length: 13 }).map((_, i) => { const k = i / 12; return [x + k * W, top + Math.sin(k * 5 - t * 4.5) * 3.4 * k] as [number, number]; });
  const d = 'M ' + [...pts, ...pts.map(([px, py]) => [px, py + H] as [number, number]).reverse()].map((p) => p.join(' ')).join(' L ') + ' Z';
  return (<g>
    <ellipse cx={x} cy={y + 6} rx={34} ry={8} fill="#000" opacity={0.45} filter="url(#blur3)" />
    <ellipse cx={x} cy={y} rx={22} ry={6} fill="#2a1e18" /><rect x={x - 22} y={y - 6} width={44} height={6} fill="#3a2a22" /><ellipse cx={x} cy={y - 6} rx={22} ry={6} fill="#4a3a30" />
    <rect x={x - 2} y={top - 8} width={4} height={y - top + 2} fill="#c9a15a" /><circle cx={x} cy={top - 10} r={4.5} fill="#e8c46a" />
    <defs><clipPath id={id}><path d={d} /></clipPath></defs>
    <g clipPath={`url(#${id})`}><g transform={`translate(${x} ${top})`}>
      {kind === 'in' ? <>
        <rect width={W} height={H / 3 + 1} fill="#ff9933" /><rect y={H / 3} width={W} height={H / 3 + 1} fill="#ffffff" /><rect y={(2 * H) / 3} width={W} height={H / 3 + 1} fill="#138808" />
        <circle cx={W / 2} cy={H / 2} r={8.5} fill="none" stroke="#1c2f8a" strokeWidth={1.6} />{Array.from({ length: 12 }).map((_, i) => <line key={i} x1={W / 2} y1={H / 2} x2={W / 2 + 8.5 * Math.cos((i * Math.PI) / 6)} y2={H / 2 + 8.5 * Math.sin((i * Math.PI) / 6)} stroke="#1c2f8a" strokeWidth={0.9} />)}<circle cx={W / 2} cy={H / 2} r={2} fill="#1c2f8a" />
      </> : <>
        <rect width={W} height={H} fill="#012169" /><path d={`M 0 0 L ${W} ${H} M ${W} 0 L 0 ${H}`} stroke="#fff" strokeWidth={11} /><path d={`M 0 0 L ${W} ${H} M ${W} 0 L 0 ${H}`} stroke="#c8102e" strokeWidth={4} />
        <rect x={0} y={H / 2 - 8} width={W} height={16} fill="#fff" /><rect x={W / 2 - 8} y={0} width={16} height={H} fill="#fff" /><rect x={0} y={H / 2 - 4.8} width={W} height={9.6} fill="#c8102e" /><rect x={W / 2 - 4.8} y={0} width={9.6} height={H} fill="#c8102e" />
      </>}
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={i * 16 + ((t * 20) % 16)} y={0} width={7} height={H} fill="#000" opacity={0.07} />)}
    </g></g>
    <path d={d} fill="none" stroke="#000" strokeWidth={1} opacity={0.25} />
  </g>);
};

const Bokeh: React.FC<{ n: number; seed: number; cols: string[]; y0: number; y1: number }> = ({ n, seed, cols, y0, y1 }) => (<>
  {Array.from({ length: n }).map((_, i) => <div key={i} style={{ position: 'absolute', left: hash(i + seed) * 1080 - 60, top: lerp(y0, y1, hash(i + seed + 9)), width: 60 + hash(i + seed + 3) * 120, height: 60 + hash(i + seed + 3) * 120, borderRadius: '50%', background: cols[i % cols.length], opacity: 0.16 + hash(i + seed + 5) * 0.2, filter: 'blur(10px)' }} />)}
</>);
export const Chip: React.FC<{ text: string; col: string; top: number; o?: number; size?: number; left?: number }> = ({ text, col, top, o = 1, size = 38, left }) => (
  <div style={{ position: 'absolute', left: left ?? 0, right: left == null ? 0 : undefined, top, display: 'flex', justifyContent: left == null ? 'center' : 'flex-start', opacity: o }}><div style={{ padding: '12px 30px', borderRadius: 30, background: 'rgba(32,16,34,.88)', border: `3px solid ${col}`, font: `800 ${size}px/1 ${FONT.ui}`, color: '#fff', whiteSpace: 'nowrap' }}>{text}</div></div>);

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
const Lock: React.FC<{ banner: number; lit: number; press?: number }> = ({ banner, lit, press = 0 }) => (<>
  <div style={{ position: 'absolute', left: -9, right: -9, top: -62, bottom: -9, background: 'linear-gradient(170deg,#3a1f4d,#a84a4a 55%,#f09a4a)', opacity: lit }} />
  <div style={{ position: 'absolute', left: -9, right: -9, top: -62, bottom: -9, background: '#050507', opacity: 1 - lit }} />
  <div style={{ opacity: lit }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: -34, textAlign: 'center', font: `600 12px ${FONT.ui}`, color: 'rgba(255,255,255,.9)' }}>Saturday, 28 November</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: -22, textAlign: 'center', font: `700 66px/1.1 ${FONT.ui}`, color: '#fff' }}>3:42</div>
    <div style={{ position: 'absolute', left: 4, right: 4, top: 116 + (1 - banner) * -60, height: 76, borderRadius: 18, background: `rgba(255,255,255,${0.3 - 0.1 * press})`, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.45)', opacity: banner, transform: `scale(${(0.92 + 0.08 * banner) * (1 - 0.045 * press)})`, boxShadow: `0 8px 24px rgba(0,0,0,.35), 0 0 ${24 * press}px rgba(255,235,190,${0.9 * press})` }}>
      <div style={{ position: 'absolute', left: 9, top: 10, width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(#5fe05f,#25b745)', display: 'grid', placeItems: 'center' }}><svg width={19} height={17} viewBox="0 0 17 15"><path d="M8.5 1C4.4 1 1 3.6 1 6.8c0 1.8 1 3.4 2.7 4.4L3 14l3.1-1.6c.8.2 1.5.3 2.4.3 4.1 0 7.5-2.6 7.5-5.9S12.6 1 8.5 1z" fill="#fff" /></svg></div>
      <div style={{ position: 'absolute', left: 50, top: 9, font: `700 14px ${FONT.ui}`, color: '#fff' }}>Arjun</div>
      <div style={{ position: 'absolute', right: 62, top: 10, font: `500 10px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>now</div>
      <div style={{ position: 'absolute', left: 50, top: 30, font: `600 13px ${FONT.ui}`, color: '#fff' }}>📷 Photo</div>
      <div style={{ position: 'absolute', right: 8, top: 9, width: 50, height: 58, borderRadius: 9, overflow: 'hidden' }}><svg width={50} height={58} viewBox="0 0 190 190" preserveAspectRatio="xMidYMid slice"><Charminar /></svg></div>
    </div>
  </div>
</>);

/* ================= 2. London: her flat, the phone lies charging on the table, the window shows London ================= */
export const LONDON_ROOM_FRAMES = 150;
const Window: React.FC<{ t: number }> = ({ t }) => {
  const mA = (42 * 6 * Math.PI) / 180, hA = ((3 * 30 + 42 * 0.5) * Math.PI) / 180;      // clock hands at 3:42
  const busX = 1060 - 150 * t;       // one slow pass from the right edge of the opening to the left, over the whole scene
  return (<g>
  <defs>
    <linearGradient id="lnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a3170" /><stop offset="0.55" stopColor="#d9694f" /><stop offset="1" stopColor="#ffb870" /></linearGradient>
    <linearGradient id="curt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#a87420" /><stop offset="0.3" stopColor="#e6b04a" /><stop offset="0.6" stopColor="#b88524" /><stop offset="1" stopColor="#e0a840" /></linearGradient>
    <clipPath id="lnWin"><rect x={540} y={130} width={500} height={860} rx={6} /></clipPath>
  </defs>
  <g clipPath="url(#lnWin)">
    <rect x={540} y={130} width={500} height={860} fill="url(#lnSky)" /><circle cx={620} cy={330} r={34} fill="#ffe7b0" opacity={0.8} />
    {Array.from({ length: 5 }).map((_, i) => <ellipse key={i} cx={640 + i * 110} cy={300 + (i % 3) * 70} rx={90} ry={16} fill="#f5a07a" opacity={0.28} />)}
    <g transform="translate(664 548) scale(0.82)">
      <polygon points="-14,0 14,0 40,180 -40,180" fill="#2a1830" opacity={0.9} /><polygon points="-6,0 6,0 -62,180 -40,180" fill="#2a1830" opacity={0.7} />
      <circle r={150} fill="none" stroke="#2a1830" strokeWidth={5} /><circle r={116} fill="none" stroke="#2a1830" strokeWidth={2} />
      {Array.from({ length: 18 }).map((_, i) => { const a = (i / 18) * 6.283 + t * 0.32; return <line key={'s' + i} x1={0} y1={0} x2={116 * Math.cos(a)} y2={116 * Math.sin(a)} stroke="#2a1830" strokeWidth={1.6} opacity={0.8} />; })}
      {Array.from({ length: 18 }).map((_, i) => { const a = (i / 18) * 6.283 + t * 0.32, px = 150 * Math.cos(a), py = 150 * Math.sin(a); return <g key={i} transform={`translate(${px} ${py})`}><line x1={0} y1={-3} x2={0} y2={2} stroke="#2a1830" strokeWidth={2} /><rect x={-7} y={0} width={14} height={11} rx={5} fill="#ffd89a" stroke="#2a1830" strokeWidth={1.4} /></g>; })}
      <circle r={9} fill="#2a1830" />
    </g>
    <g fill="#33203a"><rect x={560} y={640} width={250} height={150} /><rect x={560} y={610} width={60} height={30} />{[600, 660, 720, 780].map((x) => <rect key={x} x={x} y={600} width={8} height={40} />)}
      <rect x={810} y={400} width={68} height={390} /><rect x={802} y={392} width={84} height={14} /><polygon points="810,392 844,300 878,392" /><rect x={842} y={268} width={4} height={34} />
      <circle cx={844} cy={452} r={26} fill="#ffe7a8" /><circle cx={844} cy={452} r={22} fill="#fff6dc" />
      <path d={`M 844 452 L ${844 + 17 * Math.sin(mA)} ${452 - 17 * Math.cos(mA)}`} stroke="#33203a" strokeWidth={2.4} strokeLinecap="round" /><path d={`M 844 452 L ${844 + 11 * Math.sin(hA)} ${452 - 11 * Math.cos(hA)}`} stroke="#33203a" strokeWidth={3.6} strokeLinecap="round" /><circle cx={844} cy={452} r={2.4} fill="#33203a" /></g>
    <rect x={540} y={790} width={500} height={70} fill="#7a3a50" /><rect x={540} y={800} width={500} height={6} fill="#ffb870" opacity={0.6} />
    <rect x={540} y={860} width={500} height={130} fill="#2a1a2a" />
    <g transform={`translate(${busX} 842)`}><rect width={190} height={80} rx={8} fill="#d6252d" /><rect y={38} width={190} height={5} fill="#a01a20" />{[14, 50, 86, 122, 158].map((x) => <g key={x}><rect x={x} y={10} width={26} height={22} rx={3} fill="#ffe7a8" /><rect x={x} y={48} width={26} height={22} rx={3} fill="#ffe7a8" /></g>)}<circle cx={36} cy={80} r={13} fill="#111" /><circle cx={150} cy={80} r={13} fill="#111" /></g>
    {Array.from({ length: 80 }).map((_, i) => { const x = 540 + hash(i + 70) * 500, y = 130 + ((hash(i + 80) * 860 + t * (300 + hash(i) * 200)) % 860); return <line key={i} x1={x} y1={y} x2={x - 5} y2={y + 30} stroke="#fff" strokeWidth={1.8} opacity={0.4} />; })}
    {Array.from({ length: 9 }).map((_, i) => { const x = 560 + hash(i + 120) * 460, y = 130 + ((hash(i + 130) * 860 + t * (24 + hash(i + 4) * 26)) % 860); return <ellipse key={'d' + i} cx={x} cy={y} rx={3.2} ry={5} fill="#fff" opacity={0.35} />; })}
  </g>
  <rect x={540} y={130} width={500} height={860} rx={6} fill="none" stroke="#f3e6d0" strokeWidth={22} /><rect x={786} y={130} width={14} height={860} fill="#f3e6d0" /><rect x={540} y={512} width={500} height={14} fill="#f3e6d0" />
  {/* the sill: only a little wider than the frame */}
  <rect x={522} y={990} width={536} height={24} rx={4} fill="#e6d6bc" /><rect x={522} y={990} width={536} height={4} fill="#fff6e0" opacity={0.7} />
  {/* curtain rod with brackets and rings, and a curtain with folds hanging from the rings */}
  <rect x={500} y={104} width={600} height={9} rx={4} fill="#5a4630" /><circle cx={500} cy={108} r={10} fill="#8a6a40" /><circle cx={1100} cy={108} r={10} fill="#8a6a40" /><rect x={516} y={104} width={12} height={34} fill="#5a4630" />
  <path d="M 1000 112 H 1090 V 990 Q 1070 1004 1045 990 Q 1022 1004 1000 990 Z" fill="url(#curt)" />
  {[1008, 1028, 1048, 1068, 1086].map((x, i) => <path key={x} d={`M ${x} 114 Q ${x + (i % 2 ? 7 : -7)} 540 ${x} 990`} stroke={i % 2 ? '#fbd987' : '#8a5e16'} strokeWidth={5} fill="none" opacity={0.55} />)}
  {[1004, 1030, 1056, 1082].map((x) => <g key={x}><circle cx={x} cy={108} r={9} fill="none" stroke="#c9a15a" strokeWidth={4} /><rect x={x - 6} y={112} width={12} height={22} fill="#a87420" /></g>)}
  <path d="M 1000 560 Q 1044 600 1090 560 L 1090 596 Q 1044 636 1000 596 Z" fill="#7a5010" opacity={0.55} />
</g>); };

export const PY = 0.66, TB = 905;       // the desk top seen from above and behind her: back edge at y 905, front edge at y 1500; flat things live in a plane squashed to 66%
export const HS = 1.25;                       // hand size relative to the keys
const DOC_LINES = ['Scene 1 · Hyderabad: he taps send.', 'Scene 2 · The photo is cut into packets.', 'Scene 3 · Under the sea it is just light.'], DOC_LIVE = 'Scene 4 · London: her phone lights up.';
const SKIN = '#c98a5e', SKIN_D = '#9a6034', NAIL = '#f2d3c3';
export const rot2 = (x: number, y: number, deg: number): [number, number] => { const r = (deg * Math.PI) / 180; return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)]; };

/* A hand in its own coordinates: wrist centre at (0,0), the fingers point up (-y). side 1 = right hand (thumb on the left), -1 = left hand (mirrored, thumb on the right).
   type = how much the fingers tap the keys; point = 0..1 the index finger straightens to touch, the other fingers curl in. */
const HandShape: React.FC<{ side: 1 | -1; type: number; t: number; point: number; ph: number; skin?: string }> = ({ side, type, t, point, ph, skin = SKIN }) => {
  const fx = [-22, -7, 8, 23], len = [64, 72, 66, 52];
  return (<g transform={`scale(${side} 1)`}>
    <path d="M -21 10 L -21 -6 Q -34 -34 -31 -68 L 31 -68 Q 34 -34 21 -6 L 21 10 Z" fill={skin} />
    <path d="M -21 -6 Q -34 -34 -31 -68 L -13 -68 Q -17 -36 -10 -6 Z" fill="#e6b08a" opacity={0.35} />
    <path d="M -24 -50 Q 0 -44 26 -52" stroke={SKIN_D} strokeWidth={2} fill="none" opacity={0.35} /><path d="M -12 2 Q 0 6 12 2" stroke={SKIN_D} strokeWidth={2} fill="none" opacity={0.4} />
    {fx.map((x, i) => {
      const press = type * Math.max(0, Math.sin(t * 15 + i * 1.9 + ph)), curl = i === 0 ? 0 : point;
      const L = i === 0 ? lerp(len[0], 86, point) : lerp(len[i], len[i] * 0.52, curl), y0 = -66 + press * 6, w = 14;
      return (<g key={i}>
        <rect x={x - w / 2} y={y0 - L} width={w} height={L + 8} rx={7} fill={skin} />
        <path d={`M ${x - w / 2} ${y0 - L * 0.38} h ${w} M ${x - w / 2} ${y0 - L * 0.7} h ${w}`} stroke={SKIN_D} strokeWidth={1.6} opacity={0.4} />
        <rect x={x - 4.5} y={y0 - L + 1.5} width={9} height={12} rx={4.5} fill={NAIL} opacity={0.9} />
        {curl > 0.3 && <ellipse cx={x} cy={y0 - L * 0.22} rx={w / 2 + 1} ry={6} fill={SKIN_D} opacity={0.3 * curl} />}
      </g>);
    })}
    <g transform={`translate(-30 -24) rotate(${lerp(-36, -14, point)})`}>
      <rect x={-8} y={-44 + point * 10} width={16} height={54} rx={8} fill={skin} /><rect x={-4.5} y={-43 + point * 10} width={9} height={11} rx={4.5} fill={NAIL} opacity={0.9} /><path d="M -8 -14 h 16" stroke={SKIN_D} strokeWidth={1.6} opacity={0.4} />
    </g>
  </g>);
};
/* the arm: a sleeve that runs from a fixed point near her body (anchor) to the wrist; sleeve, wrist bend and hand all follow the wrist */
export const Limb: React.FC<{ anchor: [number, number]; wrist: [number, number]; side: 1 | -1; bend?: number; type?: number; t?: number; point?: number; lift?: number; ph?: number; skin?: string; sleeve?: [string, string, string, string] }> = ({ anchor, wrist, side, bend = 0, type = 0, t = 0, point = 0, lift = 0, ph = 0, skin = SKIN, sleeve = ['#ff7a59', '#ff9d7a', '#c9543a', '#ffd38a'] }) => {
  const [ax, ay] = anchor, [wx, wy] = wrist, ang = (Math.atan2(wx - ax, ay - wy) * 180) / Math.PI, len = Math.hypot(wx - ax, wy - ay);
  return (<g transform={`translate(${wx} ${wy}) rotate(${ang})`}>
    <ellipse cx={lift * 12} cy={-44 * HS + lift * 14} rx={46 * HS} ry={84 * HS} fill="#000" opacity={0.3 - 0.12 * lift} filter="url(#blur6)" transform={`rotate(${bend})`} />
    <polygon points={`-46,18 46,18 62,${len + 500} -62,${len + 500}`} fill={sleeve[0]} /><polygon points={`-46,18 -24,18 -30,${len + 500} -62,${len + 500}`} fill={sleeve[1]} opacity={0.5} />
    <path d={`M -42 ${len * 0.35} Q 0 ${len * 0.35 + 10} 42 ${len * 0.35} M -46 ${len * 0.62} Q 0 ${len * 0.62 + 10} 46 ${len * 0.62}`} stroke={sleeve[2]} strokeWidth={4} fill="none" opacity={0.5} />
    <rect x={-48} y={16} width={96} height={22} rx={8} fill={sleeve[3]} /><path d="M -48 27 H 48" stroke="#c9a15a" strokeWidth={2} opacity={0.7} />
    <g transform={`rotate(${bend}) scale(${HS * (1 + 0.06 * lift)})`}><HandShape side={side} type={type} t={t} point={point} ph={ph} skin={skin} /></g>
  </g>);
};
/* where must the wrist be so that the index fingertip lands exactly on the target? (the arm angle depends on the wrist, so a few passes) */
export const solveWrist = (anchor: [number, number], target: [number, number], tip: [number, number], bend: number): [number, number] => {
  let w: [number, number] = [target[0] - tip[0], target[1] - tip[1]];
  for (let i = 0; i < 10; i++) { const ang = (Math.atan2(w[0] - anchor[0], anchor[1] - w[1]) * 180) / Math.PI, [dx, dy] = rot2(tip[0], tip[1], ang + bend); w = [target[0] - dx, target[1] - dy]; }
  return w;
};

export const LONDON_TIMES = { ring: 1.2, lift: 1.55, reach: 1.85, touch: 3.0, tap: 3.4 };
export const LondonRoom: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS, T = LONDON_TIMES;
  const lit = prog(f, T.ring, T.ring + 0.1), banner = prog(f, T.ring + 0.2, T.ring + 0.6, easeOut);
  const buzzing = t >= T.ring && t < T.ring + 0.9, buzz = buzzing ? Math.sin(f * 2.9) * 4.5 * (1 - prog(f, T.ring, T.ring + 0.9)) : 0;
  const typing = 1 - prog(f, T.ring, T.ring + 0.18);                          // typing pauses the moment the phone buzzes
  const typedChars = Math.min(DOC_LIVE.length, Math.floor(Math.min(t, T.ring) * 14));   // the next script line is typed live until the phone buzzes
  const lift = prog(f, T.lift, T.lift + 0.3, easeOut) * (1 - 0.75 * prog(f, T.touch - 0.2, T.touch));
  const u = easeInOut(prog(f, T.reach, T.touch)), point = prog(f, T.reach + 0.45, T.touch - 0.2, easeOut);
  const press = prog(f, T.tap, T.tap + 0.3, easeOut) * (1 - prog(f, T.tap + 0.3, T.tap + 0.7));
  // the phone lies on the desk: small and silver (a 6.3 inch phone is about half as long as a 14 inch laptop is wide), resting partly on the notebook's left page
  const PK = 0.52, PW2 = 236 * PK, PH2 = 484 * PK, cx = 640, cy = 1382, th = 14, pcy = (cy - TB) / PY;
  const LX = 315, LB = 1170;                                                    // laptop: centre x; the line where the screen meets the keyboard
  const tipY = (LB + 40 - TB) / PY, wy0 = tipY + 138 * HS;                           // resting hands: fingertips on the home rows
  const [bdx, bdy] = rot2(0, 18 * PK, th), target: [number, number] = [cx + bdx, pcy + bdy];          // centre of the banner on the phone glass
  const anchorR: [number, number] = [LX + 175, 1650], anchorL: [number, number] = [LX - 175, 1650];
  const bendEnd = -9, wEnd = solveWrist(anchorR, target, [-22 * HS, -150 * HS], bendEnd);
  const sway = (ph: number): [number, number] => [Math.sin(t * 4.2 + ph) * 3 * typing, Math.sin(t * 8.4 + ph) * 2 * typing];
  const w0: [number, number] = [LX + 128, wy0], arc = Math.sin(Math.PI * u) * 34;
  const sR = sway(1.7), wR: [number, number] = [lerp(w0[0], wEnd[0], u) + arc + sR[0], lerp(w0[1], wEnd[1], u) + sR[1]], sL = sway(0);
  const tapP = prog(f, T.tap, T.tap + 0.6);
  return (
    <AbsoluteFill style={{ background: '#3a2230' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 860, background: 'linear-gradient(180deg,#4a2c38 0%,#5a3436 70%,#43282c 100%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <linearGradient id="wood2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9794a" /><stop offset="1" stopColor="#9a5e34" /></linearGradient>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a2e24" /><stop offset="1" stopColor="#2e1a16" /></linearGradient>
          <radialGradient id="lampPool"><stop offset="0" stopColor="#ffd89a" stopOpacity={0.75} /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient>
          <radialGradient id="scrGlow"><stop offset="0" stopColor="#bfe3ff" stopOpacity={0.5} /><stop offset="1" stopColor="#bfe3ff" stopOpacity={0} /></radialGradient>
          <filter id="blur6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter><filter id="blur3"><feGaussianBlur stdDeviation="3.5" /></filter></defs>
        <g transform="translate(300 40) scale(0.66)"><Window t={t} /></g>
        {/* wall clock showing London time, 3:42, with a sweeping second hand */}
        <g transform="translate(250 330)">
          <circle r={128} cy={8} fill="#000" opacity={0.35} filter="url(#blur6)" />
          <circle r={124} fill="#d9a13a" stroke="#a87420" strokeWidth={6} /><circle r={108} fill="#fdf3e4" stroke="#c9a15a" strokeWidth={3} />
          {Array.from({ length: 60 }).map((_, i) => { const a = (i * 6 * Math.PI) / 180, big = i % 5 === 0; return <line key={i} x1={Math.sin(a) * (big ? 86 : 94)} y1={-Math.cos(a) * (big ? 86 : 94)} x2={Math.sin(a) * 102} y2={-Math.cos(a) * 102} stroke="#3a2a22" strokeWidth={big ? 5 : 2} strokeLinecap="round" />; })}
          {[[12, 0, -64], [3, 62, 10], [6, 0, 84], [9, -62, 10]].map(([n, x, y]) => <text key={n} x={x} y={y} textAnchor="middle" fill="#3a2a22" style={{ font: `800 30px ${FONT.ui}` }}>{n}</text>)}
          <text y={36} textAnchor="middle" fill="#a87420" style={{ font: `800 13px ${FONT.ui}`, letterSpacing: '0.2em' }}>LONDON</text>
          <g transform={`rotate(${3 * 30 + 42 * 0.5})`}><rect x={-5} y={-62} width={10} height={72} rx={5} fill="#2a1a20" /></g>
          <g transform="rotate(252)"><rect x={-3.6} y={-92} width={7.2} height={104} rx={3.6} fill="#2a1a20" /></g>
          <g transform={`rotate(${(t % 60) * 6})`}><rect x={-1.6} y={-100} width={3.2} height={124} rx={1.6} fill="#d6252d" /><circle cy={20} r={5} fill="#d6252d" /></g>
          <circle r={8} fill="#d6252d" /><circle r={3} fill="#fdf3e4" />
        </g>
        <rect x={0} y={840} width={1080} height={26} fill="#e8d9c0" />
        <rect x={0} y={866} width={1080} height={1054} fill="url(#floor)" />{Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M 0 ${880 + i * 105} L 1080 ${880 + i * 105}`} stroke="#1e100c" strokeWidth={2} opacity={0.5} />)}
        <polygon points="-40,1700 1120,1700 1160,1920 -80,1920" fill="#a8452f" /><polygon points="-20,1730 1100,1730 1130,1920 -50,1920" fill="none" stroke="#f1d9a8" strokeWidth={6} opacity={0.85} />{Array.from({ length: 9 }).map((_, i) => <polygon key={i} points={`${60 + i * 120},1780 ${84 + i * 120},1806 ${60 + i * 120},1832 ${36 + i * 120},1806`} fill="#e8b04a" opacity={0.85} />)}
        <ellipse cx={540} cy={1700} rx={640} ry={46} fill="#000" opacity={0.45} filter="url(#blur6)" />
        <polygon points="-40,905 1120,905 1260,1500 -180,1500" fill="url(#wood2)" />{Array.from({ length: 9 }).map((_, i) => { const y = 935 + i * 66; return <path key={i} d={`M -40 ${y} Q 540 ${y + 6} 1120 ${y}`} stroke="#6a3c1c" strokeWidth={2} fill="none" opacity={0.3} />; })}
        <rect x={-180} y={1500} width={1440} height={50} fill="#7a4624" /><rect x={-180} y={1500} width={1440} height={5} fill="#e0a56e" />
        <rect x={-180} y={1550} width={1440} height={150} fill="#5a3218" /><rect x={300} y={1572} width={480} height={104} rx={8} fill="#6a3c1c" stroke="#8a5530" strokeWidth={4} /><rect x={500} y={1612} width={80} height={14} rx={7} fill="#e0b07a" />
        {/* the lamp's pool of light lies on the desk around its base */}
        <ellipse cx={850} cy={1085} rx={230} ry={62} fill="url(#lampPool)" />
        <ellipse cx={LX} cy={LB + 140} rx={320} ry={120} fill="url(#scrGlow)" opacity={0.6} />
      </svg>
      {/* flat things: the plane of the desk */}
      <div style={{ position: 'absolute', left: 0, top: TB, width: 1080, height: 1800, transformOrigin: '0 0', transform: `scale(1, ${PY})` }}>
        <svg width={1080} height={1800} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          {/* notebook with a centre fold, a pen on the desk beside it */}
          <g transform="translate(835 752) rotate(3)">
            <rect x={-158} y={-112} width={316} height={240} rx={10} fill="#000" opacity={0.35} transform="translate(8 12)" filter="url(#blur3)" />
            <rect x={-156} y={-110} width={312} height={236} rx={10} fill="#8f4a3a" /><rect x={-150} y={-108} width={150} height={228} rx={8} fill="#f1e7d3" /><rect x={0} y={-108} width={150} height={228} rx={8} fill="#f6efe0" />
            <rect x={-40} y={-108} width={40} height={228} fill="#cfc2a8" opacity={0.55} /><rect x={0} y={-108} width={30} height={228} fill="#d9ceb6" opacity={0.5} /><rect x={-2.5} y={-108} width={5} height={228} fill="#9d8f74" />
            {Array.from({ length: 7 }).map((_, i) => <g key={i}><line x1={-136} y1={-80 + i * 30} x2={-12} y2={-80 + i * 30} stroke="#9fb4d0" strokeWidth={2} /><line x1={14} y1={-80 + i * 30} x2={136} y2={-80 + i * 30} stroke="#9fb4d0" strokeWidth={2} /></g>)}
            <path d="M 22 -84 q 20 -12 40 0 t 40 0 M 22 -54 q 24 -10 48 0 t 40 0" stroke="#2a3a7a" strokeWidth={3.4} fill="none" opacity={0.7} />
          </g>
          <g transform="translate(1038 760) rotate(82)"><rect x={-84} y={-5} width={176} height={14} rx={7} fill="#000" opacity={0.35} /><rect x={-86} y={-8} width={176} height={14} rx={7} fill="#2a3a7a" /><rect x={-86} y={-8} width={44} height={14} rx={7} fill="#c9a15a" /><polygon points="90,-6 108,-1 90,4" fill="#e8c9a0" /></g>
          {/* the phone's contact shadow, partly on the page */}
          <g transform={`translate(${cx + 7} ${pcy + 10}) rotate(${th})`}><rect x={-PW2 / 2} y={-PH2 / 2} width={PW2} height={PH2} rx={20} fill="#000" opacity={0.45} filter="url(#blur3)" /></g>
        </svg>
        <div style={{ position: 'absolute', left: cx - PW2 / 2 + buzz, top: pcy - PH2 / 2, width: PW2, height: PH2, transform: `rotate(${th}deg)`, transformOrigin: '50% 50%' }}>
          <IPhone v18="silver" left={0} top={0} o={1} name="" avatar="#000" k={PK}><Lock banner={banner} lit={lit} press={press} /></IPhone>
        </div>
      </div>
      {/* things that stand up: shadow first, then the object, each with its base on the desk */}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
        {/* the laptop: screen, a hinge, a keyboard with rows in perspective, a spacebar and a centred trackpad */}
        <ellipse cx={LX} cy={LB + 124} rx={330} ry={30} fill="#000" opacity={0.45} filter="url(#blur6)" />
        <polygon points={`${LX - 262},${LB - 330} ${LX + 262},${LB - 330} ${LX + 276},${LB - 6} ${LX - 276},${LB - 6}`} fill="#1b1d26" stroke="#8a8d96" strokeWidth={6} />
        <polygon points={`${LX - 246},${LB - 312} ${LX + 246},${LB - 312} ${LX + 258},${LB - 22} ${LX - 258},${LB - 22}`} fill="#fdf3e4" />
        <rect x={LX - 246} y={LB - 312} width={492} height={26} fill="#e8d9c0" /><circle cx={LX - 228} cy={LB - 299} r={5} fill="#ff6b5e" /><circle cx={LX - 211} cy={LB - 299} r={5} fill="#ffbd44" /><circle cx={LX - 194} cy={LB - 299} r={5} fill="#3ec65a" />
        <text x={LX - 120} y={LB - 294} fill="#5a4a3a" style={{ font: `700 13px ${FONT.ui}` }}>Script · Part 2 (draft)</text>
        <rect x={LX - 246} y={LB - 286} width={492} height={24} fill="#f3e9d6" />{[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={LX - 232 + i * 30} y={LB - 280} width={18} height={12} rx={3} fill="#cdbfa6" />)}<rect x={LX + 120} y={LB - 280} width={90} height={12} rx={3} fill="#d9694f" opacity={0.85} />
        <rect x={LX - 214} y={LB - 258} width={428} height={232} fill="#ffffff" stroke="#e0d3bc" strokeWidth={2} />
        <text x={LX - 192} y={LB - 228} fill="#d9694f" style={{ font: `800 17px ${FONT.ui}`, letterSpacing: '0.04em' }}>HOW A PHOTO CROSSES AN OCEAN</text>
        {DOC_LINES.map((ln, i) => <text key={i} x={LX - 192} y={LB - 196 + i * 30} fill="#4a3a30" style={{ font: `600 14.5px ${FONT.ui}` }}>{ln}</text>)}
        <text x={LX - 192} y={LB - 196 + DOC_LINES.length * 30} fill="#4a3a30" style={{ font: `600 14.5px ${FONT.ui}` }}>{DOC_LIVE.slice(0, typedChars)}</text>
        <rect x={LX - 192 + typedChars * 7.35} y={LB - 196 + DOC_LINES.length * 30 - 14} width={2.4} height={18} fill="#d9694f" opacity={Math.floor(t * 2.4) % 2 === 0 ? 1 : 0.15} />
        <polygon points={`${LX - 276},${LB} ${LX + 276},${LB} ${LX + 312},${LB + 112} ${LX - 312},${LB + 112}`} fill="#c9ccd2" stroke="#8a8d96" strokeWidth={3} />
        <polygon points={`${LX - 276},${LB} ${LX + 276},${LB} ${LX + 280},${LB + 10} ${LX - 280},${LB + 10}`} fill="#a9acb4" opacity={0.55} />
        <rect x={LX - 268} y={LB - 9} width={536} height={13} rx={6} fill="#3a3c46" stroke="#1b1d26" strokeWidth={2} /><rect x={LX - 262} y={LB - 8} width={520} height={3} rx={1.5} fill="#8a8d96" opacity={0.7} /><circle cx={LX - 268} cy={LB - 2} r={8} fill="#2a2c34" /><circle cx={LX + 268} cy={LB - 2} r={8} fill="#2a2c34" />
        {[0, 1, 2, 3].map((r) => { const y = LB + 16 + r * 16, hw = 262 + r * 9, kw = (hw * 2 - 13 * 3) / 14; return Array.from({ length: 14 }).map((_, c) => <rect key={r + '-' + c} x={LX - hw + c * (kw + 3)} y={y} width={kw} height={11} rx={3} fill="#8a8d96" />); })}
        {(() => { const y = LB + 16 + 4 * 16, hw = 262 + 4 * 9, kw = (hw * 2 - 13 * 3) / 14, key = (i: number, n = 1) => ({ x: LX - hw + i * (kw + 3), w: kw * n + 3 * (n - 1) });
          return [[0, 1], [1, 1], [2, 1], [3, 1.5]].map(([i, n], j) => { const k = key(i, n); return <rect key={'L' + j} x={k.x} y={y} width={k.w} height={11} rx={3} fill="#8a8d96" />; }).concat([[4.6, 5.5]].map(([i, n]) => { const k = key(i, n); return <rect key="space" x={k.x} y={y} width={k.w} height={12} rx={4} fill="#767983" stroke="#5a5d66" strokeWidth={1.2} />; })).concat([[10.2, 1], [11.3, 1], [12.4, 1.6]].map(([i, n], j) => { const k = key(i, n); return <rect key={'R' + j} x={k.x} y={y} width={k.w} height={11} rx={3} fill="#8a8d96" />; })); })()}
        <rect x={LX - 64} y={LB + 94} width={128} height={15} rx={5} fill="#aeb1ba" stroke="#8a8d96" strokeWidth={1.5} />
        <rect x={LX - 292} y={LB - 322} width={46} height={46} fill="#ffe27a" transform={`rotate(-6 ${LX - 270} ${LB - 300})`} /><path d={`M ${LX - 282} ${LB - 308} h 26 M ${LX - 282} ${LB - 296} h 20`} stroke="#c98a2a" strokeWidth={3} />
        {/* the plant: its pot stands on the desk beside the laptop, leaves well clear of the screen */}
        <ellipse cx={725} cy={1120} rx={50} ry={11} fill="#000" opacity={0.5} filter="url(#blur3)" />
        <path d="M 692 1060 L 758 1060 L 750 1116 L 700 1116 Z" fill="#c0634a" /><ellipse cx={725} cy={1116} rx={25} ry={5} fill="#8a3f2a" /><rect x={686} y={1050} width={78} height={14} rx={5} fill="#d6785a" />
        {[-34, -12, 8, 28, 46].map((a, i) => <path key={i} d={`M 725 1052 Q ${725 + a * 0.9} ${1000 - (i % 2) * 14} ${725 + a * 1.25} ${962 + (i % 3) * 12}`} stroke="#3f8a4a" strokeWidth={8} fill="none" strokeLinecap="round" />)}
        {[-34, -12, 8, 28, 46].map((a, i) => <ellipse key={i} cx={725 + a * 1.25} cy={962 + (i % 3) * 12} rx={19} ry={10} fill="#4fa05a" transform={`rotate(${a * 1.3} ${725 + a * 1.25} ${962 + (i % 3) * 12})`} />)}
        <DeskFlag x={945} y={1078} kind="uk" t={t} id="flagUK" />
        {/* a framed picture of her dog */}
        <ellipse cx={1030} cy={1344} rx={52} ry={9} fill="#000" opacity={0.5} filter="url(#blur3)" />
        <path d="M 1030 1280 L 1004 1338 L 1056 1338 Z" fill="#4a2e1a" opacity={0.8} />
        <rect x={993} y={1243} width={74} height={96} rx={7} fill="#5a3a22" stroke="#3a2210" strokeWidth={3} /><rect x={1001} y={1251} width={58} height={80} fill="#fdf3e4" /><svg x={1004} y={1254} width={52} height={74} viewBox="0 0 190 190" preserveAspectRatio="xMidYMid slice"><DogPhoto /></svg>
        <rect x={1001} y={1316} width={58} height={16} rx={3} fill="#d9b25a" stroke="#8a6a20" strokeWidth={1.2} /><text x={1030} y={1328} textAnchor="middle" fill="#3a2a10" style={{ font: `800 11px ${FONT.ui}`, letterSpacing: '0.1em' }}>ROCKY</text>
        <g transform="translate(-30 0)">
        {/* the lamp: a wide round base, a stem, a socket joining the stem to the shade */}
        <ellipse cx={885} cy={1086} rx={74} ry={15} fill="#000" opacity={0.5} filter="url(#blur6)" />
        <ellipse cx={885} cy={1076} rx={52} ry={12} fill="#2a1e18" /><rect x={833} y={1062} width={104} height={14} fill="#3a2a22" /><ellipse cx={885} cy={1062} rx={52} ry={12} fill="#4a3a30" /><ellipse cx={885} cy={1060} rx={30} ry={6} fill="#5a4838" />
        <rect x={879} y={830} width={12} height={232} fill="#4a3a30" /><rect x={875} y={828} width={20} height={10} rx={3} fill="#6a5a46" />
        <rect x={868} y={800} width={34} height={30} rx={6} fill="#6a5a46" /><rect x={868} y={812} width={34} height={5} fill="#3a2a22" /><circle cx={885} cy={796} r={13} fill="#fff3c8" opacity={0.95} />
        <path d="M 835 794 L 935 794 L 910 706 L 860 706 Z" fill="#ff9e5e" /><ellipse cx={885} cy={794} rx={50} ry={8} fill="#ffe7b0" /><ellipse cx={885} cy={706} rx={25} ry={5} fill="#e0824a" />
        </g>
        <g transform="translate(-22 0)">
        {/* the mug on its coaster: rim, coffee, an open handle, steam from the coffee */}
        <ellipse cx={985} cy={1214} rx={66} ry={13} fill="#e8d9c0" /><ellipse cx={985} cy={1218} rx={62} ry={11} fill="#000" opacity={0.4} filter="url(#blur3)" />
        <rect x={944} y={1108} width={82} height={102} rx={12} fill="#c0392b" /><rect x={944} y={1108} width={16} height={102} rx={8} fill="#e0594a" opacity={0.5} />
        <ellipse cx={985} cy={1108} rx={41} ry={11} fill="#f3d9c8" /><ellipse cx={985} cy={1109} rx={34} ry={8} fill="#4a2a18" /><ellipse cx={978} cy={1107} rx={14} ry={3} fill="#8a5a34" opacity={0.7} />
        <path d="M 1026 1128 C 1068 1118 1070 1186 1026 1192" stroke="#c0392b" strokeWidth={11} fill="none" strokeLinecap="butt" /><path d="M 1026 1128 C 1056 1124 1058 1180 1026 1188" stroke="#e0594a" strokeWidth={3} fill="none" opacity={0.6} />
        <text x={985} y={1160} textAnchor="middle" fill="#fff" style={{ font: `800 14px ${FONT.ui}`, letterSpacing: '0.08em' }}>LONDON</text><text x={985} y={1180} textAnchor="middle" fill="#ffd38a" style={{ font: `800 14px ${FONT.ui}` }}>♥</text>
        {[0, 1, 2].map((i) => { const ph = (t * 0.7 + i * 0.33) % 1; return <path key={i} d={`M ${972 + i * 14} ${1104 - ph * 4} q 10 -24 0 -48 q -10 -22 0 -40`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.28 * (1 - ph)} strokeLinecap="round" transform={`translate(0 ${-ph * 40})`} />; })}
        </g>
        {/* the vibration: short marks right at the phone's edges, and the sound, both stuck to the phone and gone before the finger arrives */}
        {t >= T.ring && t < T.ring + 1.2 ? <g opacity={1 - prog(f, T.ring + 0.8, T.ring + 1.2)}>
          {[0, 1, 2].map((i) => { const p = ((t - T.ring) * 2.4 + i * 0.33) % 1; return <path key={i} d={`M ${cx + buzz + 72 + p * 22} ${cy - 26} q 12 26 0 52`} stroke="#ffd38a" strokeWidth={5} fill="none" strokeLinecap="round" opacity={1 - p} />; })}
          {[0, 1, 2].map((i) => { const p = ((t - T.ring) * 2.4 + i * 0.33) % 1; return <path key={'l' + i} d={`M ${cx + buzz - 72 - p * 22} ${cy - 26} q -12 26 0 52`} stroke="#ffd38a" strokeWidth={5} fill="none" strokeLinecap="round" opacity={1 - p} />; })}
          <text x={cx + buzz} y={cy - 112} textAnchor="middle" fill="#fff" style={{ font: `800 34px ${FONT.ui}`, paintOrder: 'stroke', stroke: '#2a1a20', strokeWidth: 7 }}>ding! bzzzt</text></g> : null}
      </svg>
      {/* her hands, in front of the laptop: both on the keys and typing; the left stays, the right lifts off and reaches */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, clipPath: 'inset(0 0 190px 0)' }}>{/* her arms stop at y 1730, where the desk apron meets the rug */}
      <div style={{ position: 'absolute', left: 0, top: TB, width: 1080, height: 1800, transformOrigin: '0 0', transform: `scale(1, ${PY})` }}>
        <svg width={1080} height={1800} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <Limb anchor={anchorL} wrist={[LX - 128 + sL[0], wy0 + sL[1]]} side={-1} type={typing} t={t} ph={0} />
          <Limb anchor={anchorR} wrist={wR} side={1} bend={lerp(0, bendEnd, u)} type={typing} t={t} ph={0.9} point={point} lift={lift} />
          {tapP > 0 && tapP < 1 && [0, 1].map((i) => { const p = clamp01((tapP - i * 0.25) / 0.75); return p > 0 ? <ellipse key={i} cx={target[0]} cy={target[1]} rx={10 + p * 44} ry={10 + p * 44} fill="none" stroke="#fff3d0" strokeWidth={5 * (1 - p)} opacity={0.9 * (1 - p)} /> : null; })}
        </svg>
      </div>
      </div>
      <Chip text="LONDON · 3:42 pm" col="#ffb454" top={482} left={36} />
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
    </AbsoluteFill>
  );
};

/* ================= 4. the photo flies over the globe, with the milliseconds ================= */
export const FLY_GLOBE_FRAMES = 150;
const T0F = 300 / FPS;
export const FlyGlobe: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  ov.lon = () => 40; ov.show = () => 1; ov.pins = T0F + 0.05;
  const pt = T0F + t, land = prog(f, 0.0, 0.4, easeOut);                                         // the photo comes down onto the Hyderabad pin
  const u = easeInOut(Math.min(1, Math.max(0, (t - 0.4) / 2.2))), arrived = prog(f, 2.6, 3.0, easeOut);
  const at = (uu: number) => project(pt, ll(routeAt(MAIN, uu) as unknown as LL, R * 1.012));
  const [hx, hy] = project(pt, ll(HYD_LL, R * 1.012));
  const [x, y, front] = u > 0 ? at(u) : [hx, hy, true];
  const cardX = x, cardY = u > 0 ? y : lerp(-120, hy, land);
  const trail = Array.from({ length: Math.max(2, Math.round(u * 60)) }).map((_, i, a) => at((i / (a.length - 1)) * u)).filter((q) => q[2]).map((q) => `${q[0]},${q[1]}`).join(' ');
  const ms = Math.round(65 * u);
  return (
    <AbsoluteFill style={{ backgroundColor: '#14091c' }}>
      <Sequence from={-300}><Planet /></Sequence>
      <AbsoluteFill><svg width={1080} height={1920}>
        <defs><radialGradient id="fg"><stop offset="0" stopColor="#ffe3a0" stopOpacity={0.9} /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient><filter id="tglow"><feGaussianBlur stdDeviation="6" /></filter></defs>
        {trail && u > 0 && <><polyline points={trail} fill="none" stroke="#ffb454" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} filter="url(#tglow)" /><polyline points={trail} fill="none" stroke="#fff3c8" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></>}
        {front && <g transform={`translate(${cardX} ${cardY})`} opacity={1}><circle r={104 + 18 * arrived} fill="url(#fg)" /><rect x={-46} y={-46} width={92} height={92} rx={12} fill="#fff" stroke="#ffb454" strokeWidth={5} /><svg x={-40} y={-40} width={80} height={80} viewBox="0 0 190 190"><Charminar /></svg></g>}
        {arrived > 0 && (() => { const [lx, ly] = project(pt, ll(LONDON_LL, R * 1.012)); return [0, 1, 2].map((i) => { const p = clamp01((arrived - i * 0.2) / 0.8); return p > 0 ? <circle key={i} cx={lx} cy={ly} r={14 + p * 70} fill="none" stroke="#fff3c8" strokeWidth={6 * (1 - p)} opacity={0.9 * (1 - p)} /> : null; }); })()}
      </svg></AbsoluteFill>
      <Chip text="Hyderabad → London" col="#ffb454" top={236} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 322, display: 'flex', justifyContent: 'center', gap: 36, alignItems: 'flex-end', textShadow: '0 4px 20px rgba(0,0,0,.8)' }}>
        <div style={{ font: `800 96px/1 ${FONT.mono}`, color: '#ffe3a0' }}>{ms}<span style={{ fontSize: 40, color: '#fff' }}> ms</span></div>
        <div style={{ paddingBottom: 6 }}><div style={{ font: `800 34px/1 ${FONT.mono}`, color: '#fff' }}>{(Math.round((ms / 65) * 13000 / 100) * 100).toLocaleString('en-US')}<span style={{ fontSize: 22, color: '#ffd38a' }}> km travelled</span></div>
          <div style={{ marginTop: 8, font: `800 30px/1 ${FONT.mono}`, color: '#9fe9ff' }}>200,000<span style={{ fontSize: 21, color: '#cfe9ff' }}> km/s  light in glass</span></div></div></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', font: `700 24px/1 ${FONT.ui}`, color: '#ffd38a', opacity: 0.9 }}>about 13,000 km of cable in about 65 ms</div>
    </AbsoluteFill>
  );
};
