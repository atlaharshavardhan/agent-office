// The student, redrawn from "InvisiTech Student with an Unlit Bulb.png": swept wavy dark hair, yellow hoodie,
// dark jeans, navy canvas sneakers. No pencil. Natural proportions: about 7.3 heads tall.
// Local frame for full figures: x = 0 is the body centre, feet on y = 1000, top of the head near y = 0.
import React from 'react';

export const C = {
  line: '#3b2a22', lineSkin: '#6e3d24', hairLine: '#0b0c14', lash: '#1a1214', brow: '#16141c', iris: '#3a2416', rim: '#c9783e', hairMid: '#22263a',
  skin: '#c47f52', skinSh: '#a3623c', skinHi: '#d99a6c', blush: '#cf6b55', lip: '#9a4e3c',
  hair: '#191b2a', hairHi: '#3a4260', hairSh: '#0e1019',
  hood: '#f6b412', hoodSh: '#d78d0a', hoodDeep: '#b3700a', hoodHi: '#ffd451', string: '#f8d26a', aglet: '#8d8f96',
  jeans: '#2b3350', jeansSh: '#1f2640', jeansHi: '#3d4768', stitch: '#7d6a4a',
  shoe: '#4c5a7c', shoeSh: '#3a4766', sole: '#efece4', soleSh: '#cdc8bd', lace: '#f6f3ec',
  eye: '#2a1a14', white: '#fbf7f0',
};
const LW = 2.4;
// outline colour follows the material: warm brown on skin, deep amber on the hoodie, ink-navy on denim
const lineFor = (f: string) => (f === C.skin || f === C.skinSh ? C.lineSkin : f.includes('hood') || f === C.hood || f === C.hoodSh || f === C.hoodDeep ? '#94600a' : f.includes('jeans') ? '#151a2c' : C.line);
const S = (p: { d: string; f: string; w?: number; o?: number; sw?: number }) =>
  <path d={p.d} fill={p.f} stroke={p.w === 0 ? 'none' : lineFor(p.f)} strokeWidth={p.w ?? LW} strokeLinejoin="round" strokeLinecap="round" opacity={p.o} />;
const Line = ({ d, w = 2.2, c = C.line, o = 1 }: { d: string; w?: number; c?: string; o?: number }) =>
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o} />;

// ============================================================== faces
export type Expr = 'neutral' | 'smile' | 'puzzled' | 'focus' | 'idea' | 'dawn';

// a hair lock: a tapered, curving blade from base (x, y) heading at `ang` degrees (0 = right, 90 = down), bending by `curl`
const lockPath = (x: number, y: number, len: number, ang: number, curl: number, w: number) => {
  const n = 9, a = (ang * Math.PI) / 180, L: string[] = [], R: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = len * t, v = curl * len * t * t;
    const px = x + u * Math.cos(a) - v * Math.sin(a), py = y + u * Math.sin(a) + v * Math.cos(a);
    const dx = len * Math.cos(a) - 2 * curl * len * t * Math.sin(a), dy = len * Math.sin(a) + 2 * curl * len * t * Math.cos(a), dl = Math.hypot(dx, dy) || 1;
    const hw = (w / 2) * (1 - 0.62 * t ** 1.4);
    L.push(`${(px - (dy / dl) * hw).toFixed(1)} ${(py + (dx / dl) * hw).toFixed(1)}`);
    R.push(`${(px + (dy / dl) * hw).toFixed(1)} ${(py - (dx / dl) * hw).toFixed(1)}`);
  }
  const tipR = ((w / 2) * 0.38).toFixed(1);
  return `M ${L.join(' L ')} A ${tipR} ${tipR} 0 0 0 ${R[R.length - 1]} L ${R.reverse().slice(1).join(' L ')} Z`;
};
type Lock = [number, number, number, number, number, number];
const Hair: React.FC<{ locks: Lock[]; mass: string; rim?: number[] }> = ({ locks, mass, rim = [] }) => (
  <g>
    <path d={mass} fill={C.hair} stroke={C.hairLine} strokeWidth={1.6} strokeLinejoin="round" />
    {locks.map((k, i) => <path key={i} d={lockPath(...k)} fill={rim.includes(i) ? 'url(#sg-rim)' : i % 3 === 1 ? C.hairMid : C.hair} stroke={C.hairLine} strokeWidth={1.3} strokeLinejoin="round" />)}
    {/* soft sheen inside a few waves */}
    {locks.filter((_, i) => i % 2 === 0 && !rim.includes(i)).map((k, i) => { const [x, y, len, ang, curl, w] = k; return <path key={i} d={lockPath(x + Math.cos((ang * Math.PI) / 180) * w * 0.2, y + Math.sin((ang * Math.PI) / 180) * w * 0.2 - w * 0.12, len * 0.6, ang, curl, w * 0.18)} fill={C.hairHi} opacity={0.7} />; })}
  </g>
);

// hair as one soft silhouette (wavy outline) with flowing strands inside and a warm rim on its left edge
let hairId = 0;
const HairMass: React.FC<{ d: string; strands: string[]; dark: string[]; rim: string }> = ({ d, strands, dark, rim }) => {
  const id = `hm${hairId++}`;
  return (
    <g>
      <clipPath id={id}><path d={d} /></clipPath>
      <path d={d} fill={C.hair} />
      <g clipPath={`url(#${id})`}>
        {dark.map((q, i) => <path key={`d${i}`} d={q} fill="none" stroke={C.hairSh} strokeWidth={7} strokeLinecap="round" opacity={0.9} />)}
        {strands.map((q, i) => <path key={`s${i}`} d={q} fill="none" stroke={C.hairHi} strokeWidth={3.2} strokeLinecap="round" opacity={0.85} />)}
        <path d={rim} fill="none" stroke={C.rim} strokeWidth={9} strokeLinecap="round" opacity={0.65} />
      </g>
      <path d={d} fill="none" stroke={C.hairLine} strokeWidth={1.8} strokeLinejoin="round" />
    </g>
  );
};
// apply a point map to a path made of numbers (x y pairs after each command letter)
const mapPath = (d: string, f: (x: number, y: number) => [number, number]) =>
  d.replace(/(-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)/g, (_, a, b) => { const [x, y] = f(+a, +b); return `${x.toFixed(1)} ${y.toFixed(1)}`; });

// eyes, brows, nose, mouth. The face centre line is x = 0; `turn` (0 front .. 1 three-quarter to our right)
const Features: React.FC<{ turn: number; ex: Expr; look?: [number, number] }> = ({ turn: t, ex, look = [0, 0] }) => {
  const eyeY = 75;
  const farW = 1 - 0.3 * t;
  const eF = -19 + 8 * t, eN = 19 + 5 * t;   // eye centres
  const nx = 4 * t + 9 * t;                  // nose / mouth centre slides toward the turn
  const open = ex === 'focus' ? 0.6 : ex === 'idea' ? 1.25 : ex === 'dawn' ? 1.1 : 1;
  const bro: Record<Expr, [number, number, number, number]> = {
    neutral: [0, 0, 0, 0], smile: [-1, 0, -1, 0], puzzled: [-8, -10, 3, 1], focus: [5, -1, 5, -1], idea: [-8, -6, -8, -6], dawn: [-6, -3, -6, -3],
  };
  const [ni, no, fi, fo] = bro[ex];
  const eye = (x: number, w: number, key: string) => {
    const hw = 10.4 * w, hh = 6.4 * open;
    const lx = look[0] * 3 * w, ly = Math.min(5, look[1] * 3);
    const droop = Math.max(0, look[1] - 0.8) * 3.2;
    return (
      <g key={key}>
        <path d={`M ${x - hw} ${eyeY} Q ${x - 1} ${eyeY - hh * 1.5} ${x + hw} ${eyeY - 1} Q ${x} ${eyeY + hh * 0.95} ${x - hw} ${eyeY} Z`} fill={C.white} />
        <ellipse cx={x + lx} cy={eyeY + ly} rx={6 * Math.min(1, w + 0.12)} ry={Math.min(7, hh * 1.05)} fill={C.iris} />
        <ellipse cx={x + lx} cy={eyeY + ly} rx={2.8 * Math.min(1, w + 0.12)} ry={Math.min(3.2, hh * 0.6)} fill={C.eye} />
        <circle cx={x + lx + 2} cy={eyeY + ly - 2} r={1.7} fill="#fff" />
        {droop > 0 && <path d={`M ${x - hw - 1} ${eyeY + 1} Q ${x} ${eyeY - hh * 1.7} ${x + hw + 1} ${eyeY - 1} L ${x + hw + 1} ${eyeY - 1 + droop * 0.4} Q ${x} ${eyeY - hh * 1.6 + droop * 1.6} ${x - hw - 1} ${eyeY + 1 + droop * 0.4} Z`} fill={C.skin} />}
        {/* lid line with a small outer flick, the crease above it */}
        <path d={`M ${x - hw - 1} ${eyeY + 0.6 + droop * 0.4} Q ${x - 1} ${eyeY - hh * 1.6 + droop * 1.6} ${x + hw + 1.5} ${eyeY - 1.2 + droop * 0.4} l 3 -2`} fill="none" stroke={C.lash} strokeWidth={3.8} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M ${x - hw * 0.6} ${eyeY - hh * 1.6 - 2} Q ${x} ${eyeY - hh * 2} ${x + hw * 0.7} ${eyeY - hh * 1.5 - 2}`} fill="none" stroke={C.skinSh} strokeWidth={1.3} strokeLinecap="round" opacity={0.7} />
        <path d={`M ${x - hw * 0.5} ${eyeY + hh * 0.95} Q ${x + 1} ${eyeY + hh * 1.15} ${x + hw * 0.6} ${eyeY + hh * 0.8}`} fill="none" stroke={C.skinSh} strokeWidth={1.3} strokeLinecap="round" />
      </g>
    );
  };
  // tapered brow: thick at the inner end, thin at the outer
  const brow = (xi: number, xo: number, yi: number, yo: number, key: string) => {
    const xm = (xi + xo) / 2, ym = Math.min(yi, yo) - 5;
    return <path key={key} d={`M ${xi} ${yi + 4} Q ${xm} ${ym + 1} ${xo} ${yo + 1} L ${xo} ${yo + 3.5} Q ${xm} ${ym + 8} ${xi} ${yi + 11} Z`} fill={C.brow} />;
  };
  return (
    <g>
      {brow(eF + 10 * farW, eF - 13 * farW, 56 + fi, 58 + fo, 'bf')}
      {brow(eN - 9, eN + 15, 56 + ni, 57 + no, 'bn')}
      {eye(eF, farW, 'ef')}
      {eye(eN, 1, 'en')}
      {/* nose: the bridge shadow, the wing and the tip */}
      <path d={`M ${nx + 5} ${62} C ${nx + 6} ${76} ${nx + 9} ${88} ${nx + 11} ${98}`} fill="none" stroke={C.skinSh} strokeWidth={2.2} strokeLinecap="round" opacity={0.8} />
      <path d={`M ${nx - 7} ${100} C ${nx - 4} ${104} ${nx + 4} ${105} ${nx + 9} ${101}`} fill="none" stroke={C.lineSkin} strokeWidth={2} strokeLinecap="round" />
      <path d={`M ${nx + 9} ${94} C ${nx + 14} ${96} ${nx + 13} ${102} ${nx + 9} ${103}`} fill="none" stroke={C.lineSkin} strokeWidth={1.8} strokeLinecap="round" />
      <ellipse cx={nx + 2} cy={95} rx={3} ry={2} fill={C.skinHi} opacity={0.45} />
      {/* cheekbones */}
      <path d={`M ${eN + 14} 92 C ${eN + 18} 100 ${eN + 14} 108 ${eN + 8} 112`} fill="none" stroke={C.skinSh} strokeWidth={1.6} opacity={0.6} />
      <ellipse cx={eF} cy={92} rx={8 * farW} ry={4} fill={C.blush} opacity={0.16} />
      <ellipse cx={eN + 3} cy={92} rx={9} ry={4} fill={C.blush} opacity={0.16} />
      {/* mouth */}
      {(ex === 'neutral' || ex === 'smile') && <g>
        <path d={`M ${nx - 13} ${ex === 'smile' ? 114 : 116} Q ${nx} ${ex === 'smile' ? 121 : 118} ${nx + 13} ${ex === 'smile' ? 113 : 116}`} fill="none" stroke={C.lip} strokeWidth={2.6} strokeLinecap="round" />
        <path d={`M ${nx - 7} 121 Q ${nx} 124 ${nx + 7} 121`} fill="none" stroke={C.skinSh} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
        {ex === 'smile' && <path d={`M ${nx + 15} 109 q 3 3 0 7`} fill="none" stroke={C.skinSh} strokeWidth={1.6} strokeLinecap="round" />}
      </g>}
      {ex === 'puzzled' && <path d={`M ${nx - 12} 119 Q ${nx - 3} 114 ${nx + 4} 117 Q ${nx + 9} 119 ${nx + 13} 113`} fill="none" stroke={C.lip} strokeWidth={2.6} strokeLinecap="round" />}
      {ex === 'focus' && <g><path d={`M ${nx - 10} 117 L ${nx + 10} 116`} fill="none" stroke={C.lip} strokeWidth={2.8} strokeLinecap="round" /><path d={`M ${nx + 10} 116 q 4 -1 5 -4`} fill="none" stroke={C.lip} strokeWidth={1.8} strokeLinecap="round" /></g>}
      {ex === 'dawn' && <ellipse cx={nx + 1} cy={118} rx={5.5} ry={5} fill="#4a1a1a" stroke={C.lineSkin} strokeWidth={1.6} />}
      {ex === 'idea' && <g><path d={`M ${nx - 13} 112 Q ${nx} 110 ${nx + 14} 111 Q ${nx + 12} 128 ${nx + 1} 129 Q ${nx - 11} 128 ${nx - 13} 112 Z`} fill="#4a1a1a" stroke={C.lineSkin} strokeWidth={1.8} strokeLinejoin="round" /><path d={`M ${nx - 10} 113.5 L ${nx + 11} 113`} stroke="#f4efe6" strokeWidth={4} strokeLinecap="round" /><path d={`M ${nx - 5} 125 Q ${nx + 1} 121 ${nx + 7} 125`} fill="#b85050" /></g>}
    </g>
  );
};

// head, front or three-quarter (turn 0..1, turned toward our right). Box about x -60..64, y -36..190 (neck to 190)
export const HeadFQ: React.FC<{ turn?: number; ex?: Expr; look?: [number, number] }> = ({ turn = 0, ex = 'neutral', look }) => {
  const t = turn;
  const fl = -40 + 7 * t, fr = 41 + 2 * t, jx = 7 * t;
  const face = `M ${fl} 58 C ${fl - 1} 30 ${-24 + 5 * t} 8 ${2 + jx} 6 C ${28 + jx} 8 ${fr + 1} 30 ${fr} 60 C ${fr} 82 ${36 + jx} 102 ${28 + jx} 118 C ${20 + jx} 132 ${10 + jx} 142 ${1 + jx} 143 C ${-9 + jx} 142 ${-19 + jx * 0.6} 132 ${-27 + jx * 0.5} 118 C ${-35 + t * 5} 102 ${fl + 1} 82 ${fl} 58 Z`;
  const sx = (x: number) => x + 6 * t; // shift hair toward the turn
  const locks: Lock[] = [
    // left side, swept up (the first two catch the warm rim light)
    [sx(-40), 52, 40, -96, 0.55, 22], [sx(-42), 26, 46, -70, 0.6, 28],
    // crown waves rolling over to our right
    [sx(-30), 6, 52, -44, 0.6, 34], [sx(-12), -8, 56, -22, 0.65, 34], [sx(8), -12, 54, -2, 0.7, 32], [sx(26), -8, 50, 20, 0.75, 30],
    // right side, curling down past the temple
    [sx(42), 6, 46, 56, 0.55, 26], [sx(50), 30, 40, 92, 0.45, 20], [sx(46), 50, 30, 120, 0.5, 14],
    // the loose waves that fall onto the forehead
    [sx(20), 18, 40, 112, -0.5, 18], [sx(32), 22, 32, 96, -0.55, 14], [sx(2), 20, 30, 135, -0.45, 14],
  ];
  const mass = `M ${sx(-42) + 4 * t} 70 C ${sx(-52)} 30 ${sx(-44)} -8 ${sx(-12)} -22 C ${sx(16)} -32 ${sx(48)} -20 ${sx(56)} 12 C ${sx(60)} 34 ${sx(56)} 56 ${sx(48)} 72 C ${sx(46)} 52 ${sx(40)} 40 ${sx(28)} 34 C ${sx(12)} 28 ${sx(-8)} 30 ${sx(-22)} 36 C ${sx(-32)} 42 ${sx(-38)} 54 ${sx(-42) + 4 * t} 70 Z`;
  return (
    <g>
      {/* neck, with the jaw shadow */}
      <path d={`M ${-15 + jx * 0.4} 118 L ${-18 + jx * 0.4} 192 L ${19 + jx * 0.4} 192 L ${16 + jx * 0.4} 118 Z`} fill="url(#sg-skin)" stroke={C.lineSkin} strokeWidth={1.8} />
      <path d={`M ${-16 + jx * 0.4} 126 L ${-17 + jx * 0.4} 156 C ${-4 + jx} 166 ${8 + jx} 166 ${18 + jx * 0.4} 154 L ${17 + jx * 0.4} 126 Z`} fill={C.skinSh} opacity={0.6} />
      {/* back of the hair */}
      <path d={`M ${sx(-44) + 4 * t} 62 C ${sx(-56)} 40 ${sx(-56)} 6 ${sx(-30)} -14 C ${sx(-6)} -30 ${sx(32)} -28 ${sx(52)} -6 C ${sx(62)} 12 ${sx(62)} 40 ${sx(52)} 62 Z`} fill={C.hairSh} />
      {/* ears */}
      {t < 0.85 && <path d={`M ${fl + 2} 66 C ${fl - 10} 62 ${fl - 12} 84 ${fl - 6} 94 C ${fl - 2} 100 ${fl + 3} 98 ${fl + 3} 92 Z`} fill={C.skin} stroke={C.lineSkin} strokeWidth={1.8} />}
      <path d={`M ${fr - 2} 66 C ${fr + 10} 62 ${fr + 12} 84 ${fr + 6} 94 C ${fr + 2} 100 ${fr - 3} 98 ${fr - 3} 92 Z`} fill={C.skin} stroke={C.lineSkin} strokeWidth={1.8} />
      <path d={`M ${fr + 2} 72 C ${fr + 7} 76 ${fr + 6} 86 ${fr + 2} 90`} fill="none" stroke={C.skinSh} strokeWidth={1.8} />
      {/* face */}
      <path d={face} fill="url(#sg-skin)" stroke={C.lineSkin} strokeWidth={2} strokeLinejoin="round" />
      <path d={`M ${fl} 58 C ${fl - 1} 30 ${-24 + 5 * t} 8 ${2 + jx} 6 C ${-16 + 5 * t} 22 ${-28 + 7 * t} 52 ${-26 + 7 * t} 82 C ${-24 + 7 * t} 104 ${-14 + jx} 126 ${1 + jx} 143 C ${-9 + jx} 142 ${-19 + jx * 0.6} 132 ${-27 + jx * 0.5} 118 C ${-35 + t * 5} 102 ${fl + 1} 82 ${fl} 58 Z`} fill={C.skinSh} opacity={0.16 + 0.16 * t} />
      <path d={`M ${-10 + jx} 132 C ${-2 + jx} 138 ${6 + jx} 138 ${14 + jx} 132`} fill="none" stroke={C.skinSh} strokeWidth={1.6} opacity={0.6} />
      <Features turn={t} ex={ex} look={look} />
      {/* hair */}
      {(() => {
        const f = (x: number, y: number): [number, number] => [x * (x < 0 ? 1 - 0.14 * t : 1) + 6 * t, y];
        const M = (q: string) => mapPath(q, f);
        return <HairMass
          d={M('M -40 66 C -46 56 -50 44 -48 32 C -58 28 -60 12 -50 2 C -54 -12 -42 -24 -28 -24 C -22 -36 -4 -40 8 -32 C 18 -42 40 -38 46 -24 C 60 -22 68 -6 62 8 C 72 16 70 32 60 38 C 64 50 58 62 48 66 C 50 54 46 46 40 42 C 36 34 28 30 20 32 C 14 40 10 48 4 52 C 6 42 4 34 -2 30 C -12 26 -24 30 -32 38 C -36 46 -38 56 -40 66 Z')}
          dark={[M('M -40 40 C -30 18 -12 6 10 6'), M('M 30 16 C 44 20 54 30 56 44'), M('M -20 -18 C -6 -26 12 -26 24 -18')]}
          strands={[M('M -38 22 C -26 -2 -6 -14 18 -12'), M('M -12 10 C 4 -4 26 -8 44 4'), M('M 18 -28 C 30 -32 40 -28 46 -20'), M('M 42 14 C 52 20 58 30 58 42'), M('M 14 34 C 10 42 7 46 4 50')]}
          rim={M('M -46 64 C -54 44 -58 20 -50 2 C -48 -12 -40 -22 -26 -26')} />;
      })()}
    </g>
  );
};

// profile head, facing right. Same box.
export const HeadSide: React.FC<{ ex?: Expr }> = ({ ex = 'neutral' }) => {
  const locks: Lock[] = [
    [-36, 30, 36, -110, -0.4, 22], [-34, 8, 44, -70, 0.5, 28], [-18, -8, 52, -40, 0.6, 30], [2, -16, 54, -14, 0.65, 28],
    [22, -14, 46, 14, 0.75, 24], [40, 0, 36, 50, 0.6, 20], [-46, 40, 30, 120, 0.2, 18], [46, 20, 28, 100, -0.5, 13], [36, 24, 26, 120, -0.4, 11],
  ];
  return (
    <g>
      <path d="M -10 116 L -14 192 L 22 192 L 20 116 Z" fill="url(#sg-skin)" stroke={C.lineSkin} strokeWidth={1.8} />
      <path d="M -12 128 L -14 166 C 0 162 12 156 20 146 L 20 124 Z" fill={C.skinSh} opacity={0.6} />
      <path d="M -46 80 C -62 52 -60 10 -30 -14 C -6 -32 34 -30 52 -10 C 58 0 58 12 54 22 L -20 84 Z" fill={C.hairSh} />
      <path d="M -24 42 C -20 16 8 6 30 10 C 42 14 48 28 50 42 L 51 58 C 52 62 51 66 54 70 C 58 78 62 86 64 92 C 65 96 62 98 57 98 C 59 102 58 106 55 108 C 58 110 58 116 54 118 C 52 126 50 132 44 136 C 34 142 18 140 8 132 C 0 126 -8 120 -14 116 C -26 104 -30 72 -24 42 Z" fill="url(#sg-skin)" stroke={C.lineSkin} strokeWidth={2} strokeLinejoin="round" />
      <path d="M -24 42 C -30 72 -26 104 -14 116 C -6 120 2 126 8 132 C 4 114 2 94 0 74 C -2 58 -10 48 -24 42 Z" fill={C.skinSh} opacity={0.3} />
      <path d="M -6 66 C -18 60 -22 84 -14 96 C -10 102 -2 100 0 94 C 2 84 0 72 -6 66 Z" fill={C.skin} stroke={C.lineSkin} strokeWidth={1.8} />
      <path d="M -8 74 C -14 78 -14 88 -9 92" fill="none" stroke={C.skinSh} strokeWidth={2} />
      <path d="M 37 72 Q 43 66 49 71 Q 43 76 37 72 Z" fill={C.white} />
      <ellipse cx={45} cy={72} rx={2.8} ry={4.2} fill={C.iris} />
      <path d="M 36 71 Q 43 64 50 70 l 2 -2" fill="none" stroke={C.lash} strokeWidth={3} strokeLinecap="round" />
      <path d={ex === 'focus' ? 'M 30 59 Q 40 56 52 60 L 52 62 Q 40 60 30 64 Z' : ex === 'idea' ? 'M 30 50 Q 40 45 52 50 L 52 52 Q 40 49 30 55 Z' : 'M 30 55 Q 40 50 52 55 L 52 57 Q 40 54 30 60 Z'} fill={C.brow} />
      <path d="M 54 84 C 56 88 56 92 52 94" fill="none" stroke={C.skinSh} strokeWidth={2} />
      <path d="M 57 108 Q 52 110 46 108" stroke={C.lip} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <ellipse cx={36} cy={94} rx={9} ry={4} fill={C.blush} opacity={0.16} />
      <HairMass
        d="M -44 74 C -58 44 -54 6 -32 -10 C -26 -28 0 -36 14 -26 C 28 -38 50 -28 54 -12 C 66 -6 68 12 58 22 C 64 32 58 44 48 42 C 46 32 40 26 32 26 C 26 34 18 36 10 32 C 2 40 -8 46 -14 52 C -20 60 -24 66 -26 72 C -32 68 -38 70 -44 74 Z"
        dark={['M -40 46 C -30 22 -10 10 12 10', 'M -18 -16 C -4 -24 14 -24 26 -16']}
        strands={['M -40 26 C -28 2 -6 -10 18 -8', 'M -10 12 C 6 0 28 -4 46 8', 'M 20 -24 C 32 -28 42 -24 48 -16']}
        rim="M -50 70 C -60 44 -58 12 -40 -6 C -34 -20 -22 -28 -10 -30" />
    </g>
  );
};

// gradients the student uses: include once in every <svg> that draws him
export const StudentDefs: React.FC = () => (
  <defs>
    <linearGradient id="sg-skin" x1="0.2" y1="0" x2="0.9" y2="1"><stop offset="0" stopColor="#d28f60" /><stop offset="1" stopColor="#b5703f" /></linearGradient>
    <linearGradient id="sg-hood" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stopColor="#ffc72e" /><stop offset="0.6" stopColor="#f5ad10" /><stop offset="1" stopColor="#e39709" /></linearGradient>
    <linearGradient id="sg-rim" x1="0" y1="0.5" x2="1" y2="0.5"><stop offset="0" stopColor="#d48a4a" /><stop offset="0.5" stopColor="#6a4030" /><stop offset="1" stopColor="#191b2a" /></linearGradient>
    <linearGradient id="sg-jeans" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#353f62" /><stop offset="1" stopColor="#252c47" /></linearGradient>
  </defs>
);

// ============================================================== hands (drawn large; scale down for figures)
// a relaxed hanging hand seen from its thumb side (front view of the figure), wrist at (0,0), fingers down
export const HandHang: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <g transform={flip ? 'scale(-1 1)' : undefined}>
    {/* fingers, back to front: little, ring, middle, index (slightly curled) */}
    {S({ d: 'M -15 44 C -19 58 -18 72 -12 79 C -8 82 -4 79 -5 73 C -7 64 -7 55 -5 47 Z', f: C.skinSh })}
    {S({ d: 'M -10 46 C -14 62 -12 80 -4 89 C 0 92 4 88 2 82 C 0 72 0 60 2 49 Z', f: C.skin })}
    {S({ d: 'M -3 48 C -5 66 -1 86 6 95 C 10 98 14 94 12 88 C 9 76 9 62 10 50 Z', f: C.skin })}
    {S({ d: 'M 5 47 C 5 62 8 77 14 84 C 18 87 22 83 20 77 C 16 68 15 57 16 47 Z', f: C.skin })}
    {/* back of the hand */}
    {S({ d: 'M -15 0 C -19 16 -19 34 -15 52 L 15 52 C 17 34 16 16 14 0 Z', f: C.skin })}
    <path d="M -15 0 C -19 16 -19 34 -15 52 L -6 52 C -9 34 -9 16 -6 0 Z" fill={C.skinSh} opacity={0.35} />
    {/* thumb, in front */}
    {S({ d: 'M 11 12 C 21 22 24 40 20 52 C 18 58 12 58 11 52 C 11 42 9 30 5 22 Z', f: C.skin })}
    <ellipse cx={17} cy={52} rx={3} ry={4} fill="#e3b291" />
  </g>
);

// hand gripping a bulb by its screw base: palm toward us, wrist at (0, 0), base held at about (0, -150)
export const HandBulb: React.FC = () => (
  <g>
    {/* wrist and palm */}
    {S({ d: 'M -40 0 C -44 -40 -50 -80 -48 -110 C -46 -124 -34 -132 -18 -134 L 30 -132 C 44 -128 52 -114 50 -96 C 48 -60 44 -30 40 0 Z', f: C.skin })}
    <path d="M -40 0 C -44 -40 -50 -80 -48 -110 C -36 -80 -30 -40 -26 0 Z" fill={C.skinSh} opacity={0.35} />
    <Line d="M -30 -56 C -10 -48 14 -50 34 -64" c={C.skinSh} w={2} />
    <Line d="M -20 -90 C -4 -84 14 -86 28 -96" c={C.skinSh} w={1.8} o={0.8} />
    {/* ring and little finger curled into the palm (knuckles toward us) */}
    {S({ d: 'M -44 -112 C -52 -128 -46 -146 -32 -146 C -22 -146 -18 -136 -20 -124 Z', f: C.skin })}
    {S({ d: 'M -26 -122 C -30 -142 -22 -158 -8 -156 C 2 -154 4 -142 0 -128 Z', f: C.skin })}
    {/* the bulb: screw base held between fingers and thumb, glass above */}
    <g transform="translate(6 -150)">
      <path d="M -16 -6 L 16 -6 L 14 -46 L -14 -46 Z" fill="#c3c6cc" stroke={C.line} strokeWidth={2.6} />
      {[-14, -24, -34].map((y) => <path key={y} d={`M -15 ${y} L 15 ${y - 5}`} stroke="#7f848d" strokeWidth={2.4} />)}
      <path d="M -6 -6 L 6 -6 L 4 2 L -4 2 Z" fill="#6c6e74" stroke={C.line} strokeWidth={2} />
      <path d="M -14 -46 C -40 -60 -42 -130 0 -134 C 42 -130 40 -60 14 -46 Z" fill="#dfe6ef" fillOpacity={0.55} stroke={C.line} strokeWidth={2.6} />
      <path d="M -6 -46 L -9 -86 M 6 -46 L 9 -86" stroke="#7a7d84" strokeWidth={1.8} />
      <path d="M -9 -86 L -5 -92 L -1 -86 L 3 -92 L 7 -86 L 9 -86" stroke="#4a4a4a" strokeWidth={1.8} fill="none" />
      <path d="M -26 -98 C -26 -114 -14 -122 -4 -122" stroke="#fff" strokeWidth={4} fill="none" opacity={0.8} strokeLinecap="round" />
    </g>
    {/* middle and index fingers wrap the base from the left */}
    {S({ d: 'M -14 -128 C -26 -150 -24 -176 -10 -186 C 0 -192 12 -188 14 -178 C 10 -174 4 -172 -2 -170 C -10 -160 -6 -146 2 -134 Z', f: C.skin })}
    {S({ d: 'M -8 -132 C -20 -158 -14 -188 4 -198 C 14 -202 24 -196 24 -186 C 18 -182 10 -180 6 -176 C -2 -164 2 -150 10 -136 Z', f: C.skin })}
    <path d="M 18 -186 Q 22 -190 23 -186" fill="none" stroke={C.skinSh} strokeWidth={2} />
    {/* thumb across the front of the base */}
    {S({ d: 'M 34 -110 C 46 -124 48 -146 38 -164 C 32 -176 20 -180 12 -174 C 8 -168 14 -162 20 -160 C 28 -152 30 -138 24 -124 Z', f: C.skin })}
    <ellipse cx={20} cy={-169} rx={6} ry={4.4} transform="rotate(-30 20 -169)" fill="#e3b291" stroke={C.skinSh} strokeWidth={1.4} />
    {/* hoodie cuff */}
    {S({ d: 'M -54 -6 L 52 -6 L 56 40 L -58 40 Z', f: 'url(#sg-hood)' })}
    {[-40, -24, -8, 8, 24, 40].map((x) => <Line key={x} d={`M ${x} -2 L ${x + 1} 36`} c={C.hoodSh} w={2} />)}
  </g>
);

// thumb and index pinching the edge of a foil sheet: wrist at (0,0), hand reaching up-left, pinch near (-120, -130)
export const HandFoil: React.FC = () => (
  <g>
    {/* the foil sheet, pinched at its corner */}
    <path d="M -128 -138 C -170 -150 -230 -150 -300 -140 L -330 -40 C -260 -50 -190 -50 -150 -40 Z" fill="#c9d1dc" stroke={C.line} strokeWidth={2.6} strokeLinejoin="round" />
    <path d="M -150 -120 C -190 -126 -240 -126 -290 -118 M -160 -90 C -200 -96 -250 -96 -300 -88" stroke="#fff" strokeWidth={3} fill="none" opacity={0.8} />
    <path d="M -200 -60 L -186 -84 L -170 -64 M -260 -110 L -246 -126" stroke="#8a95a6" strokeWidth={1.8} fill="none" />
    {/* curled middle, ring, little fingers (behind) */}
    {S({ d: 'M -60 -60 C -84 -64 -96 -84 -88 -100 C -80 -112 -64 -108 -54 -96 Z', f: C.skinSh })}
    {S({ d: 'M -48 -40 C -72 -40 -86 -58 -80 -74 C -74 -86 -58 -84 -46 -72 Z', f: C.skinSh })}
    {S({ d: 'M -36 -20 C -56 -18 -70 -32 -66 -46 C -62 -58 -48 -56 -38 -46 Z', f: C.skinSh })}
    {/* back of the hand */}
    {S({ d: 'M 30 10 C 6 -30 -30 -70 -56 -94 C -70 -106 -66 -128 -50 -132 C -30 -136 6 -112 34 -84 C 56 -60 66 -30 60 4 Z', f: C.skin })}
    <path d="M 30 10 C 6 -30 -30 -70 -56 -94 C -40 -70 -10 -30 8 12 Z" fill={C.skinSh} opacity={0.3} />
    <Line d="M -40 -120 q 6 -6 12 0 M -20 -110 q 6 -6 12 0" c={C.skinSh} w={2} />
    {/* index finger under the foil corner, tip pressing up */}
    {S({ d: 'M -50 -130 C -72 -142 -100 -150 -118 -150 C -128 -150 -132 -142 -126 -136 C -110 -132 -86 -124 -62 -108 Z', f: C.skin })}
    <path d="M -128 -138 L -118 -132" stroke={C.line} strokeWidth={2} />
    {/* thumb on top of the foil, pad pressing down onto the index tip */}
    {S({ d: 'M 10 -110 C -20 -136 -60 -160 -96 -166 C -112 -168 -122 -160 -116 -150 C -104 -146 -80 -140 -56 -126 C -36 -114 -12 -96 4 -84 Z', f: C.skin })}
    <ellipse cx={-104} cy={-160} rx={9} ry={5} transform="rotate(10 -104 -160)" fill="#e3b291" stroke={C.skinSh} strokeWidth={1.4} />
    <Line d="M -70 -150 C -66 -144 -66 -138 -70 -134" c={C.skinSh} w={1.8} />
    {/* hoodie cuff */}
    {S({ d: 'M 14 26 L 70 -24 L 110 24 L 54 74 Z', f: 'url(#sg-hood)' })}
    {[0, 1, 2, 3].map((i) => <Line key={i} d={`M ${24 + i * 12} ${18 - i * 11} L ${62 + i * 12} ${64 - i * 11}`} c={C.hoodSh} w={2} />)}
  </g>
);

// ============================================================== full figures
const Shoe: React.FC<{ x: number; mirror?: boolean }> = ({ x, mirror }) => (
  <g transform={`translate(${x} 0) scale(${mirror ? -1 : 1} 1)`}>
    {S({ d: 'M -30 948 C -34 962 -36 978 -32 986 L 32 986 C 36 978 34 962 30 948 Z', f: C.shoe })}
    <path d="M -30 948 C -34 962 -36 978 -32 986 L -14 986 C -18 974 -18 960 -16 948 Z" fill={C.shoeSh} opacity={0.6} />
    {S({ d: 'M -36 980 L 36 980 C 38 988 36 996 32 998 L -32 998 C -36 996 -38 988 -36 980 Z', f: C.sole })}
    <path d="M -20 966 Q 0 958 20 966 L 18 978 Q 0 972 -18 978 Z" fill={C.sole} stroke={C.line} strokeWidth={2} />
    {[952, 958, 964].map((y) => <Line key={y} d={`M -10 ${y} L 10 ${y}`} c={C.lace} w={3} />)}
  </g>
);

export const FrontFigure: React.FC<{ ex?: Expr }> = ({ ex = 'neutral' }) => (
  <g>
    {/* legs */}
    {S({ d: 'M -92 488 L 92 488 L 94 560 C 92 680 86 820 80 950 L 28 950 C 22 820 14 680 4 560 L -4 560 C -14 680 -22 820 -28 950 L -80 950 C -86 820 -92 680 -94 560 Z', f: 'url(#sg-jeans)' })}
    <path d="M -94 560 C -92 680 -86 820 -80 950 L -60 950 C -66 820 -72 680 -70 560 Z" fill={C.jeansSh} opacity={0.6} />
    <path d="M 4 560 C 14 680 22 820 28 950 L 44 950 C 36 820 30 680 22 560 Z" fill={C.jeansSh} opacity={0.5} />
    <Line d="M -54 520 L -56 940" c={C.stitch} w={1.4} o={0.5} />
    <Line d="M 54 520 L 56 940" c={C.stitch} w={1.4} o={0.5} />
    <Line d="M 0 492 L 0 556" c={C.jeansSh} w={2} />
    <Line d="M -62 700 q 10 6 20 0 M 42 700 q 10 6 20 0" c={C.jeansHi} w={2} o={0.7} />
    <Shoe x={-54} /><Shoe x={54} mirror />
    {/* arms behind the hoodie body: hands hang from the cuffs */}
    <g transform="translate(-106 468)"><HandHang flip /></g>
    <g transform="translate(106 468)"><HandHang /></g>
    {S({ d: 'M -98 176 C -124 196 -130 260 -128 330 C -126 384 -126 424 -124 444 L -86 444 C -88 404 -90 344 -92 290 Z', f: 'url(#sg-hood)' })}
    {S({ d: 'M 98 176 C 124 196 130 260 128 330 C 126 384 126 424 124 444 L 86 444 C 88 404 90 344 92 290 Z', f: 'url(#sg-hood)' })}
    <path d="M -98 176 C -124 196 -130 260 -128 330 C -126 384 -126 424 -124 444 L -110 444 C -112 400 -114 300 -108 200 Z" fill={C.hoodSh} opacity={0.6} />
    {S({ d: 'M -126 440 L -86 440 L -88 472 L -124 472 Z', f: 'url(#sg-hood)' })}
    {S({ d: 'M 126 440 L 86 440 L 88 472 L 124 472 Z', f: 'url(#sg-hood)' })}
    {/* hoodie body */}
    {S({ d: 'M -30 150 C -56 154 -86 160 -100 180 C -106 196 -106 250 -102 300 C -100 380 -98 440 -98 474 L 98 474 C 98 440 100 380 102 300 C 106 250 106 196 100 180 C 86 160 56 154 30 150 Z', f: 'url(#sg-hood)' })}
    <path d="M -100 180 C -106 196 -106 250 -102 300 C -100 380 -98 440 -98 474 L -74 474 C -78 400 -82 300 -80 200 Z" fill={C.hoodSh} opacity={0.55} />
    <path d="M 60 200 C 72 260 76 330 74 420" fill="none" stroke={C.hoodHi} strokeWidth={8} strokeLinecap="round" opacity={0.45} />
    {/* pocket */}
    {S({ d: 'M -62 358 L 62 358 L 74 446 L -74 446 Z', f: C.hood, w: 2.4 })}
    <path d="M -62 358 C -70 380 -74 410 -74 446 M 62 358 C 70 380 74 410 74 446" fill="none" stroke={C.hoodDeep} strokeWidth={3} />
    {/* hem band */}
    {S({ d: 'M -100 468 L 100 468 L 98 500 L -98 500 Z', f: 'url(#sg-hood)' })}
    {Array.from({ length: 13 }, (_, i) => <Line key={i} d={`M ${-90 + i * 15} 472 L ${-90 + i * 15} 496`} c={C.hoodSh} w={1.6} />)}
    {/* hood around the neck */}
    <g transform="translate(0 0)"><HeadFQ ex={ex} /></g>
    {S({ d: 'M -60 168 C -62 140 -36 126 -16 138 L 0 166 L 16 138 C 36 126 62 140 60 168 C 44 186 20 192 0 192 C -20 192 -44 186 -60 168 Z', f: 'url(#sg-hood)' })}
    {S({ d: 'M -16 140 L 0 170 L 16 140 C 10 150 4 154 0 154 C -4 154 -10 150 -16 140 Z', f: C.hoodDeep })}
    <path d="M -56 166 C -40 180 -20 184 0 184 C 20 184 40 180 56 166" fill="none" stroke={C.hoodSh} strokeWidth={3} />
    {/* drawstrings */}
    <Line d="M -10 172 C -12 200 -12 230 -14 262" c={C.line} w={5.4} /><Line d="M -10 172 C -12 200 -12 230 -14 262" c={C.string} w={3} />
    <Line d="M 10 172 C 12 200 12 230 14 264" c={C.line} w={5.4} /><Line d="M 10 172 C 12 200 12 230 14 264" c={C.string} w={3} />
    <rect x={-17} y={258} width={6} height={14} rx={2} fill={C.aglet} stroke={C.line} strokeWidth={1.4} />
    <rect x={11} y={260} width={6} height={14} rx={2} fill={C.aglet} stroke={C.line} strokeWidth={1.4} />
  </g>
);

// three-quarter: turned toward our right; the far (left) side is compressed and the far arm is half hidden
export const ThreeQFigure: React.FC<{ ex?: Expr }> = ({ ex = 'smile' }) => (
  <g>
    {S({ d: 'M -76 488 L 90 488 L 92 560 C 90 680 86 820 82 950 L 34 950 C 28 820 20 680 14 560 L 6 560 C -4 680 -12 820 -18 950 L -64 950 C -70 820 -76 680 -78 560 Z', f: 'url(#sg-jeans)' })}
    <path d="M -78 560 C -76 680 -70 820 -64 950 L -44 950 C -50 820 -56 680 -54 560 Z" fill={C.jeansSh} opacity={0.6} />
    <path d="M 14 560 C 20 680 28 820 34 950 L 50 950 C 42 820 36 680 30 560 Z" fill={C.jeansSh} opacity={0.45} />
    <Line d="M 60 520 L 62 940" c={C.stitch} w={1.4} o={0.5} />
    <Line d="M 10 492 L 10 556" c={C.jeansSh} w={2} />
    <g transform="translate(-42 0) scale(0.92 1)"><Shoe x={0} /></g>
    <g transform="translate(62 4)"><g transform="rotate(-6 0 990)"><Shoe x={0} mirror /></g></g>
    {/* far arm, mostly behind the body */}
    <g transform="translate(-92 466) scale(0.9 1)"><HandHang flip /></g>
    {S({ d: 'M -84 182 C -104 200 -110 260 -108 330 C -106 384 -106 424 -104 444 L -76 444 C -78 404 -80 344 -82 290 Z', f: C.hoodSh })}
    {S({ d: 'M -106 440 L -76 440 L -78 470 L -104 470 Z', f: C.hoodSh })}
    {/* body */}
    {S({ d: 'M -24 150 C -48 154 -74 160 -84 180 C -90 196 -90 250 -88 300 C -86 380 -84 440 -84 474 L 104 474 C 104 440 108 380 110 300 C 114 250 114 196 106 180 C 90 160 60 154 34 150 Z', f: 'url(#sg-hood)' })}
    <path d="M -84 180 C -90 196 -90 250 -88 300 C -86 380 -84 440 -84 474 L -58 474 C -62 400 -66 300 -62 200 Z" fill={C.hoodSh} opacity={0.6} />
    <path d="M 70 200 C 84 260 88 330 86 420" fill="none" stroke={C.hoodHi} strokeWidth={8} strokeLinecap="round" opacity={0.45} />
    {S({ d: 'M -44 358 L 74 358 L 86 446 L -54 446 Z', f: C.hood, w: 2.4 })}
    <path d="M -44 358 C -52 380 -54 410 -54 446 M 74 358 C 82 380 86 410 86 446" fill="none" stroke={C.hoodDeep} strokeWidth={3} />
    {S({ d: 'M -86 468 L 106 468 L 104 500 L -84 500 Z', f: 'url(#sg-hood)' })}
    {Array.from({ length: 13 }, (_, i) => <Line key={i} d={`M ${-76 + i * 14.5} 472 L ${-76 + i * 14.5} 496`} c={C.hoodSh} w={1.6} />)}
    <g transform="translate(8 0)"><HeadFQ turn={0.75} ex={ex} /></g>
    {S({ d: 'M -46 168 C -50 140 -28 126 -8 138 L 10 166 L 26 138 C 46 128 68 142 66 170 C 50 186 30 192 10 192 C -10 192 -32 184 -46 168 Z', f: 'url(#sg-hood)' })}
    {S({ d: 'M -8 140 L 10 170 L 26 140 C 20 150 14 154 10 154 C 4 154 -2 150 -8 140 Z', f: C.hoodDeep })}
    <Line d="M 2 172 C 0 200 0 230 -2 260" c={C.line} w={5.4} /><Line d="M 2 172 C 0 200 0 230 -2 260" c={C.string} w={3} />
    <Line d="M 20 172 C 22 200 22 230 24 262" c={C.line} w={5.4} /><Line d="M 20 172 C 22 200 22 230 24 262" c={C.string} w={3} />
    <rect x={-5} y={256} width={6} height={14} rx={2} fill={C.aglet} stroke={C.line} strokeWidth={1.4} />
    <rect x={21} y={258} width={6} height={14} rx={2} fill={C.aglet} stroke={C.line} strokeWidth={1.4} />
    {/* near arm in front */}
    {S({ d: 'M 104 176 C 132 196 138 260 136 330 C 134 384 134 424 132 444 L 94 444 C 96 404 98 344 100 290 Z', f: 'url(#sg-hood)' })}
    {S({ d: 'M 134 440 L 94 440 L 96 472 L 132 472 Z', f: 'url(#sg-hood)' })}
    <g transform="translate(114 468)"><HandHang /></g>
  </g>
);

export const SideFigure: React.FC<{ ex?: Expr }> = ({ ex = 'neutral' }) => (
  <g>
    {/* far leg, then near leg */}
    {S({ d: 'M -34 490 L 40 490 L 44 560 C 42 680 40 820 38 950 L -6 950 C -10 820 -16 680 -22 560 Z', f: C.jeansSh })}
    <g transform="translate(18 0)"><g transform="scale(1.2 1)"><Shoe x={0} /></g></g>
    {S({ d: 'M -50 490 L 46 490 L 48 560 C 44 680 34 820 28 950 L -18 950 C -22 820 -30 680 -40 560 Z', f: 'url(#sg-jeans)' })}
    <path d="M -50 490 L -40 560 C -30 680 -22 820 -18 950 L -4 950 C -10 820 -16 680 -24 560 L -30 490 Z" fill={C.jeansSh} opacity={0.5} />
    <Line d="M 30 520 C 30 640 24 820 20 940" c={C.stitch} w={1.4} o={0.5} />
    {/* side shoe, toe to the right */}
    <g transform="translate(6 0)">
      {S({ d: 'M -30 944 C -34 960 -34 976 -32 986 L 70 986 C 72 972 62 960 44 956 L 22 946 Z', f: C.shoe })}
      {S({ d: 'M -36 980 L 74 980 C 78 988 76 996 70 998 L -32 998 C -38 996 -38 988 -36 980 Z', f: C.sole })}
      <path d="M 48 958 C 60 960 70 970 72 982 L 50 982 C 48 972 48 964 48 958 Z" fill={C.sole} stroke={C.line} strokeWidth={2} />
      {[0, 1, 2].map((i) => <Line key={i} d={`M ${16 + i * 9} ${950 + i * 3} L ${22 + i * 9} ${944 + i * 3}`} c={C.lace} w={3} />)}
    </g>
    {/* hoodie in profile: hood bunched at the back of the neck, pocket bulge at the front */}
    {S({ d: 'M -40 150 C -66 158 -74 190 -72 240 C -70 320 -66 420 -64 474 L 66 474 C 70 440 74 400 72 360 C 70 300 64 240 54 190 C 46 168 30 156 14 152 Z', f: 'url(#sg-hood)' })}
    <path d="M -40 150 C -66 158 -74 190 -72 240 C -70 320 -66 420 -64 474 L -40 474 C -44 400 -48 300 -48 230 C -48 190 -44 166 -40 150 Z" fill={C.hoodSh} opacity={0.55} />
    {S({ d: 'M 40 360 C 60 364 72 380 74 400 L 72 446 L 50 446 C 52 420 50 390 40 360 Z', f: C.hood, w: 2.4 })}
    {S({ d: 'M -66 468 L 68 468 L 66 500 L -64 500 Z', f: 'url(#sg-hood)' })}
    {Array.from({ length: 9 }, (_, i) => <Line key={i} d={`M ${-56 + i * 15} 472 L ${-56 + i * 15} 496`} c={C.hoodSh} w={1.6} />)}
    <g transform="translate(-6 0)"><HeadSide ex={ex} /></g>
    {/* the hood, bunched behind the neck */}
    {S({ d: 'M -50 214 C -76 196 -76 152 -48 142 C -30 136 -14 146 -10 162 C -20 182 -34 200 -50 214 Z', f: 'url(#sg-hood)' })}
    <path d="M -64 196 C -70 176 -62 156 -46 150" fill="none" stroke={C.hoodSh} strokeWidth={4} strokeLinecap="round" />
    {S({ d: 'M -10 150 C 8 150 22 156 30 166 L 16 176 C 6 168 -4 166 -14 168 Z', f: 'url(#sg-hood)' })}
    <Line d="M 22 172 C 26 200 26 230 24 262" c={C.line} w={5.4} /><Line d="M 22 172 C 26 200 26 230 24 262" c={C.string} w={3} />
    <rect x={21} y={258} width={6} height={14} rx={2} fill={C.aglet} stroke={C.line} strokeWidth={1.4} />
    {/* arm hanging at the side */}
    {S({ d: 'M -26 174 C -4 176 8 200 8 240 C 8 300 8 400 8 444 L -24 444 C -26 400 -28 300 -30 240 C -34 210 -36 186 -26 174 Z', f: 'url(#sg-hood)' })}
    <path d="M -30 174 C -40 186 -38 210 -34 240 C -30 300 -26 400 -24 444 L -10 444 C -14 380 -18 280 -20 220 C -22 196 -26 180 -30 174 Z" fill={C.hoodSh} opacity={0.5} />
    {S({ d: 'M -26 440 L 10 440 L 10 472 L -24 472 Z', f: 'url(#sg-hood)' })}
    <g transform="translate(-8 468) scale(0.9 1)"><HandHang /></g>
  </g>
);
