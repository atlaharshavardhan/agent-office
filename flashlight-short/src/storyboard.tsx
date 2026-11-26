// Storyboard stills (pass 2) for "How You'd Invent a Flashlight": 14 frames, 1080 x 1920, SVG only.
// Room layout (locked): closed door on the LEFT, workbench + physics chalkboard in the MIDDLE, second-floor window on the RIGHT.
// Light: ceiling lamp on (warm) only in 01A. After the cut: cool dusk from the window + warm local light (candle, bulb).
// Every editable piece (hands, wires, bulbs, switch, reflector, light) sits in its own <g id="...">.
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import {
  INK, W, H, P, Svg, Person, STU, FRD, HANDS, Hand, PlaceHand, HandSpec, LEGS_STAND, toHand, unlean, anchorHand,
  Tag, MiniBulb, Socket, Pack, PushSwitch, Wire, Candle, BowlTop, ToyCar, FoilSheet, WindowFrame, ChalkSketches, Pose,
} from './kit';

// ------------------------------------------------------------------ shared defs
const CoolDefs: React.FC = () => (
  <defs>
    <filter id="cool" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.5 0.07 0.07 0 0.02  0.07 0.58 0.1 0 0.045  0.1 0.14 0.86 0 0.11  0 0 0 1 0" /></filter>
    <filter id="dusk" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.32 0.05 0.05 0 0.01  0.05 0.36 0.07 0 0.03  0.08 0.1 0.6 0 0.08  0 0 0 1 0" /></filter>
    <filter id="sil" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.12 0 0 0 0.03  0 0.12 0 0 0.04  0 0 0.16 0 0.09  0 0 0 1 0" /></filter>
    <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="blur14"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="blur30"><feGaussianBlur stdDeviation="30" /></filter>
    <radialGradient id="warmGlow"><stop offset="0" stopColor="#ffe2a0" stopOpacity={0.95} /><stop offset="0.35" stopColor="#ffb85a" stopOpacity={0.4} /><stop offset="1" stopColor="#ff9a40" stopOpacity={0} /></radialGradient>
    <radialGradient id="warmSoft"><stop offset="0" stopColor="#ffc879" stopOpacity={0.55} /><stop offset="1" stopColor="#ff9a40" stopOpacity={0} /></radialGradient>
    <radialGradient id="coolSoft"><stop offset="0" stopColor="#9fb4ff" stopOpacity={0.35} /><stop offset="1" stopColor="#6a80d0" stopOpacity={0} /></radialGradient>
  </defs>
);
const Glow: React.FC<{ x: number; y: number; r: number; id?: string; o?: number; ry?: number; grad?: string }> = ({ x, y, r, o = 1, ry, grad = 'warmGlow' }) =>
  <ellipse cx={x} cy={y} rx={r} ry={ry ?? r} fill={`url(#${grad})`} opacity={o} style={{ mixBlendMode: 'screen' }} />;
const Frame: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) =>
  <AbsoluteFill style={{ background: bg }}><Svg><CoolDefs />{children}</Svg></AbsoluteFill>;

// a figure placed in the world: x,y = where local (0,0) lands; s = scale; flip = face LEFT
const Place: React.FC<{ x: number; y: number; s: number; flip?: boolean; children: React.ReactNode; filter?: string; id?: string }> = ({ x, y, s, flip, children, filter, id }) =>
  <g id={id} transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter={filter ? `url(#${filter})` : undefined}>{children}</g>;
// world -> figure-local
const toFig = (x: number, y: number, s: number, flip: boolean, w: P): P => [(flip ? x - w[0] : w[0] - x) / s, (w[1] - y) / s];


// figure-local point (before head tilt / lean) -> world
const rot = (p: P, deg: number, c: P): P => { const r = (deg * Math.PI) / 180, x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(r) - y * Math.sin(r), c[1] + x * Math.sin(r) + y * Math.cos(r)]; };
const figToWorld = (S: { x: number; y: number; s: number }, flip: boolean, lean: number, tilt: number, p: P, inHead = false): P => {
  let q = inHead ? rot(p, tilt, [96, 196]) : p;
  q = rot(q, lean, [100, 560]);
  return [S.x + (flip ? -1 : 1) * q[0] * S.s, S.y + q[1] * S.s];
};
const MOUTH: P = [38 + 0.8 * 184, -6 + 0.8 * 158];
const worldToArm = (S: { x: number; y: number; s: number }, lean: number, w: P, flip = false): P => unlean(toFig(S.x, S.y, S.s, flip, w), lean);

// ================================================================== 01 · the room (wide three-quarter view)
// perspective: back wall x 300..1080, y 260..1240; left wall recedes from x 0 to 300.
const wallTop = (x: number) => 60 + (x / 300) * 200;
const wallBot = (x: number) => 1520 - (x / 300) * 280;
const onLeftWall = (x: number, f: number) => wallBot(x) - f * (wallBot(x) - wallTop(x)); // f = height fraction above the floor
const DOOR = { x0: 52, x1: 252, top: 0.73 };
const HANDLE: P = [222, onLeftWall(222, 0.36)];

const Room: React.FC<{ lit: boolean }> = ({ lit }) => {
  const dq = (x: number, f: number): P => [x, onLeftWall(x, f)];
  const door = [dq(DOOR.x0, 0), dq(DOOR.x0, DOOR.top), dq(DOOR.x1, DOOR.top), dq(DOOR.x1, 0)];
  const frame = [dq(DOOR.x0 - 18, -0.005), dq(DOOR.x0 - 18, DOOR.top + 0.03), dq(DOOR.x1 + 14, DOOR.top + 0.03), dq(DOOR.x1 + 14, -0.005)];
  const poly = (a: P[]) => a.map((p) => p.join(',')).join(' ');
  const panel = (x0: number, x1: number, f0: number, f1: number) => poly([dq(x0, f0), dq(x0, f1), dq(x1, f1), dq(x1, f0)]);
  // student at the door: faces LEFT, leans back, near hand grips the lever, far hand braces on the frame
  const S = { x: 520, y: 700, s: 0.86 };
  const lean = -9;
  const grip = toFig(S.x, S.y, S.s, true, [HANDLE[0] - 4, HANDLE[1] + 2]);
  const brace = toFig(S.x, S.y, S.s, true, [HANDLE[0] - 22, HANDLE[1] + 5]);
  const wrN = unlean([grip[0] - 50, grip[1] + 8], lean), wrF = unlean([brace[0] - 50, brace[1] + 2], lean);
  const pose: Pose = {
    lean, head: { mouth: 'grit', brow: -2, browTilt: 5, eye: 'fwd' }, headTilt: 4,
    near: { el: [210, 345], wr: wrN, hand: HANDS.fist, toward: unlean(grip, lean) },
    far: { el: [190, 370], wr: wrF, hand: HANDS.fist, toward: unlean(brace, lean) },
    legN: { kn: [60, 770], an: [10, 960], toe: -6 }, legF: { kn: [140, 770], an: [150, 962] },
  };
  return (
    <g>
      <defs>
        <linearGradient id="r-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8d5d3e" /><stop offset="1" stopColor="#5c3a27" /></linearGradient>
        <linearGradient id="r-left" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4a2e1e" /><stop offset="1" stopColor="#6e4630" /></linearGradient>
        <linearGradient id="r-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6e4428" /><stop offset="1" stopColor="#3a2215" /></linearGradient>
        <linearGradient id="r-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2c3c78" /><stop offset="0.6" stopColor="#b8667c" /><stop offset="1" stopColor="#eea66a" /></linearGradient>
        <linearGradient id="r-dusk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2556" /><stop offset="0.7" stopColor="#4a4f8c" /><stop offset="1" stopColor="#7a6a9a" /></linearGradient>
        <linearGradient id="r-door" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7a4a2a" /><stop offset="1" stopColor="#a0663a" /></linearGradient>
        <radialGradient id="r-lamp" cx="0.6" cy="0.08" r="0.8"><stop offset="0" stopColor="#ffd486" stopOpacity={0.5} /><stop offset="0.5" stopColor="#ffb456" stopOpacity={0.14} /><stop offset="1" stopColor="#ffb456" stopOpacity={0} /></radialGradient>
        <clipPath id="r-glass"><rect x={0} y={0} width={180} height={470} /></clipPath>
      </defs>
      {/* ceiling, walls, floor */}
      <polygon points="0,0 1080,0 1080,260 300,260 0,60" fill="#4a2f20" />
      <rect x={300} y={260} width={780} height={980} fill="url(#r-wall)" />
      <polygon points={`0,60 300,260 300,1240 0,1520`} fill="url(#r-left)" />
      <polygon points="0,1520 300,1240 1080,1240 1080,1920 0,1920" fill="url(#r-floor)" />
      {Array.from({ length: 14 }, (_, i) => { const x = 300 + i * 60; return <line key={i} x1={x} y1={1240} x2={300 + (x - 300) * 2.6 - 600} y2={1920} stroke="#4e2f1c" strokeWidth={3} />; })}
      <polyline points="0,1520 300,1240 1080,1240" fill="none" stroke="#3a2215" strokeWidth={10} />
      <polyline points="0,60 300,260 1080,260" fill="none" stroke="#3a2215" strokeWidth={5} />
      <line x1={300} y1={260} x2={300} y2={1240} stroke="#3a2215" strokeWidth={4} />

      {/* LEFT: the door, FULLY CLOSED and flush in its frame */}
      <g id="door">
        <polygon points={poly(frame)} fill="#5a3620" stroke={INK} strokeWidth={3} />
        <polygon points={poly(door)} fill="url(#r-door)" stroke={INK} strokeWidth={3} />
        <polygon points={panel(DOOR.x0 + 26, DOOR.x1 - 26, 0.08, 0.33)} fill="none" stroke="#5e3a20" strokeWidth={5} />
        <polygon points={panel(DOOR.x0 + 26, DOOR.x1 - 26, 0.41, 0.68)} fill="none" stroke="#5e3a20" strokeWidth={5} />
        {/* hinges on the near edge */}
        {[0.12, 0.62].map((f) => <rect key={f} x={DOOR.x0 - 4} y={onLeftWall(DOOR.x0, f) - 26} width={10} height={40} fill="#c9a24a" stroke={INK} strokeWidth={2} />)}
        {/* lock plate */}
        <path d={`M ${HANDLE[0] - 7} ${HANDLE[1] - 40} h 16 v 92 h -16 Z`} fill="#c9a24a" stroke={INK} strokeWidth={2.4} />
        <circle cx={HANDLE[0] + 1} cy={HANDLE[1] + 34} r={4} fill={INK} />
      </g>

      {/* MIDDLE: the physics chalkboard (sketches only, no words) */}
      <g id="board" transform="translate(470 450)">
        <rect x={-16} y={-16} width={432} height={312} rx={6} fill="#6b4a32" stroke={INK} strokeWidth={3} />
        <rect width={400} height={280} fill="#24352f" />
        <g transform="translate(-6 16) scale(0.92)"><ChalkSketches /></g>
        <rect x={-6} y={282} width={412} height={14} fill="#5a3e2a" stroke={INK} strokeWidth={2} />
        <rect x={40} y={276} width={30} height={8} rx={2} fill="#f0efe8" />
      </g>

      {/* RIGHT: the second-floor window; dusk outside, the friend below on the pavement */}
      <g id="window" transform="translate(870 420)">
        <WindowFrame w={180} h={470} frame="#e7dccb" frameSh="#b8a68e" glass={<g clipPath="url(#r-glass)">
          <rect width={180} height={470} fill={lit ? 'url(#r-dusk)' : 'url(#r-dusk2)'} />
          <rect x={0} y={130} width={110} height={180} fill={lit ? '#3a3550' : '#1e2238'} />
          {[0, 1, 2].map((i) => [0, 1].map((j) => <rect key={`${i}${j}`} x={12 + i * 34} y={150 + j * 60} width={20} height={30} fill={lit ? '#f7c66c' : '#262c48'} opacity={0.9} />))}
          <rect x={0} y={330} width={180} height={140} fill={lit ? '#5a5f7a' : '#2a3050'} />
          <rect x={0} y={330} width={180} height={10} fill={lit ? '#8a8ea4' : '#4a5274'} />
          <g id="friend-in-window" transform="translate(60 286) scale(0.13)" filter={lit ? undefined : 'url(#cool)'}><Person who="friend" pal={FRD} pose={{ head: {}, near: { el: [80, 400], wr: [70, 540], hand: HANDS.fist }, far: { el: [140, 400], wr: [180, 530], hand: HANDS.fist }, legN: { kn: [150, 770], an: [180, 960] }, legF: { kn: [80, 770], an: [40, 950], toe: 20 } }} /></g>
        </g>} />
      </g>

      {/* the ceiling lamp */}
      <g id="ceiling-lamp">
        <path d="M 660 0 V 150" stroke="#2a1a12" strokeWidth={4} />
        <path d="M 610 150 H 710 L 690 196 H 630 Z" fill="#3a2418" stroke={INK} strokeWidth={3} />
        <ellipse cx={660} cy={200} rx={28} ry={11} fill={lit ? '#fff3cc' : '#4a4a52'} stroke={INK} strokeWidth={2} />
      </g>

      {/* MIDDLE: the workbench with the toy car, two miniature bulbs, shallow bowl, folded foil, small switch */}
      <g id="workbench">
        <ellipse cx={660} cy={1250} rx={240} ry={20} fill="#1a0f09" opacity={0.4} filter="url(#blur14)" />
        <path d="M 470 940 L 850 940 L 876 1000 L 446 1000 Z" fill="#a8744a" stroke={INK} strokeWidth={3} />
        <rect x={446} y={1000} width={430} height={30} fill="#7a4e2e" stroke={INK} strokeWidth={3} />
        {[[460, 1030, 1270], [846, 1030, 1270], [486, 1000, 1240], [832, 1000, 1240]].map(([x, y0, y1], i) => <rect key={i} x={x} y={y0} width={22} height={y1 - y0} fill={i > 1 ? '#5a381f' : '#6d4527'} stroke={INK} strokeWidth={3} />)}
        <rect x={482} y={1150} width={370} height={14} fill="#6d4527" stroke={INK} strokeWidth={2.4} />
        <g transform="translate(590 978) scale(0.44)"><ToyCar /></g>
        <g transform="translate(668 984) rotate(80) scale(0.42)"><MiniBulb state="off" id="r1b1" /></g>
        <g transform="translate(700 990) rotate(96) scale(0.42)"><MiniBulb state="off" id="r1b2" /></g>
        <g transform="translate(762 966)"><BowlTop rx={44} ry={12} id="r1bowl" /></g>
        <g transform="translate(806 954) scale(0.8)"><FoilSheet w={48} h={26} /></g>
        <g transform="translate(848 990) scale(0.3)"><PushSwitch /></g>
      </g>

      {/* the student pulling the stuck door */}
      <Place x={S.x} y={S.y} s={S.s} flip id="student">
        <Person who="stu" pal={STU} pose={{ ...pose, near: { ...pose.near, behind: undefined } }} />
      </Place>
      {/* the lever handle passes through his fist: draw its free end in front so the grip reads */}
      <g id="door-lever">
        <path d={`M ${HANDLE[0] + 2} ${HANDLE[1]} L ${HANDLE[0] - 44} ${HANDLE[1] + 6}`} stroke={INK} strokeWidth={13} strokeLinecap="round" />
        <path d={`M ${HANDLE[0] + 2} ${HANDLE[1]} L ${HANDLE[0] - 44} ${HANDLE[1] + 6}`} stroke="#d8b35a" strokeWidth={7} strokeLinecap="round" />
      </g>
      <Place x={S.x} y={S.y} s={S.s} flip>
        {/* re-draw only the fingers over the lever so they wrap it */}
        <g transform={`rotate(${lean} 100 560)`}>
          <PlaceHand at={wrN} toward={unlean(grip, lean)} s={0.64}><Hand h={HANDS.fist} pal={STU} only={['f0', 'f1', 'f2', 'f3', 't']} /></PlaceHand>
        </g>
      </Place>

      {/* light */}
      {lit
        ? <g id="light-lamp"><rect width={W} height={H} fill="url(#r-lamp)" style={{ mixBlendMode: 'screen' }} /><Glow x={660} y={205} r={90} o={0.9} /></g>
        : <g id="light-blackout">
          <rect width={W} height={H} fill="#2a3a78" opacity={0.85} style={{ mixBlendMode: 'multiply' }} />
          {/* faint blue window light across the floor and the bench */}
          <polygon points="870,420 1050,420 1080,900 1080,1920 380,1920 870,890" fill="#7d93e0" opacity={0.16} style={{ mixBlendMode: 'screen' }} filter="url(#blur30)" />
          <Glow x={960} y={650} r={360} o={0.8} grad="coolSoft" /><Glow x={560} y={1100} r={520} o={0.35} grad="coolSoft" />
        </g>}
      {!lit && <g transform="translate(870 420)" opacity={0.55} style={{ mixBlendMode: 'screen' }}><rect width={180} height={470} fill="url(#r-dusk2)" /></g>}
    </g>
  );
};
export const S01A: React.FC = () => <Frame bg="#2a1a12"><Room lit /></Frame>;
export const S01B: React.FC = () => <Frame bg="#0e1328"><Room lit={false} /></Frame>;

// ================================================================== 02A · calling from the open window (interior, side profile)
export const S02A: React.FC = () => {
  const S = { x: 236, y: 440, s: 1.45 };
  const lean = 22, tilt = -10;
  const pose: Pose = {
    lean, head: { mouth: 'shout', brow: 9, browTilt: -3, eye: 'fwd' }, headTilt: tilt,
    near: { el: worldToArm(S, lean, [560, 1010]), wr: worldToArm(S, lean, [650, 1150]), hand: HANDS.flat, toward: worldToArm(S, lean, [800, 1176]) },
    far: { el: worldToArm(S, lean, [790, 720]), wr: worldToArm(S, lean, [900, 540]), hand: HANDS.spread, toward: worldToArm(S, lean, [930, 420]) },
    ...LEGS_STAND,
  };
  const m = figToWorld(S, false, lean, tilt, MOUTH, true);
  return (
    <Frame bg="#121a33">
      <defs>
        <linearGradient id="w2-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141f4a" /><stop offset="0.65" stopColor="#3d4a8a" /><stop offset="1" stopColor="#a06a88" /></linearGradient>
        <linearGradient id="w2-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1a2346" /><stop offset="1" stopColor="#2b3866" /></linearGradient>
        <clipPath id="w2-open"><polygon points="600,380 1000,260 1000,1230 600,1160" /></clipPath>
      </defs>
      <rect width={W} height={H} fill="#141b36" />
      <rect x={0} y={1560} width={W} height={360} fill="#0f1428" />
      {/* the window wall on the right, receding; its open casement shows the dusk outside */}
      <polygon points="560,0 1080,-140 1080,2060 560,1640" fill="url(#w2-wall)" />
      <g clipPath="url(#w2-open)">
        <rect x={560} y={200} width={520} height={1100} fill="url(#w2-sky)" />
        <path d="M 560 1000 L 660 1000 L 660 900 L 760 900 L 760 960 L 860 960 L 860 860 L 1000 860 L 1000 1300 L 560 1300 Z" fill="#0d1328" />
        {[[680, 930], [720, 930], [880, 900], [930, 900]].map(([x, y], i) => <rect key={i} x={x} y={y} width={18} height={26} fill="#1c2546" />)}
        <circle cx={920} cy={400} r={22} fill="#e4ebff" opacity={0.85} />
        <circle cx={920} cy={400} r={70} fill="url(#coolSoft)" />
      </g>
      <polygon points="600,380 1000,260 1000,1230 600,1160" fill="none" stroke="#9b94a8" strokeWidth={22} strokeLinejoin="round" />
      <polygon points="600,380 1000,260 1000,1230 600,1160" fill="none" stroke={INK} strokeWidth={3} />
      {/* the casement swung open toward us */}
      <polygon points="1000,260 1080,300 1080,1200 1000,1230" fill="#8c86a0" stroke={INK} strokeWidth={3} />
      {/* inner sill */}
      <g id="sill">
        <polygon points="520,1160 600,1160 1000,1230 1080,1262 1080,1312 520,1212" fill="#9b94a8" stroke={INK} strokeWidth={3} />
        <polygon points="520,1212 1080,1312 1080,1344 520,1240" fill="#6c6680" stroke={INK} strokeWidth={3} />
      </g>
      <Place x={S.x} y={S.y} s={S.s} id="student" filter="cool"><Person who="stu" pal={STU} pose={pose} /></Place>
      {/* his shout carries out of the window: sound arcs only, no words */}
      <g id="shout-arcs" stroke="#e8eeff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9}>
        {[0, 1, 2].map((i) => { const x = m[0] + 34 + i * 30, r = 26 + i * 18; return <path key={i} d={`M ${x} ${m[1] - r} Q ${x + r * 0.7} ${m[1]} ${x} ${m[1] + r}`} />; })}
      </g>
      <Glow x={820} y={600} r={460} o={0.35} grad="coolSoft" />
    </Frame>
  );
};

// ================================================================== the street (02B, 03, 09 share one camera)
const WIN = { x: 140, y: 300, w: 290, h: 400 };
type StreetState = 'empty' | 'candle' | 'torch';
const Street: React.FC<{ state: StreetState; children?: React.ReactNode; torchOn?: boolean }> = ({ state, children }) => (
  <g>
    <defs>
      <linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1330" /><stop offset="1" stopColor="#2a3866" /></linearGradient>
      <linearGradient id="st-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4a6c" /><stop offset="1" stopColor="#26324e" /></linearGradient>
      <linearGradient id="st-pave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b4560" /><stop offset="1" stopColor="#1c2236" /></linearGradient>
      <clipPath id="st-glass"><rect x={WIN.x + 20} y={WIN.y + 20} width={WIN.w - 40} height={WIN.h - 40} /></clipPath>
    </defs>
    <rect width={W} height={H} fill="url(#st-sky)" />
    <circle cx={900} cy={110} r={24} fill="#e8eeff" opacity={0.85} /><circle cx={900} cy={110} r={90} fill="url(#coolSoft)" />
    {/* building: two storeys, flat elevation */}
    <rect x={-20} y={170} width={1120} height={1020} fill="url(#st-wall)" stroke={INK} strokeWidth={3} />
    <rect x={-20} y={170} width={1120} height={30} fill="#2a3654" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 19 }, (_, i) => <line key={i} x1={-20} y1={240 + i * 50} x2={1100} y2={240 + i * 50} stroke="#2f3c5c" strokeWidth={2} opacity={0.5} />)}
    {/* neighbouring dark windows */}
    {[640, 880].map((x) => <g key={x} transform={`translate(${x} ${WIN.y + 30})`}><WindowFrame w={170} h={330} frame="#46557a" frameSh="#2c3756" glass={<rect width={170} height={330} fill="#101a30" />} /></g>)}
    {/* THE window */}
    <g id="student-window" transform={`translate(${WIN.x} ${WIN.y})`}>
      <WindowFrame w={WIN.w} h={WIN.h} frame="#5b6b92" frameSh="#36436a" glass={<rect width={WIN.w} height={WIN.h} fill={state === 'empty' ? '#121c34' : state === 'candle' ? '#1a1f34' : '#2a2a34'} />} />
    </g>
    <g clipPath="url(#st-glass)">{state !== 'empty' && children}</g>
    {/* window frame bars over whoever is inside */}
    <g transform={`translate(${WIN.x} ${WIN.y})`}><WindowFrame w={WIN.w} h={WIN.h} frame="#5b6b92" frameSh="#36436a" glass={null} /></g>
    {/* ground floor: shuttered shop, street door, a dead street lamp */}
    <rect x={-20} y={790} width={1120} height={22} fill="#2a3654" stroke={INK} strokeWidth={3} />
    <rect x={40} y={860} width={430} height={330} fill="#2b354f" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 11 }, (_, i) => <line key={i} x1={40} y1={884 + i * 28} x2={470} y2={884 + i * 28} stroke="#1f2840" strokeWidth={3} />)}
    <rect x={640} y={870} width={170} height={320} fill="#1d2640" stroke={INK} strokeWidth={3} />
    <circle cx={790} cy={1040} r={6} fill="#5b6b92" />
    <rect x={950} y={600} width={14} height={600} fill="#1b2238" stroke={INK} strokeWidth={2} />
    <path d="M 957 610 C 957 570 920 560 890 570" stroke="#1b2238" strokeWidth={12} fill="none" /><path d="M 860 562 H 920 L 910 584 H 870 Z" fill="#2c3550" stroke={INK} strokeWidth={2} />
    {/* pavement, kerb, road */}
    <rect x={0} y={1190} width={W} height={560} fill="url(#st-pave)" />
    {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-100 + i * 140} y1={1190} x2={-500 + i * 200} y2={1750} stroke="#2a3149" strokeWidth={3} />)}
    {[1290, 1450].map((y) => <line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#2a3149" strokeWidth={3} />)}
    <rect x={0} y={1750} width={W} height={26} fill="#545e78" stroke={INK} strokeWidth={3} />
    <rect x={0} y={1776} width={W} height={150} fill="#14182a" />
  </g>
);
const FRIEND_Y = 1395 - 0.9 * 1024;
const friendWalk: Pose = {
  head: { eye: 'fwd', mouth: 'flat' },
  near: { el: [76, 400], wr: [52, 540], hand: HANDS.relaxed }, far: { el: [146, 398], wr: [196, 520], hand: HANDS.relaxed },
  legN: { kn: [150, 770], an: [188, 962] }, legF: { kn: [86, 776], an: [30, 948], toe: 22 },
};

export const S02B: React.FC = () => (
  <Frame bg="#0b1330">
    <Street state="empty" />
    <Place x={420} y={FRIEND_Y} s={0.9} id="friend" filter="cool"><Person who="friend" pal={FRD} pose={friendWalk} /></Place>
  </Frame>
);

// ================================================================== 03 · the candle, from the street
const WS = { x: 140, y: 352, s: 0.62 }; // the student framed in his window (03 and 09)
export const S03: React.FC = () => {
  const lean = 8, tilt = 12;
  const candleAt: P = [336, 600];
  const pose: Pose = {
    lean, head: { eye: 'downfwd', mouth: 'flat', brow: 2 }, headTilt: tilt,
    near: { el: worldToArm(WS, lean, [250, 640]), wr: worldToArm(WS, lean, [candleAt[0] - 30, candleAt[1] + 8]), hand: HANDS.fist, toward: worldToArm(WS, lean, [candleAt[0] + 20, candleAt[1] + 8]) },
    far: { el: worldToArm(WS, lean, [200, 650]), wr: worldToArm(WS, lean, [230, 700]), hand: HANDS.relaxed }, ...LEGS_STAND,
  };
  return (
    <Frame bg="#0b1330">
      <Street state="candle">
        <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="#141a30" />
        <Place x={WS.x} y={WS.y} s={WS.s} id="student" filter="dusk"><Person who="stu" pal={STU} pose={pose} /></Place>
        <g id="candle" transform={`translate(${candleAt[0]} ${candleAt[1]}) scale(0.34)`}><Candle id="c3" glow={0} /></g>
        {/* the candle lights only the front of his face */}
        <Glow x={candleAt[0] - 10} y={candleAt[1] - 70} r={90} o={0.85} />
      </Street>
      {/* from the pavement it is only a small warm point */}
      <g id="candle-glow"><Glow x={candleAt[0]} y={candleAt[1] - 62} r={40} o={0.7} /></g>
      <Place x={560} y={FRIEND_Y} s={0.9} id="friend" filter="cool"><Person who="friend" pal={FRD} pose={{ ...friendWalk, legN: friendWalk.legF, legF: friendWalk.legN, near: friendWalk.far, far: friendWalk.near }} /></Place>
    </Frame>
  );
};

// ================================================================== 04 / 05 / 08A · first-person workbench framing
const Bench: React.FC<{ id: string }> = ({ id }) => (
  <g>
    <defs>
      <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a5236" /><stop offset="1" stopColor="#4a3020" /></linearGradient>
    </defs>
    {/* wall with the bottom of the chalkboard */}
    <rect width={W} height={540} fill="#1d2747" />
    <rect x={110} y={-40} width={700} height={330} fill="#5a3e2a" stroke={INK} strokeWidth={3} />
    <rect x={126} y={-40} width={668} height={312} fill="#1f2e2a" />
    <path d="M 200 200 C 300 170 420 230 520 190" stroke="#e8eae2" strokeWidth={4} fill="none" opacity={0.35} />
    <rect x={100} y={286} width={720} height={18} fill="#4a3322" stroke={INK} strokeWidth={2.4} />
    {/* bench top */}
    <polygon points={`-200,540 1280,540 ${W + 600},${H} -600,${H}`} fill={`url(#${id}-top)`} />
    {Array.from({ length: 9 }, (_, i) => { const x = -160 + i * 180; return <line key={i} x1={x} y1={540} x2={540 + (x - 540) * 2.2} y2={H} stroke="#3c2618" strokeWidth={3} opacity={0.7} />; })}
    <rect x={0} y={530} width={W} height={14} fill="#3a2418" />
  </g>
);
// a first-person hand placed by a fingertip contact point
type FPA = { h: HandSpec; at: P; toward: P; dir: number; s: number; mirror?: boolean };
const fpHand = (h: HandSpec, k: string, target: P, dir: number, s: number, mirror?: boolean, thumbTo?: P): FPA => {
  const pl = anchorHand(h, k, target, dir, s, mirror);
  const hh = thumbTo ? { ...h, t: { ...h.t, to: toHand(pl.at, pl.toward, s, mirror, thumbTo) } } : h;
  return { h: hh, dir, s, mirror, ...pl };
};
// forearm from the wrist back out of frame, with the rolled mustard cuff and the sleeve beyond
const Forearm: React.FC<{ a: FPA }> = ({ a }) => {
  const b = ((a.dir + 180) * Math.PI) / 180, ux = Math.cos(b), uy = Math.sin(b), px = -uy, py = ux;
  const at = (d: number, w: number, side: 1 | -1): string => `${(a.at[0] + ux * d + px * w * side / 2).toFixed(1)},${(a.at[1] + uy * d + py * w * side / 2).toFixed(1)}`;
  const s = a.s, c0 = 120 * s, c1 = 160 * s;
  const quad = (d0: number, w0: number, d1: number, w1: number) => [at(d0, w0, 1), at(d1, w1, 1), at(d1, w1, -1), at(d0, w0, -1)].join(' ');
  const shade = a.mirror ? 1 : -1;
  return (
    <g>
      <polygon points={quad(c1 - 4, 92 * s, 1200, 104 * s)} fill={STU.top} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
      <polygon points={quad(c1 + 30 * s, 40 * s, 1200, 40 * s)} fill={STU.topSh} opacity={0.4} transform={`translate(${px * shade * 22 * s} ${py * shade * 22 * s})`} />
      <polygon points={quad(-6, 50 * s, c0 + 6, 66 * s)} fill={STU.skin} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
      <polygon points={quad(-6, 16 * s, c0, 22 * s)} fill={STU.skinSh} opacity={0.35} transform={`translate(${px * shade * 16 * s} ${py * shade * 16 * s})`} />
      <polygon points={quad(c0 - 4, 84 * s, c1, 90 * s)} fill={STU.topHi} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
      <polyline points={`${at(c0 + 18 * s, 80 * s, 1)} ${at(c0 + 18 * s, 80 * s, -1)}`} stroke={STU.topSh} strokeWidth={3} />
    </g>
  );
};
const FPArm: React.FC<{ a: FPA; only?: string[]; noArm?: boolean; light?: string }> = ({ a, only, noArm, light }) => (
  <g>
    {!noArm && <Forearm a={a} />}
    <PlaceHand at={a.at} toward={a.toward} s={a.s} mirror={a.mirror}><Hand h={a.h} pal={STU} o={3.4 / Math.max(1, a.s / 1.6)} only={only} glow={light} /></PlaceHand>
  </g>
);
// hand shapes for the build
// thumb-side views (seen from above, the hand is in handshake orientation)
const PINCH: HandSpec = { side: true, f: [{ a: 14, b: 38, c: 30 }, { a: 40, b: 70, c: 60 }, { a: 46, b: 74, c: 60 }, { a: 50, b: 74, c: 60 }], t: { toF0: true, b: 6 } };
const STEADY: HandSpec = { side: true, f: [{ a: 10, b: 30, c: 26 }, { a: 20, b: 40, c: 34 }, { a: 40, b: 70, c: 60 }, { a: 46, b: 72, c: 60 }], t: { b: 8 } };
const PRESS: HandSpec = { side: true, f: [{ a: 50, b: 80, c: 70 }, { a: 54, b: 80, c: 66 }, { a: 56, b: 78, c: 64 }, { a: 58, b: 76, c: 62 }], t: { a: 18, b: 8, c: 6 } };
const SMOOTH: HandSpec = { f: [{ a: 12, b: -4, c: -4 }, { a: 4, b: -2, c: -4 }, { a: -5, c: -4 }, { a: -14, c: -4 }], t: { a: 22, b: -6 } };

const SOCK: P = [540, 1060], SS = 2.3;
const term = (side: -1 | 1): P => [SOCK[0] + side * 52 * SS, SOCK[1] + 12 * SS];
const HS = 2.25;

const BulbSetup04: React.FC<{ after: boolean }> = ({ after }) => {
  // left hand steadies the socket: index on the far side of the black collar, thumb on the near side
  const L = fpHand(STEADY, 'f0', [SOCK[0] - 30, SOCK[1] - 84], -58, HS, true, [SOCK[0] - 50, SOCK[1] - 6]);
  // right hand pinches the red lead; the bare tip stops just short of the right terminal (before), then has jerked away (after)
  const tipEnd: P = after ? [term(1)[0] + 70, term(1)[1] + 46] : [term(1)[0] + 20, term(1)[1] + 4];
  const ldir = after ? 205 : 196; // direction from the pinch toward the tip
  const pinch: P = [tipEnd[0] - Math.cos((ldir * Math.PI) / 180) * 110, tipEnd[1] - Math.sin((ldir * Math.PI) / 180) * 110];
  const R = fpHand(PINCH, 'f0', pinch, after ? -100 : -110, HS);
  const leadBack: P = [pinch[0] - Math.cos((ldir * Math.PI) / 180) * 60, pinch[1] - Math.sin((ldir * Math.PI) / 180) * 60];
  return (
    <g>
      {/* the opened toy car with its four-cell 6 V pack */}
      <g id="toy-car">
        <g transform="translate(80 600) rotate(-6) scale(1.1)"><ToyCar /></g>
        <g transform="translate(40 690)">
          <rect x={0} y={0} width={330} height={230} rx={40} fill="#b02c24" stroke={INK} strokeWidth={4} />
          <rect x={18} y={18} width={294} height={194} rx={28} fill="#5a1612" stroke={INK} strokeWidth={2.4} />
          {[[-16, 30], [318, 30], [-16, 160], [318, 160]].map(([x, y], i) => <rect key={i} x={x} y={y} width={30} height={50} rx={9} fill="#1b1b1f" stroke={INK} strokeWidth={3} />)}
          <g id="pack-6v" transform="translate(64 40)"><Pack cells={4} /></g>
        </g>
        <Tag x={205} y={966} t="6 V" s={1.15} />
      </g>
      {/* black lead: pack (-) to the left terminal, already screwed down */}
      <g id="wire-black"><Wire d={`M 300 730 C 380 700 400 860 380 960 C 370 1040 380 1090 ${term(-1)[0]} ${term(-1)[1]}`} c="#1d1d22" w={11} /></g>
      {/* socket and the bulb */}
      <g id="socket" transform={`translate(${SOCK[0]} ${SOCK[1]}) scale(${SS})`}><Socket /></g>
      <g id="bulb" transform={`translate(${SOCK[0]} ${SOCK[1] - 34 * SS}) scale(${SS})`}><MiniBulb state={after ? 'burnt' : 'off'} id={after ? 'b4b' : 'b4a'} /></g>
      <Tag x={SOCK[0] + 210} y={SOCK[1] - 270} t="3 V" s={1.15} rot={6} />
      <path d={`M ${SOCK[0] + 166} ${SOCK[1] - 256} C ${SOCK[0] + 120} ${SOCK[1] - 200} ${SOCK[0] + 70} ${SOCK[1] - 110} ${SOCK[0] + 40} ${SOCK[1] - 96}`} stroke="#e8e2d4" strokeWidth={2.4} fill="none" />
      {after && <g id="smoke" opacity={0.6}><path d={`M ${SOCK[0] + 6} ${SOCK[1] - 290} c -20 -30 20 -50 0 -80 c -16 -26 14 -44 6 -64`} stroke="#c9cbd2" strokeWidth={7} fill="none" strokeLinecap="round" filter="url(#blur6)" /></g>}
      {/* left hand */}
      <g id="hand-left"><FPArm a={L} /></g>
      {/* right hand: thumb under the lead, the lead, then the index on top */}
      <g id="hand-right">
        <Wire d={`M 340 720 C 520 560 900 640 940 900 C 970 1100 ${leadBack[0] + 140} ${leadBack[1] + 160} ${leadBack[0]} ${leadBack[1]}`} c="#c8322a" w={11} />
        <FPArm a={R} only={['palm', 'f0', 'f1', 'f2', 'f3']} />
        <g id="wire-red">
          <Wire d={`M ${pinch[0] - Math.cos((ldir * Math.PI) / 180) * 30} ${pinch[1] - Math.sin((ldir * Math.PI) / 180) * 30} L ${tipEnd[0] - Math.cos((ldir * Math.PI) / 180) * 26} ${tipEnd[1] - Math.sin((ldir * Math.PI) / 180) * 26}`} c="#c8322a" w={11} />
          <path d={`M ${tipEnd[0] - Math.cos((ldir * Math.PI) / 180) * 26} ${tipEnd[1] - Math.sin((ldir * Math.PI) / 180) * 26} L ${tipEnd[0]} ${tipEnd[1]}`} stroke="#d9a441" strokeWidth={6} strokeLinecap="round" />
        </g>
        <FPArm a={R} only={['t']} noArm />
      </g>
    </g>
  );
};
const BenchLight04: React.FC = () => (
  <g id="light">
    <rect width={W} height={H} fill="#1a2650" opacity={0.5} style={{ mixBlendMode: 'multiply' }} />
    {/* warm local light from the candle (top right) */}
    <g id="candle" transform="translate(900 690) scale(0.6)"><Candle id="c4" glow={0} /></g>
    <Glow x={900} y={590} r={420} o={0.6} />
    <Glow x={540} y={1000} r={640} o={0.18} grad="coolSoft" />
  </g>
);
export const S04A: React.FC = () => <Frame bg="#1d2747"><Bench id="b4a" /><BulbSetup04 after={false} /><BenchLight04 /></Frame>;
export const S04B: React.FC = () => <Frame bg="#1d2747"><Bench id="b4b" /><BulbSetup04 after /><BenchLight04 /></Frame>;

// ================================================================== 05 · 3 V pack, switch, steady glow
export const S05: React.FC = () => {
  const SW: P = [700, 1250], SWS = 1.9;
  const R = fpHand(PRESS, 't', [SW[0] + 2, SW[1] + 4 * SWS], -100, HS);
  const sw = (side: -1 | 1): P => [SW[0] + side * 38 * SWS, SW[1] + 10 * SWS];
  return (
    <Frame bg="#1d2747">
      <Bench id="b5" />
      {/* toy car closed and pushed aside; the burnt 6 V bulb lies on its side */}
      <g transform="translate(830 640) scale(0.9)"><ToyCar /></g>
      <g id="burnt-bulb" transform="translate(190 1240) rotate(-74) scale(1.7)"><MiniBulb state="burnt" id="b5x" /></g>
      {/* the 3 V pack */}
      <g id="pack-3v" transform="translate(110 640) scale(1.2)"><Pack cells={2} /></g>
      <Tag x={170} y={880} t="3 V" s={1.15} />
      <g id="wire-black"><Wire d={`M 150 640 C 100 540 330 560 340 720 C 350 880 340 1050 ${term(-1)[0]} ${term(-1)[1]}`} c="#1d1d22" w={11} /></g>
      <g id="wire-red">
        <Wire d={`M 205 640 C 300 520 560 600 640 760 C 700 880 640 1150 ${sw(-1)[0]} ${sw(-1)[1]}`} c="#c8322a" w={11} />
        <Wire d={`M ${sw(1)[0]} ${sw(1)[1]} C 900 1250 900 1080 ${term(1)[0] + 60} ${term(1)[1] + 10} L ${term(1)[0]} ${term(1)[1]}`} c="#c8322a" w={11} />
      </g>
      <g id="socket" transform={`translate(${SOCK[0]} ${SOCK[1]}) scale(${SS})`}><Socket /></g>
      <g id="bulb" transform={`translate(${SOCK[0]} ${SOCK[1] - 34 * SS}) scale(${SS})`}><MiniBulb state="lit" id="b5" /></g>
      <Tag x={SOCK[0] - 200} y={SOCK[1] - 280} t="3 V" s={1.15} rot={-6} />
      <path d={`M ${SOCK[0] - 156} ${SOCK[1] - 266} C ${SOCK[0] - 110} ${SOCK[1] - 200} ${SOCK[0] - 70} ${SOCK[1] - 120} ${SOCK[0] - 40} ${SOCK[1] - 100}`} stroke="#e8e2d4" strokeWidth={2.4} fill="none" />
      <g id="switch" transform={`translate(${SW[0]} ${SW[1]}) scale(${SWS})`}><PushSwitch down /></g>
      <g id="hand-right"><FPArm a={R} /></g>
      {/* light: cool room, a warm pool from the bulb over the desk, the fingers and the wall */}
      <g id="light">
        <rect width={W} height={H} fill="#1a2650" opacity={0.5} style={{ mixBlendMode: 'multiply' }} />
        <Glow x={SOCK[0]} y={SOCK[1] - 160} r={760} o={0.55} grad="warmSoft" />
        <Glow x={SOCK[0]} y={SOCK[1] - 150} r={300} o={0.85} />
        <Glow x={SOCK[0]} y={SOCK[1] - 150} r={90} o={1} />
        <Glow x={SOCK[0] + 20} y={430} r={520} ry={220} o={0.45} grad="warmSoft" />
      </g>
      <g id="hand-light" style={{ mixBlendMode: 'screen' }} opacity={0.3}><PlaceHand at={R.at} toward={R.toward} s={R.s}><Hand h={R.h} pal={{ ...STU, skin: '#ffb860', skinSh: '#ffb860', nail: '#ffb860' }} o={0} /></PlaceHand></g>
    </Frame>
  );
};

// ================================================================== 06 · slumped, the physics board gives him an idea
export const S06: React.FC = () => {
  const S = { x: 150, y: 520, s: 1.3 };
  const lean = -16, tilt = 14;
  const bulb: P = [640, 1000];
  const bowl: P = [900, 1092];
  const pose: Pose = {
    lean, head: { eye: 'downfwd', brow: 10, browTilt: -3, mouth: 'o' }, headTilt: tilt,
    near: { el: worldToArm(S, lean, [470, 1060]), wr: worldToArm(S, lean, [560, 1080]), hand: HANDS.relaxed, toward: worldToArm(S, lean, [640, 1086]) },
    far: { el: worldToArm(S, lean, [250, 1060]), wr: worldToArm(S, lean, [250, 1230]), hand: HANDS.relaxed },
    legN: { kn: [330, 590], an: [320, 850] }, legF: { kn: [340, 584], an: [356, 846] },
    hipN: [110, 572], hipF: [126, 568],
  };
  return (
    <Frame bg="#141b36">
      <rect width={W} height={H} fill="#18203e" />
      <rect y={1660} width={W} height={260} fill="#10152c" />
      {/* the chalkboard: two sketches */}
      <g id="board" transform="translate(430 230)">
        <rect x={-18} y={-18} width={596} height={386} rx={6} fill="#5a3e2a" stroke={INK} strokeWidth={3} />
        <rect width={560} height={350} fill="#1f2e2a" />
        <g transform="translate(20 50) scale(1.15)"><ChalkSketches hi={1} /></g>
        <rect x={-8} y={350} width={576} height={16} fill="#4a3322" stroke={INK} strokeWidth={2} />
      </g>
      <g id="chair">
        <path d="M 150 1250 L 110 700 L 154 700 L 196 1250 Z" fill="#5a3a24" stroke={INK} strokeWidth={3} />
        <rect x={140} y={1250} width={300} height={30} rx={6} fill="#5a3a24" stroke={INK} strokeWidth={3} />
        <path d="M 170 1280 L 170 1660 M 410 1280 L 420 1660" stroke="#3e2818" strokeWidth={20} />
      </g>
      <Place x={S.x} y={S.y} s={S.s} id="student" filter="cool"><Person who="stu" pal={STU} pose={{ ...pose, near: { ...pose.near } }} /></Place>
      {/* the bench (side view) in front of him */}
      <g id="bench">
        <rect x={500} y={1100} width={540} height={36} fill="#8a5c38" stroke={INK} strokeWidth={3} />
        <rect x={980} y={1136} width={24} height={524} fill="#5a3a24" stroke={INK} strokeWidth={3} />
        <rect x={540} y={1136} width={24} height={524} fill="#4a301e" stroke={INK} strokeWidth={3} />
      </g>
      {/* his forearm rests on the bench top */}
      <Place x={S.x} y={S.y} s={S.s} filter="cool"><g transform={`rotate(${lean} 100 560)`}>
        <PlaceHand at={pose.near.wr} toward={pose.near.toward!} s={0.64}><Hand h={HANDS.relaxed} pal={STU} /></PlaceHand>
      </g></Place>
      <g id="bulb-rig">
        <g transform="translate(700 1060) scale(0.3)"><Pack cells={2} /></g>
        <g transform={`translate(${bulb[0]} ${bulb[1] + 100}) scale(0.9)`}><Socket><MiniBulb state="lit" id="b6" /></Socket></g>
        <g transform="translate(780 1094) scale(0.5)"><PushSwitch /></g>
      </g>
      <g id="bowl" transform={`translate(${bowl[0]} ${bowl[1] + 8})`}>
        <path d="M -80 -50 L 80 -50 C 74 -12 44 0 0 0 C -44 0 -74 -12 -80 -50 Z" fill="#d9d2c4" stroke={INK} strokeWidth={3} />
        <ellipse cx={0} cy={-50} rx={80} ry={11} fill="#9a9488" stroke={INK} strokeWidth={3} />
      </g>
      <g id="foil" transform="translate(830 1086) scale(1.2)"><FoilSheet w={40} h={12} /></g>
      <g id="light">
        <rect width={W} height={H} fill="#1a2650" opacity={0.45} style={{ mixBlendMode: 'multiply' }} />
        <Glow x={bulb[0]} y={bulb[1]} r={700} o={0.6} grad="warmSoft" />
        <Glow x={bulb[0]} y={bulb[1]} r={160} o={0.95} />
        <Glow x={bulb[0]} y={bulb[1] + 4} r={44} o={1} />
      </g>
    </Frame>
  );
};

// ================================================================== 07 · what light does inside the metal (side-on cross-section)
export const S07: React.FC = () => {
  const fr = useCurrentFrame(), ph = -fr * 0.22, wig = Math.sin(fr * 0.45) * 9;
  const SURF = 980, HIT: P = [540, SURF];
  const inc = (t: number): P => [HIT[0] - (1 - t) * 520, HIT[1] - (1 - t) * 640];
  const ref = (t: number): P => [HIT[0] + t * 520, HIT[1] - t * 640];
  const wave = (f: (t: number) => P, phase: number) => {
    const len = Math.hypot(520, 640), nx = 640 / len, ny = (f === ref ? 520 : -520) / len; // unit normal to the ray
    return Array.from({ length: 241 }, (_, i) => {
      const t = i / 240, p = f(t), a = Math.sin((t * len / 150) * 2 * Math.PI + phase) * 32;
      return `${i ? 'L' : 'M'} ${(p[0] + nx * a).toFixed(1)} ${(p[1] + ny * a).toFixed(1)}`;
    }).join(' ');
  };
  const electrons = Array.from({ length: 9 }, (_, i) => [240 + i * 75, SURF + 34 + (i % 2) * 22] as P);
  return (
    <Frame bg="#0c1226">
      <defs>
        <linearGradient id="m7-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c6ceda" /><stop offset="0.25" stopColor="#8f9aaa" /><stop offset="1" stopColor="#3a4252" /></linearGradient>
        <linearGradient id="m7-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c1226" stopOpacity={0} /><stop offset="1" stopColor="#0c1226" stopOpacity={1} /></linearGradient>
      </defs>
      {/* faint grid: we are magnified */}
      {Array.from({ length: 28 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 70} x2={W} y2={i * 70} stroke="#16203e" strokeWidth={2} />)}
      {Array.from({ length: 16 }, (_, i) => <line key={`v${i}`} x1={i * 70} y1={0} x2={i * 70} y2={H} stroke="#16203e" strokeWidth={2} />)}
      {/* the foil, cut open: a slab of aluminium with its ion lattice */}
      <g id="metal">
        <rect x={60} y={SURF} width={960} height={300} fill="url(#m7-metal)" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 13 }, (_, c) => <circle key={`${r}-${c}`} cx={100 + c * 74 + (r % 2) * 37} cy={SURF + 110 + r * 52} r={15} fill="#6d7786" stroke="#4a5262" strokeWidth={2} />))}
        <line x1={60} y1={SURF} x2={1020} y2={SURF} stroke="#eef3fb" strokeWidth={5} />
        <rect x={60} y={SURF + 200} width={960} height={110} fill="url(#m7-fade)" />
      </g>
      {/* normal (dashed), matching the chalk sketch */}
      <line x1={HIT[0]} y1={SURF} x2={HIT[0]} y2={SURF - 560} stroke="#5a6688" strokeWidth={4} strokeDasharray="12 14" />
      {/* incoming amber wave from the upper left, reflected wave to the upper right */}
      <g id="wave-in">
        <path d={`M ${inc(0)[0]} ${inc(0)[1]} L ${HIT[0]} ${HIT[1]}`} stroke="#ffb54d" strokeWidth={3} opacity={0.35} strokeDasharray="6 10" />
        <path d={wave(inc, ph)} stroke="#ffb54d" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d={`M ${inc(0.86)[0] - 26} ${inc(0.86)[1] - 2} L ${inc(0.86)[0] + 2} ${inc(0.86)[1] + 26} L ${inc(0.86)[0] + 12} ${inc(0.86)[1] - 12} Z`} fill="#ffb54d" />
      </g>
      <g id="wave-out">
        <path d={`M ${HIT[0]} ${HIT[1]} L ${ref(1)[0]} ${ref(1)[1]}`} stroke="#ffcf7a" strokeWidth={3} opacity={0.35} strokeDasharray="6 10" />
        <path d={wave(ref, Math.PI + ph)} stroke="#ffcf7a" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d={`M ${ref(0.96)[0] - 24} ${ref(0.96)[1] - 6} L ${ref(0.96)[0] + 14} ${ref(0.96)[1] - 22} L ${ref(0.96)[0] + 4} ${ref(0.96)[1] + 18} Z`} fill="#ffcf7a" />
      </g>
      <Glow x={HIT[0]} y={SURF} r={160} ry={60} o={0.5} />
      {/* electrons just inside the surface, wiggling back and forth */}
      <g id="electrons">
        {electrons.map(([x0, y], i) => { const x = x0 + wig * (i % 2 ? -1 : 1); return <g key={i}><circle cx={x} cy={y} r={20} fill="#3ee6ff" opacity={0.25} filter="url(#blur6)" /><circle cx={x} cy={y} r={11} fill="#5eeaff" stroke="#0c6e80" strokeWidth={2.4} /></g>; })}
      </g>
      <g id="electron-arrows" stroke="#bff6ff" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {electrons.map(([x, y], i) => <g key={i}><path d={`M ${x - 30} ${y} H ${x + 30}`} /><path d={`M ${x - 22} ${y - 7} L ${x - 30} ${y} L ${x - 22} ${y + 7} M ${x + 22} ${y - 7} L ${x + 30} ${y} L ${x + 22} ${y + 7}`} /></g>)}
      </g>
    </Frame>
  );
};

// ================================================================== 08A · pressing foil into the bowl
export const S08A: React.FC = () => {
  const B: P = [540, 1090], RX = 380, RY = 170;
  const Lh = fpHand(SMOOTH, 'f1', [B[0] - 170, B[1] - 70], -60, HS, true);
  const Rh = fpHand(SMOOTH, 'f1', [B[0] + 160, B[1] - 60], -120, HS);
  const lit: P = [860, 760];
  return (
    <Frame bg="#1d2747">
      <Bench id="b8" />
      {/* the wired bulb nearby, glowing on its 3 V pack + switch */}
      <g id="bulb-rig">
        <g transform="translate(120 620) scale(0.9)"><Pack cells={2} /></g>
        <Wire d={`M 160 620 C 260 520 560 560 ${lit[0] - 60} ${lit[1] + 64}`} c="#c8322a" w={8} />
        <Wire d={`M 200 620 C 300 560 600 620 ${lit[0] + 60} ${lit[1] + 64}`} c="#1d1d22" w={8} />
        <g transform={`translate(${lit[0]} ${lit[1] + 60}) scale(1.15)`}><Socket><MiniBulb state="lit" id="b8" /></Socket></g>
      </g>
      {/* the bowl, lined with foil */}
      <g id="reflector" transform={`translate(${B[0]} ${B[1]})`}><BowlTop rx={RX} ry={RY} foil id="b8bowl" /></g>
      {/* both hands pressing the foil smooth against the curve */}
      <g id="hand-left"><FPArm a={Lh} /></g>
      <g id="hand-right"><FPArm a={Rh} /></g>
      {/* foil ridges pushed up just ahead of the fingertips */}
      <g stroke="#eef3fa" strokeWidth={3.4} fill="none" opacity={0.85} strokeLinecap="round">
        <path d={`M ${B[0] - 250} ${B[1] - 40} q 24 -16 48 -4 M ${B[0] - 120} ${B[1] - 70} q 22 -12 44 0 M ${B[0] + 80} ${B[1] - 66} q 22 -12 44 0 M ${B[0] + 200} ${B[1] - 36} q 22 -14 44 -2`} />
      </g>
      <g id="light">
        <rect width={W} height={H} fill="#1a2650" opacity={0.45} style={{ mixBlendMode: 'multiply' }} />
        <Glow x={lit[0]} y={lit[1]} r={680} o={0.5} grad="warmSoft" />
        <Glow x={lit[0]} y={lit[1]} r={150} o={0.9} />
        <Glow x={B[0] + 40} y={B[1] - 20} r={220} ry={80} o={0.4} />
      </g>
    </Frame>
  );
};

// ================================================================== 08B · side-on cutaway: bowl reflector, bulb, test wall
export const S08B: React.FC<{ t?: number }> = ({ t = 1 }) => {
  const Y0 = 900, F = 104, X0 = 110, RIM = 290;
  const xOf = (dy: number) => X0 + (dy * dy) / (4 * F);
  const curve = (off: number) => Array.from({ length: 41 }, (_, i) => { const dy = -RIM + (i / 40) * 2 * RIM; return `${i ? 'L' : 'M'} ${(xOf(dy) - off).toFixed(1)} ${(Y0 + dy).toFixed(1)}`; }).join(' ');
  const FX = X0 + F + 10 - (1 - t) * 40; // bulb a little in front of the focus: the spot tightens but stays a little uneven
  const WALL = 870;
  const rays = [-260, -195, -130, -70, 70, 130, 195, 260].map((dy) => {
    const hx = xOf(dy), hy = Y0 + dy;
    const yy = Y0 + dy * (0.36 + (1 - t) * 0.5) + (Math.abs(dy) > 150 ? (dy > 0 ? 10 : -6) : 0);
    return { d: `M ${FX} ${Y0} L ${hx} ${hy} L ${WALL} ${yy}`, hy };
  });
  return (
    <Frame bg="#121a33">
      <defs>
        <linearGradient id="c8-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c9c2b4" /><stop offset="1" stopColor="#8f887a" /></linearGradient>
        <radialGradient id="c8-spot" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff2c4" /><stop offset="0.6" stopColor="#ffc860" stopOpacity={0.8} /><stop offset="1" stopColor="#ffaa40" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="#141b36" />
      {/* desk surface line */}
      <rect x={0} y={1240} width={W} height={40} fill="#5a3a24" stroke={INK} strokeWidth={3} />
      <rect x={0} y={1280} width={W} height={700} fill="#0f1428" />
      {/* the test wall: a sheet of card standing on the desk */}
      <g id="test-wall">
        <polygon points={`${WALL},430 ${WALL + 56},400 ${WALL + 56},1260 ${WALL},1250`} fill="url(#c8-wall)" stroke={INK} strokeWidth={3} />
        <rect x={WALL - 40} y={1220} width={120} height={24} fill="#3a2a1e" stroke={INK} strokeWidth={3} />
      </g>
      {/* the reflector: bowl wall in section, foil on its concave face, opening to the RIGHT */}
      <g id="reflector">
        <path d={`${curve(-2)} L ${xOf(RIM) - 36} ${Y0 + RIM + 4} ${Array.from({ length: 41 }, (_, i) => { const dy = RIM - (i / 40) * 2 * RIM; return `L ${(xOf(dy) - 36).toFixed(1)} ${(Y0 + dy).toFixed(1)}`; }).join(' ')} Z`} fill="#d9d2c4" stroke={INK} strokeWidth={3} />
        <path d={curve(0)} stroke="#eef3fb" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d={curve(-5)} stroke="#8e9aac" strokeWidth={3} fill="none" />
        {/* stand */}
        <path d={`M ${X0 - 30} ${Y0 + 40} L ${X0 - 70} 1240 L ${X0 + 30} 1240 Z`} fill="#3a3b40" stroke={INK} strokeWidth={3} />
      </g>
      {/* rays: leave the bulb, hit the foil, travel forward in straight lines */}
      <g id="rays" stroke="#ffcf6a" strokeWidth={4} fill="none" strokeLinejoin="round" opacity={0.9}>
        {rays.map((r, i) => <path key={i} d={r.d} />)}
        {rays.map((r, i) => { const m = r.d.split(' L ')[2].split(' ').map(Number); return <path key={`a${i}`} d={`M ${m[0] - 22} ${m[1] - 8} L ${m[0] - 2} ${m[1]} L ${m[0] - 22} ${m[1] + 8}`} />; })}
        {/* a few direct rays spreading out, much fainter */}
        {[-0.22, 0, 0.22].map((s, i) => <path key={`d${i}`} d={`M ${FX} ${Y0} L ${WALL} ${Y0 + s * (WALL - FX)}`} stroke="#ffcf6a" strokeWidth={2} opacity={0.35} strokeDasharray="8 10" />)}
      </g>
      {/* the bulb on its stand, just in front of the concave surface */}
      <g id="bulb" transform={`translate(${FX} ${Y0 + 50}) scale(0.9)`}><MiniBulb state="lit" id="b8b" /></g>
      <path d={`M ${FX} ${Y0 + 52} L ${FX} 1240`} stroke="#3a3b40" strokeWidth={10} />
      <Wire d={`M ${FX} 1230 C ${FX + 60} 1230 ${FX + 120} 1236 ${FX + 220} 1236`} c="#c8322a" w={6} />
      <g id="bulb-glow"><Glow x={FX} y={Y0} r={130} o={0.9} /><Glow x={FX} y={Y0} r={30} o={1} /></g>
      {/* the bright, slightly uneven spot on the wall */}
      <g id="wall-glow" transform={`translate(0 ${Y0}) scale(1 ${1 + (1 - t) * 1.6}) translate(0 ${-Y0})`} opacity={0.55 + 0.45 * t}>
        <path d={`M ${WALL + 6} ${Y0 - 62} C ${WALL + 40} ${Y0 - 70} ${WALL + 48} ${Y0 - 20} ${WALL + 44} ${Y0 + 10} C ${WALL + 50} ${Y0 + 50} ${WALL + 34} ${Y0 + 78} ${WALL + 6} ${Y0 + 66} C ${WALL - 4} ${Y0 + 30} ${WALL - 2} ${Y0 - 30} ${WALL + 6} ${Y0 - 62} Z`} fill="url(#c8-spot)" filter="url(#blur6)" />
        <Glow x={WALL + 24} y={Y0 + 6} r={110} ry={150} o={0.6} />
      </g>
    </Frame>
  );
};

// ================================================================== 09 · two flashes: he stops and looks up
export const S09: React.FC<{ flash?: number; turned?: boolean }> = ({ flash = 1, turned = true }) => {
  const torch: P = [340, 590];
  const patch: P = [770, 1420];
  const lean = 8, tilt = 14;
  const pose: Pose = {
    lean, head: { eye: 'downfwd' }, headTilt: tilt,
    near: { el: worldToArm(WS, lean, [250, 640]), wr: worldToArm(WS, lean, [torch[0] - 46, torch[1] + 4]), hand: HANDS.fist, toward: worldToArm(WS, lean, [torch[0], torch[1] + 10]) },
    far: { el: worldToArm(WS, lean, [210, 650]), wr: worldToArm(WS, lean, [torch[0] - 56, torch[1] + 30]), hand: HANDS.fist, toward: worldToArm(WS, lean, [torch[0], torch[1] + 30]) }, ...LEGS_STAND,
  };
  const fturn: Pose = {
    head: { eye: 'up', mouth: 'o', brow: 8 }, headTilt: -24, lean: -3,
    near: { el: [80, 404], wr: [70, 548], hand: HANDS.relaxed }, far: { el: [140, 402], wr: [160, 540], hand: HANDS.relaxed },
    legN: { kn: [112, 774], an: [100, 962] }, legF: { kn: [40, 770], an: [-20, 950], toe: 16 },
  };
  return (
    <Frame bg="#0b1330">
      <Street state="torch">
        {/* the student, a silhouette behind the glass, holding the foil torch */}
        <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="#2a2630" />
        <Place x={WS.x} y={WS.y} s={WS.s} id="student-silhouette" filter="sil"><Person who="stu" pal={STU} pose={pose} /></Place>
        {/* the homemade torch: foil-lined bowl, bulb inside, aimed down at the pavement */}
        <g id="foil-torch" transform={`translate(${torch[0]} ${torch[1]}) rotate(48)`}>
          <path d="M -40 -38 C -6 -38 14 -20 16 0 C 14 20 -6 38 -40 38 C -52 20 -52 -20 -40 -38 Z" fill="#3a3440" stroke={INK} strokeWidth={2.6} />
          <path d="M -30 -30 C -4 -30 10 -16 12 0 C 10 16 -4 30 -30 30" fill="none" stroke="#c9d1dc" strokeWidth={4} />
          <ellipse cx={14} cy={0} rx={8} ry={34} fill="#fff4d0" />
        </g>
      </Street>
      {/* the beam: separate so it can flash */}
      <g id="beam" style={{ mixBlendMode: 'screen' }} opacity={0.5 * flash}>
        <path d={`M ${torch[0] + 2} ${torch[1] + 30} L ${torch[0] + 30} ${torch[1] - 4} L ${patch[0] + 140} ${patch[1]} L ${patch[0] - 150} ${patch[1]} Z`} fill="#ffcf73" opacity={0.28} filter="url(#blur14)" />
      </g>
      <g id="torch-glow" opacity={0.25 + 0.75 * flash}><Glow x={torch[0] + 14} y={torch[1] + 14} r={80} o={0.9} /><Glow x={torch[0] + 12} y={torch[1] + 12} r={22} o={1} /></g>
      {/* the friend: stopped mid-step, turned back toward the window, looking up */}
      {turned
        ? <Place x={610} y={FRIEND_Y} s={0.9} flip id="friend" filter="cool"><Person who="friend" pal={FRD} pose={fturn} /></Place>
        : <Place x={420} y={FRIEND_Y} s={0.9} id="friend" filter="cool"><Person who="friend" pal={FRD} pose={friendWalk} /></Place>}
      {/* the warm patch on the pavement just ahead of him (separate layer: it flashes twice) */}
      <g id="pavement-glow" opacity={flash}>
        <ellipse cx={patch[0]} cy={patch[1]} rx={150} ry={40} fill="url(#warmGlow)" style={{ mixBlendMode: 'screen' }} />
        <ellipse cx={patch[0]} cy={patch[1]} rx={70} ry={18} fill="#fff1c4" opacity={0.6} filter="url(#blur6)" />
      </g>
      {/* a little warm spill on his face */}
      <Glow x={530} y={560} r={80} o={0.25} />
    </Frame>
  );
};

// ================================================================== 10 · end card (the existing InvisiTech card)
export const S10: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#0e0b09', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ transform: 'translate(-20px, -60px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
      <Img src={staticFile('logo.png')} style={{ width: 150, height: 150, borderRadius: 75 }} />
      <div style={{ font: '800 96px/1 Inter, system-ui, sans-serif', color: '#f6f1ea', letterSpacing: '-0.01em' }}>InvisiTech</div>
      <div style={{ font: '600 36px/1 Inter, system-ui, sans-serif', color: '#b9aa96' }}>@TheInvisiTech</div>
    </div>
  </AbsoluteFill>
);

export const BOARD: [string, React.FC][] = [
  ['01A-room-lit', S01A], ['01B-room-blackout', S01B], ['02A-shout-window', S02A], ['02B-friend-earbuds', S02B],
  ['03-candle-from-street', S03], ['04A-6v-before-touch', S04A], ['04B-6v-burnt-out', S04B], ['05-3v-switch-glow', S05],
  ['06-board-idea', S06], ['07-electrons-in-foil', S07], ['08A-foil-into-bowl', S08A], ['08B-reflector-cutaway', S08B],
  ['09-two-flashes', S09], ['10-end-card', S10],
];
