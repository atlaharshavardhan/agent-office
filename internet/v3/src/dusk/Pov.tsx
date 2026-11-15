import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { FPS, hash } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Adult } from './Adult';
import type { StickPose } from './Dusk';

/* First-person view: you are the man on the balcony, torch in hand, looking across the street at her. */
const Win: React.FC<{ x: number; y: number; w: number; h: number; lit?: boolean; dim?: number }> = ({ x, y, w, h, lit = true, dim = 1 }) => (
  <g opacity={dim}><rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} fill="#8f7fe0" /><rect x={x} y={y} width={w} height={h} fill={lit ? '#ffd88a' : '#141736'} />
    {lit && <rect x={x} y={y} width={w * 0.34} height={h} fill="#e98f6a" opacity={0.75} />}
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#3d3280" strokeWidth={6} /><line x1={x} y1={y + h * 0.45} x2={x + w} y2={y + h * 0.45} stroke="#3d3280" strokeWidth={6} />
    <rect x={x - 14} y={y + h + 6} width={w + 28} height={12} fill="#a898f0" /></g>);
export const Pov: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const her: StickPose = { blink: 0, smile: 1, look: 0, armR: [150 + Math.sin(t * 9) * 14, 172 + Math.sin(t * 9 + 1) * 16], armL: [-10, -6], tilt: 3 + Math.sin(t * 9) * 2 };
  const HX = 540, HY = 716, lens = { x: 668, y: 1318 }, tg = { x: HX, y: HY - 150 };
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
        <g opacity={0.55}><rect x={-60} y={470} width={280} height={680} fill="#35508a" /><rect x={-70} y={450} width={300} height={26} fill="#4a68a8" /><Win x={40} y={560} w={90} h={130} dim={0.7} /><Win x={40} y={860} w={90} h={130} lit={false} />
          <rect x={870} y={420} width={280} height={730} fill="#8a4f74" /><rect x={860} y={400} width={300} height={26} fill="#a8688c" /><Win x={940} y={520} w={90} h={130} lit={false} /><Win x={940} y={840} w={90} h={130} dim={0.7} /></g>
        {/* her house, straight ahead */}
        <rect x={190} y={350} width={700} height={790} fill="url(#pWall)" />
        {Array.from({ length: 44 }).map((_, i) => <line key={i} x1={190} y1={368 + i * 18} x2={890} y2={368 + i * 18} stroke="#000" strokeWidth={1.5} opacity={0.13} />)}
        {Array.from({ length: 44 * 12 }).map((_, i) => { const r = Math.floor(i / 12), c = i % 12; return <line key={i} x1={190 + c * 60 + (r % 2) * 30} y1={368 + r * 18} x2={190 + c * 60 + (r % 2) * 30} y2={386 + r * 18} stroke="#000" strokeWidth={1.2} opacity={0.1} />; })}
        <rect x={170} y={318} width={740} height={40} fill="#9a8cf0" /><rect x={170} y={352} width={740} height={10} fill="#5a4cb0" />
        <rect x={300} y={248} width={70} height={72} rx={6} fill="#14152a" /><ellipse cx={335} cy={248} rx={35} ry={10} fill="#2a2d55" />
        <line x1={720} y1={318} x2={720} y2={262} stroke="#14152a" strokeWidth={5} /><ellipse cx={722} cy={258} rx={26} ry={16} fill="#cfd3de" transform="rotate(-25 722 258)" />
        {Array.from({ length: 19 }).map((_, i) => <g key={i}><circle cx={190 + i * 39} cy={366 + Math.sin(i * 1.4) * 5} r={9} fill={i % 2 ? '#9fe9ff' : '#fff1d0'} opacity={0.22} /><circle cx={190 + i * 39} cy={366 + Math.sin(i * 1.4) * 5} r={4} fill={i % 2 ? '#9fe9ff' : '#fff1d0'} opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} /></g>)}
        <rect x={190} y={728} width={700} height={14} fill="#9a8cf0" opacity={0.8} />
        <Win x={232} y={450} w={120} h={170} /><Win x={728} y={450} w={120} h={170} /><Win x={232} y={830} w={120} h={170} /><Win x={728} y={830} w={120} h={170} lit={false} />
        <rect x={462} y={836} width={156} height={304} fill="#2a1f5c" stroke="#8f7fe0" strokeWidth={8} /><circle cx={596} cy={996} r={7} fill="#ffd38a" />
        {/* her balcony door, her, the railing */}
        <rect x={452} y={418} width={176} height={300} fill="#fff1d0" /><rect x={462} y={428} width={156} height={290} fill="#33266e" /><circle cx={482} cy={590} r={7} fill="#ffd38a" />
        <ellipse cx={HX} cy={HY - 150} rx={210} ry={230} fill="url(#pWarm)" opacity={0.55} />
        <g transform={`translate(${HX} ${HY}) scale(0.84)`}><Adult kind="woman" p={her} id="pv" /></g>
        {[0, 1, 2].map((i) => { const u = (t * 0.9 + i / 3) % 1, x = HX + 70 + i * 26 + Math.sin(t * 2 + i) * 8, y = HY - 290 - u * 90; return <path key={i} d={`M ${x} ${y} c -14 -16 -34 2 0 26 c 34 -24 14 -42 0 -26 Z`} fill="#ff6f91" opacity={(1 - u) * 0.9} />; })}
        <rect x={310} y={716} width={460} height={26} fill="#8f7fe0" /><rect x={310} y={742} width={460} height={12} fill="#3d3280" />
        <line x1={318} y1={612} x2={762} y2={612} stroke="#14152a" strokeWidth={8} strokeLinecap="round" />
        {Array.from({ length: 13 }).map((_, i) => <line key={i} x1={320 + i * 36.6} y1={612} x2={320 + i * 36.6} y2={718} stroke="#14152a" strokeWidth={5} />)}
        {[0, 0.5].map((d) => { const u = (t * 1.2 + d) % 1; return <circle key={d} cx={tg.x} cy={tg.y} r={40 + u * 150} fill="none" stroke="#ffe2a8" strokeWidth={6 * (1 - u) + 1} opacity={(1 - u) * 0.6} />; })}
        {/* hedge, footpath, street */}
        <rect x={0} y={1108} width={1080} height={48} fill="#1f5a44" /><rect x={0} y={1100} width={1080} height={14} fill="#2a6a4a" />
        {[90, 990].map((x) => <g key={x}><rect x={x - 8} y={1010} width={16} height={130} fill="#2a1f3a" /><circle cx={x} cy={990} r={62} fill="#1f5a44" /><circle cx={x - 20} cy={966} r={36} fill="#2c6e52" /></g>)}
        <rect x={0} y={1150} width={1080} height={50} fill="#4a4f8a" /><polygon points="0,1200 1080,1200 1080,1920 0,1920" fill="#15183a" />
        {[0, 1, 2, 3, 4, 5].map((i) => <polygon key={i} points={`${380 + i * 56},1210 ${420 + i * 56},1210 ${340 + i * 96 + 60},1470 ${340 + i * 96 - 10},1470`} fill="#8e8cc0" opacity={0.5} />)}
        {[140, 930].map((x) => <g key={x}><ellipse cx={x} cy={1200} rx={170} ry={50} fill="url(#pLamp)" /><line x1={x} y1={1196} x2={x} y2={920} stroke="#0c0d20" strokeWidth={8} /><circle cx={x} cy={914} r={46} fill="url(#pLamp)" /><circle cx={x} cy={914} r={11} fill="#fff3d6" /></g>)}
        {/* selective light: the world drops back, she stays bright */}
        <rect x={-460} y={-420} width={2000} height={2200} fill="url(#pSpot)" />
        {/* the beam from your torch to her */}
        <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`} style={{ mixBlendMode: 'screen' }}>
          <path d={`M 0 -62 L ${len} -22 L ${len} 22 L 0 62 Z`} fill="url(#pBeam)" opacity={0.55} filter="url(#pB)" />
          <path d={`M 0 -30 L ${len} -8 L ${len} 8 L 0 30 Z`} fill="url(#pBeam)" opacity={0.75} filter="url(#pB2)" />
          {[0, 0.5].map((d) => { const u = (t * 1.4 + d) % 1; return <g key={d} opacity={Math.sin(Math.PI * u)}><circle cx={len * u} cy={0} r={70 - 40 * u} fill="url(#pWarm)" /><circle cx={len * u} cy={0} r={9 - 4 * u} fill="#fffbee" /></g>; })}
        </g>
        {/* your balcony railing, out of focus */}
        <g filter="url(#pB2)"><line x1={-40} y1={1585} x2={1120} y2={1525} stroke="#070818" strokeWidth={30} strokeLinecap="round" />{Array.from({ length: 9 }).map((_, i) => <line key={i} x1={40 + i * 128} y1={1582 - i * 6.6} x2={40 + i * 128} y2={1940} stroke="#070818" strokeWidth={18} />)}
          <line x1={-40} y1={1578} x2={1120} y2={1518} stroke="#3a4a9a" strokeWidth={5} opacity={0.6} /></g>
        {/* your arm and the torch */}
        <g>
          <polygon points="1080,1640 1080,1920 800,1920 688,1452 782,1404" fill="#2f9c95" /><polygon points="1080,1640 1080,1760 830,1500 782,1404" fill="#3fb8a8" opacity={0.6} />
          <polygon points="676,1462 792,1396 806,1424 692,1492" fill="#f3f0ea" />
          <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`}>
            <rect x={-205} y={-34} width={150} height={68} rx={16} fill="#3a3f5c" /><rect x={-205} y={-34} width={150} height={22} rx={11} fill="#5a6088" opacity={0.7} />
            <polygon points="-62,-36 0,-58 0,58 -62,36" fill="#cfd3de" /><polygon points="-62,-36 0,-58 0,-30 -62,-18" fill="#fff" opacity={0.5} /><rect x={-8} y={-60} width={14} height={120} rx={5} fill="#8a90a8" />
            <rect x={-150} y={-46} width={30} height={14} rx={5} fill="#ff8672" />
          </g>
          <g transform={`translate(${lens.x} ${lens.y}) rotate(${ang})`}><ellipse cx={-128} cy={6} rx={74} ry={56} fill="#d6a481" /><ellipse cx={-128} cy={-30} rx={66} ry={26} fill="#e2b592" opacity={0.7} />
            {[0, 1, 2, 3].map((k) => <rect key={k} x={-190 + k * 30} y={-52} width={26} height={66} rx={13} fill="#d6a481" stroke="#b98863" strokeWidth={2.5} />)}
            <rect x={-96} y={-62} width={30} height={74} rx={14} fill="#dcae8a" stroke="#b98863" strokeWidth={2.5} transform="rotate(28 -80 -30)" /></g>
          <circle cx={lens.x} cy={lens.y} r={150} fill="url(#pWarm)" style={{ mixBlendMode: 'screen' }} />
        </g>
        <rect width={1080} height={1920} fill="url(#pVig)" />
        <rect width={1080} height={1920} filter="url(#pGrain)" opacity={0.1} style={{ mixBlendMode: 'overlay' }} />
      </svg>
      <div style={{ position: 'absolute', right: 18, top: 960, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.8 }}>
        <Img src={staticFile('logo.png')} style={{ width: 70, height: 70, borderRadius: 35 }} /><span style={{ writingMode: 'vertical-rl', font: `700 26px ${FONT.ui}`, color: 'rgba(255,255,255,.85)' }}>@TheInvisiTech</span>
      </div>
    </AbsoluteFill>
  );
};
