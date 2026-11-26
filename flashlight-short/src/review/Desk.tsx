// Review 2 · Foil-build keyframe (1080 x 1920). Slightly elevated three-quarter view across the desk:
// the student has just worked out what to do with the foil. Eyes on the sheet, one hand braces the open
// carton, thumb and index pinch the foil edge, the empty bowl beside him. Warm desk bulb, cool window light.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, HeadFQ } from './student';
import { MiniBulb, Socket, Pack, Wire } from '../kit';

const W = 1080, H = 1920;
const L = C.line;
const S = (d: string, f: string, w = 3, o?: number) => <path d={d} fill={f} stroke={w ? L : 'none'} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" opacity={o} />;
const Ln = (d: string, c = L, w = 2, o = 1) => <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={o} />;

// ---- a hand seen from above (back of the hand), fingers pointing to local -y, thumb on the local -x side.
// pose 'brace': fingers spread a little and flat on a surface. pose 'pinch': index and thumb tips meet at (0, -128).
const finger = (x: number, y: number, len: number, w: number, ang: number, nail = true, key?: string) => {
  const r = (ang * Math.PI) / 180, dx = Math.sin(r), dy = -Math.cos(r), px = -dy, py = dx;
  const tx = x + dx * (len - w / 2), ty = y + dy * (len - w / 2);
  const d = `M ${x - px * w / 2} ${y - py * w / 2} L ${tx - px * w / 2} ${ty - py * w / 2} A ${w / 2} ${w / 2} 0 0 1 ${tx + px * w / 2} ${ty + py * w / 2} L ${x + px * w / 2} ${y + py * w / 2} Z`;
  const nx = x + dx * (len - w * 0.62), ny = y + dy * (len - w * 0.62);
  return (
    <g key={key}>
      {S(d, C.skin, 2.6)}
      <path d={`M ${x + dx * len * 0.42 - px * w * 0.28} ${y + dy * len * 0.42 - py * w * 0.28} l ${px * w * 0.56} ${py * w * 0.56}`} stroke={C.skinSh} strokeWidth={1.6} strokeLinecap="round" opacity={0.8} />
      {nail && <ellipse cx={nx} cy={ny} rx={w * 0.28} ry={w * 0.36} transform={`rotate(${ang} ${nx} ${ny})`} fill="#e2ae8c" stroke={C.skinSh} strokeWidth={1.2} />}
    </g>
  );
};
const HandTop: React.FC<{ pose: 'brace' | 'pinch'; x: number; y: number; rot: number; s: number; mirror?: boolean; tint?: number }> = ({ pose, x, y, rot, s, mirror }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${mirror ? -s : s} ${s})`}>
    {pose === 'brace' ? <>
      {finger(28, -60, 52, 17, 14, true, 'p')}
      {finger(12, -66, 64, 19, 5, true, 'r')}
      {finger(-6, -68, 70, 20, -2, true, 'm')}
      {finger(-24, -64, 64, 19, -10, true, 'i')}
      {S('M -34 0 C -40 -22 -40 -48 -34 -68 L 36 -64 C 40 -44 40 -20 34 0 Z', C.skin)}
      <path d="M 34 0 C 40 -20 40 -44 36 -64 L 22 -64 C 26 -40 26 -20 22 0 Z" fill={C.skinSh} opacity={0.35} />
      {Ln('M -26 -60 q 5 -4 10 0 M -10 -62 q 5 -4 10 0 M 8 -60 q 5 -4 10 0', C.skinSh, 1.8)}
      {S('M -32 -18 C -52 -26 -66 -42 -72 -58 C -76 -68 -66 -74 -58 -66 C -50 -54 -40 -46 -28 -40 Z', C.skin)}
      <ellipse cx={-66} cy={-64} rx={5} ry={6.5} transform="rotate(-40 -66 -64)" fill="#e2ae8c" stroke={C.skinSh} strokeWidth={1.2} />
    </> : <>
      {/* middle, ring, little: curled under, only the knuckle rows show */}
      {S('M 30 -62 C 40 -72 40 -86 30 -92 C 22 -96 16 -88 18 -78 Z', C.skinSh, 2.4)}
      {S('M 16 -66 C 26 -80 26 -96 14 -102 C 4 -106 -2 -96 2 -84 Z', C.skin, 2.4)}
      {S('M 0 -66 C 8 -84 8 -102 -4 -108 C -14 -112 -20 -102 -16 -88 Z', C.skin, 2.4)}
      {S('M -34 0 C -40 -22 -40 -48 -32 -68 L 34 -60 C 40 -40 40 -20 34 0 Z', C.skin)}
      <path d="M 34 0 C 40 -20 40 -40 34 -60 L 20 -62 C 24 -40 24 -20 20 0 Z" fill={C.skinSh} opacity={0.35} />
      {/* index reaching forward, its tip turning down under the foil */}
      {finger(-24, -62, 66, 19, -6, true, 'i')}
      {/* thumb crossing over to meet the index tip on top of the foil */}
      {S('M -32 -20 C -54 -40 -58 -74 -44 -104 C -38 -118 -26 -124 -18 -118 C -14 -112 -20 -104 -24 -98 C -34 -80 -32 -56 -22 -40 Z', C.skin)}
      <ellipse cx={-26} cy={-114} rx={6} ry={7.5} transform="rotate(30 -26 -114)" fill="#e2ae8c" stroke={C.skinSh} strokeWidth={1.2} />
    </>}
  </g>
);

// a hoodie sleeve as an outlined tube: shoulder -> elbow -> wrist, ribbed cuff at the wrist
type Pt = [number, number];
const Tube: React.FC<{ p: Pt[]; w: number; fill: string }> = ({ p, w, fill }) => {
  const pts = p.map((q) => q.join(',')).join(' ');
  return <g strokeLinecap="round" strokeLinejoin="round" fill="none"><polyline points={pts} stroke={L} strokeWidth={w + 6} /><polyline points={pts} stroke={fill} strokeWidth={w} /></g>;
};
const ArmSleeve: React.FC<{ sh: Pt; el: Pt; wr: Pt; shade?: boolean }> = ({ sh, el, wr, shade }) => {
  const k = (t: number): Pt => [el[0] + (wr[0] - el[0]) * t, el[1] + (wr[1] - el[1]) * t];
  return (
    <g>
      <Tube p={[sh, el]} w={98} fill={shade ? C.hoodSh : C.hood} />
      <Tube p={[el, k(0.8)]} w={84} fill={shade ? C.hoodSh : C.hood} />
            <Tube p={[k(0.8), k(0.97)]} w={76} fill={C.hood} />
      {[0.84, 0.88, 0.92].map((t) => { const a = k(t); return <circle key={t} cx={a[0]} cy={a[1]} r={2} fill={C.hoodSh} />; })}
      <path d={`M ${sh[0] - 30} ${sh[1] + 20} Q ${el[0] - 34} ${el[1] - 40} ${el[0] - 20} ${el[1] + 10}`} fill="none" stroke={C.hoodSh} strokeWidth={10} strokeLinecap="round" opacity={0.5} />
    </g>
  );
};

export const FoilBuild: React.FC = () => {
  // key positions
  const carton = { x: 150, y: 1262 };
  // the pinching hand: wrist, direction, scale; the pinch point is computed from the hand's own geometry
  const PH = { x: 724, y: 1300, rot: 160, s: 1.25 };
  const pinchAt = ((): [number, number] => {
    const lx = 27 * PH.s, ly = -121 * PH.s, r = (PH.rot * Math.PI) / 180; // mirrored local tip (-27, -121)
    return [PH.x + lx * Math.cos(r) - ly * Math.sin(r), PH.y + lx * Math.sin(r) + ly * Math.cos(r)];
  })();
  const bowl = { x: 838, y: 1168 };
  const bulb = { x: 170, y: 990 };
  return (
    <AbsoluteFill style={{ background: '#121a30' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="d-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2444" /><stop offset="1" stopColor="#141b33" /></linearGradient>
          <linearGradient id="d-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a5a36" /><stop offset="1" stopColor="#5a3820" /></linearGradient>
          <linearGradient id="d-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c2a5c" /><stop offset="0.7" stopColor="#3d4f92" /><stop offset="1" stopColor="#6a6fa8" /></linearGradient>
          <radialGradient id="d-warm"><stop offset="0" stopColor="#ffd890" stopOpacity={0.75} /><stop offset="0.4" stopColor="#ffb458" stopOpacity={0.28} /><stop offset="1" stopColor="#ff9a40" stopOpacity={0} /></radialGradient>
          <radialGradient id="d-core"><stop offset="0" stopColor="#fffbe6" /><stop offset="0.3" stopColor="#ffe2a0" stopOpacity={0.8} /><stop offset="1" stopColor="#ffb458" stopOpacity={0} /></radialGradient>
          <linearGradient id="d-cool" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#8fa6ff" stopOpacity={0.4} /><stop offset="0.5" stopColor="#6a80d0" stopOpacity={0.08} /><stop offset="1" stopColor="#6a80d0" stopOpacity={0} /></linearGradient>
          <linearGradient id="d-foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eef2f8" /><stop offset="0.45" stopColor="#b9c3d1" /><stop offset="0.7" stopColor="#e4e9f1" /><stop offset="1" stopColor="#9aa5b6" /></linearGradient>
          <radialGradient id="d-bowl" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stopColor="#efe9dd" /><stop offset="1" stopColor="#b9b0a0" /></radialGradient>
          <filter id="d-soft"><feGaussianBlur stdDeviation="10" /></filter>
          <filter id="d-soft2"><feGaussianBlur stdDeviation="4" /></filter>
        </defs>

        {/* the room behind him: the closed door far left, the window on the right */}
        <rect width={W} height={1040} fill="url(#d-wall)" />
        <g opacity={0.9}>
          <rect x={40} y={260} width={230} height={720} fill="#2a2430" stroke={L} strokeWidth={3} />
          <rect x={60} y={280} width={190} height={690} fill="#3a2c26" />
          <rect x={86} y={320} width={138} height={250} fill="none" stroke="#2c211c" strokeWidth={5} />
          <rect x={86} y={620} width={138} height={300} fill="none" stroke="#2c211c" strokeWidth={5} />
          <rect x={220} y={620} width={14} height={44} rx={3} fill="#8a7440" stroke={L} strokeWidth={2} />
        </g>
        <g id="window">
          <rect x={850} y={170} width={250} height={640} fill="#3a4466" stroke={L} strokeWidth={3} />
          <rect x={872} y={192} width={208} height={596} fill="url(#d-win)" />
          <rect x={872} y={330} width={208} height={14} fill="#3a4466" />
          <rect x={968} y={344} width={14} height={444} fill="#3a4466" />
          <circle cx={1020} cy={260} r={18} fill="#e6ecff" opacity={0.8} />
          <rect x={838} y={800} width={270} height={22} fill="#4a5578" stroke={L} strokeWidth={3} />
        </g>
        {/* cool light from the window across the room */}
        <polygon points="872,200 1080,200 1080,1920 420,1920" fill="url(#d-cool)" opacity={0.6} />

        {/* ---- the student, behind the desk */}
        <g id="student">
          {/* torso: three-quarter, leaning in over the desk */}
          {S('M 300 1040 C 290 940 300 860 340 820 C 380 790 440 780 470 776 L 540 774 C 590 778 650 790 690 816 C 730 846 740 920 734 1040 Z', C.hood)}
          <path d="M 300 1040 C 290 940 300 860 340 820 C 360 806 380 798 400 792 C 360 840 340 940 350 1040 Z" fill={C.hoodSh} opacity={0.6} />
          <path d="M 660 830 C 700 860 712 930 708 1030" fill="none" stroke="#9fb4ff" strokeWidth={10} strokeLinecap="round" opacity={0.25} />
          {/* head, tilted down toward the sheet */}
          <g transform="translate(508 570) rotate(10 0 180) scale(1.55)"><HeadFQ turn={0.45} ex="dawn" look={[0.4, 1.9]} /></g>
          {/* hood around the neck */}
          {S('M 400 800 C 396 760 432 738 462 752 L 506 800 L 548 752 C 580 740 616 760 610 802 C 582 826 546 834 506 834 C 466 834 424 826 400 800 Z', C.hood)}
          {S('M 462 754 L 506 802 L 548 754 C 536 770 520 778 506 778 C 492 778 474 770 462 754 Z', C.hoodDeep, 2.6)}
          {Ln('M 494 818 C 490 860 488 900 486 940', L, 6)}{Ln('M 494 818 C 490 860 488 900 486 940', C.string, 3.4)}
          {Ln('M 524 818 C 530 860 532 900 534 944', L, 6)}{Ln('M 524 818 C 530 860 532 900 534 944', C.string, 3.4)}
        </g>

        {/* ---- the desk */}
        <polygon points="-40,1010 1120,980 1260,1920 -180,1920" fill="url(#d-desk)" />
        {Array.from({ length: 8 }, (_, i) => { const t = (i + 1) / 9; return <line key={i} x1={-40 + 1160 * t} y1={1010 - 30 * t} x2={-180 + 1440 * t} y2={1920} stroke="#5a3820" strokeWidth={2.4} opacity={0.6} />; })}
        <line x1={-40} y1={1010} x2={1120} y2={980} stroke="#3a2414" strokeWidth={5} />

        {/* the desk bulb: warm light from the left */}
        <g id="bulb-rig">
          <g transform="translate(40 1040) scale(0.6)"><Pack cells={2} /></g>
          <Wire d="M 70 1040 C 100 1010 130 1040 150 1040" c="#c8322a" w={6} />
          <g transform={`translate(${bulb.x} ${bulb.y + 60}) scale(1.1)`}><Socket><MiniBulb state="lit" id="dk" /></Socket></g>
        </g>

        {/* ---- the empty bowl beside him */}
        <g id="bowl">
          <ellipse cx={bowl.x + 10} cy={bowl.y + 70} rx={150} ry={32} fill="#1a0f08" opacity={0.45} filter="url(#d-soft)" />
          {S(`M ${bowl.x - 140} ${bowl.y} C ${bowl.x - 136} ${bowl.y + 70} ${bowl.x - 70} ${bowl.y + 96} ${bowl.x} ${bowl.y + 96} C ${bowl.x + 70} ${bowl.y + 96} ${bowl.x + 136} ${bowl.y + 70} ${bowl.x + 140} ${bowl.y} Z`, '#d9d0c0')}
          <path d={`M ${bowl.x + 140} ${bowl.y} C ${bowl.x + 136} ${bowl.y + 70} ${bowl.x + 70} ${bowl.y + 96} ${bowl.x} ${bowl.y + 96} C ${bowl.x + 50} ${bowl.y + 80} ${bowl.x + 100} ${bowl.y + 50} ${bowl.x + 110} ${bowl.y}`} fill="#a69c8a" opacity={0.6} />
          <ellipse cx={bowl.x} cy={bowl.y} rx={140} ry={46} fill="#ece6da" stroke={L} strokeWidth={3} />
          <ellipse cx={bowl.x} cy={bowl.y + 4} rx={124} ry={38} fill="url(#d-bowl)" stroke={L} strokeWidth={2} />
          <ellipse cx={bowl.x - 30} cy={bowl.y - 8} rx={40} ry={10} fill="#fff" opacity={0.5} />
        </g>

        {/* ---- the open foil carton, the sheet pulled out toward him */}
        <g id="carton">
          <ellipse cx={carton.x + 230} cy={carton.y + 150} rx={300} ry={40} fill="#1a0f08" opacity={0.5} filter="url(#d-soft)" />
          {/* box body (long, seen from above-front) */}
          {S(`M ${carton.x} ${carton.y + 40} L ${carton.x + 420} ${carton.y + 70} L ${carton.x + 424} ${carton.y + 140} L ${carton.x + 2} ${carton.y + 108} Z`, '#2f6db3')}
          <path d={`M ${carton.x + 2} ${carton.y + 108} L ${carton.x + 424} ${carton.y + 140} L ${carton.x + 424} ${carton.y + 120} L ${carton.x + 2} ${carton.y + 90} Z`} fill="#245892" />
          {S(`M ${carton.x + 40} ${carton.y + 64} L ${carton.x + 200} ${carton.y + 76} L ${carton.x + 200} ${carton.y + 100} L ${carton.x + 40} ${carton.y + 88} Z`, '#e8eef6', 2)}
          {/* end face */}
          {S(`M ${carton.x} ${carton.y + 40} L ${carton.x - 36} ${carton.y + 20} L ${carton.x - 34} ${carton.y + 86} L ${carton.x + 2} ${carton.y + 108} Z`, '#245892')}
          {/* inside: the roll */}
          {S(`M ${carton.x - 36} ${carton.y + 20} L ${carton.x + 384} ${carton.y + 48} L ${carton.x + 420} ${carton.y + 70} L ${carton.x} ${carton.y + 40} Z`, '#173f6e')}
          {S(`M ${carton.x - 20} ${carton.y + 16} L ${carton.x + 390} ${carton.y + 44} C ${carton.x + 400} ${carton.y + 52} ${carton.x + 400} ${carton.y + 62} ${carton.x + 392} ${carton.y + 66} L ${carton.x - 14} ${carton.y + 36} C ${carton.x - 24} ${carton.y + 32} ${carton.x - 26} ${carton.y + 22} ${carton.x - 20} ${carton.y + 16} Z`, 'url(#d-foil)', 2.4)}
          {/* open lid, flipped back */}
          {S(`M ${carton.x - 36} ${carton.y + 20} L ${carton.x + 384} ${carton.y + 48} L ${carton.x + 392} ${carton.y - 30} L ${carton.x - 30} ${carton.y - 62} Z`, '#3a7cc4')}
          {S(`M ${carton.x + 20} ${carton.y - 34} L ${carton.x + 300} ${carton.y - 14} L ${carton.x + 300} ${carton.y + 14} L ${carton.x + 20} ${carton.y - 6} Z`, '#e8eef6', 2)}
          {/* the serrated cutting edge */}
          <path d={`M ${carton.x} ${carton.y + 40} ${Array.from({ length: 30 }, (_, i) => `L ${carton.x + 7 + i * 14} ${carton.y + 43 + i + (i % 2 ? 4 : 0)}`).join(' ')}`} fill="none" stroke="#c9ced6" strokeWidth={2} />
        </g>
        {/* the foil sheet, pulled out of the carton over its front edge toward the pinch */}
        <g id="foil-sheet">
          <path d={`M ${carton.x + 60} ${carton.y + 64} L ${carton.x + 400} ${carton.y + 92} L ${pinchAt[0] + 30} ${pinchAt[1] + 40} C ${pinchAt[0] - 40} ${pinchAt[1] + 70} ${carton.x + 260} ${carton.y + 230} ${carton.x + 70} ${carton.y + 200} Z`} fill="#1a0f08" opacity={0.35} filter="url(#d-soft2)" transform="translate(6 14)" />
          {S(`M ${carton.x + 60} ${carton.y + 62} L ${carton.x + 400} ${carton.y + 90} C ${carton.x + 450} ${carton.y + 120} ${pinchAt[0] - 10} ${pinchAt[1] - 40} ${pinchAt[0] + 6} ${pinchAt[1] + 2} C ${pinchAt[0] - 60} ${pinchAt[1] + 40} ${carton.x + 300} ${carton.y + 220} ${carton.x + 70} ${carton.y + 196} C ${carton.x + 56} ${carton.y + 160} ${carton.x + 60} ${carton.y + 110} ${carton.x + 60} ${carton.y + 62} Z`, 'url(#d-foil)', 2.6)}
          {Ln(`M ${carton.x + 110} ${carton.y + 120} C ${carton.x + 220} ${carton.y + 130} ${carton.x + 330} ${carton.y + 140} ${pinchAt[0] - 60} ${pinchAt[1] - 30}`, '#ffffff', 4, 0.8)}
          {Ln(`M ${carton.x + 140} ${carton.y + 168} L ${carton.x + 170} ${carton.y + 150} L ${carton.x + 200} ${carton.y + 172} M ${carton.x + 300} ${carton.y + 120} L ${carton.x + 320} ${carton.y + 104}`, '#7f8a9c', 1.8)}
        </g>

        {/* ---- arms and hands */}
        {/* his right arm (our left): elbow on the desk, hand flat on top of the carton, fingers forward */}
        <ellipse cx={300} cy={1330} rx={80} ry={22} fill="#1a0f08" opacity={0.35} filter="url(#d-soft2)" />
        <ArmSleeve sh={[372, 860]} el={[290, 1066]} wr={[296, 1184]} />
        <HandTop pose="brace" x={296} y={1180} rot={176} s={1.2} />
        {/* his left arm (our right): elbow on the desk, thumb and index pinching the foil corner */}
        <ellipse cx={pinchAt[0] + 20} cy={pinchAt[1] + 40} rx={70} ry={20} fill="#1a0f08" opacity={0.35} filter="url(#d-soft2)" />
        <ArmSleeve sh={[650, 860]} el={[770, 1070]} wr={[PH.x + 2, PH.y + 4]} />
        <HandTop pose="pinch" x={PH.x} y={PH.y} rot={PH.rot} s={PH.s} mirror />

        {/* ---- light */}
        <g id="light-warm" style={{ mixBlendMode: 'screen' }}>
          <circle cx={bulb.x} cy={bulb.y - 30} r={760} fill="url(#d-warm)" opacity={0.7} />
          <circle cx={bulb.x} cy={bulb.y - 30} r={130} fill="url(#d-core)" />
        </g>
        <rect width={W} height={H} fill="#24306a" opacity={0.18} style={{ mixBlendMode: 'multiply' }} />
      </svg>
    </AbsoluteFill>
  );
};
