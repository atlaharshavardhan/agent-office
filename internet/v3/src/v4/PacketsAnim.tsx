import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Label } from './PacketsHyd';
/* Part 2, segment B animation: (A) about 2,000 packets gather, the counter runs; (B) one packet comes close, its address and number appear, then the label card. 9:16. */
const GOLD = '#ffb454', GOLD2 = '#ffd38a';
const sm = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); }, eo = (u: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3), lp = (a: number, b: number, u: number) => a + (b - a) * u;
const Bg: React.FC = () => <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><defs><radialGradient id="eb" cx="50%" cy="42%" r="75%"><stop offset="0" stopColor="#101a4a" /><stop offset="1" stopColor="#04061a" /></radialGradient><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd38a" /><stop offset="1" stopColor="#e08a1e" /></linearGradient><linearGradient id="gp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd38a" /><stop offset="1" stopColor="#e8962a" /></linearGradient></defs><rect width={1080} height={1920} fill="url(#eb)" />{[...Array(50)].map((_, k) => <circle key={k} cx={hash(k) * 1080} cy={hash(k + 40) * 1920} r={1 + hash(k + 3) * 1.4} fill="#cfd8ff" opacity={0.35} />)}</svg>;
const Ms: React.FC<{ v: number }> = ({ v }) => <div style={{ position: 'absolute', right: 70, top: 150, display: 'flex', alignItems: 'baseline', gap: 8, font: `800 120px/1 ${FONT.ui}`, color: '#7fd4ff', textShadow: '0 0 30px rgba(127,212,255,.6)' }}>{String(v).padStart(3, '0')}<span style={{ font: `800 40px ${FONT.ui}` }}>ms</span></div>;
const NP = 150;
const Pk: React.FC<{ x: number; y: number; w: number; rot: number; o: number }> = ({ x, y, w, rot, o }) => { const h = w * 0.58; return <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o} style={{ filter: 'drop-shadow(8px 10px 8px rgba(0,0,0,.5))' }}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="url(#gp)" /><rect x={-w / 2} y={-h / 2} width={w} height={h * 0.28} rx={6} fill="#2a1630" opacity={0.85} /></g>; };
const cloud = (k: number) => { const a = hash(k + 100) * 6.283, r = 120 + Math.pow(hash(k + 5), 0.7) * 520; return [540 + Math.cos(a) * r * 1.05, 900 + Math.sin(a) * r * 1.15]; };
export const PACKETS_A_FRAMES = 120;
export const PacketsA: React.FC = () => { const f = useCurrentFrame(), t = f / 30, count = Math.round(2000 * eo((t - 0.2) / 2.4) / 10) * 10;
  return (<AbsoluteFill><Bg /><svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    {Array.from({ length: NP }).map((_, k) => { const d = hash(k) * 1.5, u = eo((t - d) / 1.1), [cx, cy] = cloud(k), a = hash(k + 7) * 6.283, sx = 540 + Math.cos(a) * 1100, sy = 900 + Math.sin(a) * 1300;
      return <Pk key={k} x={lp(sx, cx, u) + Math.sin(t * 1.3 + k) * 4} y={lp(sy, cy, u) + Math.cos(t * 1.1 + k) * 4} w={lp(40, 70 + hash(k + 9) * 90, u)} rot={lp(hash(k + 4) * 300, (hash(k + 4) - 0.5) * 60, u)} o={Math.min(1, u * 2) * (0.5 + 0.5 * hash(k + 2))} />; })}</svg>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 740, textAlign: 'center', font: `900 190px/1 ${FONT.ui}`, color: GOLD, textShadow: '0 0 40px rgba(255,180,84,.55), 0 8px 18px rgba(0,0,0,.7)', opacity: sm(t / 0.5) }}>{count.toLocaleString('en-US')}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 950, textAlign: 'center', font: `800 60px ${FONT.ui}`, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,.8)', opacity: sm(t / 0.5) }}>packets</div>
    <Ms v={2} /></AbsoluteFill>); };
export const PACKETS_B_FRAMES = 150;
export const LabelB: React.FC = () => { const f = useCurrentFrame(), t = f / 30, grow = eo(t / 1.3), up = sm((t - 2.6) / 0.8), rows = [sm((t - 1.4) / 0.5), sm((t - 1.8) / 0.5)], card = sm((t - 3.0) / 0.6);
  const sc = lp(0.18, 1, grow), cy = lp(900, lp(640, 470, 0), up), y0 = lp(820, 440, up), s2 = lp(1, 0.62, up);
  return (<AbsoluteFill><Bg /><svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
    {Array.from({ length: 60 }).map((_, k) => { const [cx, cy2] = cloud(k); return <Pk key={k} x={cx} y={cy2} w={50 + hash(k + 9) * 90} rot={(hash(k + 4) - 0.5) * 60} o={0.22 * (1 - grow * 0.6)} />; })}
    <g transform={`translate(540 ${y0}) scale(${sc * s2})`} style={{ filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.7)) drop-shadow(0 0 50px rgba(255,180,84,.35))' }}>
      <rect x={-430} y={-330} width={860} height={230} rx={34} fill="#18235a" stroke="#4a63c8" strokeWidth={4} />
      <g opacity={rows[0]}><text x={-390} y={-250} fill="#8fb0ff" style={{ font: `700 36px ${FONT.ui}` }}>From</text><text x={-250} y={-250} fill="#fff" style={{ font: `800 44px ${FONT.mono}` }}>49.37.118.202 · Hyderabad</text></g>
      <g opacity={rows[1]}><text x={-390} y={-160} fill="#8fb0ff" style={{ font: `700 36px ${FONT.ui}` }}>To</text><text x={-250} y={-160} fill="#fff" style={{ font: `800 44px ${FONT.mono}` }}>86.14.203.57 · London</text></g>
      <rect x={-430} y={-100} width={860} height={80} fill="#15131c" /><rect x={-430} y={-20} width={860} height={400} rx={34} fill="url(#gp2)" /><text y={240} textAnchor="middle" fill="#3a2008" style={{ font: `900 230px ${FONT.ui}` }}>#1204</text></g>
    <g opacity={card} transform={`translate(0 ${lp(60, 0, card)})`}><Label y={900} /></g>
  </svg><Ms v={3} /></AbsoluteFill>); };
