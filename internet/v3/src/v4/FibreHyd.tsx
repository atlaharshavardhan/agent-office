import React from 'react';
import { AbsoluteFill } from 'remotion';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
/* Part 2, after the tower box: the light goes into a glass cable under the street (STILL STORYBOARD, 9:16). Beats: 2 the cable under the ground, 3 the light enters the cable, 4 inside, the light races. */
const GOLD = '#ffb454', GOLD2 = '#ffd38a', CREAM = '#fff1dc';
const Ms: React.FC<{ v: string }> = ({ v }) => null;
const Cap: React.FC<{ t: string; y?: number }> = ({ t, y = 1640 }) => <div style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center' }}><div style={{ padding: '16px 36px', borderRadius: 40, background: '#2a1630', border: '3px solid #ffb454', font: `800 46px/1 ${FONT.ui}`, color: CREAM, textAlign: 'center' }}>{t}</div></div>;
const Night: React.FC<{ h: number }> = ({ h }) => (<g><defs><linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070a22" /><stop offset="1" stopColor="#1a2250" /></linearGradient></defs><rect width={1080} height={h} fill="url(#fsky)" />
  {[...Array(60)].map((_, k) => <circle key={k} cx={hash(k) * 1080} cy={hash(k + 40) * h * 0.6} r={1 + hash(k + 3) * 1.5} fill="#e6ebff" opacity={0.5} />)}
  {[...Array(12)].map((_, b) => { const w = 110 + hash(b) * 90, x = b * 92 - 30, bh = 220 + hash(b + 5) * 330; return <g key={b}><rect x={x} y={h - bh} width={w} height={bh} fill={b % 2 ? '#10153a' : '#0c1030'} />{[...Array(Math.floor(bh / 52))].map((_, r) => [0, 1, 2].map((c) => hash(b * 99 + r * 7 + c) > 0.55 && <rect key={r + '-' + c} x={x + 14 + c * 30} y={h - bh + 20 + r * 46} width={16} height={24} fill={hash(b + r + c) > 0.7 ? '#ffd38a' : '#7fa8ff'} opacity={0.8} />))}</g>; })}</g>);
const Scene: React.FC<{ beat: number }> = ({ beat }) => (<AbsoluteFill style={{ background: '#04061a' }}>
  <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    {beat === 2 && <g>
      <Night h={640} />
      <rect y={640} width={1080} height={1280} fill="#14122e" /><rect y={640} width={1080} height={26} fill="#2a2a50" /><rect y={640} width={1080} height={6} fill="#6a78c8" opacity={0.7} />
      {[...Array(220)].map((_, k) => <ellipse key={k} cx={hash(k) * 1080} cy={690 + hash(k + 9) * 330} rx={10 + hash(k + 3) * 22} ry={7 + hash(k + 5) * 14} fill={hash(k + 1) > 0.5 ? '#2a2f66' : '#1c2150'} stroke="#3a4086" strokeWidth={2} />)}
      <rect y={1040} width={1080} height={880} fill="#0b0b22" />
      <defs><linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9e6ff" stopOpacity={0.55} /><stop offset="0.5" stopColor="#6aa8e8" stopOpacity={0.25} /><stop offset="1" stopColor="#c9e6ff" stopOpacity={0.45} /></linearGradient><radialGradient id="pu"><stop offset="0" stopColor="#fff" /><stop offset="0.4" stopColor="#ffd38a" /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient></defs>
      <g transform="translate(0 -60) rotate(-2 540 1180)"><rect x={-40} y={1130} width={1160} height={110} rx={55} fill="#0a1030" stroke="#9fd0ff" strokeWidth={5} /><rect x={-40} y={1130} width={1160} height={110} rx={55} fill="url(#gl)" />
        {[0, 1, 2, 3, 4, 5].map((k) => <rect key={k} x={60 + k * 190} y={1160} width={70 + (k % 3) * 40} height={14} rx={7} fill={k % 2 ? '#7fd4ff' : '#ffe3a0'} opacity={0.9} />)}
        <circle cx={700} cy={1185} r={70} fill="url(#pu)" /><circle cx={700} cy={1185} r={14} fill="#fff" /></g>
      <g transform="translate(130 1330)"><rect x={-30} y={-52} width={560} height={78} rx={18} fill="#0b0f2e" opacity={0.9} stroke="#9fd0ff" strokeWidth={3} /><text x={250} y={4} textAnchor="middle" fill="#fff" style={{ font: `800 46px ${FONT.ui}` }}>Glass cable</text><line x1={190} y1={-52} x2={260} y2={-110} stroke="#9fd0ff" strokeWidth={3} /></g></g>}
    {beat === 3 && <g>
      <rect width={1080} height={1920} fill="#050818" />
      <defs><linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity={0.05} /><stop offset="0.8" stopColor="#ffe9b0" stopOpacity={0.85} /><stop offset="1" stopColor="#fff" stopOpacity={1} /></linearGradient><radialGradient id="hot"><stop offset="0" stopColor="#fff" /><stop offset="0.35" stopColor="#ffe3a0" stopOpacity={0.9} /><stop offset="1" stopColor="#ffb454" stopOpacity={0} /></radialGradient></defs>
      {[...Array(60)].map((_, k) => <line key={k} x1={0} y1={420 + hash(k) * 1080} x2={640} y2={930 + hash(k + 4) * 60} stroke="#ffe9b0" strokeWidth={1 + hash(k + 8) * 2} opacity={0.12 + hash(k + 2) * 0.35} />)}
      <polygon points="0,420 640,930 640,1010 0,1500" fill="url(#beam)" opacity={0.85} />
      <g transform="translate(640 970)"><rect x={0} y={-80} width={460} height={160} rx={30} fill="#0a1030" stroke="#7fb8ff" strokeWidth={6} /><rect x={0} y={-80} width={460} height={160} rx={30} fill="url(#gl)" opacity={0.0} />
        <circle r={150} fill="url(#hot)" /><circle r={86} fill="none" stroke="#fff" strokeWidth={4} opacity={0.8} /><circle r={130} fill="none" stroke="#fff" strokeWidth={3} opacity={0.45} /><circle r={26} fill="#fff" /></g>
      <g transform="translate(540 560)"><rect x={-300} y={-48} width={600} height={96} rx={20} fill="#0b0f2e" opacity={0.9} stroke="#9fd0ff" strokeWidth={3} /><text y={16} textAnchor="middle" fill="#fff" style={{ font: `800 46px ${FONT.ui}` }}>Light goes into the glass</text></g></g>}
    {beat === 4 && <g>
      <rect width={1080} height={1920} fill="#04061a" />
      <defs><radialGradient id="core"><stop offset="0" stopColor="#fff" /><stop offset="0.3" stopColor="#ffe3a0" /><stop offset="1" stopColor="#b8801e" /></radialGradient></defs>
      {[...Array(150)].map((_, k) => { const a = hash(k) * 6.283, r0 = 90 + hash(k + 3) * 240, r1 = r0 + 160 + hash(k + 8) * 700, c = hash(k + 5) > 0.5 ? '#ffc060' : '#7fa4ff'; return <line key={k} x1={540 + Math.cos(a) * r0} y1={940 + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={940 + Math.sin(a) * r1} stroke={c} strokeWidth={2 + hash(k + 6) * 5} strokeLinecap="round" opacity={0.35 + hash(k + 2) * 0.6} />; })}
      <circle cx={540} cy={940} r={150} fill="none" stroke="#fff" strokeWidth={3} opacity={0.5} /><circle cx={540} cy={940} r={105} fill="none" stroke="#fff" strokeWidth={4} opacity={0.7} /><circle cx={540} cy={940} r={64} fill="url(#core)" /></g>}
  </svg>
  {beat === 2 && <><Ms v="009" /><Cap t="A glass cable under the street" y={1560} /></>}
  {beat === 3 && <><Ms v="009" /><Cap t="The box sends the light into the cable" /></>}
  {beat === 4 && <><Ms v="009" /><Cap t="Inside the glass, light races" /></>}
</AbsoluteFill>);
export const FbB2 = () => <Scene beat={2} />; export const FbB3 = () => <Scene beat={3} />; export const FbB4 = () => <Scene beat={4} />;
