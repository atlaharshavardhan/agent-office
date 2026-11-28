import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { DogPhoto } from './Story';
import { City, Ph } from './PacketsHyd';
import { Bg, Ms, Block, Bits, Grid, Lock, DogBits } from './Encrypt';
/* Part 2 video, steps 1 to 6: tap send, zoom into the photo, it breaks into blocks, ones and zeros, the dog in ones and zeros, the lock, the magnifier. 9:16, 30 fps. */
const SP = 1.5;   // v2: everything runs 1.5x faster
const sm = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); }, eo = (u: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3), lp = (a: number, b: number, u: number) => a + (b - a) * u;
const SVG: React.FC<{ children: React.ReactNode }> = ({ children }) => <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>{children}</svg>;
export const S1_FRAMES = 107;
export const S1Phone: React.FC = () => { const t = useCurrentFrame() / 30 * SP, u = eo((t - 2.0) / 2.5), k = lp(2.3, 5.09, u), cy = lp(816, 880, u), press = t > 1.2 && t < 1.7, fade = sm((t - 4.1) / 0.6);
  return (<AbsoluteFill><Bg /><div style={{ position: 'absolute', inset: 0, opacity: 1 - sm((t - 2.0) / 2.0) }}><SVG><City /></SVG></div>
    <Ph k={k} left={540 - 133 * k} top={cy - 246 * k} press={press} />
    <div style={{ position: 'absolute', inset: 0, opacity: fade }}><Bg /></div>
    <SVG><svg x={92} y={432} width={896} height={896} viewBox="0 0 190 190" opacity={fade}><DogPhoto /></svg></SVG><Ms v="000" /></AbsoluteFill>); };
const N = 14, PITCH = 64;
export const blockAt = (i: number, j: number, u: number, t = 0) => { const k = i * N + j, dx = j - 6.5, dy = i - 6.5, d = Math.hypot(dx, dy) + 0.4; const x1 = 540 + dx * 64 * (1 + 0.012 * d) + (hash(k) - 0.5) * 26, y1 = 880 + dy * 64 * (1 + 0.012 * d) + (hash(k + 3) - 0.5) * 26, r1 = (hash(k + 7) - 0.5) * 60 * Math.min(1, d / 3);
  return { x: lp(540 + dx * PITCH, x1, u) + (Math.sin(t * 2.3 + k * 1.7) * 22) * u, y: lp(880 + dy * PITCH, y1, u) + (Math.cos(t * 2.0 + k * 1.3) * 22) * u, rot: lp(0, r1, u) + Math.sin(t * 1.9 + k) * 22 * u, s: lp(PITCH, 52, u) }; };
export const S2_FRAMES = 60;
export const S2Break: React.FC = () => { const t = useCurrentFrame() / 30 * SP;
  return (<AbsoluteFill><Bg /><SVG>{Array.from({ length: N * N }).map((_, k) => { const i = Math.floor(k / N), j = k % N, u = eo((t - 0.2 - hash(k + 50) * 0.5) / 1.5), b = blockAt(i, j, u, t); return <Block key={k} x={b.x} y={b.y} s={b.s} rot={b.rot} i={i} j={j} n={N} />; })}</SVG><Ms v="000" /></AbsoluteFill>); };
const Wall: React.FC<{ t: number; o: number; sc: number }> = ({ t, o, sc }) => (<g opacity={o} transform={`translate(540 960) scale(${sc}) translate(-540 -960)`}>{Array.from({ length: 9 }).map((_, r) => { const s = 0.8 + r * 0.085; return Array.from({ length: 8 }).map((_, c) => <Bits key={r + '-' + c} x={540 + (c - 3.5) * 150 * s} y={330 + r * 118 * s * 1.05 + r * r * 4} s={128 * s} seed={r * 11 + c + Math.floor(t * 6) * 7} lit={hash(r * 3 + c + Math.floor(t * 4)) > 0.45 ? 1 : 0.3} />); })}</g>);
export const S3_FRAMES = 55;
export const S3Bits: React.FC = () => { const t = useCurrentFrame() / 30 * SP, u = sm((t - 0.2) / 1.0);
  return (<AbsoluteFill><Bg /><SVG>
    <g opacity={1 - u}>{Array.from({ length: N * N }).map((_, k) => { const i = Math.floor(k / N), j = k % N, b = blockAt(i, j, 1, t); return <Block key={k} x={b.x} y={b.y} s={b.s * (1 - 0.3 * u)} rot={b.rot} i={i} j={j} n={N} />; })}</g>
    <Wall t={t} o={u} sc={lp(0.82, 1, u)} /></SVG><Ms v="001" /></AbsoluteFill>); };
export const S4_FRAMES = 60;
export const S4Dog: React.FC = () => { const t = useCurrentFrame() / 30 * SP, u = sm(t / 1.1), tb = t + 2.95;   // the floating blocks fade into the dog drawn in ones and zeros (the grid of bit blocks was dropped, Harsh)
  return (<AbsoluteFill><Bg /><SVG>
    <g opacity={1 - u}>{Array.from({ length: N * N }).map((_, k) => { const i = Math.floor(k / N), j = k % N, b = blockAt(i, j, 1, tb); return <Block key={k} x={540 + (b.x - 540) * (1 + 0.25 * u)} y={880 + (b.y - 880) * (1 + 0.25 * u)} s={b.s * (1 - 0.4 * u)} rot={b.rot} i={i} j={j} n={N} />; })}</g>
    <DogBits reveal={sm((t - 0.3) / 1.3)} tick={Math.floor(t * 30)} o={sm((t - 0.1) / 0.5)} /></SVG><Ms v="001" /></AbsoluteFill>); };
export const S5_FRAMES = 59;
export const S5Lock: React.FC = () => { const t = useCurrentFrame() / 30 * SP, p = sm((t - 0.1) / 1.2), pop = t < 1.1 ? 0 : t < 1.4 ? lp(0, 1.18, (t - 1.1) / 0.3) : lp(1.18, 1, Math.min(1, (t - 1.4) / 0.3));
  return (<AbsoluteFill><Bg /><SVG><g opacity={0.5 * sm((t - 0.6) / 1.0)} transform="translate(0 150)"><Grid scramble seed={4} /></g><DogBits p={p} tick={Math.floor(t * 30)} o={1 - 0.4 * sm((t - 0.8) / 0.8)} />
    {pop > 0 && <g opacity={sm((t - 1.1) / 0.2)}><Lock x={540} y={900} k={2.3 * pop} /><circle cx={540} cy={900} r={lp(120, 520, Math.min(1, (t - 1.4) / 0.9))} fill="none" stroke="#7fd4ff" strokeWidth={6} opacity={Math.max(0, 1 - (t - 1.4) / 0.9) * (t > 1.4 ? 1 : 0)} /></g>}</SVG><Ms v="001" /></AbsoluteFill>); };
export const S6_FRAMES = 72;
export const S6Lens: React.FC = () => { const t = useCurrentFrame() / 30 * SP, ex = eo((t - 0.2) / 1.2), lx = lp(-260, 600, ex) + Math.sin(t * 1.4) * 8, ly = 880 + Math.sin(t * 1.1) * 8, seed = 4 + Math.floor(t * 2) * 5, txt = sm((t - 1.7) / 0.6);
  return (<AbsoluteFill><Bg /><SVG>
    <g opacity={0.55} transform="translate(0 150)"><Grid scramble seed={seed} /></g>
    <defs><clipPath id="lensClip"><circle cx={lx} cy={ly} r={296} /></clipPath>
      <radialGradient id="lensG" cx="32%" cy="26%" r="85%"><stop offset="0" stopColor="#fff" stopOpacity={0.4} /><stop offset="0.35" stopColor="#bfe0ff" stopOpacity={0.1} /><stop offset="1" stopColor="#5a7acc" stopOpacity={0.22} /></radialGradient>
      <linearGradient id="rimG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f8ff" /><stop offset="0.45" stopColor="#9fb4dc" /><stop offset="1" stopColor="#5c6e96" /></linearGradient>
      <linearGradient id="hdlG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2a2150" /><stop offset="0.45" stopColor="#7a68c0" /><stop offset="1" stopColor="#1e183c" /></linearGradient>
      <linearGradient id="nsBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24357e" /><stop offset="1" stopColor="#0a1030" /></linearGradient></defs>
    <ellipse cx={lx + 40} cy={ly + 330} rx={280} ry={38} fill="#000" opacity={0.28} />
    <circle cx={lx} cy={ly} r={296} fill="#050816" /><g clipPath="url(#lensClip)"><g transform={`translate(${lx} ${ly}) scale(2.3) translate(${-lx} ${-ly}) translate(0 150)`} opacity={0.95}><Grid scramble seed={seed + 5} /></g></g>
    <circle cx={lx} cy={ly} r={296} fill="url(#lensG)" /><path d={`M ${lx - 210} ${ly - 120} A 250 250 0 0 1 ${lx - 40} ${ly - 238}`} fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.5} /><path d={`M ${lx + 190} ${ly + 150} A 250 250 0 0 1 ${lx + 90} ${ly + 225}`} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.25} />
    <circle cx={lx} cy={ly} r={304} fill="none" stroke="#2a3558" strokeWidth={8} /><circle cx={lx} cy={ly} r={306} fill="none" stroke="url(#rimG)" strokeWidth={24} /><circle cx={lx} cy={ly} r={318} fill="none" stroke="#fff" strokeWidth={3} opacity={0.4} />
    <line x1={lx + 218} y1={ly + 218} x2={lx + 300} y2={ly + 300} stroke="url(#rimG)" strokeWidth={34} strokeLinecap="round" />
    <line x1={lx + 296} y1={ly + 296} x2={lx + 450} y2={ly + 450} stroke="#12102a" strokeWidth={58} strokeLinecap="round" /><line x1={lx + 296} y1={ly + 296} x2={lx + 450} y2={ly + 450} stroke="url(#hdlG)" strokeWidth={46} strokeLinecap="round" />
    {[0, 1, 2, 3].map((q) => <line key={q} x1={lx + 330 + q * 26 - 14} y1={ly + 330 + q * 26 + 14} x2={lx + 330 + q * 26 + 14} y2={ly + 330 + q * 26 - 14} stroke="#cdbfff" strokeWidth={4} opacity={0.35} />)}
    {(() => { const ey = sm((t - 1.0) / 0.5), bl = Math.max(0, 1 - Math.abs(t - 2.4) / 0.16, 1 - Math.abs(t - 3.1) / 0.16), lk = Math.sin(t * 2.2) * 20, k = Math.min(1, bl * 1.3);
      return <g opacity={ey} transform={`translate(${lx} ${ly - 178}) scale(${0.85 + 0.15 * ey})`} style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,.55))' }}>
        <defs><clipPath id="eyeC"><path d="M -135 0 Q 0 -86 135 0 Q 0 86 -135 0 Z" /></clipPath>
          <radialGradient id="irisG" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#9fd6ff" /><stop offset="0.55" stopColor="#3f78d8" /><stop offset="1" stopColor="#14246b" /></radialGradient>
          <linearGradient id="lidG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a5ab8" /><stop offset="1" stopColor="#3a3279" /></linearGradient></defs>
        <path d="M -135 0 Q 0 -86 135 0 Q 0 86 -135 0 Z" fill="#f4f7ff" />
        <g clipPath="url(#eyeC)"><circle cx={lk} cy={0} r={46} fill="url(#irisG)" /><circle cx={lk} cy={0} r={20} fill="#050816" /><circle cx={lk - 14} cy={-16} r={9} fill="#fff" opacity={0.9} />
          <rect x={-140} y={-90} width={280} height={90 * k} fill="url(#lidG)" /><rect x={-140} y={90 - 90 * k} width={280} height={90 * k} fill="url(#lidG)" />
          <path d={`M -135 0 Q 0 ${-86 + 86 * k} 135 0`} fill="none" stroke="#1b1750" strokeWidth={5} opacity={k > 0.05 ? 1 : 0} /></g>
        <path d="M -135 0 Q 0 -86 135 0" fill="none" stroke="#1b1750" strokeWidth={7} strokeLinecap="round" /><path d="M -135 0 Q 0 86 135 0" fill="none" stroke="#1b1750" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        {[-90, -45, 0, 45, 90].map((x, q) => <line key={q} x1={x} y1={-(80 - Math.abs(x) * 0.5) * 0.92} x2={x + (x < 0 ? -9 : x > 0 ? 9 : 0)} y2={-(80 - Math.abs(x) * 0.5) * 0.92 - 16} stroke="#1b1750" strokeWidth={4} strokeLinecap="round" />)}
      </g>; })()}
    <g opacity={txt} transform={`translate(${lx} ${ly}) scale(${0.9 + 0.1 * txt})`} style={{ filter: 'drop-shadow(0 0 22px rgba(255,122,122,.55))' }}><rect x={-270} y={-56} width={540} height={112} rx={24} fill="url(#nsBg)" stroke="#ff7a7a" strokeWidth={4} /><path d="M -250 -53 H 250 Q 264 -53 266 -34 H -266 Q -264 -53 -250 -53 Z" fill="#fff" opacity={0.16} /><rect x={-256} y={-34} width={7} height={68} rx={3.5} fill="#ff7a7a" /><text y={19} textAnchor="middle" fill="#ffb0a8" style={{ font: `900 58px ${FONT.ui}`, letterSpacing: '0.04em' }}>NOTHING TO SEE</text></g></SVG><Ms v="001" /></AbsoluteFill>); };

/* v5 order: the full-screen dog turns into ones and zeros (zooming a little as it does) */
export const S2B_FRAMES = 59;
export const S2Bits: React.FC = () => { const t = useCurrentFrame() / 30 * SP, k = lp(0.8615, 1, eo((t - 0.2) / 1.4)), ph = 1 - sm((t - 0.35) / 1.0);
  return (<AbsoluteFill><Bg /><SVG>
    <g transform={`translate(540 880) scale(${k}) translate(-540 -940)`}><DogBits reveal={sm((t - 0.3) / 1.3)} tick={Math.floor(t * 30)} o={sm((t - 0.2) / 0.5)} /></g>
    <svg x={92} y={432} width={896} height={896} viewBox="0 0 190 190" opacity={ph}><DogPhoto /></svg></SVG><Ms v="001" /></AbsoluteFill>); };
