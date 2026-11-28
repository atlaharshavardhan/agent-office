import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { DogPhoto } from './Story';
import { IPhone, Compose, PW, PH } from '../dusk/Phone';
/* Part 2, the arrival: on HER phone the gold packets land in any order, the numbers put them back in line, her phone unlocks them and the dog photo appears. 9:16, our iPhone, no names. */
const GOLD = '#ffb454', GOLD2 = '#ffd38a', CREAM = '#fff1dc';
const sm = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); }, eo = (u: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3), lp = (a: number, b: number, u: number) => a + (b - a) * u;
export const ARRIVE_FRAMES = 330;
const K = 3.3, PL = (1080 - PW * K) / 2, PT = 190, N = 10, T = 58;
const BX = PL + 19 * K, BY = PT + 158 * K, BW = 176 * K, TS = BW / N;       // the photo box on her screen
const num = (n: number) => '#' + String(n * 20 + 4).padStart(4, '0');
const perm = Array.from({ length: N * N }).map((_, i) => i).sort((a, b) => hash(a + 300) - hash(b + 300));      // jumbled order
const Cap: React.FC<{ t: string; o: number; y?: number }> = ({ t, o, y = 1740 }) => <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: o }}><div style={{ padding: '16px 36px', borderRadius: 40, background: '#2a1630', border: '3px solid #ffb454', font: `800 46px/1 ${FONT.ui}`, color: CREAM, textAlign: 'center' }}>{t}</div></div>;
export const Arrive: React.FC = () => { const t = useCurrentFrame() / 30, shake = t < 0.5 ? Math.sin(t * 90) * 7 : 0, ms = Math.round(lp(50, 65, sm((t - 0.2) / 7.0)));
  const tiles = Array.from({ length: N * N }).map((_, n) => {
    const slot = perm[n], jx = BX + (slot % N + 0.5) * TS, jy = BY + (Math.floor(slot / N) + 0.5) * TS, gx = BX + (n % N + 0.5) * TS, gy = BY + (Math.floor(n / N) + 0.5) * TS;
    const ta = 0.15 + hash(n + 5) * 1.7, u = eo((t - ta) / 0.8), a = hash(n + 9) * 6.283, sx = 540 + Math.cos(a) * 1000, sy = 700 + Math.sin(a) * 1100, cx0 = lp(sx, jx, 0.5) + (hash(n + 3) - 0.5) * 500, cy0 = lp(sy, jy, 0.5) - 250 - hash(n + 4) * 300;
    const bz = (p: number, q: number, r: number) => (1 - u) * (1 - u) * p + 2 * (1 - u) * u * q + u * u * r;
    const so = sm((t - (2.4 + hash(n + 11) * 0.5)) / 0.9), x = t < 2.4 ? bz(sx, cx0, jx) : lp(jx, gx, so), y = t < 2.4 ? bz(sy, cy0, jy) : lp(jy, gy, so), rot0 = (hash(n + 6) - 0.5) * 24, rot = t < 2.4 ? lp((hash(n + 7) - 0.5) * 500, rot0, u) : lp(rot0, 0, so);
    const tf = 4.3 + (Math.floor(n / N) * 0.12 + (n % N) * 0.05), fu = sm((t - tf) / 0.5), sc = Math.abs(Math.cos(Math.PI * fu)), back = fu > 0.5;
    const i = Math.floor(n / N), j = n % N, s = back ? TS : TS - 5;
    return <g key={n} transform={`translate(${x} ${y}) rotate(${rot}) scale(${back ? lp(1, 1, 0) * sc : sc || 1} 1)`} opacity={Math.min(1, u * 3)} style={{ filter: back && fu >= 1 ? undefined : 'drop-shadow(0 4px 5px rgba(0,0,0,.45))' }}>
      {!back && <><rect x={-s / 2} y={-s / 2} width={s} height={s} rx={5} fill="url(#gpA)" stroke="#ffe3a0" strokeWidth={1.5} /><rect x={-s / 2} y={-s / 2} width={s} height={s * 0.3} rx={5} fill="#2a1630" opacity={0.92} />
        <text y={-s * 0.12} textAnchor="middle" fill={GOLD2} style={{ font: `800 ${s * 0.19}px ${FONT.mono}` }}>{num(n)}</text><g transform={`translate(${s * 0.28} ${s * 0.02})`}><rect x={-4} y={0} width={8} height={7} rx={1} fill="#7a4a08" /><path d="M -2.6 0 v -3 a 2.6 2.6 0 0 1 5.2 0 v 3" fill="none" stroke="#7a4a08" strokeWidth={1.4} /></g>
        <svg x={-s * 0.4} y={-s * 0.15} width={s * 0.5} height={s * 0.5} viewBox={`${(j * 190) / N} ${(i * 190) / N} ${190 / N} ${190 / N}`} overflow="hidden" opacity={0.9}><DogPhoto /></svg></>}
      {back && <svg x={-TS / 2} y={-TS / 2} width={TS + 0.6} height={TS + 0.6} viewBox={`${(j * 190) / N} ${(i * 190) / N} ${190 / N} ${190 / N}`} overflow="hidden"><DogPhoto /></svg>}
    </g>; });
  return (<AbsoluteFill style={{ background: '#04061a' }}>
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><defs><radialGradient id="ebA" cx="50%" cy="42%" r="75%"><stop offset="0" stopColor="#101a4a" /><stop offset="1" stopColor="#04061a" /></radialGradient><linearGradient id="gpA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd38a" /><stop offset="1" stopColor="#e08a1e" /></linearGradient></defs><rect width={1080} height={1920} fill="url(#ebA)" />{[...Array(50)].map((_, k) => <circle key={k} cx={hash(k) * 1080} cy={hash(k + 40) * 1920} r={1 + hash(k + 3) * 1.4} fill="#cfd8ff" opacity={0.35} />)}</svg>
    <div style={{ position: 'absolute', inset: 0, transform: `translateX(${shake}px)` }}>
      <IPhone v18 left={PL} top={PT} o={1} name="Boyfriend" avatar="#4a7fd0" k={K}>
        <div style={{ position: 'absolute', left: 10, top: 6, background: '#26252a', color: '#fff', borderRadius: '14px 14px 14px 4px', padding: '5px 10px', font: `700 15px ${FONT.ui}` }}>Look at this!</div><div style={{ position: 'absolute', left: 10, top: 52, width: 176, height: 176, borderRadius: 14, background: '#15141c' }} />
        <Compose bottom={8} text={<span style={{ color: '#8e8e93' }}>Message</span>} ready={false} />
      </IPhone>
    </div>
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, transform: `translateX(${shake}px)` }}><rect x={BX - 6} y={BY - 6} width={BW + 12} height={BW + 12} rx={14} fill="none" stroke={t > 6.6 ? '#7dffb0' : '#3a3a4c'} strokeWidth={4} opacity={0.9} />{tiles}</svg>
    <div style={{ position: 'absolute', right: 70, top: 150, display: 'flex', alignItems: 'baseline', gap: 8, font: `800 120px/1 ${FONT.ui}`, color: t > 7.4 ? '#7dffb0' : '#7fd4ff', textShadow: '0 0 30px rgba(127,212,255,.6)' }}>{String(ms).padStart(3, '0')}<span style={{ font: `800 40px ${FONT.ui}` }}>ms</span></div>
    <Cap t="Sorted by number" o={sm((t - 2.7) / 0.4) * (1 - sm((t - 4.0) / 0.3))} /><Cap t="Unlocked" o={sm((t - 4.5) / 0.4) * (1 - sm((t - 7.3) / 0.3))} />
    <Cap t="About 65 ms: faster than a blink" o={sm((t - 7.7) / 0.5)} />
  </AbsoluteFill>); };
