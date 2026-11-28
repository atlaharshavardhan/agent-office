import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { DogPhoto } from './Story';
/* Part 2, the arrival (Harsh's reference): packets rain down IN THE WRONG ORDER onto an empty numbered board; each lands in the slot with its own number; the counter climbs; 3 packets are missing and asked for again; then it unlocks into the dog photo. 9:16, tilted board. */
const GOLD2 = '#ffd38a', CREAM = '#fff1dc';
const sm = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); }, eo = (u: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3), lp = (a: number, b: number, u: number) => a + (b - a) * u;
export const RAIN_FRAMES = 420;
const C = 28, R = 36, NT = C * R, BX = 40, BY = 250, TW = 1000 / C, TH = 40, BW = C * TW, BH = R * TH, LOST = [14 * 28 + 21, 18 * 28 + 6, 22 * 28 + 14], TL = 6.6;
const label = (n: number) => String(Math.round(n * 2000 / NT) + 1).padStart(4, '0');
const rank = Array.from({ length: NT }).map((_, i) => i).sort((a, b) => hash(a + 700) - hash(b + 700));
const order = new Array(NT); rank.forEach((n, r) => { order[n] = r; });
const Cap: React.FC<{ t: string; o: number }> = ({ t, o }) => <div style={{ position: 'absolute', left: 0, right: 0, top: 1680, display: 'flex', justifyContent: 'center', opacity: o }}><div style={{ padding: '16px 36px', borderRadius: 40, background: '#2a1630', border: '3px solid #ffb454', font: `800 46px/1 ${FONT.ui}`, color: CREAM, textAlign: 'center' }}>{t}</div></div>;
export const ArriveRain: React.FC = () => { const t = useCurrentFrame() / 30, ms = Math.round(lp(50, 65, sm((t - 0.3) / 9.6)));
  let landed = 0; const got: boolean[] = new Array(NT).fill(false); const tiles: React.ReactNode[] = [], slots: React.ReactNode[] = [], marks: React.ReactNode[] = [];
  for (let n = 0; n < NT; n++) {
    const c = n % C, r = Math.floor(n / C), x = BX + (c + 0.5) * TW, y = BY + (r + 0.5) * TH, lost = LOST.indexOf(n) >= 0;
    const ta = lost ? TL + LOST.indexOf(n) * 0.2 : 0.4 + order[n] / NT * 4.6, fall = 0.55, u = (t - ta) / fall;
    slots.push(<g key={'s' + n} transform={`translate(${x} ${y})`}><rect x={-TW / 2 + 1} y={-TH / 2 + 1.5} width={TW - 2} height={TH - 3} rx={3} fill="#0a1236" stroke="#1c2a5c" strokeWidth={1} /><text y={4} textAnchor="middle" fill="#2c3d78" style={{ font: `700 ${TW * 0.3}px ${FONT.mono}` }}>{label(n)}</text></g>);
    if (lost && t > 2.6 && t < TL + 0.9) { const bl = 0.5 + 0.5 * Math.sin(t * 11), fo = sm((t - 2.6) / 0.3) * (1 - sm((t - TL - 0.6) / 0.3)), pr = (t * 1.6) % 1; marks.push(<g key={'x' + n} transform={`translate(${x} ${y})`} opacity={fo}><ellipse rx={TW * (3 + 3 * pr)} ry={TH * (2.6 + 2.6 * pr)} fill="none" stroke="#ff2a3a" strokeWidth={4} opacity={1 - pr} /><ellipse rx={TW * 3} ry={TH * 2.6} fill="#ff2a3a" opacity={0.18 + 0.3 * bl} /><rect x={-TW * 1.5} y={-TH * 1.2} width={TW * 3} height={TH * 2.4} rx={6} fill="#ff1f33" opacity={0.4 + 0.6 * bl} stroke="#ffd6d6" strokeWidth={3} /><text y={TH * 0.35} textAnchor="middle" fill="#fff" style={{ font: `900 ${TW * 0.8}px ${FONT.mono}` }}>{label(n)}</text></g>); }
    if (u <= 0) continue;
    const k = Math.min(1, u), e = k * k, sy = y - (1500 - r * 30) * (1 - e), sx = x + (hash(n + 3) - 0.5) * 220 * (1 - e), rot = (hash(n + 4) - 0.5) * 420 * (1 - e), w = TW * (1 + 0.9 * (1 - e)), h = TH * (1 + 0.9 * (1 - e));
    if (k >= 1) { landed++; got[n] = true; }
    tiles.push(<g key={'p' + n} transform={`translate(${sx} ${sy}) rotate(${rot})`} opacity={Math.min(1, u * 4)}><rect x={-w / 2 + 1} y={-h / 2 + 1} width={w - 2} height={h - 2} rx={3} fill="url(#gpR)" stroke="#ffe3a0" strokeWidth={0.8} /><rect x={-w / 2 + 1} y={-h / 2 + 1} width={w - 2} height={(h - 2) * 0.34} rx={3} fill="#2a1630" opacity={0.92} /><text y={-h * 0.04} textAnchor="middle" fill={GOLD2} style={{ font: `900 ${w * 0.29}px ${FONT.mono}` }}>{label(n)}</text></g>);
  }
  const pct = Math.round(100 * landed / NT), TWd = 230 / C, THd = 230 / R, count = Math.round(2000 * landed / NT), sorted = sm((t - 2.7) / 0.4) * (1 - sm((t - 4.9) / 0.3)), miss = sm((t - 5.2) / 0.4) * (1 - sm((t - 6.9) / 0.3)), unl = sm((t - 7.9) / 0.4) * (1 - sm((t - 10.0) / 0.3)), rv = sm((t - 8.4) / 1.6), fl = sm((t - 7.9) / 1.4);
  return (<AbsoluteFill style={{ background: '#04061a' }}>
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><defs><radialGradient id="ebR" cx="50%" cy="42%" r="75%"><stop offset="0" stopColor="#0e1744" /><stop offset="1" stopColor="#04061a" /></radialGradient><linearGradient id="gpR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd98f" /><stop offset="1" stopColor="#e08a1e" /></linearGradient></defs><rect width={1080} height={1920} fill="url(#ebR)" />{[...Array(40)].map((_, k) => <circle key={k} cx={hash(k) * 1080} cy={hash(k + 40) * 700} r={1 + hash(k + 3) * 1.4} fill="#cfd8ff" opacity={0.35} />)}</svg>
    <div style={{ position: 'absolute', inset: 0, perspective: 1100, perspectiveOrigin: '50% 8%' }}><div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 40%', transform: `translateY(${lp(330, 20, fl)}px) rotateX(${lp(58, 0, fl)}deg) scale(${lp(1, 0.97, fl)})` }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><g>{slots}</g><defs><clipPath id="rvC"><rect x={BX} y={BY + (BH - BW) / 2} width={BW} height={BW * rv} /></clipPath></defs>
        <g opacity={1 - 0.88 * sm((t - 9.8) / 0.8)}>{tiles}</g><g>{marks}</g><g clipPath="url(#rvC)"><svg x={BX} y={BY + (BH - BW) / 2} width={BW} height={BW} viewBox="0 0 190 190"><DogPhoto /></svg></g></svg></div></div>
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: sm((t - 0.5) / 0.4) * (1 - sm((t - 9.4) / 0.4)) }}><svg width={1080} height={460} style={{ position: 'absolute', left: 0, top: 0 }}>
      <rect x={56} y={116} width={238} height={290} rx={16} fill="#0b1230" stroke="#4a63c8" strokeWidth={3} />
      <svg x={60} y={120} width={230} height={230} viewBox="0 0 190 190"><DogPhoto /></svg>
      {Array.from({ length: NT }).map((_, n) => got[n] ? null : <rect key={n} x={60 + (n % C) * TWd - (LOST.indexOf(n) >= 0 ? 3 : 0)} y={120 + Math.floor(n / C) * THd - (LOST.indexOf(n) >= 0 ? 3 : 0)} width={TWd + 0.4 + (LOST.indexOf(n) >= 0 ? 6 : 0)} height={THd + 0.4 + (LOST.indexOf(n) >= 0 ? 6 : 0)} fill={LOST.indexOf(n) >= 0 && t > 2.6 ? '#ff2a3a' : '#070b22'} opacity={LOST.indexOf(n) >= 0 && t > 2.6 ? 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 11)) : 1} />)}
      <text x={175} y={392} textAnchor="middle" fill={pct >= 100 ? '#7dffb0' : '#ffd38a'} style={{ font: `900 40px ${FONT.ui}` }}>PHOTO {pct}%</text></svg></div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 460, textAlign: 'center', font: `900 170px/1 ${FONT.ui}`, color: t < TL + 0.7 && count > 1000 && t > 4.9 ? '#ff6a6a' : t >= TL + 0.7 ? '#7dffb0' : '#fff', textShadow: '0 6px 18px rgba(0,0,0,.8)', opacity: 1 - sm((t - 9.4) / 0.4) }}>{count.toLocaleString('en-US')}<span style={{ font: `700 70px ${FONT.ui}`, color: '#cfd8ff' }}> / 2,000</span><div style={{ font: `700 56px ${FONT.ui}`, color: '#fff' }}>packets</div></div>
    <div style={{ position: 'absolute', right: 70, top: 150, display: 'flex', alignItems: 'baseline', gap: 8, font: `800 120px/1 ${FONT.ui}`, color: t > 10.3 ? '#7dffb0' : '#7fd4ff', textShadow: '0 0 30px rgba(127,212,255,.6)' }}>{String(ms).padStart(3, '0')}<span style={{ font: `800 40px ${FONT.ui}` }}>ms</span></div>
    <Cap t="They arrive in the wrong order" o={sm((t - 0.8) / 0.4) * (1 - sm((t - 2.0) / 0.3))} /><Cap t="Sorted by number" o={sorted} /><Cap t="3 packets missing. Asking again" o={miss} /><div style={{ position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', font: `900 120px/1 ${FONT.ui}`, color: '#ff4a5a', textShadow: '0 0 36px rgba(255,42,58,.9), 0 6px 14px rgba(0,0,0,.8)', opacity: miss * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 11))) }}>3 MISSING</div><Cap t="Unlocked" o={unl} /><Cap t="About 65 ms: faster than a blink" o={sm((t - 10.5) / 0.5)} />
  </AbsoluteFill>); };
