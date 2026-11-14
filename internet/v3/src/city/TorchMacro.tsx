import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolateColors } from 'remotion';
import { CITY, TECH, FONT } from '../lib/palette';
import { keys, prog, pulse, hash, lerp, FPS, easeIn } from '../lib/anim';

/* Macro of the boy's hand switching the torch on. Screen-space illustration with depth layers.
   From 6.0 s the world darkens, the light turns cyan and binary digits leave the lens in step with each pulse. */
const BITS = '01001000';
export const LENS = { x: 700, y: 840 };

export const TorchMacro: React.FC<{ t0: number }> = ({ t0 }) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const press = keys(f, [[t0 + 0.4, 0], [t0 + 0.55, 1], [t0 + 0.75, 0.6]]);
  // light pattern: on, then pulses that become bits 0 1 0 0 1 0 0 0
  const bitStart = t0 + 1.9, bd = 0.2;
  let on = Math.max(pulse(f, t0 + 0.55, t0 + 1.2), pulse(f, t0 + 1.4, t0 + 1.75));
  BITS.split('').forEach((b, i) => { if (b === '1') on = Math.max(on, pulse(f, bitStart + i * bd, bitStart + i * bd + 0.12)); });
  on = Math.max(on * 1, prog(f, t0 + 2.6, t0 + 2.95, easeIn));          // finally stays on and floods the frame
  const dark = prog(f, t0 + 1.8, t0 + 2.4);
  const cyan = prog(f, t0 + 1.7, t0 + 2.3);
  const col = interpolateColors(cyan, [0, 1], ['#ffe6b0', TECH.cyan]);
  const dolly = keys(f, [[t0, 1], [t0 + 1.8, 1.14], [t0 + 2.95, 3.4]], (u) => u * u * (3 - 2 * u));
  const flood = prog(f, t0 + 2.75, t0 + 3.0, easeIn);
  return (
    <AbsoluteFill style={{ backgroundColor: TECH.bg, overflow: 'hidden' }}>
      {/* background: the sunset city melted into bokeh, darkening into the tech world */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${CITY.skyTop} 0%, ${CITY.skyMid} 35%, ${CITY.skyLow} 70%, ${CITY.skyHorizon} 100%)`, opacity: 1 - dark }} />
      <AbsoluteFill style={{ filter: 'blur(22px)', opacity: 1 - dark * 0.85 }}>
        <svg width={1080} height={1920}>
          {Array.from({ length: 34 }).map((_, i) => (
            <circle key={i} cx={hash(i) * 1200 - 60} cy={700 + hash(i + 7) * 1300} r={30 + hash(i + 2) * 70}
              fill={i % 4 === 0 ? CITY.windowLit : i % 4 === 1 ? '#c9b6e0' : i % 4 === 2 ? '#ffb870' : '#e9a3b8'} opacity={0.55} />
          ))}
          
        </svg>
      </AbsoluteFill>
      {/* the torch + hand, dollying in on the lens */}
      <AbsoluteFill style={{ transform: `scale(${dolly}) translate(${(540 - LENS.x) * (1 - 1 / dolly)}px, ${(960 - LENS.y) * (1 - 1 / dolly)}px)`, transformOrigin: `${LENS.x}px ${LENS.y}px` }}>
        <svg width={1080} height={1920}>
          <defs>
            <linearGradient id="mBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6c7484" /><stop offset=".18" stopColor="#c3c9d4" /><stop offset=".32" stopColor="#4a5160" /><stop offset=".7" stopColor="#1a1d24" /><stop offset="1" stopColor="#3c4250" /></linearGradient>
            <linearGradient id="mHead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f08a68" /><stop offset=".22" stopColor="#ffc2a6" /><stop offset=".4" stopColor="#b9462f" /><stop offset=".8" stopColor="#5a1f14" /><stop offset="1" stopColor="#8a3424" /></linearGradient>
            <pattern id="knurl" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="none" /><path d="M0 0 L16 16 M16 0 L0 16" stroke="#0c0e12" strokeWidth="3" opacity=".7" /></pattern>
            <radialGradient id="mRefl" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffffff" /><stop offset=".18" stopColor="#d9dde6" /><stop offset=".36" stopColor="#8f96a6" /><stop offset=".52" stopColor="#e9edf4" /><stop offset=".7" stopColor="#7d8494" /><stop offset=".86" stopColor="#c9ced8" /><stop offset="1" stopColor="#5a6070" /></radialGradient>
            <radialGradient id="mGlow"><stop offset="0" stopColor="#ffffff" /><stop offset=".25" stopColor={col} stopOpacity=".9" /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient>
            <linearGradient id="mBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={col} stopOpacity=".75" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient>
            <radialGradient id="skinG" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#c4875f" /><stop offset=".7" stopColor="#a8714f" /><stop offset="1" stopColor="#7a4c33" /></radialGradient>
            <filter id="mb"><feGaussianBlur stdDeviation="10" /></filter><filter id="mb2"><feGaussianBlur stdDeviation="36" /></filter>
          </defs>
          {/* beam cone into the distance (behind the torch head) */}
          <g transform={`translate(${LENS.x} ${LENS.y}) scale(1.42) rotate(-28)`} style={{ mixBlendMode: 'screen' }} opacity={on}>
            <path d="M 0 -60 L 900 -420 L 900 420 L 0 60 Z" fill="url(#mBeam)" filter="url(#mb)" opacity={0.6} />
            {Array.from({ length: 26 }).map((_, i) => <circle key={i} cx={80 + hash(i) * 700 + (t * 40) % 60} cy={(hash(i + 4) - 0.5) * 400 * (0.2 + hash(i))} r={2 + hash(i + 2) * 3} fill="#fff" opacity={0.5 * hash(i + 9)} />)}
          </g>
          <g transform={`translate(${LENS.x} ${LENS.y}) scale(1.42) rotate(-28)`}>
            {/* body: from the lens back toward the bottom-left */}
            <rect x={-760} y={-62} width={600} height={124} rx={30} fill="url(#mBody)" />
            <rect x={-700} y={-62} width={360} height={124} fill="url(#knurl)" opacity={0.85} />
            <rect x={-770} y={-58} width={40} height={116} rx={14} fill="#2a2e38" />
            <rect x={-300} y={-82} width={70} height={30} rx={12} fill="#15171c" />
            <rect x={-300 + press * 0} y={-90 + press * 8} width={70} height={14} rx={7} fill="#2b2f37" />
            <path d="M -170 -62 L -40 -104 L -6 -104 L -6 104 L -40 104 L -170 62 Z" fill="url(#mHead)" />
            {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={-150 + i * 18} y={-70 - i * 6} width={4} height={140 + i * 12} fill="#3a120c" opacity={0.35} />)}
            <rect x={-10} y={-112} width={22} height={224} rx={8} fill="#d6d9df" />
            <ellipse cx={12} cy={0} rx={24} ry={104} fill="url(#mRefl)" />
            <ellipse cx={14} cy={0} rx={8} ry={30} fill={on > 0.05 ? '#ffffff' : '#c9a24a'} />
            <ellipse cx={18} cy={0} rx={130 * (0.4 + on)} ry={190 * (0.4 + on)} fill="url(#mGlow)" opacity={on} style={{ mixBlendMode: 'screen' }} />
            <rect x={-200} y={-3} width={900} height={6} fill={col} opacity={0.35 * on} filter="url(#mb)" />
          </g>
          {/* the hand gripping the torch, thumb on the switch */}
          <g transform={`translate(${LENS.x} ${LENS.y}) scale(1.42) rotate(-28)`}>
            <path d="M -620 -70 Q -520 -120 -380 -96 Q -300 -86 -276 -40 L -300 90 Q -420 140 -560 120 Q -650 100 -660 20 Z" fill="url(#skinG)" />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-560 + i * 62} 70 Q ${-540 + i * 62} 128 ${-500 + i * 62} 112`} stroke="#7a4c33" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />)}
            <g transform={`translate(0 ${press * 8})`}>
              <path d="M -470 -90 Q -380 -150 -290 -112 Q -262 -98 -280 -80 Q -360 -96 -440 -66 Z" fill="#b57b56" />
              <ellipse cx={-286} cy={-100} rx={20} ry={13} fill="#d9a48a" opacity={0.7} />
            </g>
            <path d="M -640 -40 Q -700 60 -760 120 Q -880 300 -980 620 L -620 700 Q -560 420 -470 200 Q -430 120 -420 110 Q -540 140 -600 110 Z" fill={CITY.teal} /><path d="M -640 -40 Q -700 60 -760 120 Q -880 300 -980 620 L -900 640 Q -800 330 -700 160 Z" fill={CITY.tealDark} opacity={0.7} /><path d="M -652 -20 Q -620 70 -520 120 Q -480 128 -440 116" stroke={CITY.tealDark} strokeWidth={14} fill="none" strokeLinecap="round" />
          </g>
        </svg>
      </AbsoluteFill>
      {/* binary digits leave the lens in step with each pulse */}
      <AbsoluteFill>
        {BITS.split('').map((b, i) => {
          const s = bitStart + i * bd, u = (t - s) / 0.9; if (u < 0) return null;
          const k = Math.min(1, u); const x = LENS.x + 60 + k * (120 + i * 38) - (1 - k) * 20, y = LENS.y - 260 - i * 6 - k * 120;
          return <div key={i} style={{ position: 'absolute', left: lerp(LENS.x + 30, 210 + i * 86, Math.min(1, u * 0.8)), top: lerp(LENS.y - 40, 520, Math.min(1, u * 0.8)), font: `600 64px ${FONT.mono}`, color: b === '1' ? TECH.cyan : TECH.text2, textShadow: b === '1' ? `0 0 24px ${TECH.cyan}` : 'none', opacity: Math.min(1, u * 4) * (1 - flood), transform: 'translate(-50%,-50%)' }}>{b}</div>;
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', font: `500 30px ${FONT.mono}`, letterSpacing: '0.3em', color: TECH.text2, opacity: prog(f, bitStart + 1.6, bitStart + 1.9) * (1 - flood) }}>8 PULSES = 1 LETTER</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${LENS.x}px ${LENS.y}px, ${TECH.cyan} 0%, ${TECH.bg} 70%)`, opacity: flood }} />
    </AbsoluteFill>
  );
};
