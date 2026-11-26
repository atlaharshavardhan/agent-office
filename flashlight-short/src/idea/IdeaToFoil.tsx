// IdeaToFoil · 10 s preview (1080 x 1920, 30 fps).
// 0-2 s : the last two seconds of the Higgsfield clip, cut the moment his fingertips touch the blue foil carton.
// 2-10 s: match cut to a steady, slightly overhead desk view; one continuous action in editable layers:
//         left hand braces the carton -> right thumb lifts the flap -> thumb + index pull the foil out (edge stays in the pinch)
//         -> the sheet tears across the cutter -> both hands lay it over the bowl and press it into the curve -> short hold.
import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Hand, HandSpec, PlaceHand, STU, anchorHand, P } from '../kit';

export const IDEA_FPS = 30;
export const IDEA_FRAMES = 300;
const CUT = 60; // frame of the match cut

// ---------------------------------------------------------------- timing helpers
const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
// keyframed value: list of [time, value]; eased between keys, held outside
const kf = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]; return v0 + (v1 - v0) * ease((t - t0) / (t1 - t0)); }
  return keys[keys.length - 1][1];
};
const kp = (t: number, keys: [number, P][]): P => [kf(t, keys.map(([a, p]) => [a, p[0]])), kf(t, keys.map(([a, p]) => [a, p[1]]))];
const mix = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

// ---------------------------------------------------------------- the set (overhead, slightly from the front)
const W = 1080, H = 1920;
const BOX = { x0: 130, x1: 730, hinge: 820, front: 930, bottom: 1012 };   // carton: top face hinge..front, front face front..bottom
const BOWL = { x: 790, y: 1150, rx: 165, ry: 66 };
const BULB: P = [128, 640];
const LIP_Y = BOX.front + 4;           // where the foil leaves the roll, under the cutter edge
const SHEET = { x0: 175, x1: 685 };    // sheet width on the roll

// hand shapes (kit hands: dorsal view by default, `side` = thumb-side view)
const FLAT: HandSpec = { f: [{ a: 8, b: -2 }, { a: 2 }, { a: -4 }, { a: -10 }], t: { a: 18, b: -8 } };
const LIFT: HandSpec = { side: true, f: [{ a: 30, b: 60, c: 50 }, { a: 40, b: 70, c: 60 }, { a: 46, b: 74, c: 60 }, { a: 50, b: 74, c: 60 }], t: { a: 6, b: 4 } };
const PINCH: HandSpec = { side: true, f: [{ a: 14, b: 38, c: 30 }, { a: 40, b: 70, c: 60 }, { a: 46, b: 74, c: 60 }, { a: 50, b: 74, c: 60 }], t: { toF0: true, b: 6 } };
const HS = 2.3;

// a hoodie sleeve from the wrist back up out of frame, with a ribbed cuff
const Sleeve: React.FC<{ wrist: P; dir: number; s: number }> = ({ wrist, dir, s }) => {
  const b = ((dir + 180) * Math.PI) / 180, ux = Math.cos(b), uy = Math.sin(b), px = -uy, py = ux;
  const q = (d: number, w: number, side: 1 | -1) => `${(wrist[0] + ux * d + px * w * side / 2).toFixed(1)},${(wrist[1] + uy * d + py * w * side / 2).toFixed(1)}`;
  const quad = (d0: number, w0: number, d1: number, w1: number) => [q(d0, w0, 1), q(d1, w1, 1), q(d1, w1, -1), q(d0, w0, -1)].join(' ');
  return (
    <g>
      <polygon points={quad(30 * s, 76 * s, 1900, 96 * s)} fill="url(#if-hood)" stroke="#94600a" strokeWidth={3} strokeLinejoin="round" />
      <polygon points={quad(60 * s, 20 * s, 1900, 26 * s)} fill="#d78d0a" opacity={0.35} />
      <polygon points={quad(-4, 62 * s, 34 * s, 70 * s)} fill="#f6b412" stroke="#94600a" strokeWidth={3} strokeLinejoin="round" />
      {[0.2, 0.45, 0.7].map((k) => <polyline key={k} points={`${q(4 * s + k * 26 * s, 64 * s, 1)} ${q(4 * s + k * 26 * s, 64 * s, -1)}`} stroke="#d78d0a" strokeWidth={2} />)}
    </g>
  );
};
// a hand placed so that fingertip `k` lands on `target`; optional thumb target
const PlacedHand: React.FC<{ h: HandSpec; k: string; target: P; dir: number; mirror?: boolean; only?: string[]; sleeve?: boolean; id: string }> = ({ h, k, target, dir, mirror, only, sleeve = true, id }) => {
  const pl = anchorHand(h, k, target, dir, HS, mirror);
  return (
    <g id={id}>
      {sleeve && <Sleeve wrist={pl.at} dir={dir} s={HS} />}
      <PlaceHand at={pl.at} toward={pl.toward} s={HS} mirror={mirror}><Hand h={h} pal={STU} o={1.6} only={only} /></PlaceHand>
    </g>
  );
};

// ---------------------------------------------------------------- carton (lid opens about the far hinge)
const Carton: React.FC<{ open: number }> = ({ open }) => {
  const th = (open * 118 * Math.PI) / 180, depth = BOX.front - BOX.hinge;
  const freeY = BOX.hinge + depth * Math.cos(th);
  const inner = Math.cos(th) < 0;
  const serr = (y: number) => `M ${BOX.x0 + 4} ${y} ${Array.from({ length: 42 }, (_, i) => `L ${BOX.x0 + 8 + i * 14} ${y + (i % 2 ? 5 : 0)}`).join(' ')}`;
  return (
    <g id="carton">
      <ellipse cx={(BOX.x0 + BOX.x1) / 2 + 10} cy={BOX.bottom + 18} rx={330} ry={30} fill="#120904" opacity={0.5} filter="url(#if-blur)" />
      {/* inside of the box and the roll (seen when the lid is up) */}
      <rect x={BOX.x0} y={BOX.hinge} width={BOX.x1 - BOX.x0} height={depth} fill="#1c3f72" stroke="#0c1a30" strokeWidth={2.4} />
      <rect id="foil-roll" x={BOX.x0 + 12} y={BOX.hinge + 18} width={BOX.x1 - BOX.x0 - 24} height={depth - 26} rx={34} fill="url(#if-roll)" stroke="#5b6574" strokeWidth={2} />
      {/* front face */}
      <path d={`M ${BOX.x0} ${BOX.front} L ${BOX.x1} ${BOX.front} L ${BOX.x1} ${BOX.bottom} L ${BOX.x0} ${BOX.bottom} Z`} fill="url(#if-box)" stroke="#0c1a30" strokeWidth={2.6} />
      <path d={`M ${BOX.x0 + 40} ${BOX.bottom - 14} C ${BOX.x0 + 200} ${BOX.bottom - 60} ${BOX.x0 + 380} ${BOX.front + 50} ${BOX.x1 - 30} ${BOX.front + 14}`} fill="none" stroke="#9fc3f0" strokeWidth={10} opacity={0.5} strokeLinecap="round" />
      {/* end face */}
      <path d={`M ${BOX.x0} ${BOX.hinge} L ${BOX.x0 - 26} ${BOX.hinge + 18} L ${BOX.x0 - 26} ${BOX.bottom - 10} L ${BOX.x0} ${BOX.bottom} Z`} fill="#24508e" stroke="#0c1a30" strokeWidth={2.4} />
      {/* lid */}
      <g id="carton-lid">
        <path d={`M ${BOX.x0} ${BOX.hinge} L ${BOX.x1} ${BOX.hinge} L ${BOX.x1} ${freeY} L ${BOX.x0} ${freeY} Z`} fill={inner ? '#cfd5df' : 'url(#if-lid)'} stroke="#0c1a30" strokeWidth={2.6} />
        {!inner && <path d={`M ${BOX.x0 + 60} ${BOX.hinge + (freeY - BOX.hinge) * 0.7} C ${BOX.x0 + 260} ${BOX.hinge + (freeY - BOX.hinge) * 0.2} ${BOX.x0 + 420} ${BOX.hinge + (freeY - BOX.hinge) * 0.9} ${BOX.x1 - 40} ${BOX.hinge + (freeY - BOX.hinge) * 0.4}`} fill="none" stroke="#b9d4f5" strokeWidth={8} opacity={0.45} strokeLinecap="round" />}
        <path d={serr(freeY)} fill="none" stroke="#e6eaf0" strokeWidth={2.4} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- bowl
const Bowl: React.FC<{ lined: number }> = ({ lined }) => (
  <g id="bowl">
    <ellipse cx={BOWL.x + 12} cy={BOWL.y + 92} rx={BOWL.rx * 1.05} ry={34} fill="#120904" opacity={0.5} filter="url(#if-blur)" />
    <path d={`M ${BOWL.x - BOWL.rx} ${BOWL.y} C ${BOWL.x - BOWL.rx + 6} ${BOWL.y + 80} ${BOWL.x - 70} ${BOWL.y + 104} ${BOWL.x} ${BOWL.y + 104} C ${BOWL.x + 70} ${BOWL.y + 104} ${BOWL.x + BOWL.rx - 6} ${BOWL.y + 80} ${BOWL.x + BOWL.rx} ${BOWL.y} Z`} fill="url(#if-bowl-out)" stroke="#4a3a2c" strokeWidth={2.4} />
    <ellipse cx={BOWL.x} cy={BOWL.y} rx={BOWL.rx} ry={BOWL.ry} fill="#f1ece2" stroke="#4a3a2c" strokeWidth={2.4} />
    <ellipse cx={BOWL.x} cy={BOWL.y + 4} rx={BOWL.rx - 14} ry={BOWL.ry - 10} fill="url(#if-bowl-in)" stroke="#8a7d6a" strokeWidth={1.6} />
    {/* the foil lining (fades in as it is pressed into the curve) */}
    <g id="foil-lining" opacity={lined}>
      <ellipse cx={BOWL.x} cy={BOWL.y + 4} rx={BOWL.rx - 12} ry={BOWL.ry - 8} fill="url(#if-lining)" />
      <ellipse cx={BOWL.x - 30} cy={BOWL.y + 14} rx={70} ry={20} fill="#fff" opacity={0.55} filter="url(#if-blur-s)" />
      {[[-110, -10, -80, 6], [-40, 30, -10, 20], [40, -30, 70, -20], [100, 18, 124, 2], [-10, -40, 20, -46]].map(([a, b, c, d], i) =>
        <path key={i} d={`M ${BOWL.x + a} ${BOWL.y + b} L ${BOWL.x + (a + c) / 2 + 6} ${BOWL.y + (b + d) / 2 - 7} L ${BOWL.x + c} ${BOWL.y + d}`} fill="none" stroke="#7d8798" strokeWidth={1.8} />)}
    </g>
  </g>
);

// ---------------------------------------------------------------- the foil sheet: 8 boundary points (TL, TM, TR, RM, BR, BM, BL, LM)
type Poly = P[];
const smoothPath = (pts: Poly, wob = 0, seed = 0) => {
  // closed smooth curve through the points; `wob` adds a little crinkle to every edge
  const n = pts.length, out: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const steps = 6;
    for (let s = 0; s < steps; s++) {
      const k = s / steps, x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k;
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], l = Math.hypot(nx, ny) || 1;
      const w = s === 0 ? 0 : wob * Math.sin((i * 7 + s * 3 + seed) * 1.7);
      out.push(`${(x + (nx / l) * w).toFixed(1)} ${(y + (ny / l) * w).toFixed(1)}`);
    }
  }
  return `M ${out.join(' L ')} Z`;
};
const FoilSheet: React.FC<{ pts: Poly; wob: number; creases: P[]; under?: boolean }> = ({ pts, wob, creases }) => (
  <g id="foil-sheet">
    <path d={smoothPath(pts.map((p) => [p[0] + 8, p[1] + 16] as P), wob)} fill="#120904" opacity={0.35} filter="url(#if-blur-s)" />
    <path d={smoothPath(pts, wob)} fill="url(#if-foil)" stroke="#5f6a7a" strokeWidth={2} strokeLinejoin="round" />
    {/* long soft highlights across the sheet */}
    <path d={`M ${mix(pts[7], pts[0], 0.3)[0]} ${mix(pts[7], pts[0], 0.3)[1]} Q ${mix(pts[1], pts[5], 0.35)[0]} ${mix(pts[1], pts[5], 0.35)[1]} ${mix(pts[3], pts[2], 0.3)[0]} ${mix(pts[3], pts[2], 0.3)[1]}`} fill="none" stroke="#fff" strokeWidth={6} opacity={0.6} strokeLinecap="round" />
    <path d={`M ${mix(pts[7], pts[6], 0.4)[0]} ${mix(pts[7], pts[6], 0.4)[1]} Q ${mix(pts[1], pts[5], 0.75)[0]} ${mix(pts[1], pts[5], 0.75)[1]} ${mix(pts[3], pts[4], 0.4)[0]} ${mix(pts[3], pts[4], 0.4)[1]}`} fill="none" stroke="#fff" strokeWidth={4} opacity={0.4} strokeLinecap="round" />
    {/* crinkles where fingers grip or press */}
    {creases.map(([x, y], i) => <path key={i} d={`M ${x - 26} ${y + 10} L ${x - 10} ${y - 6} L ${x + 2} ${y + 8} L ${x + 18} ${y - 8} L ${x + 30} ${y + 4}`} fill="none" stroke="#7d8798" strokeWidth={1.8} strokeLinejoin="round" />)}
  </g>
);

// ---------------------------------------------------------------- the animated desk (local time t in seconds, 0..8)
const Desk: React.FC = () => {
  const fr = useCurrentFrame(), t = fr / IDEA_FPS;
  // lid: thumb lifts it 0.9-1.8 s, the left hand presses it shut on the sheet 3.6-4.0 s
  const open = kf(t, [[0.9, 0], [1.8, 1], [3.6, 1], [4.0, 0]]);
  const depth = BOX.front - BOX.hinge, freeY = BOX.hinge + depth * Math.cos((open * 118 * Math.PI) / 180);
  // the pinch point while pulling (2.2-3.6 s), with a small tug sideways at the tear (4.1-4.5 s)
  const pull = kp(t, [[2.2, [430, LIP_Y + 4]], [3.6, [430, 1330]], [4.1, [430, 1330]], [4.5, [470, 1316]]]);
  const tear = kf(t, [[4.1, 0], [4.45, 1]]);
  // the sheet before the tear: top edge on the roll lip, bottom edge in the pinch, corners lagging
  const lag = Math.min(40, (pull[1] - LIP_Y) * 0.12);
  const topY = (x: number) => LIP_Y + (tear > 0 && x < SHEET.x0 + (SHEET.x1 - SHEET.x0) * tear ? 10 * tear : 0);
  const pulled: Poly = [
    [SHEET.x0, topY(SHEET.x0)], [430, topY(430)], [SHEET.x1, topY(SHEET.x1)], [SHEET.x1 + 4, (LIP_Y + pull[1] - lag) / 2],
    [SHEET.x1 + 6, pull[1] - lag], pull, [SHEET.x0 - 6, pull[1] - lag], [SHEET.x0 - 4, (LIP_Y + pull[1] - lag) / 2],
  ];
  // carried to the bowl (4.6-6.0 s): held at its left and right edges
  const B = BOWL, hw = 200, overBowl: Poly = [
    [B.x - hw, B.y - 120], [B.x, B.y - 132], [B.x + hw, B.y - 120], [B.x + hw + 10, B.y - 4],
    [B.x + hw, B.y + 112], [B.x, B.y + 124], [B.x - hw, B.y + 112], [B.x - hw - 10, B.y - 4],
  ];
  // pressed into the curve (6.0-7.0 s): the edges gather to a crinkled ring just outside the rim
  const rim: Poly = [-135, -90, -45, 0, 45, 90, 135, 180].map((deg, i) => {
    const r = (deg * Math.PI) / 180, j = i % 2 ? 6 : -4;
    return [B.x + Math.cos(r) * (B.rx + 18 + j), B.y + Math.sin(r) * (B.ry + 14 + j)] as P;
  });
  const carry = kf(t, [[4.6, 0], [6.0, 1]]), press = kf(t, [[6.0, 0], [6.9, 1]]);
  const torn = t >= 4.45;
  const lifted: Poly = pulled.map((p, i) => [p[0], p[1] + (i < 3 ? 6 : 0)] as P);
  let sheet: Poly = torn ? lifted.map((p, i) => mix(mix(p, overBowl[i], carry), rim[i], press)) : pulled;
  // a little lift and sway while carried
  if (torn && carry < 1) { const lift = Math.sin(carry * Math.PI) * 60; sheet = sheet.map(([x, y], i) => [x, y - lift + Math.sin(t * 6 + i) * 3 * (1 - press)] as P); }
  const showSheet = t >= 2.2;
  const lining = press;

  // ---- hand targets
  // right hand (screen left): rests on the carton, lifts the flap with the thumb, pinches and pulls, carries, presses, leaves
  const R = (() => {
    if (t < 0.9) return { h: FLAT, k: 'f1', p: [390, 872] as P, dir: 94 };
    if (t < 1.8) { const y = Math.max(freeY, BOX.hinge - 60); return { h: LIFT, k: 't', p: [kf(t, [[0.9, 420], [1.8, 440]]), Math.min(BOX.front, y + 2)] as P, dir: 96 }; }
    if (t < 2.2) return { h: PINCH, k: 'f0', p: kp(t, [[1.8, [440, BOX.hinge - 30]], [2.2, [430, LIP_Y + 4]]]), dir: 92 };
    if (!torn) return { h: PINCH, k: 'f0', p: pull, dir: 92 };
    if (t < 6.0) return { h: PINCH, k: 'f0', p: sheet[7], dir: 80 };
    const rub = Math.sin(t * 9) * 10 * (1 - kf(t, [[6.8, 0], [7.0, 1]]));
    const p = kp(t, [[6.0, sheet[7]], [6.3, [B.x - 92 + rub, B.y + 10]], [7.0, [B.x - 92 + rub, B.y + 10]], [7.6, [B.x - 120, B.y - 1700]]]);
    return { h: FLAT, k: 'f1', p, dir: 96 };
  })();
  // left hand (screen right, mirrored): enters, braces the carton end, presses the lid shut, carries, presses, leaves
  const L = (() => {
    if (t < 3.6) return { h: FLAT, k: 'f1', p: kp(t, [[0, [800, -300]], [0.9, [672, 880]]]), dir: 98 };
    if (t < 4.6) return { h: FLAT, k: 'f1', p: kp(t, [[3.6, [672, 880]], [4.0, [600, 884]]]), dir: 98 };
    if (t < 6.0) return { h: PINCH, k: 'f0', p: sheet[3], dir: 100 };
    const rub = Math.sin(t * 9 + 1.6) * 10 * (1 - kf(t, [[6.8, 0], [7.0, 1]]));
    const p = kp(t, [[6.0, sheet[3]], [6.3, [B.x + 92 + rub, B.y + 12]], [7.0, [B.x + 92 + rub, B.y + 12]], [7.6, [B.x + 120, B.y - 1700]]]);
    return { h: FLAT, k: 'f1', p, dir: 84 };
  })();
  const creases: P[] = !showSheet ? [] : t < 4.6 ? [[pull[0] - 4, pull[1] - 30]] : t < 6 ? [[sheet[7][0] + 40, sheet[7][1]], [sheet[3][0] - 40, sheet[3][1]]] : [];

  return (
    <AbsoluteFill style={{ background: '#2a1a10' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="if-desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a3820" /><stop offset="0.5" stopColor="#6e4628" /><stop offset="1" stopColor="#3a2212" /></linearGradient>
          <linearGradient id="if-hood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffc72e" /><stop offset="1" stopColor="#e39709" /></linearGradient>
          <linearGradient id="if-box" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a74c4" /><stop offset="1" stopColor="#24508e" /></linearGradient>
          <linearGradient id="if-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5c93db" /><stop offset="1" stopColor="#3f78c6" /></linearGradient>
          <linearGradient id="if-roll" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f7fb" /><stop offset="0.45" stopColor="#aab4c2" /><stop offset="0.6" stopColor="#e6ebf2" /><stop offset="1" stopColor="#7d8798" /></linearGradient>
          <linearGradient id="if-foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2f5fa" /><stop offset="0.35" stopColor="#b9c3d1" /><stop offset="0.55" stopColor="#eef2f7" /><stop offset="0.8" stopColor="#a6b0bf" /><stop offset="1" stopColor="#dfe5ee" /></linearGradient>
          <radialGradient id="if-lining" cx="0.45" cy="0.55" r="0.6"><stop offset="0" stopColor="#f6f8fb" /><stop offset="0.5" stopColor="#b3bdcb" /><stop offset="1" stopColor="#6b7584" /></radialGradient>
          <radialGradient id="if-bowl-in" cx="0.45" cy="0.6" r="0.65"><stop offset="0" stopColor="#efe9dd" /><stop offset="1" stopColor="#b7ad9c" /></radialGradient>
          <linearGradient id="if-bowl-out" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e8e2d6" /><stop offset="1" stopColor="#a99f8e" /></linearGradient>
          <radialGradient id="if-warm"><stop offset="0" stopColor="#ffd890" stopOpacity={0.85} /><stop offset="0.35" stopColor="#ffb458" stopOpacity={0.3} /><stop offset="1" stopColor="#ff9a40" stopOpacity={0} /></radialGradient>
          <radialGradient id="if-core"><stop offset="0" stopColor="#fffbe6" /><stop offset="0.35" stopColor="#ffe2a0" stopOpacity={0.8} /><stop offset="1" stopColor="#ffb458" stopOpacity={0} /></radialGradient>
          <linearGradient id="if-cool" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7f98ff" stopOpacity={0.28} /><stop offset="0.5" stopColor="#7f98ff" stopOpacity={0.05} /><stop offset="1" stopColor="#7f98ff" stopOpacity={0} /></linearGradient>
          <filter id="if-blur"><feGaussianBlur stdDeviation="12" /></filter>
          <filter id="if-blur-s"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        {/* desk top, wood grain */}
        <rect width={W} height={H} fill="url(#if-desk)" />
        {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M -20 ${180 + i * 112} C 300 ${170 + i * 112 + (i % 3) * 10} 700 ${196 + i * 112} 1100 ${176 + i * 112}`} fill="none" stroke="#3e2614" strokeWidth={2.4} opacity={0.55} />)}
        <g id="set" transform="translate(0 250)">
        {/* the student's torso at the far edge of the desk */}
        <g id="torso">
          <path d="M 120 -400 L 150 -40 C 170 120 230 230 340 270 L 740 270 C 850 230 910 120 930 -40 L 960 -400 Z" fill="url(#if-hood)" stroke="#94600a" strokeWidth={3} />
          <path d="M 420 -40 L 460 200 M 640 -40 L 610 200" stroke="#d78d0a" strokeWidth={3} opacity={0.6} />
          <path d="M 512 -10 C 508 60 506 120 504 176 M 572 -10 C 576 60 578 120 580 180" stroke="#f8d26a" strokeWidth={5} fill="none" />
          <rect x={498} y={172} width={11} height={22} rx={3} fill="#8d8f96" /><rect x={575} y={176} width={11} height={22} rx={3} fill="#8d8f96" />
          <path d="M 150 -40 C 170 120 230 230 340 270 L 740 270 C 850 230 910 120 930 -40" fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={30} filter="url(#if-blur)" />
        </g>
        {/* the warm desk bulb */}
        <g id="bulb">
          <ellipse cx={BULB[0] + 6} cy={BULB[1] + 96} rx={70} ry={16} fill="#120904" opacity={0.5} filter="url(#if-blur-s)" />
          <rect x={BULB[0] - 54} y={BULB[1] + 70} width={108} height={26} rx={4} fill="#a87a48" stroke="#3a2414" strokeWidth={2} />
          <rect x={BULB[0] - 16} y={BULB[1] + 32} width={32} height={40} fill="#3a3b40" stroke="#141414" strokeWidth={2} />
          <rect x={BULB[0] - 12} y={BULB[1] + 4} width={24} height={30} fill="#c3c6cc" stroke="#141414" strokeWidth={1.6} />
          <ellipse cx={BULB[0]} cy={BULB[1] - 26} rx={30} ry={36} fill="#fff6d8" stroke="#8a7a50" strokeWidth={1.6} />
        </g>

        <Bowl lined={lining} />
        <Carton open={open} />
        {/* foil: under the lid while it is in the box; on top once torn */}
        {showSheet && !torn && <FoilSheet pts={sheet} wob={2.2} creases={creases} />}
        {/* the lid's cutter edge sits over the sheet once it is pressed shut */}
        {showSheet && !torn && open < 0.05 && <g><path d={`M ${BOX.x0} ${BOX.hinge} L ${BOX.x1} ${BOX.hinge} L ${BOX.x1} ${freeY} L ${BOX.x0} ${freeY} Z`} fill="url(#if-lid)" stroke="#0c1a30" strokeWidth={2.6} /><path d={`M ${BOX.x0 + 4} ${freeY} ${Array.from({ length: 42 }, (_, i) => `L ${BOX.x0 + 8 + i * 14} ${freeY + (i % 2 ? 5 : 0)}`).join(' ')}`} fill="none" stroke="#e6eaf0" strokeWidth={2.4} /></g>}
        {torn && <FoilSheet pts={sheet} wob={2.6 + press * 4} creases={creases} />}
        {/* the tear line: a bright ragged edge running along the cutter */}
        {tear > 0 && tear < 1 && <path d={`M ${SHEET.x0} ${LIP_Y + 8} ${Array.from({ length: Math.round(30 * tear) }, (_, i) => `L ${SHEET.x0 + (i + 1) * ((SHEET.x1 - SHEET.x0) / 30)} ${LIP_Y + 8 + (i % 2 ? 4 : 0)}`).join(' ')}`} fill="none" stroke="#fff" strokeWidth={2.4} />}

        {/* hands (editable layers) */}
        <PlacedHand id="hand-left" h={L.h} k={L.k} target={L.p} dir={L.dir} mirror />
        {/* right hand: when pinching, the thumb goes over the foil edge */}
        <PlacedHand id="hand-right" h={R.h} k={R.k} target={R.p} dir={R.dir} />

        </g>
        {/* light: warm from the bulb (left), cool from the window (top right) */}
        <g style={{ mixBlendMode: 'screen' }}>
          <circle cx={BULB[0]} cy={BULB[1] + 230} r={1050} fill="url(#if-warm)" opacity={0.95} />
          <circle cx={BULB[0]} cy={BULB[1] + 226} r={130} fill="url(#if-core)" />
          <rect width={W} height={H} fill="url(#if-cool)" />
        </g>
        <rect width={W} height={H} fill="#1a2350" opacity={0.22} style={{ mixBlendMode: 'multiply' }} />
      </svg>
    </AbsoluteFill>
  );
};

export const IdeaToFoil: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    {/* 0-2 s: the last two seconds of the Higgsfield shot (source frames 53-101 at 24 fps), ending as the fingertips touch */}
    <Sequence from={0} durationInFrames={CUT}>
      <OffthreadVideo src={staticFile('clips/higgsfield-reach.mp4')} startFrom={66} endAt={126} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </Sequence>
    {/* 2-10 s: match cut to the overhead desk */}
    <Sequence from={CUT} durationInFrames={IDEA_FRAMES - CUT}>
      <Desk />
      <Sequence from={27}><Audio src={staticFile('sfx/flap.wav')} volume={0.35} /></Sequence>
      <Sequence from={66}><Audio src={staticFile('sfx/rustle_pull.wav')} volume={0.4} /></Sequence>
      <Sequence from={123}><Audio src={staticFile('sfx/tear.wav')} volume={0.55} /></Sequence>
      <Sequence from={140}><Audio src={staticFile('sfx/rustle_pull.wav')} volume={0.22} /></Sequence>
      <Sequence from={180}><Audio src={staticFile('sfx/rustle_press.wav')} volume={0.4} /></Sequence>
    </Sequence>
  </AbsoluteFill>
);
