import React, { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AbsoluteFill, delayRender, continueRender } from 'remotion';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { DogPhoto } from './Story';
/* Part 2, after the hook: the photo breaks into blocks, becomes ones and zeros, is ENCRYPTED, a zoom lens finds nothing, then the gold packets and the address label (STILL STORYBOARD, 9:16). The tower comes later. */
const GOLD = '#ffb454', GOLD2 = '#ffd38a', INK = '#2a1630', CREAM = '#fff1dc';
const Bg: React.FC = () => <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><defs><radialGradient id="eb" cx="50%" cy="42%" r="75%"><stop offset="0" stopColor="#101a4a" /><stop offset="1" stopColor="#04061a" /></radialGradient></defs><rect width={1080} height={1920} fill="url(#eb)" />{[...Array(50)].map((_, k) => <circle key={k} cx={hash(k) * 1080} cy={hash(k + 40) * 1920} r={1 + hash(k + 3) * 1.4} fill="#cfd8ff" opacity={0.35} />)}</svg>;
const Ms: React.FC<{ v: string }> = ({ v }) => <div style={{ position: 'absolute', right: 70, top: 150, display: 'flex', alignItems: 'baseline', gap: 8, font: `800 120px/1 ${FONT.ui}`, color: '#7fd4ff', textShadow: '0 0 30px rgba(127,212,255,.6)' }}>{v}<span style={{ font: `800 40px ${FONT.ui}` }}>ms</span></div>;
const Cap: React.FC<{ t: string; y?: number }> = ({ t, y = 1640 }) => <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center' }}><div style={{ padding: '16px 36px', borderRadius: 40, background: '#2a1630', border: '3px solid #ffb454', font: `800 46px/1 ${FONT.ui}`, color: CREAM, textAlign: 'center' }}>{t}</div></div>;
/* a dog block: a piece of the photo as a solid 3D block */
const Block: React.FC<{ x: number; y: number; s: number; rot: number; i: number; j: number; n: number }> = ({ x, y, s, rot, i, j, n }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} style={{ filter: 'drop-shadow(14px 20px 14px rgba(0,0,0,.65))' }}>
    <rect x={-s / 2 + 10} y={-s / 2 + 12} width={s} height={s} rx={6} fill="#3a2418" />
    <svg x={-s / 2} y={-s / 2} width={s} height={s} viewBox={`${(j * 190) / n} ${(i * 190) / n} ${190 / n} ${190 / n}`} overflow="hidden"><DogPhoto /></svg>
    <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={4} fill="none" stroke="#1a0f08" strokeWidth={3} />
  </g>);
const Bits: React.FC<{ x: number; y: number; s: number; seed: number; lit: number }> = ({ x, y, s, seed, lit }) => (
  <g transform={`translate(${x} ${y})`}><rect x={-s / 2} y={-s / 2} width={s} height={s} rx={8} fill="#1a1710" stroke="#4a3a1a" strokeWidth={3} />
    {[0, 1].map((r) => [0, 1, 2, 3].map((c) => { const b = hash(seed * 13 + r * 5 + c) > 0.5 ? '1' : '0'; return <text key={r + '-' + c} x={-s * 0.33 + c * s * 0.22} y={-s * 0.06 + r * s * 0.34} textAnchor="middle" fill={GOLD2} opacity={0.25 + 0.75 * lit * (b === '1' ? 1 : 0.5)} style={{ font: `800 ${s * 0.3}px ${FONT.mono}` }}>{b}</text>; }))}</g>);
const COLS = 40, ROWS = 54, CW = 27, CH = 35;
const Grid: React.FC<{ scramble?: boolean; mask?: boolean; seed?: number }> = ({ scramble, mask, seed = 1 }) => {
  const chars = '#%@&$?*+=<>/\\|~^';
  return (<g>
    {mask && <defs><mask id="dogmask" maskUnits="userSpaceOnUse" x={0} y={0} width={COLS * CW} height={ROWS * CH}><rect width={COLS * CW} height={ROWS * CH} fill="#000" /><svg x={60} y={150} width={COLS * CW - 120} height={COLS * CW - 120} viewBox="0 0 190 190"><DogPhoto /></svg></mask></defs>}
    <g mask={mask ? 'url(#dogmask)' : undefined}>{Array.from({ length: ROWS }).map((_, r) => Array.from({ length: COLS }).map((_, c) => { const h = hash(r * 97 + c * 13 + seed * 5); const ch = scramble ? chars[Math.floor(h * chars.length)] : h > 0.5 ? '1' : '0'; return <text key={r + '-' + c} x={c * CW + 6} y={r * CH + 28} fill={scramble ? (h > 0.5 ? '#7fd4ff' : '#c58bff') : GOLD2} opacity={scramble ? 0.45 + 0.4 * hash(r + c * 7) : 0.9} style={{ font: `800 24px ${FONT.mono}` }}>{ch}</text>; }))}</g>
  </g>);
};
/* the dog drawn only with ones and zeros: the photo is sampled on a grid, bright where the dog is, dark on the background */
const DogBits: React.FC = () => {
  const G = 52, [cells, setCells] = useState<number[][] | null>(null), [h] = useState(() => delayRender('dog bits'));
  useEffect(() => { const url = URL.createObjectURL(new Blob([renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width={190} height={190} viewBox="0 0 190 190"><DogPhoto /></svg>)], { type: 'image/svg+xml' })), im = new Image();
    im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = G; const g = c.getContext('2d')!; g.drawImage(im, 22, 28, 146, 146, 0, 0, G, G); const d = g.getImageData(0, 0, G, G).data, out: number[][] = [];
      for (let k = 0; k < G * G; k++) { const r = d[k * 4], gg = d[k * 4 + 1], b = d[k * 4 + 2], y = (k / G) | 0, bgR = 251 - (y / G) * 9, bgG = 232 - (y / G) * 48, bgB = 200 - (y / G) * 62, dist = Math.hypot(r - bgR, gg - bgG, b - bgB) / 255; out.push([Math.min(1, dist * 7), r, gg, b]); }
      setCells(out); URL.revokeObjectURL(url); continueRender(h); };
    im.onerror = () => continueRender(h); im.src = url; }, []);
  const cw = 20;
  return (<g transform={`translate(${(1080 - G * cw) / 2} 420)`}><defs><clipPath id="dbc"><rect width={G * cw} height={G * cw} /></clipPath></defs><g clipPath="url(#dbc)" opacity={0.26}><g transform={`scale(${(G * cw) / 146}) translate(-22 -28)`}><DogPhoto /></g></g>{cells && cells.map(([v, cr, cg, cb], k) => { const c = k % G, r = (k / G) | 0, b = hash(k * 7 + 3) > 0.5 ? '1' : '0', lit = v > 0.35; return <text key={k} x={c * cw + cw / 2} y={r * cw + 22} textAnchor="middle" fill={lit ? `rgb(${Math.min(255, cr * 1.15 + 20)},${Math.min(255, cg * 1.1 + 15)},${Math.min(255, cb * 1.0 + 10)})` : '#5a6aa8'} opacity={lit ? 1 : 0.18} style={{ font: `800 ${cw * 0.9}px ${FONT.mono}` }}>{b}</text>; })}</g>);
};
const Lock: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (<g transform={`translate(${x} ${y}) scale(${k})`} style={{ filter: 'drop-shadow(0 12px 22px rgba(0,0,0,.6)) drop-shadow(0 0 30px rgba(127,212,255,.6))' }}>
  <path d="M -62 -40 L -62 -110 A 62 62 0 0 1 62 -110 L 62 -40" fill="none" stroke="#c9d6f0" strokeWidth={26} strokeLinecap="round" />
  <rect x={-110} y={-50} width={220} height={190} rx={30} fill="#2a7fe0" stroke="#9fd0ff" strokeWidth={6} /><circle cx={0} cy={30} r={26} fill="#0a2a5a" /><rect x={-9} y={40} width={18} height={50} rx={9} fill="#0a2a5a" /></g>);
const Scene: React.FC<{ beat: number }> = ({ beat }) => {
  const els: React.ReactNode[] = [];
  if (beat === 1) { const n = 6, s = 118; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const k = i * n + j, dx = (j - 2.5), dy = (i - 2.5), d = Math.hypot(dx, dy) + 0.4; els.push(<Block key={k} x={540 + dx * (s + 14) * (1 + 0.07 * d) + (hash(k) - 0.5) * 36} y={880 + dy * (s + 14) * (1 + 0.07 * d) + (hash(k + 3) - 0.5) * 36} s={s - 6} rot={(hash(k + 7) - 0.5) * 50 * Math.min(1, d / 2)} i={i} j={j} n={n} />); } }
  if (beat === 2) { for (let r = 0; r < 9; r++) { const sc = 0.8 + r * 0.085, cols = 8; for (let c = 0; c < cols; c++) els.push(<Bits key={r + '-' + c} x={540 + (c - 3.5) * 150 * sc} y={330 + r * 118 * sc * 1.05 + r * r * 4} s={128 * sc} seed={r * 11 + c} lit={hash(r * 3 + c) > 0.45 ? 1 : 0.3} />); } }
  const lens = beat === 5;
  return (<AbsoluteFill><Bg />
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
      {beat === 1 && <g>{els}</g>}
      {beat === 2 && <g>{els}</g>}
      {beat === 3 && <DogBits />}
      {beat === 4 && <><g transform="translate(0 150)" opacity={0.5}><Grid scramble seed={4} /></g><Lock x={540} y={900} k={2.3} /></>}
      {beat === 5 && <>
        <g transform="translate(0 150)" opacity={0.55}><Grid scramble seed={4} /></g>
        <defs><clipPath id="lensClip"><circle cx={600} cy={880} r={300} /></clipPath><radialGradient id="lensG" cx="35%" cy="30%"><stop offset="0" stopColor="#fff" stopOpacity={0.35} /><stop offset="0.5" stopColor="#9fd0ff" stopOpacity={0.08} /><stop offset="1" stopColor="#9fd0ff" stopOpacity={0.15} /></radialGradient></defs>
        <circle cx={600} cy={880} r={300} fill="#050816" />
        <g clipPath="url(#lensClip)"><g transform="translate(600 880) scale(2.3) translate(-600 -880) translate(0 150)" opacity={0.95}><Grid scramble seed={9} /></g></g>
        <circle cx={600} cy={880} r={300} fill="url(#lensG)" /><circle cx={600} cy={880} r={300} fill="none" stroke="#c9d6f0" strokeWidth={26} /><circle cx={600} cy={880} r={314} fill="none" stroke="#6a7a9a" strokeWidth={6} />
        <defs><linearGradient id="hood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a2e70" /><stop offset="1" stopColor="#120e28" /></linearGradient><radialGradient id="scr" cx="50%" cy="0%" r="90%"><stop offset="0" stopColor="#3dffc0" stopOpacity={0.35} /><stop offset="1" stopColor="#3dffc0" stopOpacity={0} /></radialGradient></defs>
        <g transform="translate(540 1340)">
          <path d="M -330 560 Q -330 190 -150 140 L 150 140 Q 330 190 330 560 Z" fill="url(#hood)" stroke="#5a4aa0" strokeWidth={4} />
          <path d="M -150 140 Q 0 260 150 140" fill="none" stroke="#0b0820" strokeWidth={10} opacity={0.6} /><line x1={-50} y1={230} x2={-56} y2={330} stroke="#cfd6ff" strokeWidth={6} strokeLinecap="round" /><line x1={50} y1={230} x2={56} y2={330} stroke="#cfd6ff" strokeWidth={6} strokeLinecap="round" />
          <path d="M -165 150 Q -190 -150 0 -190 Q 190 -150 165 150 Q 0 230 -165 150 Z" fill="url(#hood)" stroke="#6a5ab8" strokeWidth={5} />
          <path d="M -118 130 Q -134 -110 0 -140 Q 134 -110 118 130 Q 0 190 -118 130 Z" fill="#04050e" />
          <ellipse cx={0} cy={60} rx={140} ry={110} fill="url(#scr)" />
          <path d="M -80 -30 L -30 -14 L -30 6 L -84 -6 Z" fill="#7fffd4" /><path d="M 80 -30 L 30 -14 L 30 6 L 84 -6 Z" fill="#7fffd4" /><circle cx={-48} cy={-6} r={5} fill="#04050e" /><circle cx={48} cy={-6} r={5} fill="#04050e" />
          <text x={-250} y={160} textAnchor="middle" fill="#7fffd4" style={{ font: `800 34px ${FONT.mono}`, letterSpacing: '0.18em' }}>HACKER</text></g>
        <g transform="translate(540 1640)"><path d="M -300 20 L 300 20 L 340 150 L -340 150 Z" fill="#2a2a44" stroke="#6a6a9a" strokeWidth={4} /><rect x={-290} y={-250} width={580} height={280} rx={16} fill="#0a1020" stroke="#8a8ab8" strokeWidth={6} />
          <rect x={-272} y={-232} width={544} height={244} rx={8} fill="#04140f" /><text y={-130} textAnchor="middle" fill="#5fffb0" style={{ font: `800 62px ${FONT.mono}` }}>? ? ? ? ? ?</text><text y={-50} textAnchor="middle" fill="#5fffb0" opacity={0.7} style={{ font: `700 34px ${FONT.mono}` }}>data: unreadable</text><rect x={-190} y={-20} width={380} height={22} rx={4} fill="#ff5a5a" opacity={0.0} /></g>
        <line x1={780} y1={1130} x2={760} y2={1420} stroke="#c9d6f0" strokeWidth={46} strokeLinecap="round" /><line x1={780} y1={1130} x2={760} y2={1420} stroke="#4a3a6a" strokeWidth={22} strokeLinecap="round" /><g transform="translate(748 1440)"><rect x={-26} y={-20} width={52} height={50} rx={20} fill="#c68a5a" /><rect x={-22} y={-26} width={14} height={24} rx={7} fill="#d29a6a" /><rect x={-4} y={-28} width={14} height={26} rx={7} fill="#d29a6a" /><rect x={14} y={-24} width={12} height={22} rx={6} fill="#d29a6a" /></g>
        <g transform="translate(600 880)"><rect x={-250} y={-48} width={500} height={96} rx={20} fill="#0b0f2e" opacity={0.88} stroke="#ff7a7a" strokeWidth={4} /><text y={16} textAnchor="middle" fill="#ff9a9a" style={{ font: `900 54px ${FONT.ui}`, letterSpacing: '0.04em' }}>NOTHING TO SEE</text></g></>}
      {beat === 6 && <g>{Array.from({ length: 130 }).map((_, k) => { const x = hash(k) * 1080, y = 160 + hash(k + 5) * 1500, w = 70 + hash(k + 9) * 130, h = w * 0.58, o = 0.35 + 0.65 * hash(k + 2); return <g key={k} transform={`translate(${x} ${y}) rotate(${(hash(k + 4) - 0.5) * 70})`} opacity={o} style={{ filter: 'drop-shadow(8px 10px 8px rgba(0,0,0,.5))' }}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="url(#gp)" /><rect x={-w / 2} y={-h / 2} width={w} height={h * 0.28} rx={6} fill="#2a1630" opacity={0.85} /></g>; })}
        <defs><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd38a" /><stop offset="1" stopColor="#e08a1e" /></linearGradient></defs></g>}
      {beat === 7 && <g>{Array.from({ length: 40 }).map((_, k) => { const x = hash(k) * 1080, y = 100 + hash(k + 5) * 1700, w = 90 + hash(k + 9) * 120, h = w * 0.58; return <g key={k} transform={`translate(${x} ${y}) rotate(${(hash(k + 4) - 0.5) * 50})`} opacity={0.22}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill={GOLD} /></g>; })}
        <g transform="translate(540 820)" style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.7)) drop-shadow(0 0 50px rgba(255,180,84,.35))' }}>
          <rect x={-430} y={-330} width={860} height={230} rx={34} fill="#18235a" stroke="#4a63c8" strokeWidth={4} />
          <text x={-390} y={-250} fill="#8fb0ff" style={{ font: `700 36px ${FONT.ui}` }}>From</text><text x={-250} y={-250} fill="#fff" style={{ font: `800 44px ${FONT.mono}` }}>49.37.118.202 · Hyderabad</text>
          <text x={-390} y={-160} fill="#8fb0ff" style={{ font: `700 36px ${FONT.ui}` }}>To</text><text x={-250} y={-160} fill="#fff" style={{ font: `800 44px ${FONT.mono}` }}>86.14.203.57 · London</text>
          <rect x={-430} y={-100} width={860} height={80} fill="#15131c" /><rect x={-430} y={-20} width={860} height={400} rx={34} fill="url(#gp2)" /><rect x={-430} y={-20} width={860} height={60} fill="#e08a1e" opacity={0.0} />
          <defs><linearGradient id="gp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd38a" /><stop offset="1" stopColor="#e8962a" /></linearGradient></defs>
          <text y={240} textAnchor="middle" fill="#3a2008" style={{ font: `900 230px ${FONT.ui}` }}>#1204</text></g></g>}
    </svg>
    {beat === 1 && <><Ms v="000" /><Cap t="The photo breaks into blocks" /></>}
    {beat === 2 && <><Ms v="001" /><Cap t="Each block is only ones and zeros" /></>}
    {beat === 3 && <><Ms v="001" /><Cap t="The dog, made of ones and zeros" /></>}
    {beat === 4 && <><Ms v="001" /><Cap t="Then it is encrypted" /></>}
    {beat === 5 && <><Ms v="001" /><Cap t="A hacker looks closely: he sees nothing" y={300} /></>}
    {beat === 6 && <><Ms v="002" /><div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', font: `900 190px/1 ${FONT.ui}`, color: GOLD, textShadow: '0 0 40px rgba(255,180,84,.55), 0 8px 18px rgba(0,0,0,.7)' }}>2,000</div><div style={{ position: 'absolute', left: 0, right: 0, top: 850, textAlign: 'center', font: `800 60px ${FONT.ui}`, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,.8)' }}>packets</div><Cap t="Into about 2,000 small packets" /></>}
    {beat === 7 && <><Ms v="003" /><Cap t="Each packet: an address and its number" /></>}
  </AbsoluteFill>);
};
export const EncB1 = () => <Scene beat={1} />; export const EncB2 = () => <Scene beat={2} />; export const EncB3 = () => <Scene beat={3} />; export const EncB4 = () => <Scene beat={4} />; export const EncB5 = () => <Scene beat={5} />; export const EncB6 = () => <Scene beat={6} />; export const EncB7 = () => <Scene beat={7} />;
