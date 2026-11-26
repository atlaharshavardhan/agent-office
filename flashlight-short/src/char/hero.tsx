// The student, v3: drawn from the yellow-hoodie workbench illustration. Clean vector, bold dark outline, simple
// two-tone cel shading. Average college build: about 7.2 heads tall. No pencil, nothing on the ears.
// Reusable, editable layers:
//   <HeroHead>  head facing LEFT in three-quarter (face, eyes, pupils, lids, brows, mouth, hair are separate groups)
//   <HeroTorso> hoodie torso (hood, drawstrings, pocket, hem, folds) in a local frame: hip centre (0,0), facing LEFT
//   <HeroArm>   hoodie sleeve shoulder -> elbow -> wrist, with a ribbed cuff (world coordinates)
//   <HeroLeg>   jeans + canvas sneaker hip -> knee -> ankle (world coordinates)
//   <GripHand>  a hand wrapped around a horizontal lever (lever passes between the fingers and the palm)
//   <FlatHand>  an open hand pressed flat against a surface
//   ik2()       two-bone IK so elbows and knees bend naturally to reach a target
import React from 'react';

export type Pt = [number, number];
export const HC = {
  ink: '#17110f',
  skin: '#c98a5a', skinSh: '#a96a40', skinHi: '#dea172', blush: '#d06a50', lip: '#8e4a38', mole: '#3a2216',
  hair: '#1a1620', hairSh: '#0c0a10', hairHi: '#4a4256', rim: '#e0954a',
  hood: '#f0a722', hoodSh: '#c97d0c', hoodDeep: '#9e5f08', hoodHi: '#ffc94d', string: '#f6c450', aglet: '#9aa0a8', tee: '#26262c',
  jeans: '#2b3350', jeansSh: '#1e2540', shoe: '#33405f', shoeSh: '#26304a', sole: '#efece4', lace: '#f4f1ea',
  white: '#fbf7f0', iris: '#3a2416', pupil: '#120c0a',
};
const INK = HC.ink;

// ---------------------------------------------------------------- geometry helpers
export const rotP = (p: Pt, deg: number, c: Pt = [0, 0]): Pt => {
  const r = (deg * Math.PI) / 180, x = p[0] - c[0], y = p[1] - c[1];
  return [c[0] + x * Math.cos(r) - y * Math.sin(r), c[1] + x * Math.sin(r) + y * Math.cos(r)];
};
// two-bone IK: from root a toward target t with bone lengths l1, l2; `bend` = +1 / -1 picks the side the joint bends to
export const ik2 = (a: Pt, t: Pt, l1: number, l2: number, bend: 1 | -1): Pt => {
  const dx = t[0] - a[0], dy = t[1] - a[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01);
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const base = Math.atan2(dy, dx) + bend * A;
  return [a[0] + Math.cos(base) * l1, a[1] + Math.sin(base) * l1];
};
const tube = (pts: Pt[]) => pts.map((p) => p.join(',')).join(' ');

// ---------------------------------------------------------------- head (facing left, three-quarter). Units: eye line y=0, chin 138.
export type HeroFace = {
  look: Pt;                         // pupils, -1..1
  lid: number;                      // upper lid drop 0..1
  browIn: number; browOut: number;  // brow ends (y offsets, + is down)
  mouth: 'press' | 'smile' | 'neutral' | 'open';
};
export const HERO_EFFORT: HeroFace = { look: [-0.7, 0.75], lid: 0.28, browIn: 6, browOut: -1, mouth: 'press' };
export const HERO_SMILE: HeroFace = { look: [0.2, 0.5], lid: 0.3, browIn: 0, browOut: 0, mouth: 'smile' };

// big, loose side-swept curls (cx, cy, r) - drawn as one outlined mass
const CURLS: [number, number, number][] = [
  [-96, -96, 32], [-74, -128, 38], [-36, -156, 44], [12, -168, 46], [60, -158, 44], [100, -132, 40], [128, -94, 36],
  [140, -50, 30], [134, -8, 26], [118, 24, 20], [-108, -62, 24], [-104, -30, 16],
  [-44, -104, 30], [-4, -112, 32], [38, -110, 30], [76, -100, 28], [104, -64, 26],
];
const Eye: React.FC<{ cx: number; hw: number; f: HeroFace; id: string }> = ({ cx, hw, f, id }) => {
  const hh = 10.5, drop = f.lid * hh * 1.5;
  const white = `M ${cx - hw} 2 Q ${cx - hw * 0.1} ${-hh * 1.5} ${cx + hw} -1 Q ${cx + hw * 0.1} ${hh} ${cx - hw} 2 Z`;
  const px = cx + f.look[0] * hw * 0.42, py = 1 + f.look[1] * hh * 0.42;
  return (
    <g id={id}>
      <clipPath id={`${id}-c`}><path d={white} /></clipPath>
      <path id={`${id}-white`} d={white} fill={HC.white} />
      <g id={`${id}-pupil`} clipPath={`url(#${id}-c)`}>
        <circle cx={px} cy={py} r={hw * 0.58} fill={HC.iris} />
        <circle cx={px} cy={py} r={hw * 0.36} fill={HC.pupil} />
        <circle cx={px + hw * 0.18} cy={py - hw * 0.2} r={hw * 0.13} fill="#fff" />
        <path d={`M ${cx - hw} 2 Q ${cx - hw * 0.1} ${-hh * 1.5 + drop} ${cx + hw} -1 L ${cx + hw} -40 L ${cx - hw} -40 Z`} fill={HC.skin} />
      </g>
      <g id={`${id}-lid`}>
        <path d={`M ${cx - hw - 1} 2 Q ${cx - hw * 0.1} ${-hh * 1.55 + drop} ${cx + hw + 2} -2 l 5 -3`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M ${cx - hw * 0.6} ${-hh * 1.4 - 6 + drop * 0.4} Q ${cx} ${-hh * 1.9 - 6} ${cx + hw * 0.8} ${-hh * 1.2 - 5}`} fill="none" stroke={HC.skinSh} strokeWidth={2.4} strokeLinecap="round" />
      </g>
    </g>
  );
};
export const HeroHead: React.FC<{ f?: HeroFace }> = ({ f = HERO_EFFORT }) => (
  <g>
    {/* hair mass behind the head */}
    <g id="hair-back">
      {CURLS.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r + 5} fill={INK} />)}
    </g>
    {/* ear */}
    <g id="ear">
      <path d="M 98 -10 C 122 -24 140 6 132 36 C 128 56 112 66 100 58 C 104 40 104 14 98 -10 Z" fill={HC.skin} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M 110 2 C 122 8 124 26 118 40" fill="none" stroke={HC.skinSh} strokeWidth={4} strokeLinecap="round" />
    </g>
    {/* face: soft jaw, the far cheek receding */}
    <g id="face">
      <path d="M -84 -74 C -94 -44 -97 -14 -93 8 C -91 36 -84 62 -70 88 C -56 114 -32 134 -8 138 C 18 140 46 128 66 108 C 86 88 98 64 102 40 L 104 -20 C 102 -56 88 -86 66 -98 L -60 -98 Z" fill={HC.skin} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      {/* cel shadow: the turned-away side and under the jaw */}
      <path d="M 40 30 C 58 52 66 82 60 112 C 78 96 92 72 100 44 L 102 -10 C 90 4 70 18 40 30 Z" fill={HC.skinSh} opacity={0.55} />
      <path d="M -30 128 C -10 136 20 134 44 120 C 30 132 10 140 -8 138 C -16 136 -24 132 -30 128 Z" fill={HC.skinSh} opacity={0.6} />
      <ellipse cx={-66} cy={42} rx={14} ry={7} fill={HC.blush} opacity={0.22} />
      <ellipse cx={26} cy={48} rx={18} ry={8} fill={HC.blush} opacity={0.18} />
      <circle id="mole" cx={-64} cy={56} r={3.6} fill={HC.mole} />
    </g>
    <g id="nose">
      <path d="M -26 -6 C -30 18 -36 38 -42 52" fill="none" stroke={INK} strokeWidth={3.2} strokeLinecap="round" />
      <path d="M -52 54 C -48 64 -34 66 -24 60" fill="none" stroke={INK} strokeWidth={3.6} strokeLinecap="round" />
      <path d="M -26 52 C -18 52 -16 60 -22 64" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </g>
    <Eye cx={-60} hw={16} f={f} id="eye-far" />
    <Eye cx={16} hw={22} f={f} id="eye-near" />
    <g id="brows">
      <path id="brow-far" d={`M -38 ${-24 + f.browIn} Q -58 ${-34 + (f.browIn + f.browOut) / 2} -82 ${-22 + f.browOut} L -80 ${-17 + f.browOut} Q -58 ${-26 + (f.browIn + f.browOut) / 2} -40 ${-14 + f.browIn} Z`} fill={HC.hair} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <path id="brow-near" d={`M -12 ${-24 + f.browIn} Q 14 ${-38 + (f.browIn + f.browOut) / 2} 46 ${-24 + f.browOut} L 44 ${-17 + f.browOut} Q 14 ${-28 + (f.browIn + f.browOut) / 2} -10 ${-12 + f.browIn} Z`} fill={HC.hair} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    </g>
    <g id="mouth">
      {f.mouth === 'press' && <><path d="M -52 94 Q -30 97 -6 91" fill="none" stroke={INK} strokeWidth={3.6} strokeLinecap="round" /><path d="M -6 91 q 4 0 6 3" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" /><path d="M -40 106 Q -28 110 -16 106" fill="none" stroke={HC.skinSh} strokeWidth={3} strokeLinecap="round" /></>}
      {f.mouth === 'smile' && <><path d="M -54 90 Q -28 102 0 86" fill="none" stroke={INK} strokeWidth={3.6} strokeLinecap="round" /><path d="M -38 108 Q -26 112 -14 108" fill="none" stroke={HC.skinSh} strokeWidth={3} strokeLinecap="round" /></>}
      {f.mouth === 'neutral' && <path d="M -50 94 Q -28 98 -4 92" fill="none" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />}
      {f.mouth === 'open' && <path d="M -50 90 Q -28 92 -4 88 Q -24 112 -50 90 Z" fill="#4a1a1a" stroke={INK} strokeWidth={3} />}
    </g>
    {/* hair: one outlined mass of loose curls, side-swept over the forehead */}
    <g id="hair">
      {CURLS.map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill={HC.hair} />)}
      {/* cel shadow on the lower-back curls */}
      {CURLS.filter(([x, y]) => x > 90 || y > -40).map(([x, y, r], i) => <path key={`s${i}`} d={`M ${x - r * 0.2} ${y + r * 0.95} A ${r} ${r} 0 0 0 ${x + r * 0.95} ${y + r * 0.2} L ${x + r * 0.4} ${y + r * 0.1} Z`} fill={HC.hairSh} />)}
      {/* curl highlights */}
      {CURLS.map(([x, y, r], i) => <path key={`h${i}`} d={`M ${x - r * 0.55} ${y - r * 0.15} A ${r * 0.6} ${r * 0.6} 0 0 1 ${x + r * 0.35} ${y - r * 0.5}`} fill="none" stroke={HC.hairHi} strokeWidth={3.2} strokeLinecap="round" />)}
      {/* warm rim on the curls nearest the lamp/bulb */}
      {CURLS.filter(([x]) => x < -60).map(([x, y, r], i) => <path key={`r${i}`} d={`M ${x - r * 0.95} ${y + r * 0.2} A ${r} ${r} 0 0 1 ${x - r * 0.3} ${y - r * 0.92}`} fill="none" stroke={HC.rim} strokeWidth={4.5} strokeLinecap="round" opacity={0.85} />)}
      {/* side-swept fringe curls falling onto the forehead */}
      <path d="M 50 -92 C 24 -80 -6 -78 -30 -66 C -46 -58 -52 -44 -44 -36 C -40 -48 -28 -54 -16 -54 C -4 -66 24 -72 46 -74 Z" fill={HC.hair} stroke={INK} strokeWidth={3.6} strokeLinejoin="round" />
      <path d="M -44 -36 C -54 -40 -58 -54 -50 -62" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d="M 30 -84 C 10 -78 -12 -72 -26 -62" fill="none" stroke={HC.hairHi} strokeWidth={3} strokeLinecap="round" />
    </g>
  </g>
);

// ---------------------------------------------------------------- torso (local: hip centre (0,0), facing LEFT; y up is negative)
export const TORSO = { shoulderFar: [-50, -300] as Pt, shoulderNear: [36, -302] as Pt, neck: [-6, -334] as Pt, hipFar: [-18, 6] as Pt, hipNear: [16, 8] as Pt };
export const HeroTorso: React.FC = () => (
  <g>
    {/* hood bunched behind the neck */}
    <path id="hood-back" d="M 0 -338 C 14 -364 56 -368 70 -338 C 76 -316 62 -298 42 -302 C 28 -312 14 -324 0 -338 Z" fill={HC.hood} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M 58 -346 C 68 -334 68 -316 58 -306" fill="none" stroke={HC.hoodSh} strokeWidth={5} strokeLinecap="round" />
    {/* body: loose hoodie */}
    <path id="hoodie-body" d="M -34 -336 C -62 -328 -84 -302 -88 -262 C -94 -200 -90 -120 -84 -40 L -80 26 L 78 26 C 82 -40 86 -140 84 -220 C 82 -282 64 -322 34 -336 Z" fill={HC.hood} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    {/* cel shadow along the back and under the chest */}
    <path d="M 34 -336 C 64 -322 82 -282 84 -220 C 86 -140 82 -40 78 26 L 46 26 C 54 -60 58 -160 54 -240 C 52 -290 44 -320 34 -336 Z" fill={HC.hoodSh} />
    <path d="M -88 -200 C -60 -186 -30 -184 -4 -192 C -30 -176 -60 -170 -86 -176 Z" fill={HC.hoodSh} opacity={0.7} />
    {/* kangaroo pocket */}
    <path id="pocket" d="M -84 -112 L -16 -116 C -8 -86 -8 -52 -14 -22 L -82 -20 Z" fill={HC.hood} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
    <path d="M -16 -116 C -30 -96 -34 -60 -28 -22" fill="none" stroke={HC.hoodDeep} strokeWidth={3} />
    {/* relaxed folds */}
    <path d="M -70 -60 q 16 -8 30 4 M 30 -140 q -10 10 -8 26 M 10 -12 q 14 -10 30 -2" fill="none" stroke={HC.hoodDeep} strokeWidth={3} strokeLinecap="round" />
    {/* ribbed hem */}
    <path d="M -82 0 L 80 0 L 78 26 L -80 26 Z" fill={HC.hoodSh} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M ${-72 + i * 15} 4 L ${-72 + i * 15} 22`} stroke={HC.hood} strokeWidth={2.4} />)}
    {/* neck opening: dark tee, then the hood's front edge */}
    <path d="M -30 -334 C -18 -346 12 -346 24 -334 C 10 -324 -16 -324 -30 -334 Z" fill={HC.tee} />
    <path id="hood-front" d="M -46 -330 C -40 -356 16 -362 38 -336 L 30 -326 C 12 -340 -24 -340 -36 -320 Z" fill={HC.hood} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {/* drawstrings with metal tips */}
    <g id="drawstrings">
      {[[-24, -320, -32, -236], [-4, -320, -6, -230]].map(([x0, y0, x1, y1], i) => <g key={i}>
        <path d={`M ${x0} ${y0} C ${x0 - 2} ${(y0 + y1) / 2} ${x1 + 2} ${(y0 + y1) / 2} ${x1} ${y1}`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <path d={`M ${x0} ${y0} C ${x0 - 2} ${(y0 + y1) / 2} ${x1 + 2} ${(y0 + y1) / 2} ${x1} ${y1}`} fill="none" stroke={HC.string} strokeWidth={3.6} strokeLinecap="round" />
        <rect x={x1 - 4} y={y1} width={8} height={14} rx={2} fill={HC.aglet} stroke={INK} strokeWidth={1.8} />
      </g>)}
    </g>
  </g>
);

// ---------------------------------------------------------------- limbs (world coordinates)
const Tube: React.FC<{ pts: Pt[]; w: number; fill: string; ow?: number }> = ({ pts, w, fill, ow = 4.5 }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polyline points={tube(pts)} stroke={INK} strokeWidth={w + ow * 2} />
    <polyline points={tube(pts)} stroke={fill} strokeWidth={w} />
  </g>
);
const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
export const HeroArm: React.FC<{ sh: Pt; el: Pt; wr: Pt; far?: boolean; id: string }> = ({ sh, el, wr, far, id }) => {
  const c0 = lerp(el, wr, 0.78), c1 = lerp(el, wr, 1.02);
  const fill = far ? HC.hoodSh : HC.hood;
  return (
    <g id={id}>
      <Tube pts={[sh, el, c0]} w={52} fill={fill} />
      {/* soft bunching at the elbow, cel shadow down the underside */}
      <path d={`M ${el[0] - 14} ${el[1] - 10} q 10 12 2 26`} fill="none" stroke={far ? HC.hoodDeep : HC.hoodSh} strokeWidth={4} strokeLinecap="round" />
      <Tube pts={[c0, c1]} w={44} fill={far ? HC.hoodDeep : HC.hoodSh} />
      {[0.25, 0.55, 0.85].map((k) => { const p = lerp(c0, c1, k); return <circle key={k} cx={p[0]} cy={p[1]} r={2.2} fill={far ? HC.hoodSh : HC.hood} />; })}
    </g>
  );
};
export const HeroLeg: React.FC<{ hip: Pt; kn: Pt; an: Pt; far?: boolean; toe?: number; id: string }> = ({ hip, kn, an, far, toe = 0, id }) => (
  <g id={id}>
    <Tube pts={[hip, kn, an]} w={58} fill={far ? HC.jeansSh : HC.jeans} />
    <polyline points={tube([lerp(hip, kn, 0.1), kn, lerp(kn, an, 0.9)])} fill="none" stroke={HC.jeansSh} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={far ? 0 : 0.55} transform="translate(12 0)" />
    {/* seam and knee crease */}
    <path d={`M ${kn[0] + 6} ${kn[1] - 10} q 12 8 4 22`} fill="none" stroke={HC.jeansSh} strokeWidth={3} strokeLinecap="round" />
    {/* canvas sneaker, toe pointing left */}
    <g transform={`translate(${an[0]} ${an[1]}) rotate(${toe})`}>
      <path d="M 30 -16 L -12 -20 C -42 -18 -66 -4 -70 14 L 34 14 Z" fill={far ? HC.shoeSh : HC.shoe} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -70 10 L 36 10 L 36 26 L -66 26 C -72 22 -72 14 -70 10 Z" fill={HC.sole} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -40 -6 C -50 -2 -56 4 -58 10 L -40 10 Z" fill={HC.sole} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${-6 + i * 10} ${-17 + i} l -8 8`} stroke={HC.lace} strokeWidth={3} strokeLinecap="round" />)}
    </g>
  </g>
);

// a hand wrapped around a horizontal lever: origin = grip centre on the lever axis, wrist toward +x (to the right)
export const GRIP_WRIST: Pt = [40, 12];
export const GripHand: React.FC<{ lever?: [number, number]; leverColor?: string }> = ({ lever = [-30, 34], leverColor = '#d8b35a' }) => (
  <g id="grip-hand">
    {/* the wrist and back of the hand, behind the lever */}
    <path id="grip-back" d="M 4 -24 C 20 -34 40 -30 48 -12 L 50 22 C 40 32 22 30 10 22 Z" fill={HC.skin} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 30 -26 C 42 -20 48 -8 48 6" fill="none" stroke={HC.skinSh} strokeWidth={5} strokeLinecap="round" />
    {/* the lever */}
    <g id="lever">
      <path d={`M ${lever[1]} 0 L ${lever[0]} 2`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d={`M ${lever[1]} 0 L ${lever[0]} 2`} stroke={leverColor} strokeWidth={7} strokeLinecap="round" />
    </g>
    {/* four fingers curling over the top of the lever and down its front */}
    <g id="grip-fingers">
      {[-16, -5, 6, 17].map((x, i) => (
        <g key={i}>
          <path d={`M ${x - 6} -14 C ${x - 7} 0 ${x - 6} 10 ${x} 13 C ${x + 6} 10 ${x + 7} 0 ${x + 6} -14 Z`} fill={i === 0 ? HC.skinHi : HC.skin} stroke={INK} strokeWidth={3.2} strokeLinejoin="round" />
          <path d={`M ${x - 4} 2 q 4 3 8 0`} fill="none" stroke={HC.skinSh} strokeWidth={2} strokeLinecap="round" />
        </g>
      ))}
      {/* knuckles on top */}
      <path d="M -22 -14 C -14 -22 22 -22 30 -12" fill="none" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
    </g>
    {/* thumb wraps under the lever */}
    <path id="grip-thumb" d="M 26 16 C 14 26 -4 26 -12 18 C -8 13 4 12 18 10 Z" fill={HC.skin} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
  </g>
);

// an open hand pressed flat on a surface: origin = wrist, fingers toward -y (up)
export const FlatHand: React.FC = () => (
  <g id="flat-hand">
    {[-14, -4, 6, 15].map((x, i) => <path key={i} d={`M ${x - 5} -40 C ${x - 6} -60 ${x - 5} ${-76 + Math.abs(i - 1.5) * 6} ${x} ${-78 + Math.abs(i - 1.5) * 6} C ${x + 5} ${-76 + Math.abs(i - 1.5) * 6} ${x + 6} -60 ${x + 5} -40 Z`} fill={HC.skin} stroke={INK} strokeWidth={3.2} strokeLinejoin="round" />)}
    <path d="M -20 0 C -24 -16 -22 -34 -18 -44 L 22 -44 C 24 -30 24 -14 20 0 Z" fill={HC.skin} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -20 -12 C -32 -20 -38 -32 -36 -40 C -30 -42 -24 -36 -20 -30 Z" fill={HC.skin} stroke={INK} strokeWidth={3.2} strokeLinejoin="round" />
  </g>
);

// ---------------------------------------------------------------- the door pull (world coordinates)
// handle: the lever's pivot on the door; leverTip: its free end. Feet, hips and lean are set here.
export const HeroDoorPull: React.FC<{ handle: Pt; leverTip: Pt; brace: Pt }> = ({ handle, leverTip, brace }) => {
  const hip: Pt = [374, 1040], lean = 8;                    // weight back: the upper body tilts away from the door
  const W = (p: Pt): Pt => { const q = rotP(p, lean); return [hip[0] + q[0], hip[1] + q[1]]; };
  const shN = W(TORSO.shoulderNear), shF = W(TORSO.shoulderFar), neck = W(TORSO.neck);
  // the grip sits on the middle of the lever; the wrist follows from the hand's own geometry
  const grip = lerp(handle, leverTip, 0.5);
  const wrN: Pt = [grip[0] + GRIP_WRIST[0], grip[1] + GRIP_WRIST[1]];
  const elN = ik2(shN, wrN, 168, 152, -1);                  // elbow bends down and out
  const wrF: Pt = [brace[0] + 26, brace[1] + 30];
  const elF = ik2(shF, wrF, 168, 152, -1);
  // legs: front (far) foot toward the door, rear (near) foot planted behind; knees bend forward
  const hipF = W(TORSO.hipFar), hipN = W(TORSO.hipNear);
  const anF: Pt = [262, 1468], anN: Pt = [462, 1490];
  const knF = ik2(hipF, anF, 222, 214, -1), knN = ik2(hipN, anN, 222, 214, -1);
  const leverAng = (Math.atan2(leverTip[1] - handle[1], leverTip[0] - handle[0]) * 180) / Math.PI + 180;
  const lenL = Math.hypot(leverTip[0] - handle[0], leverTip[1] - handle[1]) / 2;
  return (
    <g id="hero-door-pull">
      <ellipse cx={420} cy={1500} rx={170} ry={22} fill="#1a0f09" opacity={0.4} filter="url(#r-soft)" />
      {/* far arm braces flat on the door frame */}
      <HeroArm id="arm-far" sh={shF} el={elF} wr={wrF} far />
      <g transform={`translate(${wrF[0]} ${wrF[1]}) rotate(-70) scale(1.05)`}><FlatHand /></g>
      <HeroLeg id="leg-far" hip={hipF} kn={knF} an={anF} far toe={-4} />
      <HeroLeg id="leg-near" hip={hipN} kn={knN} an={anN} toe={2} />
      <g id="torso" transform={`translate(${hip[0]} ${hip[1]}) rotate(${lean})`}><HeroTorso /></g>
      {/* head: turned just enough to read the face, looking down at the handle */}
      <g id="head" transform={`translate(${neck[0] - 8} ${neck[1] + 10}) rotate(${-6}) scale(0.46) translate(-10 -182)`}><HeroHead f={HERO_EFFORT} /></g>
      {/* near arm and the gripping hand, aligned with the lever */}
      <HeroArm id="arm-near" sh={shN} el={elN} wr={wrN} />
      <g transform={`translate(${grip[0]} ${grip[1]}) rotate(${leverAng}) scale(1.05)`}><GripHand lever={[-lenL - 2, lenL + 2]} /></g>
    </g>
  );
};
