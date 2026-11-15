import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { FPS, hash, prog, pulse, lerp, easeOut } from '../lib/anim';
import { FONT, TECH } from '../lib/palette';
import { Adult } from './Adult';
import type { StickPose } from './Dusk';

/* First-person view: you are the man on the balcony, torch in hand, looking across the street at her. */
const Win: React.FC<{ x: number; y: number; w: number; h: number; lit?: boolean; dim?: number }> = ({ x, y, w, h, lit = true, dim = 1 }) => (
  <g opacity={dim}><rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill="#8f7fe0" /><rect x={x} y={y} width={w} height={h} fill={lit ? '#ffd88a' : '#141736'} />
    {lit && <rect x={x} y={y} width={w * 0.34} height={h} fill="#e98f6a" opacity={0.75} />}
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#3d3280" strokeWidth={6} /><line x1={x} y1={y + h * 0.45} x2={x + w} y2={y + h * 0.45} stroke="#3d3280" strokeWidth={6} />
    <rect x={x - 14} y={y + h + 6} width={w + 28} height={12} fill="#a898f0" /></g>);
/* "Hi" by torch: H = 01001000, i = 01101001. Runs on the hook clock, 8.4 s to 12.8 s. */
export const HI = [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1], HB0 = 10.25, HBD = 0.128, HFLY = 0.5, POV_A = 252, POV_B = 384;
const HVO: [number, React.ReactNode][] = [[8.4, <>On is <em>one</em>. Off is <em>zero</em>.</>], [10.5, <>Eight blinks make <em>one letter</em>.</>], [12.45, <>But <em>"hello"</em> takes forty blinks.</>]];
export const Pov: React.FC<{ hi?: boolean }> = ({ hi }) => {
  const f = useCurrentFrame(), t = f / FPS, F = f + POV_A, T = F / FPS;
  let on = 1; const done = hi ? prog(F, HB0 + 15 * HBD + HFLY - 0.1, HB0 + 15 * HBD + HFLY + 0.1, easeOut) : 1;
  if (hi) { on = pulse(F, 8.95, 9.5); HI.forEach((b, i) => { if (b) on = Math.max(on, pulse(F, HB0 + i * HBD, HB0 + i * HBD + 0.085, 0.02)); }); }
  const wv = hi ? done : 1, dy = hi ? 130 : 0;
  const shield = hi ? Math.max(prog(F, 8.97, 9.15, easeOut) * (1 - prog(F, 9.6, 9.95)), prog(F, HB0 + 0.1, HB0 + 0.35) * (1 - done)) : 0;
  const hop = hi ? Math.sin(Math.PI * Math.min(1, Math.max(0, (T - 8.97) / 0.3))) * 16 + Math.abs(Math.sin(t * 9)) * 8 * done : 0;
  const her: StickPose = { blink: hi ? Math.max(0.5 * on * (1 - done), 1 - Math.abs(T - 9.9) / 0.07) : 0, smile: hi ? lerp(0.45, 1, Math.max(done, prog(F, 9.2, 9.6))) : 1, look: 0, armR: [lerp(8, 150 + Math.sin(t * 9) * 14, wv), lerp(5, 172 + Math.sin(t * 9 + 1) * 16, wv)], armL: [lerp(-10, -110, shield), lerp(-6, 140, shield)], tilt: (3 + Math.sin(t * 9) * 2) * wv - 4 * shield };
  const HX = 540, HY = 716, lens = { x: 668, y: 1318 + dy }, tg = { x: HX, y: HY - 150 };
  const ang = Math.atan2(tg.y - lens.y, tg.x - lens.x) * 180 / Math.PI, len = Math.hypot(tg.x - lens.x, tg.y - lens.y);
  return (
    <AbsoluteFill style={{ backgroundColor: '#0b1030' }}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="pSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0d2a" /><stop offset=".6" stopColor="#1b2060" /><stop offset="1" stopColor="#262a72" /></linearGradient>
          <linearGradient id="pWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7566cc" /><stop offset="1" stopColor="#4a3d94" /></linearGradient>
          <linearGradient id="pBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff6dc" stopOpacity=".85" /><stop offset="1" stopColor="#ffe2a8" stopOpacity=".28" /></linearGradient>
          <radialGradient id="pWarm"><stop offset="0" stopColor="#fff6dc" stopOpacity=".95" /><stop offset=".3" stopColor="#ffd98a" stopOpacity=".45" /><stop offset="1" stopColor="#ffc864" stopOpacity="0" /></radialGradient>
          <radialGradient id="pLamp"><stop offset="0" stopColor="#ffe2a8" stopOpacity=".5" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
          <radialGradient id="pVig" cx=".5" cy=".42" r=".8"><stop offset=".4" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#02030c" stopOpacity=".8" /></radialGradient>
          <radialGradient id="pSpot" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#040820" stopOpacity="0" /><stop offset=".55" stopColor="#040820" stopOpacity=".1" /><stop offset="1" stopColor="#040820" stopOpacity=".62" /></radialGradient>
          <filter id="pB"><feGaussianBlur stdDeviation="10" /></filter><filter id="pB2"><feGaussianBlur stdDeviation="4" /></filter>
          <filter id="pGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 -0.12" /></filter>
        </defs>
        <rect width={1080} height={1920} fill="url(#pSky)" />
        {Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={hash(i * 3) * 1080} cy={hash(i * 7) * 420} r={1 + hash(i) * 1.8} fill="#dfe6ff" opacity={0.35 + 0.4 * Math.sin(t * 2 + i)} />)}
        {/* neighbours, held back in shadow */}
        {/* left: the park. right: the pink hostel. Both held back in shadow, as in the street scene */}
        <rect x={-20} y={700} width={230} height={420} fill="#143a36" /><ellipse cx={60} cy={705} rx={200} ry={46} fill="#143a36" />
        {[[30, 700, 74], [130, 760, 60], [-10, 860, 66], [110, 900, 78], [40, 1000, 62], [160, 1020, 50]].map(([x, y, r], i) => <g key={'pt' + i}><rect x={x - 7} y={y} width={14} height={r * 1.3} fill="#1c1630" /><circle cx={x} cy={y} r={r} fill={i % 2 ? '#1f5a44' : '#1a4c3c'} /><circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.55} fill="#2c6e52" /></g>)}
        {Array.from({ length: 26 }).map((_, i) => { const x = 6 + hash(i * 3) * 180 + Math.sin(t * 0.8 + i) * 8, y = 640 + hash(i * 7) * 440 + Math.cos(t * 0.6 + i * 2) * 8; return <g key={'ff' + i} opacity={0.5 + 0.5 * Math.sin(t * 3 + i * 1.7)}><circle cx={x} cy={y} r={7} fill="#d8ff8a" opacity={0.25} /><circle cx={x} cy={y} r={2.4} fill="#f2ffc0" /></g>; })}
        <g opacity={0.6}><rect x={870} y={420} width={280} height={730} fill="#b0568a" /><rect x={860} y={400} width={300} height={26} fill="#d078a8" /><Win x={940} y={520} w={90} h={130} lit={false} /><Win x={940} y={840} w={90} h={130} dim={0.7} /></g>
        {/* her house, straight ahead */}
        <rect x={190} y={350} width={700} height={790} fill="url(#pWall)" />
        {Array.from({ length: 44 }).map((_, i) => <line key={i} x1={190} y1={368 + i * 18} x2={890} y2={368 + i * 18} stroke="#000" strokeWidth={1.5} opacity={0.13} />)}
        {Array.from({ length: 44 * 12 }).map((_, i) => { const r = Math.floor(i / 12), c = i % 12; return <line key={i} x1={190 + c * 60 + (r % 2) * 30} y1={368 + r * 18} x2={190 + c * 60 + (r % 2) * 30} y2={386 + r * 18} stroke="#000" strokeWidth={1.2} opacity={0.1} />; })}
        <rect x={170} y={318} width={740} height={40} fill="#9a8cf0" /><rect x={170} y={352} width={740} height={10} fill="#5a4cb0" />
        <rect x={300} y={248} width={70} height={72} rx={6} fill="#14152a" /><ellipse cx={335} cy={248} rx={35} ry={10} fill="#2a2d55" />
        <line x1={420} y1={318} x2={420} y2={236} stroke="#14152a" strokeWidth={5} /><line x1={600} y1={318} x2={600} y2={236} stroke="#14152a" strokeWidth={5} /><line x1={420} y1={242} x2={600} y2={242} stroke="#cfd3de" strokeWidth={2} />{['#e0b84a', '#7fd0f0', '#f3f0ea', '#ff8672'].map((c, i) => <rect key={c} x={436 + i * 40} y={244} width={28} height={40 + (i % 2) * 8} fill={c} opacity={0.85} />)}
        <polygon points="780,318 880,318 866,286 794,286" fill="#1c3a7a" stroke="#9fb4ff" strokeWidth={2} />
        <line x1={720} y1={318} x2={720} y2={262} stroke="#14152a" strokeWidth={5} /><ellipse cx={722} cy={258} rx={26} ry={16} fill="#cfd3de" transform="rotate(-25 722 258)" />
        {Array.from({ length: 19 }).map((_, i) => <g key={i}><circle cx={190 + i * 39} cy={366 + Math.sin(i * 1.4) * 5} r={9} fill={i % 2 ? '#9fe9ff' : '#fff1d0'} opacity={0.22} /><circle cx={190 + i * 39} cy={366 + Math.sin(i * 1.4) * 5} r={4} fill={i % 2 ? '#9fe9ff' : '#fff1d0'} opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} /></g>)}
        <rect x={190} y={728} width={700} height={14} fill="#9a8cf0" opacity={0.8} />
        <Win x={232} y={450} w={120} h={170} /><Win x={728} y={450} w={120} h={170} /><Win x={232} y={830} w={120} h={170} /><Win x={728} y={830} w={120} h={170} lit={false} />
        <rect x={462} y={836} width={156} height={304} fill="#2a1f5c" stroke="#8f7fe0" strokeWidth={8} /><circle cx={596} cy={996} r={7} fill="#ffd38a" />
        {/* her balcony door, her, the railing */}
        <rect x={452} y={418} width={176} height={300} fill="#fff1d0" /><rect x={462} y={428} width={156} height={290} fill="#33266e" /><circle cx={482} cy={590} r={7} fill="#ffd38a" />
        <ellipse cx={HX} cy={HY - 150} rx={210} ry={230} fill="url(#pWarm)" opacity={0.2 + 0.35 * on} />
        {/* the torch light lands on her wall, and on her */}
        <g opacity={on} style={{ mixBlendMode: 'screen' }}><ellipse cx={HX} cy={HY - 150} rx={190} ry={200} fill="#fff0c0" opacity={0.2} /><ellipse cx={HX} cy={HY - 150} rx={190} ry={200} fill="none" stroke="#fff6dc" strokeWidth={5} opacity={0.35} /></g>
        <g transform={`translate(${HX + 22} ${HY}) scale(0.84) skewX(-8)`} opacity={0.22 * on}><g style={{ filter: 'brightness(0)' }}><Adult kind="woman" p={her} id="pvs" /></g></g>
        <g transform={`translate(${HX} ${HY - hop}) scale(0.84)`} style={{ filter: `brightness(${1 + 0.22 * on}) saturate(${1 + 0.15 * on})` }}><Adult kind="woman" p={her} id="pv" /></g>
        <ellipse cx={HX} cy={HY - 170} rx={110} ry={170} fill="url(#pWarm)" opacity={0.3 * on} style={{ mixBlendMode: 'screen' }} />
        {hi && T > 8.97 && T < 9.7 && <text x={HX + 112} y={HY - 205 - 20 * prog(F, 8.97, 9.15, easeOut)} textAnchor="middle" style={{ font: `800 96px ${FONT.ui}` }} fill="#ffd38a" stroke="#0a0e24" strokeWidth={9} paintOrder="stroke" opacity={prog(F, 8.97, 9.08) * (1 - prog(F, 9.5, 9.7))}>!</text>}
        {[0, 1, 2].map((i) => { const u = (t * 0.9 + i / 3) % 1, x = HX + 70 + i * 26 + Math.sin(t * 2 + i) * 8, y = HY - 290 - u * 90; return <path key={i} d={`M ${x} ${y} c -14 -16 -34 2 0 26 c 34 -24 14 -42 0 -26 Z`} fill="#ff6f91" opacity={(1 - u) * 0.9 * wv} />; })}
        <rect x={310} y={716} width={460} height={26} fill="#8f7fe0" /><rect x={310} y={742} width={460} height={12} fill="#3d3280" />
        <line x1={318} y1={612} x2={762} y2={612} stroke="#14152a" strokeWidth={8} strokeLinecap="round" />
        {Array.from({ length: 13 }).map((_, i) => <line key={i} x1={320 + i * 36.6} y1={612} x2={320 + i * 36.6} y2={718} stroke="#14152a" strokeWidth={5} />)}
        {[0, 0.5].map((d) => { const u = (t * 1.2 + d) % 1; return <circle key={d} cx={tg.x} cy={tg.y} r={40 + u * 150} fill="none" stroke="#ffe2a8" strokeWidth={6 * (1 - u) + 1} opacity={(1 - u) * 0.6 * on} />; })}
        {/* hedge, footpath, street */}
        <rect x={0} y={1108} width={1080} height={48} fill="#1f5a44" /><rect x={0} y={1100} width={1080} height={14} fill="#2a6a4a" />
        {[90, 990].map((x) => <g key={x}><rect x={x - 8} y={1010} width={16} height={130} fill="#2a1f3a" /><circle cx={x} cy={990} r={62} fill="#1f5a44" /><circle cx={x - 20} cy={966} r={36} fill="#2c6e52" /></g>)}
        <rect x={0} y={1150} width={1080} height={50} fill="#4a4f8a" /><polygon points="0,1200 1080,1200 1080,1920 0,1920" fill="#15183a" />
        {[0, 1, 2, 3, 4, 5].map((i) => <polygon key={i} points={`${380 + i * 56},1210 ${420 + i * 56},1210 ${340 + i * 96 + 60},1470 ${340 + i * 96 - 10},1470`} fill="#8e8cc0" opacity={0.5} />)}
        {[140, 930].map((x) => <g key={x}><ellipse cx={x} cy={1200} rx={170} ry={50} fill="url(#pLamp)" /><line x1={x} y1={1196} x2={x} y2={920} stroke="#0c0d20" strokeWidth={8} /><circle cx={x} cy={914} r={46} fill="url(#pLamp)" /><circle cx={x} cy={914} r={11} fill="#fff3d6" /></g>)}
        <g transform="translate(150 1290)"><ellipse cx={0} cy={58} rx={150} ry={18} fill="#000" opacity={0.4} /><rect x={-140} y={-10} width={280} height={62} rx={20} fill="#c8553a" /><path d="M -90 -10 L -60 -62 L 70 -62 L 104 -10 Z" fill="#a8432c" /><path d="M -74 -12 L -52 -52 L 0 -52 L 0 -12 Z M 10 -12 L 10 -52 L 62 -52 L 88 -12 Z" fill="#9fd0ff" opacity={0.6} /><circle cx={-84} cy={52} r={26} fill="#14152a" /><circle cx={84} cy={52} r={26} fill="#14152a" /><circle cx={-84} cy={52} r={10} fill="#cfd3de" /><circle cx={84} cy={52} r={10} fill="#cfd3de" /><circle cx={136} cy={16} r={9} fill="#fff6d8" /></g>
        {/* selective light: the world drops back, she stays bright */}
        <rect x={-460} y={-420} width={2000} height={2200} fill="url(#pSpot)" />
        {/* the beam from your torch to her */}
        <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`} style={{ mixBlendMode: 'screen' }} opacity={on}>
          <path d={`M 0 -62 L ${len} -22 L ${len} 22 L 0 62 Z`} fill="url(#pBeam)" opacity={0.55} filter="url(#pB)" />
          <path d={`M 0 -30 L ${len} -8 L ${len} 8 L 0 30 Z`} fill="url(#pBeam)" opacity={0.75} filter="url(#pB2)" />
          {[0, 0.5].map((d) => { const u = (t * 1.4 + d) % 1; return <g key={d} opacity={Math.sin(Math.PI * u)}><circle cx={len * u} cy={0} r={70 - 40 * u} fill="url(#pWarm)" /><circle cx={len * u} cy={0} r={9 - 4 * u} fill="#fffbee" /></g>; })}
        </g>
        {/* your balcony railing, out of focus */}
        <g filter="url(#pB2)"><line x1={-40} y1={1585} x2={1120} y2={1525} stroke="#070818" strokeWidth={30} strokeLinecap="round" />{Array.from({ length: 9 }).map((_, i) => <line key={i} x1={40 + i * 128} y1={1582 - i * 6.6} x2={40 + i * 128} y2={1940} stroke="#070818" strokeWidth={18} />)}
          <line x1={-40} y1={1578} x2={1120} y2={1518} stroke="#3a4a9a" strokeWidth={5} opacity={0.6} /></g>
        {/* the bits fly from your torch to her, and the letters land beside her */}
        {hi && HI.map((b, i) => { const u = (T - (HB0 + i * HBD)) / HFLY; if (u < 0 || u > 1) return null; const x = lerp(lens.x, tg.x, u), y = lerp(lens.y - 40, tg.y, u), k = lerp(1, 0.5, u);
          return <g key={'b' + i} transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, u * 8, (1 - u) * 6)}><rect x={-30} y={-38} width={60} height={76} rx={14} fill="#0a0e24" stroke={b ? '#ffe08a' : '#9fb0ff'} strokeWidth={4} /><text x={0} y={20} textAnchor="middle" style={{ font: `700 56px ${FONT.mono}` }} fill={b ? '#ffe08a' : '#9fb0ff'}>{b}</text></g>; })}
        {hi && (() => { const a0 = prog(F, HB0 + 7 * HBD + HFLY - 0.05, HB0 + 7 * HBD + HFLY + 0.12, easeOut), a1 = prog(F, HB0 + 15 * HBD + HFLY - 0.05, HB0 + 15 * HBD + HFLY + 0.12, easeOut); if (a0 <= 0) return null;
          return <g transform={`translate(${HX + 168} ${HY - 196}) scale(${0.7 + 0.3 * a0 + 0.12 * Math.sin(Math.PI * a1)})`} opacity={a0}><path d="M -78 -58 h 156 a 22 22 0 0 1 22 22 v 72 a 22 22 0 0 1 -22 22 h -120 l -40 30 l 8 -30 h -4 a 22 22 0 0 1 -22 -22 v -72 a 22 22 0 0 1 22 -22 Z" fill="#0a0e24" stroke="#ffd38a" strokeWidth={5} />
            <text x={0} y={30} textAnchor="middle" style={{ font: `800 88px ${FONT.ui}` }} fill="#ffd38a">H<tspan opacity={a1}>i</tspan></text></g>; })()}
        {/* your arm and the torch, drawn along the torch's own axis: x runs toward her, y runs out to your right */}
        <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`}>
          <defs><linearGradient id="pTb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#11131f" /><stop offset=".28" stopColor="#3b4162" /><stop offset=".42" stopColor="#8d95bd" /><stop offset=".56" stopColor="#3b4162" /><stop offset="1" stopColor="#0c0e18" /></linearGradient>
            <linearGradient id="pTh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a1f14" /><stop offset=".3" stopColor="#e2553a" /><stop offset=".44" stopColor="#ffa88e" /><stop offset=".6" stopColor="#d24a30" /><stop offset="1" stopColor="#5e150d" /></linearGradient>
            <linearGradient id="pSl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3fb8a8" /><stop offset="1" stopColor="#1f6f6a" /></linearGradient></defs>
          {/* forearm: sleeve, cuff, wrist */}
          <line x1={-330} y1={150} x2={-1100} y2={640} stroke="url(#pSl)" strokeWidth={190} />
          <line x1={-330} y1={150} x2={-1100} y2={640} stroke="#8fe6d6" strokeWidth={10} opacity={0.25} transform="translate(-40 -70)" />
          <line x1={-292} y1={126} x2={-352} y2={164} stroke="#f3f0ea" strokeWidth={176} /><line x1={-338} y1={155} x2={-352} y2={164} stroke="#cfcabe" strokeWidth={176} />
          <line x1={-236} y1={86} x2={-300} y2={130} stroke="#c9946e" strokeWidth={128} strokeLinecap="round" />
          {/* palm sits under the barrel */}
          <path d="M -292 26 C -300 110 -230 150 -150 128 C -96 112 -84 60 -100 26 Z" fill="#d6a481" />
          {/* the torch: tail cap, ribbed barrel, flared red head, bright rim */}
          <path d="M -372 -43 L -96 -37 L -96 37 L -372 43 Z" fill="url(#pTb)" />
          <ellipse cx={-372} cy={0} rx={15} ry={43} fill="#1b1e30" stroke="#5a6088" strokeWidth={3} /><ellipse cx={-372} cy={0} rx={7} ry={20} fill="#0b0d16" />
          {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={-340 + i * 16} y1={-42.5 + i * 0.3} x2={-340 + i * 16} y2={42.5 - i * 0.3} stroke="#0a0c14" strokeWidth={4} opacity={0.55} />)}
          <path d="M -96 -37 L -30 -64 L 0 -64 L 0 64 L -30 64 L -96 37 Z" fill="url(#pTh)" /><rect x={-104} y={-39} width={12} height={78} rx={4} fill="#c9cfe0" />
          <rect x={-10} y={-68} width={16} height={136} rx={7} fill="#e3e7f2" /><rect x={-10} y={-68} width={16} height={40} rx={7} fill="#fff" opacity={0.7} />
          <ellipse cx={5} cy={0} rx={9} ry={62} fill={on > 0.2 ? '#fffbe8' : '#565c78'} />
          {/* fingers wrap over the barrel, thumb rests on the switch */}
          {[0, 1, 2, 3].map((k) => <g key={k}><rect x={-286 + k * 43} y={-58} width={40} height={104} rx={20} fill="#dcae8a" stroke="#b07f5a" strokeWidth={3} /><rect x={-280 + k * 43} y={-52} width={12} height={44} rx={6} fill="#f0c9a6" opacity={0.6} /><path d={`M ${-280 + k * 43} 6 q 14 7 28 0`} stroke="#b07f5a" strokeWidth={3} fill="none" opacity={0.7} /></g>)}
          <rect x={-128} y={-4} width={22} height={30} rx={7} fill="#20233a" />
          <g transform="rotate(-24 -150 70)"><rect x={-190} y={34} width={104} height={44} rx={22} fill="#e2b592" stroke="#b07f5a" strokeWidth={3} /><rect x={-112} y={40} width={22} height={30} rx={10} fill="#f6dcc4" opacity={0.75} /></g>
          <circle cx={0} cy={0} r={150} fill="url(#pWarm)" style={{ mixBlendMode: 'screen' }} opacity={on} />
        </g>
        <rect width={1080} height={1920} fill="url(#pVig)" />
        <rect width={1080} height={1920} filter="url(#pGrain)" opacity={0.1} style={{ mixBlendMode: 'overlay' }} />
      </svg>
      {hi && (() => { let line: React.ReactNode = null; for (const [a, txt] of HVO) if (T >= a) line = txt; const bitsOn = T >= 10.15;
        return <>
          <div style={{ position: 'absolute', top: 222, left: 70, right: 70, height: 184, borderRadius: 40, background: 'rgba(10,14,36,.86)', border: '1px solid rgba(160,176,255,.25)', boxShadow: '0 20px 60px rgba(0,0,0,.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: prog(F, 8.8, 9.0) }}>
            {!bitsOn ? <><div style={{ font: `700 104px/1 ${FONT.mono}`, color: T < 9.5 ? '#ffe08a' : '#9fb0ff' }}>{T < 9.5 ? '1' : '0'}</div><div style={{ font: `600 30px ${FONT.mono}`, letterSpacing: '0.2em', color: '#cfd8ff' }}>{T < 9.5 ? 'LIGHT ON' : 'LIGHT OFF'}</div></> : <>
              <div style={{ display: 'flex', gap: 6, font: `600 44px ${FONT.mono}` }}>{HI.map((b, i) => { const shown = T > HB0 + i * HBD; return <span key={i} style={{ width: 46, height: 66, marginLeft: i === 8 ? 22 : 0, borderRadius: 11, display: 'grid', placeItems: 'center', background: shown && b ? 'rgba(255,224,138,.16)' : 'rgba(255,255,255,.05)', border: `1px solid ${shown && b ? 'rgba(255,224,138,.8)' : 'rgba(255,255,255,.16)'}`, color: shown ? (b ? '#ffe08a' : '#9fb0ff') : 'rgba(255,255,255,.2)' }}>{shown ? b : '·'}</span>; })}</div>
              <div style={{ display: 'flex', width: 848, font: `800 64px/1 ${FONT.ui}`, color: '#ffd38a' }}>{[0, 1].map((j) => <div key={j} style={{ width: j ? 410 : 438, textAlign: 'center', opacity: prog(F, HB0 + (j * 8 + 7) * HBD + 0.05, HB0 + (j * 8 + 7) * HBD + 0.2), color: '#ffd38a' }}>{'Hi'[j]}</div>)}</div></>}
          </div>
          {line && <div style={{ position: 'absolute', top: 1260, left: 60, right: 150, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', font: `800 58px/1.15 ${FONT.ui}`, color: '#fff', textShadow: '0 3px 6px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.9)' }}><div className="sub">{line}</div></div>}
          <style>{'.sub em{font-style:normal;color:#ffd38a}'}</style></>; })()}
      <div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.8 }}>
        <Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} /><span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span>
      </div>
    </AbsoluteFill>
  );
};

export const PovHi: React.FC = () => <Pov hi />;
