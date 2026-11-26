// The student, redrawn from "InvisiTech Student with an Unlit Bulb.png": swept wavy dark hair, yellow hoodie,
// dark jeans, navy canvas sneakers. No pencil. Natural proportions: about 7.3 heads tall.
// Local frame for full figures: x = 0 is the body centre, feet on y = 1000, top of the head near y = 0.
import React from 'react';

export const C = {
  line: '#2a1c18',
  skin: '#c47f52', skinSh: '#a3623c', skinHi: '#d99a6c', blush: '#cf6b55', lip: '#9a4e3c',
  hair: '#171a29', hairHi: '#2f3651', hairSh: '#0d0f18',
  hood: '#f6b412', hoodSh: '#d78d0a', hoodDeep: '#b3700a', hoodHi: '#ffd451', string: '#f8d26a', aglet: '#8d8f96',
  jeans: '#2b3350', jeansSh: '#1f2640', jeansHi: '#3d4768', stitch: '#7d6a4a',
  shoe: '#4c5a7c', shoeSh: '#3a4766', sole: '#efece4', soleSh: '#cdc8bd', lace: '#f6f3ec',
  eye: '#2a1a14', white: '#fbf7f0',
};
const LW = 3;
const S = (p: { d: string; f: string; w?: number; o?: number; sw?: number }) =>
  <path d={p.d} fill={p.f} stroke={p.w === 0 ? 'none' : C.line} strokeWidth={p.w ?? LW} strokeLinejoin="round" strokeLinecap="round" opacity={p.o} />;
const Line = ({ d, w = 2.2, c = C.line, o = 1 }: { d: string; w?: number; c?: string; o?: number }) =>
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o} />;

// ============================================================== faces
export type Expr = 'neutral' | 'smile' | 'puzzled' | 'focus' | 'idea' | 'dawn';
// eyes / brows / mouth for a face whose centre line is at x = cx; `turn` (0 front .. 1 three-quarter) squeezes the far side
const Features: React.FC<{ cx: number; turn: number; ex: Expr; look?: [number, number] }> = ({ cx, turn, ex, look = [0, 0] }) => {
  const nearW = 1, farW = 1 - 0.32 * turn;
  const eyeY = 66;
  const eye = (x: number, w: number, side: -1 | 1) => {
    const open = ex === 'focus' ? 0.55 : ex === 'idea' ? 1.25 : ex === 'dawn' ? 1.1 : 1;
    const hw = 10.5 * w, hh = 5.6 * open;
    const lx = look[0] * 3.2 * w, ly = Math.min(4.6, look[1] * 3.2);
    const droop = Math.max(0, look[1] - 0.8) * 3.4; // looking down: the upper lid comes down with the gaze
    return (
      <g key={side}>
        <path d={`M ${x - hw} ${eyeY} Q ${x} ${eyeY - hh * 1.5} ${x + hw} ${eyeY} Q ${x} ${eyeY + hh * 0.9} ${x - hw} ${eyeY} Z`} fill={C.white} />
        <ellipse cx={x + lx} cy={eyeY + ly + 0.4} rx={5.4 * Math.min(1, w + 0.1)} ry={Math.min(6, hh * 1.05)} fill={C.eye} />
        <circle cx={x + lx + 1.8} cy={eyeY + ly - 1.6} r={1.6} fill="#fff" />
        {droop > 0 && <path d={`M ${x - hw - 1} ${eyeY + 1} Q ${x} ${eyeY - hh * 1.7} ${x + hw + 1} ${eyeY} L ${x + hw + 1} ${eyeY + droop * 0.4} Q ${x} ${eyeY - hh * 1.6 + droop * 1.6} ${x - hw - 1} ${eyeY + 1 + droop * 0.4} Z`} fill={C.skin} />}
        {/* upper lid: the heavier line */}
        <path d={`M ${x - hw - 1.5} ${eyeY + 0.6 + droop * 0.4} Q ${x} ${eyeY - hh * 1.6 + droop * 1.6} ${x + hw + 1} ${eyeY - 0.6 + droop * 0.4}`} fill="none" stroke={C.line} strokeWidth={3.4} strokeLinecap="round" />
        <path d={`M ${x - hw * 0.6} ${eyeY + hh * 0.85} Q ${x} ${eyeY + hh * 1.05} ${x + hw * 0.6} ${eyeY + hh * 0.8}`} fill="none" stroke={C.skinSh} strokeWidth={1.6} strokeLinecap="round" />
      </g>
    );
  };
  // brows: [inner y, outer y] offsets per side
  const bro: Record<Expr, [number, number, number, number]> = {
    neutral: [0, 0, 0, 0], smile: [-1, 0, -1, 0], puzzled: [-7, -10, 3, 1], focus: [5, -1, 5, -1], idea: [-8, -6, -8, -6], dawn: [-6, -3, -6, -3],
  };
  const [ni, no, fi, fo] = bro[ex];
  const nx = cx + 12 * turn; // nose / mouth centre slides toward the turn
  const eL = cx - 20 * farW + 5 * turn, eR = cx + 20 + 3 * turn;
  return (
    <g>
      {/* brows (far = left, near = right in a turn to our right) */}
      <path d={`M ${eL - 13 * farW} ${50 + fo} Q ${eL - 2} ${44 + (fo + fi) / 2} ${eL + 10 * farW} ${50 + fi}`} fill="none" stroke={C.hair} strokeWidth={6.5} strokeLinecap="round" />
      <path d={`M ${eR - 10} ${50 + ni} Q ${eR + 2} ${44 + (no + ni) / 2} ${eR + 14} ${50 + no}`} fill="none" stroke={C.hair} strokeWidth={6.5} strokeLinecap="round" />
      {eye(eL, farW, -1)}
      {eye(eR, nearW, 1)}
      {/* nose: soft side shadow and the tip */}
      <path d={`M ${nx - 2} ${68} Q ${nx - 6 + 4 * turn} ${84} ${nx - 8 + 6 * turn} ${92}`} fill="none" stroke={C.skinSh} strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M ${nx - 9 + 6 * turn} ${92} Q ${nx + 1 + 6 * turn} ${97} ${nx + 9 + 4 * turn} ${92}`} fill="none" stroke={C.line} strokeWidth={2.2} strokeLinecap="round" />
      {/* cheeks */}
      <ellipse cx={eL - 2} cy={86} rx={9 * farW} ry={5} fill={C.blush} opacity={0.18} />
      <ellipse cx={eR + 4} cy={86} rx={10} ry={5} fill={C.blush} opacity={0.18} />
      {/* mouth */}
      {ex === 'neutral' && <path d={`M ${nx - 11} 108 Q ${nx + 1} 111 ${nx + 12} 107`} fill="none" stroke={C.lip} strokeWidth={2.6} strokeLinecap="round" />}
      {ex === 'smile' && <g><path d={`M ${nx - 13} 105 Q ${nx + 1} 114 ${nx + 14} 104`} fill="none" stroke={C.lip} strokeWidth={2.8} strokeLinecap="round" /><path d={`M ${nx - 4} 116 Q ${nx + 2} 118 ${nx + 7} 116`} fill="none" stroke={C.skinSh} strokeWidth={1.8} strokeLinecap="round" /></g>}
      {ex === 'puzzled' && <path d={`M ${nx - 11} 110 Q ${nx - 2} 106 ${nx + 4} 109 Q ${nx + 9} 111 ${nx + 13} 106`} fill="none" stroke={C.lip} strokeWidth={2.8} strokeLinecap="round" />}
      {ex === 'focus' && <g><path d={`M ${nx - 9} 109 L ${nx + 10} 108`} fill="none" stroke={C.lip} strokeWidth={3} strokeLinecap="round" /><path d={`M ${nx + 10} 108 q 4 -1 5 -4`} fill="none" stroke={C.lip} strokeWidth={2} strokeLinecap="round" /></g>}
      {ex === 'dawn' && <g><ellipse cx={nx + 1} cy={110} rx={6} ry={5} fill="#5a2020" stroke={C.line} strokeWidth={2.2} /><path d={`M ${nx - 14} 104 q 3 -2 5 0 M ${nx + 11} 103 q 3 -2 5 1`} fill="none" stroke={C.skinSh} strokeWidth={1.8} strokeLinecap="round" /></g>}
      {ex === 'idea' && <g><path d={`M ${nx - 12} 104 Q ${nx + 1} 103 ${nx + 13} 103 Q ${nx + 12} 120 ${nx + 1} 121 Q ${nx - 11} 120 ${nx - 12} 104 Z`} fill="#5a2020" stroke={C.line} strokeWidth={2.4} strokeLinejoin="round" /><path d={`M ${nx - 9} 105.5 L ${nx + 10} 105`} stroke="#f4efe6" strokeWidth={4} strokeLinecap="round" /><path d={`M ${nx - 5} 117 Q ${nx + 1} 113 ${nx + 7} 117`} fill="#c25a5a" /></g>}
    </g>
  );
};

// head, front or three-quarter (turn 0..1, turned toward our right). Box: about x -60..60, y -30..180 (neck to 180)
export const HeadFQ: React.FC<{ turn?: number; ex?: Expr; look?: [number, number] }> = ({ turn = 0, ex = 'neutral', look }) => {
  const t = turn;
  // the face outline: the near (right) cheek stays full, the far one narrows; the jaw swings right
  const fl = -44 + 6 * t, fr = 44 + 2 * t, jx = 6 * t;
  const face = `M ${fl} 58 C ${fl - 1} 28 ${-28 + 4 * t} 8 ${2 + jx} 6 C ${32 + jx} 8 ${fr + 2} 30 ${fr} 60 C ${fr - 1} 84 ${36 + jx} 104 ${24 + jx} 118 C ${16 + jx} 127 ${8 + jx} 132 ${jx} 132 C ${-8 + jx} 132 ${-17 + jx * 0.6} 127 ${-25 + jx * 0.5} 118 C ${-37 + t * 4} 104 ${fl + 1} 84 ${fl} 58 Z`;
  return (
    <g>
      {/* neck */}
      {S({ d: `M ${-15 + jx * 0.4} 112 L ${-17 + jx * 0.4} 178 L ${19 + jx * 0.4} 178 L ${17 + jx * 0.4} 112 Z`, f: C.skin })}
      {S({ d: `M ${-16 + jx * 0.4} 122 L ${-17 + jx * 0.4} 150 C ${-4 + jx} 160 ${8 + jx} 160 ${18 + jx * 0.4} 148 L ${17 + jx * 0.4} 122 Z`, f: C.skinSh, w: 0, o: 0.7 })}
      {/* back hair mass behind the face */}
      {S({ d: `M ${-48 + 7 * t} 84 C ${-58 + 7 * t} 50 ${-56 + 6 * t} 8 ${-34 + 4 * t} -10 C ${-12} -28 ${30} -30 ${50 + 2 * t} -10 C ${60 + 2 * t} 6 ${60 + 2 * t} 50 ${52 + 2 * t} 80 Z`, f: C.hair })}
      {/* ears */}
      {t < 0.85 && S({ d: `M ${fl + 2} 62 C ${fl - 10} 58 ${fl - 12} 80 ${fl - 6} 90 C ${fl - 2} 96 ${fl + 3} 94 ${fl + 3} 88 Z`, f: C.skin })}
      {S({ d: `M ${fr - 2} 62 C ${fr + 10} 58 ${fr + 12} 80 ${fr + 6} 90 C ${fr + 2} 96 ${fr - 3} 94 ${fr - 3} 88 Z`, f: C.skin })}
      <path d={`M ${fr + 2} 68 C ${fr + 7} 72 ${fr + 6} 82 ${fr + 2} 86`} fill="none" stroke={C.skinSh} strokeWidth={2} />
      {/* face */}
      {S({ d: face, f: C.skin })}
      {/* form shading: far side of the face and under the cheekbone */}
      <path d={`M ${fl} 58 C ${fl - 1} 28 ${-28 + 4 * t} 8 ${2 + jx} 6 C ${-18 + 4 * t} 20 ${-30 + 6 * t} 50 ${-28 + 6 * t} 80 C ${-26 + 6 * t} 100 ${-18 + jx} 120 ${jx} 132 C ${-8 + jx} 132 ${-17 + jx * 0.6} 127 ${-25 + jx * 0.5} 118 C ${-37 + t * 4} 104 ${fl + 1} 84 ${fl} 58 Z`} fill={C.skinSh} opacity={0.22 + 0.18 * t} />
      <path d={`M ${fr - 6} 30 C ${fr - 2} 50 ${fr - 4} 70 ${fr - 10} 84`} fill="none" stroke={C.skinHi} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
      <Features cx={0} turn={t} ex={ex} look={look} />
      {/* hair: trimmed at the sides, volume on top swept over to our right, one loose lock on the forehead */}
      {S({ d: `M ${-45 + 7 * t} 58 C ${-52 + 7 * t} 40 ${-55 + 6 * t} 12 ${-46 + 5 * t} -2 C ${-44 + 5 * t} -16 ${-32 + 4 * t} -24 ${-22 + 3 * t} -22 C ${-16} -34 ${0} -34 ${8} -26 C ${16} -36 ${34} -34 ${40} -22 C ${54} -24 ${64 + 2 * t} -10 ${60 + 2 * t} 4 C ${68 + 2 * t} 12 ${66 + 2 * t} 26 ${61 + 2 * t} 34 C ${62 + 2 * t} 40 ${57 + 2 * t} 50 ${51 + 2 * t} 64 C ${49 + 2 * t} 50 ${47 + 2 * t} 40 ${43 + 2 * t} 33 C ${34 + 2 * t} 28 ${26 + 2 * t} 27 ${18 + 3 * t} 30 C ${6 + 3 * t} 22 ${-10 + 3 * t} 22 ${-22 + 4 * t} 28 C ${-32 + 5 * t} 32 ${-40 + 6 * t} 42 ${-45 + 7 * t} 58 Z`, f: C.hair })}
      {/* waves */}
      <Line d={`M ${-40 + 5 * t} 18 C ${-30} -6 ${-8} -18 ${16} -16`} c={C.hairHi} w={4} />
      <Line d={`M ${-14} 6 C ${4} -10 ${30} -14 ${50} -2`} c={C.hairHi} w={4} />
      <Line d={`M ${-24} -14 C ${-10} -24 ${10} -24 ${24} -16`} c={C.hairHi} w={3.4} />
      <Line d={`M ${30} 12 C ${42} 14 ${52} 24 ${56} 38`} c={C.hairHi} w={3} />
      {/* the loose lock */}
      {S({ d: `M ${18 + 3 * t} 30 C ${14 + 3 * t} 40 ${6 + 3 * t} 48 ${-2 + 3 * t} 52 C ${3 + 3 * t} 43 ${5 + 3 * t} 35 ${3 + 3 * t} 27 Z`, f: C.hair, w: 2 })}
      {/* sideburn */}
      {S({ d: `M ${fr - 6} 50 L ${fr - 2} 72 L ${fr - 8} 70 Z`, f: C.hair, w: 0 })}
    </g>
  );
};

// profile head, facing right. Same box.
export const HeadSide: React.FC<{ ex?: Expr }> = ({ ex = 'neutral' }) => (
  <g>
    {S({ d: 'M -10 112 L -14 178 L 22 178 L 20 112 Z', f: C.skin })}
    <path d="M -12 124 L -14 160 C 0 156 12 150 20 140 L 20 120 Z" fill={C.skinSh} opacity={0.6} />
    {/* back hair */}
    {S({ d: 'M -46 92 C -62 60 -60 10 -30 -14 C -6 -32 34 -30 52 -10 C 58 0 58 12 54 22 L -20 100 Z', f: C.hair })}
    {/* face profile: forehead, brow, nose, lips, chin, jaw */}
    {S({ d: 'M -24 40 C -20 14 8 4 30 8 C 42 12 48 26 50 40 L 51 54 C 52 58 51 62 54 66 C 58 74 62 82 64 88 C 65 92 62 94 57 94 C 59 98 58 102 55 104 C 58 106 58 112 54 114 C 52 120 50 126 44 130 C 34 136 18 134 8 126 C 0 120 -8 114 -14 112 C -26 100 -30 70 -24 40 Z', f: C.skin })}
    <path d="M -24 40 C -30 70 -26 100 -14 112 C -6 116 2 120 8 126 C 4 110 2 90 0 70 C -2 56 -10 46 -24 40 Z" fill={C.skinSh} opacity={0.35} />
    {/* ear */}
    {S({ d: 'M -6 62 C -18 56 -22 80 -14 92 C -10 98 -2 96 0 90 C 2 80 0 68 -6 62 Z', f: C.skin })}
    <path d="M -8 70 C -14 74 -14 84 -9 88" fill="none" stroke={C.skinSh} strokeWidth={2.2} />
    {/* eye in profile */}
    <path d="M 36 66 Q 42 60 48 65 Q 42 70 36 66 Z" fill={C.white} />
    <ellipse cx={44} cy={66} rx={2.6} ry={4} fill={C.eye} />
    <path d="M 35 65 Q 42 58 49 64" fill="none" stroke={C.line} strokeWidth={3.2} strokeLinecap="round" />
    <path d={ex === 'focus' ? 'M 30 54 Q 40 52 50 56' : ex === 'idea' ? 'M 30 46 Q 40 42 50 47' : 'M 30 50 Q 40 46 50 51'} fill="none" stroke={C.hair} strokeWidth={6.5} strokeLinecap="round" />
    <path d="M 54 80 C 56 84 56 88 52 90" fill="none" stroke={C.skinSh} strokeWidth={2.2} />
    <path d="M 56 104 L 46 104" stroke={C.lip} strokeWidth={2.6} strokeLinecap="round" />
    <ellipse cx={36} cy={88} rx={9} ry={5} fill={C.blush} opacity={0.18} />
    {/* hair, swept back and up */}
    {S({ d: 'M -40 64 C -54 30 -44 -4 -16 -18 C 10 -32 42 -26 56 -4 C 62 8 60 22 54 34 C 50 24 42 18 34 18 C 30 26 24 30 18 28 C 10 34 0 34 -6 28 C -10 40 -14 52 -18 60 C -26 56 -34 58 -40 64 Z', f: C.hair })}
    {S({ d: 'M -20 -14 C -10 -34 20 -40 36 -30 C 48 -36 62 -24 60 -8 C 50 -18 38 -16 32 -10 C 20 -18 2 -18 -8 -6 Z', f: C.hair })}
    <Line d="M -30 20 C -18 0 4 -8 24 -4" c={C.hairHi} w={4} />
    <Line d="M 8 -20 C 20 -28 34 -26 44 -18" c={C.hairHi} w={3.4} />
    {S({ d: 'M 46 22 C 52 34 52 44 46 50 C 46 40 42 32 36 28 Z', f: C.hair, w: 2 })}
  </g>
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
    {S({ d: 'M -54 -6 L 52 -6 L 56 40 L -58 40 Z', f: C.hood })}
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
    {S({ d: 'M 14 26 L 70 -24 L 110 24 L 54 74 Z', f: C.hood })}
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
    {S({ d: 'M -92 488 L 92 488 L 94 560 C 92 680 86 820 80 950 L 28 950 C 22 820 14 680 4 560 L -4 560 C -14 680 -22 820 -28 950 L -80 950 C -86 820 -92 680 -94 560 Z', f: C.jeans })}
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
    {S({ d: 'M -98 176 C -124 196 -130 260 -128 330 C -126 384 -126 424 -124 444 L -86 444 C -88 404 -90 344 -92 290 Z', f: C.hood })}
    {S({ d: 'M 98 176 C 124 196 130 260 128 330 C 126 384 126 424 124 444 L 86 444 C 88 404 90 344 92 290 Z', f: C.hood })}
    <path d="M -98 176 C -124 196 -130 260 -128 330 C -126 384 -126 424 -124 444 L -110 444 C -112 400 -114 300 -108 200 Z" fill={C.hoodSh} opacity={0.6} />
    {S({ d: 'M -126 440 L -86 440 L -88 472 L -124 472 Z', f: C.hood })}
    {S({ d: 'M 126 440 L 86 440 L 88 472 L 124 472 Z', f: C.hood })}
    {/* hoodie body */}
    {S({ d: 'M -30 150 C -56 154 -86 160 -100 180 C -106 196 -106 250 -102 300 C -100 380 -98 440 -98 474 L 98 474 C 98 440 100 380 102 300 C 106 250 106 196 100 180 C 86 160 56 154 30 150 Z', f: C.hood })}
    <path d="M -100 180 C -106 196 -106 250 -102 300 C -100 380 -98 440 -98 474 L -74 474 C -78 400 -82 300 -80 200 Z" fill={C.hoodSh} opacity={0.55} />
    <path d="M 60 200 C 72 260 76 330 74 420" fill="none" stroke={C.hoodHi} strokeWidth={8} strokeLinecap="round" opacity={0.45} />
    {/* pocket */}
    {S({ d: 'M -62 358 L 62 358 L 74 446 L -74 446 Z', f: C.hood, w: 2.4 })}
    <path d="M -62 358 C -70 380 -74 410 -74 446 M 62 358 C 70 380 74 410 74 446" fill="none" stroke={C.hoodDeep} strokeWidth={3} />
    {/* hem band */}
    {S({ d: 'M -100 468 L 100 468 L 98 500 L -98 500 Z', f: C.hood })}
    {Array.from({ length: 13 }, (_, i) => <Line key={i} d={`M ${-90 + i * 15} 472 L ${-90 + i * 15} 496`} c={C.hoodSh} w={1.6} />)}
    {/* hood around the neck */}
    <g transform="translate(0 0)"><HeadFQ ex={ex} /></g>
    {S({ d: 'M -60 168 C -62 140 -36 126 -16 138 L 0 166 L 16 138 C 36 126 62 140 60 168 C 44 186 20 192 0 192 C -20 192 -44 186 -60 168 Z', f: C.hood })}
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
    {S({ d: 'M -76 488 L 90 488 L 92 560 C 90 680 86 820 82 950 L 34 950 C 28 820 20 680 14 560 L 6 560 C -4 680 -12 820 -18 950 L -64 950 C -70 820 -76 680 -78 560 Z', f: C.jeans })}
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
    {S({ d: 'M -24 150 C -48 154 -74 160 -84 180 C -90 196 -90 250 -88 300 C -86 380 -84 440 -84 474 L 104 474 C 104 440 108 380 110 300 C 114 250 114 196 106 180 C 90 160 60 154 34 150 Z', f: C.hood })}
    <path d="M -84 180 C -90 196 -90 250 -88 300 C -86 380 -84 440 -84 474 L -58 474 C -62 400 -66 300 -62 200 Z" fill={C.hoodSh} opacity={0.6} />
    <path d="M 70 200 C 84 260 88 330 86 420" fill="none" stroke={C.hoodHi} strokeWidth={8} strokeLinecap="round" opacity={0.45} />
    {S({ d: 'M -44 358 L 74 358 L 86 446 L -54 446 Z', f: C.hood, w: 2.4 })}
    <path d="M -44 358 C -52 380 -54 410 -54 446 M 74 358 C 82 380 86 410 86 446" fill="none" stroke={C.hoodDeep} strokeWidth={3} />
    {S({ d: 'M -86 468 L 106 468 L 104 500 L -84 500 Z', f: C.hood })}
    {Array.from({ length: 13 }, (_, i) => <Line key={i} d={`M ${-76 + i * 14.5} 472 L ${-76 + i * 14.5} 496`} c={C.hoodSh} w={1.6} />)}
    <g transform="translate(8 0)"><HeadFQ turn={0.75} ex={ex} /></g>
    {S({ d: 'M -46 168 C -50 140 -28 126 -8 138 L 10 166 L 26 138 C 46 128 68 142 66 170 C 50 186 30 192 10 192 C -10 192 -32 184 -46 168 Z', f: C.hood })}
    {S({ d: 'M -8 140 L 10 170 L 26 140 C 20 150 14 154 10 154 C 4 154 -2 150 -8 140 Z', f: C.hoodDeep })}
    <Line d="M 2 172 C 0 200 0 230 -2 260" c={C.line} w={5.4} /><Line d="M 2 172 C 0 200 0 230 -2 260" c={C.string} w={3} />
    <Line d="M 20 172 C 22 200 22 230 24 262" c={C.line} w={5.4} /><Line d="M 20 172 C 22 200 22 230 24 262" c={C.string} w={3} />
    <rect x={-5} y={256} width={6} height={14} rx={2} fill={C.aglet} stroke={C.line} strokeWidth={1.4} />
    <rect x={21} y={258} width={6} height={14} rx={2} fill={C.aglet} stroke={C.line} strokeWidth={1.4} />
    {/* near arm in front */}
    {S({ d: 'M 104 176 C 132 196 138 260 136 330 C 134 384 134 424 132 444 L 94 444 C 96 404 98 344 100 290 Z', f: C.hood })}
    {S({ d: 'M 134 440 L 94 440 L 96 472 L 132 472 Z', f: C.hood })}
    <g transform="translate(114 468)"><HandHang /></g>
  </g>
);

export const SideFigure: React.FC<{ ex?: Expr }> = ({ ex = 'neutral' }) => (
  <g>
    {/* far leg, then near leg */}
    {S({ d: 'M -34 490 L 40 490 L 44 560 C 42 680 40 820 38 950 L -6 950 C -10 820 -16 680 -22 560 Z', f: C.jeansSh })}
    <g transform="translate(18 0)"><g transform="scale(1.2 1)"><Shoe x={0} /></g></g>
    {S({ d: 'M -50 490 L 46 490 L 48 560 C 44 680 34 820 28 950 L -18 950 C -22 820 -30 680 -40 560 Z', f: C.jeans })}
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
    {S({ d: 'M -40 150 C -66 158 -74 190 -72 240 C -70 320 -66 420 -64 474 L 66 474 C 70 440 74 400 72 360 C 70 300 64 240 54 190 C 46 168 30 156 14 152 Z', f: C.hood })}
    <path d="M -40 150 C -66 158 -74 190 -72 240 C -70 320 -66 420 -64 474 L -40 474 C -44 400 -48 300 -48 230 C -48 190 -44 166 -40 150 Z" fill={C.hoodSh} opacity={0.55} />
    {S({ d: 'M 40 360 C 60 364 72 380 74 400 L 72 446 L 50 446 C 52 420 50 390 40 360 Z', f: C.hood, w: 2.4 })}
    {S({ d: 'M -66 468 L 68 468 L 66 500 L -64 500 Z', f: C.hood })}
    {Array.from({ length: 9 }, (_, i) => <Line key={i} d={`M ${-56 + i * 15} 472 L ${-56 + i * 15} 496`} c={C.hoodSh} w={1.6} />)}
    <g transform="translate(-6 0)"><HeadSide ex={ex} /></g>
    {/* the hood, bunched behind the neck */}
    {S({ d: 'M -50 214 C -76 196 -76 152 -48 142 C -30 136 -14 146 -10 162 C -20 182 -34 200 -50 214 Z', f: C.hood })}
    <path d="M -64 196 C -70 176 -62 156 -46 150" fill="none" stroke={C.hoodSh} strokeWidth={4} strokeLinecap="round" />
    {S({ d: 'M -10 150 C 8 150 22 156 30 166 L 16 176 C 6 168 -4 166 -14 168 Z', f: C.hood })}
    <Line d="M 22 172 C 26 200 26 230 24 262" c={C.line} w={5.4} /><Line d="M 22 172 C 26 200 26 230 24 262" c={C.string} w={3} />
    <rect x={21} y={258} width={6} height={14} rx={2} fill={C.aglet} stroke={C.line} strokeWidth={1.4} />
    {/* arm hanging at the side */}
    {S({ d: 'M -26 174 C -4 176 8 200 8 240 C 8 300 8 400 8 444 L -24 444 C -26 400 -28 300 -30 240 C -34 210 -36 186 -26 174 Z', f: C.hood })}
    <path d="M -30 174 C -40 186 -38 210 -34 240 C -30 300 -26 400 -24 444 L -10 444 C -14 380 -18 280 -20 220 C -22 196 -26 180 -30 174 Z" fill={C.hoodSh} opacity={0.5} />
    {S({ d: 'M -26 440 L 10 440 L 10 472 L -24 472 Z', f: C.hood })}
    <g transform="translate(-8 468) scale(0.9 1)"><HandHang /></g>
  </g>
);
