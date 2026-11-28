import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Ph } from './PacketsHyd';
import { PkD, Bg } from './PacketsAnim';
/* three layouts to replace the ring (stills for Harsh): a STREAM leaving the phone, a FOUNTAIN, a 3D CLOUD */
const lp = (a: number, b: number, u: number) => a + (b - a) * u;
const NN = 187, NC = 11, NR = 17;
const bez = (u: number, p0: number[], p1: number[], p2: number[]) => [(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]];
const Label: React.FC<{ n: string }> = ({ n }) => <div style={{ position: 'absolute', left: 56, top: 330, font: `900 110px/1 ${FONT.ui}`, color: '#ffb454', textShadow: '0 6px 18px rgba(0,0,0,.8)' }}>{n}<div style={{ font: `700 46px ${FONT.ui}`, color: '#fff' }}>packets</div></div>;
export const Layout: React.FC<{ mode: 'stream' | 'fountain' | 'cloud'; t?: number }> = ({ mode, t: tt }) => { const f = useCurrentFrame(), t = tt ?? f / 30;
  const items: React.ReactNode[] = [];
  for (let k = 0; k < NN; k++) { const i = Math.floor(k / NC) % NR, j = k % NC; let x = 0, y = 0, w = 80, rot = 0, o = 1, z = 0;
    if (mode === 'stream') { const u = (k / NN + t * 0.22) % 1, p = bez(u, [540, 1560], [90, 1050], [860, 330]), nx = bez(Math.min(1, u + 0.01), [540, 1560], [90, 1050], [860, 330]), ang = Math.atan2(nx[1] - p[1], nx[0] - p[0]), off = (hash(k + 5) - 0.5) * (50 + 190 * u) ; x = p[0] - Math.sin(ang) * off; y = p[1] + Math.cos(ang) * off; w = lp(120, 46, u); rot = ang * 57.3 + (hash(k + 8) - 0.5) * 30; o = Math.min(1, u * 8) * (1 - Math.max(0, (u - 0.9) * 10)); z = u; }
    else if (mode === 'fountain') { const s = (k / NN * 3 + t * 0.55) % 1, a = -Math.PI / 2 + (hash(k + 3) - 0.5) * 2.1, v = 520 + hash(k + 9) * 520; x = 540 + Math.cos(a) * v * s * 0.62; y = 1480 + Math.sin(a) * v * s * 1.5 + 1300 * s * s; w = lp(70, 120, hash(k + 4)) * (0.6 + 0.6 * s); rot = (hash(k + 6) - 0.5) * 400 * s; o = Math.min(1, s * 10) * (1 - Math.max(0, (s - 0.85) * 6)); z = s; }
    else { const th = hash(k) * 6.283 + t * 0.5, ph = Math.acos(2 * hash(k + 7) - 1), R = 430, X = R * Math.sin(ph) * Math.cos(th), Z = R * Math.sin(ph) * Math.sin(th), Y = R * Math.cos(ph) * 1.1, sc = 1 + Z / 1100; x = 540 + X * sc; y = 900 + Y * sc; w = 96 * sc; rot = Math.atan2(Y, X) * 57.3 + 90; o = 0.45 + 0.55 * (Z + R) / (2 * R); z = Z; }
    items.push({ k, x, y, w, rot, o, z, i, j } as any); }
  const sorted = (items as any[]).sort((a, b) => a.z - b.z);
  return (<AbsoluteFill><Bg />
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><defs><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0b040" /><stop offset="1" stopColor="#c07a14" /></linearGradient></defs>
      {sorted.map((p: any) => <PkD key={p.k} x={p.x} y={p.y} w={p.w} rot={p.rot} o={p.o} i={p.i} j={p.j} />)}</svg>
    {mode !== 'cloud' && <div style={{ position: 'absolute', inset: 0 }}><Ph k={1.0} left={(1080 - 236) / 2} top={1500} photo={false} /></div>}
    <Label n="2,000" /></AbsoluteFill>); };
export const LayStream = () => <Layout mode="stream" />; export const LayFountain = () => <Layout mode="fountain" />; export const LayCloud = () => <Layout mode="cloud" />;
