import React from 'react';

/**
 * Minimalist 2.5D character rig (original design): rounded head, expressive eyes with blink,
 * brows and mouth that change with emotion, stylised hair, layered clothing with soft rim light,
 * two-segment arms. Origin = waist centre; the body is drawn upward (negative y).
 */
export type CharStyle = {
  skin: string; skinShade: string; hair: string; top: string; topShade: string; accent?: string;
  hairStyle: 'boy' | 'girl'; rim?: string;
};
export type Pose = {
  breathe: number;          // -1..1
  blink: number;            // 0 open .. 1 closed
  look: [number, number];   // pupil offset (-1..1)
  brow: number;             // 0 relaxed .. 1 raised (surprise)
  smile: number;            // 0 neutral .. 1 big open smile
  headTilt: number;         // degrees
  armR: [number, number];   // upper, fore angle (deg from straight down, + = toward +x)
  armL: [number, number];
  holdTorch?: boolean; torchOn?: number; // 0..1 glow at lens
};

const limb = (x: number, y: number, a: number, len: number) => {
  const r = (a * Math.PI) / 180; return [x + Math.sin(r) * len, y + Math.cos(r) * len] as const;
};

export const Torch: React.FC<{ on: number; scale?: number }> = ({ on, scale = 1 }) => (
  <g transform={`scale(${scale})`}>
    <defs>
      <linearGradient id="tBody" x1="0" y1="-12" x2="0" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#5a6170" /><stop offset=".35" stopColor="#2a2f3a" /><stop offset=".7" stopColor="#14171d" /><stop offset="1" stopColor="#3a404c" />
      </linearGradient>
      <linearGradient id="tHead" x1="0" y1="-18" x2="0" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#e07a5a" /><stop offset=".4" stopColor="#a8432c" /><stop offset="1" stopColor="#5e2318" />
      </linearGradient>
      <radialGradient id="tLens"><stop offset="0" stopColor="#fffbe8" /><stop offset=".5" stopColor="#ffe3a6" /><stop offset="1" stopColor="#ffb454" stopOpacity="0" /></radialGradient>
    </defs>
    <rect x={-6} y={-10} width={70} height={20} rx={8} fill="url(#tBody)" />
    {[10, 18, 26, 34].map((x) => <rect key={x} x={x} y={-10} width={2.5} height={20} fill="#0b0d11" opacity={0.55} />)}
    <rect x={44} y={-13} width={9} height={6} rx={2.5} fill="#1a1d23" />
    <path d="M62 -11 L84 -17 L92 -17 L92 17 L84 17 L62 11 Z" fill="url(#tHead)" />
    <rect x={90} y={-18} width={5} height={36} rx={2} fill="#d9d4cc" />
    <ellipse cx={95} cy={0} rx={4} ry={15} fill={on > 0.05 ? '#fff6dc' : '#2a2f38'} />
    {on > 0.01 && <ellipse cx={97} cy={0} rx={22 * on} ry={30 * on} fill="url(#tLens)" opacity={on} />}
  </g>
);

export const Character: React.FC<{ s: CharStyle; p: Pose; id: string }> = ({ s, p, id }) => {
  const b = p.breathe * 2.2;
  const shoulderY = -138 + b;
  const R0: [number, number] = [74, shoulderY + 6], L0: [number, number] = [-74, shoulderY + 6];
  const [rex, rey] = limb(R0[0], R0[1], p.armR[0], 78); const [rwx, rwy] = limb(rex, rey, p.armR[1], 72);
  const [lex, ley] = limb(L0[0], L0[1], p.armL[0], 78); const [lwx, lwy] = limb(lex, ley, p.armL[1], 72);
  const eyeS = 1 - 0.92 * p.blink;
  const px = p.look[0] * 6, py = p.look[1] * 5;
  const smile = p.smile;
  const mouth = smile < 0.5
    ? `M -16 ${30 - smile * 4} Q 0 ${36 + smile * 14} 16 ${30 - smile * 4}`
    : `M -20 26 Q 0 ${30 + smile * 26} 20 26 Q 0 ${30 + smile * 8} -20 26 Z`;
  const torsoD = `M -64 26 C -70 -40 -94 -96 -84 ${shoulderY} Q -62 ${shoulderY - 22} -20 ${shoulderY - 24} L 20 ${shoulderY - 24} Q 62 ${shoulderY - 22} 84 ${shoulderY} C 94 -96 70 -40 64 26 Z`;
  return (
    <g>
      <defs>
        <linearGradient id={`rim${id}`} x1="-90" y1="0" x2="90" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={s.rim || '#ffd2a8'} stopOpacity=".55" /><stop offset=".22" stopColor={s.rim || '#ffd2a8'} stopOpacity="0" />
          <stop offset=".7" stopColor="#1b1430" stopOpacity="0" /><stop offset="1" stopColor="#1b1430" stopOpacity=".32" />
        </linearGradient>
        <radialGradient id={`face${id}`} cx=".38" cy=".38" r=".75"><stop offset="0" stopColor={s.skin} /><stop offset=".75" stopColor={s.skin} /><stop offset="1" stopColor={s.skinShade} /></radialGradient>
      </defs>
      {/* back arm */}
      <line x1={L0[0]} y1={L0[1]} x2={lex} y2={ley} stroke={s.topShade} strokeWidth={36} strokeLinecap="round" />
      <line x1={lex} y1={ley} x2={lwx} y2={lwy} stroke={s.skinShade} strokeWidth={27} strokeLinecap="round" />
      <circle cx={lwx} cy={lwy} r={16} fill={s.skinShade} />
      {/* torso */}
      <path d={torsoD} fill={s.top} />
      <path d={torsoD} fill={`url(#rim${id})`} />
      {s.hairStyle === 'girl' ? (
        <g>
          <path d={`M -38 ${shoulderY - 22} Q 0 ${shoulderY + 34} 38 ${shoulderY - 22} L 30 ${shoulderY - 24} Q 0 ${shoulderY + 14} -30 ${shoulderY - 24} Z`} fill={s.topShade} />
          <path d={`M -86 ${shoulderY + 4} Q -20 ${shoulderY + 40} 40 ${shoulderY - 22} L 54 ${shoulderY - 18} Q -10 ${shoulderY + 64} -78 ${shoulderY + 34} Z`} fill={s.accent} opacity={0.95} />
        </g>
      ) : (
        <path d={`M -30 ${shoulderY - 23} Q 0 ${shoulderY + 6} 30 ${shoulderY - 23}`} stroke={s.topShade} strokeWidth={7} fill="none" strokeLinecap="round" />
      )}
      {/* neck */}
      <rect x={-17} y={shoulderY - 52} width={34} height={36} rx={12} fill={s.skinShade} />
      {/* head */}
      <g transform={`translate(0 ${shoulderY - 110 + b * 0.4}) rotate(${p.headTilt})`}>
        {s.hairStyle === 'girl' && <><circle cx={-6} cy={-70} r={28} fill={s.hair} /><path d="M 52 -10 Q 86 40 62 104 Q 50 120 44 104 Q 64 50 36 4 Z" fill={s.hair} /></>}
        <ellipse cx={-63} cy={6} rx={12} ry={16} fill={s.skinShade} /><ellipse cx={63} cy={6} rx={12} ry={16} fill={s.skinShade} />
        <ellipse cx={0} cy={0} rx={64} ry={70} fill={`url(#face${id})`} />
        {s.hairStyle === 'boy' ? (
          <path d="M -66 -2 C -72 -64 -30 -88 4 -86 C 46 -86 74 -58 66 -6 C 58 -30 44 -44 22 -42 C 30 -54 18 -60 6 -52 C -6 -66 -30 -58 -34 -44 C -48 -40 -60 -26 -66 -2 Z" fill={s.hair} />
        ) : (
          <path d="M -68 18 C -76 -58 -34 -90 4 -88 C 50 -88 78 -56 68 14 C 62 -18 48 -40 30 -46 C 10 -38 -20 -36 -40 -52 C -52 -36 -62 -18 -68 18 Z" fill={s.hair} />
        )}
        <path d="M -40 -64 Q -10 -80 22 -72" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* brows */}
        <path d={`M -38 ${-30 - p.brow * 8} Q -26 ${-38 - p.brow * 10} -14 ${-31 - p.brow * 8}`} stroke={s.hair} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d={`M 14 ${-31 - p.brow * 8} Q 26 ${-38 - p.brow * 10} 38 ${-30 - p.brow * 8}`} stroke={s.hair} strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* eyes */}
        {[-26, 26].map((ex) => (
          <g key={ex} transform={`translate(${ex} -6) scale(1 ${eyeS})`}>
            <ellipse cx={0} cy={0} rx={13 + p.brow * 2} ry={15 + p.brow * 2} fill="#fffaf2" />
            <ellipse cx={px} cy={py} rx={8.5} ry={10} fill="#2a1d1a" />
            <circle cx={px + 3} cy={py - 4} r={3.2} fill="#ffffff" />
          </g>
        ))}
        {p.blink > 0.6 && [-26, 26].map((ex) => <path key={ex} d={`M ${ex - 13} -6 Q ${ex} 0 ${ex + 13} -6`} stroke="#3a2a26" strokeWidth={4} fill="none" strokeLinecap="round" />)}
        <path d="M -3 12 Q 2 18 6 13" stroke={s.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
        <ellipse cx={-40} cy={20} rx={11} ry={6} fill="#e8796a" opacity={0.28} /><ellipse cx={40} cy={20} rx={11} ry={6} fill="#e8796a" opacity={0.28} />
        <path d={mouth} fill={smile >= 0.5 ? '#6b2a2a' : 'none'} stroke="#5a2424" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        {smile >= 0.5 && <path d={`M -14 28 Q 0 ${31 + smile * 4} 14 28 L 14 30 Q 0 ${34 + smile * 4} -14 30 Z`} fill="#fff" />}
        {s.hairStyle === 'girl' && <><circle cx={0} cy={-20} r={2.6} fill="#c8324a" /><circle cx={-63} cy={22} r={4} fill="#ffcc66" /><circle cx={63} cy={22} r={4} fill="#ffcc66" /></>}
      </g>
      {/* front arm (+ torch) */}
      <line x1={R0[0]} y1={R0[1]} x2={rex} y2={rey} stroke={s.top} strokeWidth={36} strokeLinecap="round" />
      <line x1={rex} y1={rey} x2={rwx} y2={rwy} stroke={s.skin} strokeWidth={27} strokeLinecap="round" />
      {p.holdTorch && (
        <g transform={`translate(${rwx} ${rwy}) rotate(${90 - p.armR[1]})`}><Torch on={p.torchOn || 0} scale={0.95} /></g>
      )}
      <circle cx={rwx} cy={rwy} r={16} fill={s.skin} />
    </g>
  );
};
