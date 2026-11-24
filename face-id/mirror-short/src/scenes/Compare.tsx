import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, Label, ramp } from '../theme';
import { headDots, turnDot } from './dotHead';

// Scene 4 (20.4–28.6 s, 246 frames). Four short shots, cut on the voiceover; no lock screen and no result.
//   0– 79  the infrared image, full frame                       "It also captures an infrared image."
//  79–121  depth point cloud + infrared image, side by side     "Your iPhone uses both"
// 121–210  Comparing…: his face as a white dot cloud in a ring of ticks, turning left / right / up / down
//                                                                "to check whether the face matches the one you"
// 210–246  the ring fills: DOES IT MATCH?                       "enrolled."
export const CMP = { both: 74, check: 122, merge: 205, match: 167, no: 186 };   // match / no: the ring shows both outcomes on "matches"
const CROP = { x: 106, y: 200, w: 540, h: 720 };                    // face region of the 752 x 1344 stills
const CYAN = '#7fe3ea', VIO = '#b9a2ff', GREEN = '#59d98a', BAD = '#ff2d46';
const DOTS = headDots(1, 2), RING_DOTS = headDots(0.78);

const Card: React.FC<{ x: number; y: number; w: number; sweep?: number }> = ({ x, y, w, sweep }) => {
  const k = w / CROP.w, h = CROP.h * k;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: 22, border: `3px solid ${C.violetDim}`, background: '#000', boxShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
      <Img src={staticFile('face_front_ir.png')} style={{ position: 'absolute', left: -CROP.x * k, top: -CROP.y * k, width: 752 * k, height: 1344 * k }} />
      {sweep !== undefined && <div style={{ position: 'absolute', left: 0, right: 0, top: sweep * h - 60, height: 60, background: 'linear-gradient(rgba(255,90,90,0), rgba(255,90,90,.35))', borderBottom: '3px solid #ff6a6a' }} />}
    </div>
  );
};

const Cloud: React.FC<{ cx: number; cy: number; k: number; yaw: number; pitch: number; color: string; r?: number; o?: number }> = ({ cx, cy, k, yaw, pitch, color, r = 1.9, o = 1 }) => (
  <g opacity={o}>
    {DOTS.map((d, i) => { const [x, y] = turnDot(d, yaw, pitch); return <circle key={i} cx={cx + x * k} cy={cy + y * k} r={r} fill={color} opacity={0.25 + 0.75 * d[3]} />; })}
  </g>
);

export const Compare: React.FC = () => {
  const l = useCurrentFrame();
  const yaw = 24 * Math.sin(l / 13), pitch = 8 * Math.cos(l / 17);
  const bg = <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 50% at 50% 45%, #1b1420 0%, #0b090d 75%)' }} />;
  if (l < CMP.both) {
    const s = 1 + 0.07 * (l / CMP.both);
    return (
      <AbsoluteFill style={{ backgroundColor: C.bg }}>{bg}
        <div style={{ position: 'absolute', inset: 0, transformOrigin: '540px 1000px', transform: `scale(${s})` }}>
          <Card x={150} y={480} w={780} sweep={((l + 10) % 50) / 50} />
        </div>
        <Label text="INFRARED IMAGE" x={540} y={1590} o={ramp(l, 4, 8)} size={32} align="center" />
      </AbsoluteFill>
    );
  }
  if (l < CMP.check) {
    const t = l - CMP.both;
    return (
      <AbsoluteFill style={{ backgroundColor: C.bg }}>{bg}
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <Cloud cx={280 - 40 * (1 - ramp(t, 0, 8))} cy={960} k={0.95} yaw={yaw} pitch={pitch} color={CYAN} r={2} />
        </svg>
        <Card x={560 + 40 * (1 - ramp(t, 0, 8))} y={650} w={440} />
        <div style={{ position: 'absolute', left: 490, top: 880, width: 60, textAlign: 'center', font: `800 80px/1 ${FONT}`, color: '#fff', opacity: ramp(t, 6, 10) }}>+</div>
        <Label text="DEPTH MAP" x={280} y={1290} o={1} size={30} align="center" />
        <Label text="INFRARED IMAGE" x={780} y={1290} o={1} size={30} align="center" />
      </AbsoluteFill>
    );
  }
  // comparing: his face as a dense white dot cloud inside a ring of ticks. The head turns left, right, up, down
  // while a white arc circles the ring; on "enrolled" the ring fills and the question lands. No result is shown.
  const t = l - CMP.check, done = l >= CMP.merge, yes = l >= CMP.match && l < CMP.no, no = l >= CMP.no && !done, R = 330, CX = 540, CY = 900, TICKS = 96, spin = (t / 24) % 1;
  const io = (x: number) => x * x * (3 - 2 * x), key = (v: number[]) => interpolate(t, [0, 16, 36, 48, 60, 74, 86], v, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: io });
  const t0 = t; const lagT = Math.max(0, t0 - 5);
  const key2 = (v: number[]) => interpolate(lagT, [0, 16, 36, 48, 60, 74, 86], v, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: io });
  const ry2 = done ? 10 * Math.cos((l - CMP.merge) / 10) : 26 * key2([0, -1, 1, 0, 0, 0, 0]), rp2 = done ? 8 * Math.sin((l - CMP.merge) / 10) : 18 * key2([0, 0, 0, 0, -1, 1, 0]);
  const ry = done ? 10 * Math.cos((l - CMP.merge) / 10) : 26 * key([0, -1, 1, 0, 0, 0, 0]), rp = done ? 8 * Math.sin((l - CMP.merge) / 10) : 18 * key([0, 0, 0, 0, -1, 1, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>{bg}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${CX} ${CY}) scale(${0.9 + 0.1 * ramp(t, 0, 8)})`}>
          <circle r={R + 36} fill="rgba(4,4,6,.9)" />
          {Array.from({ length: TICKS }, (_, i) => { const a = (i / TICKS) * 2 * Math.PI - Math.PI / 2, lit = done || yes || no || ((i / TICKS - spin + 1) % 1) < 0.24;
            const r0 = R - 26, r1 = R + (lit ? 18 : 12);
            return <line key={i} x1={r0 * Math.cos(a)} y1={r0 * Math.sin(a)} x2={r1 * Math.cos(a)} y2={r1 * Math.sin(a)} stroke={yes ? GREEN : no ? BAD : done ? (i < TICKS / 2 ? GREEN : BAD) : lit ? CYAN : '#5d5a6a'} strokeWidth={lit ? 7 : 6} strokeLinecap="round" opacity={lit ? 1 : 0.55} />; })}
          {/* enrolled face (violet) and this scan (cyan): the scan follows the stored face a beat behind, then they line up */}
          {RING_DOTS.map((d, i) => { const e = i % 2 === 0, [x, y] = turnDot(d, e ? ry : ry2, e ? rp : rp2); return <circle key={i} cx={x} cy={y} r={2.2} fill={e ? VIO : CYAN} opacity={0.3 + 0.7 * d[3]} />; })}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1320, textAlign: 'center', opacity: l >= CMP.match ? 0 : ramp(t, 4, 8), font: `800 62px/1 ${FONT}`, color: '#fff' }}>Comparing…</div>
      {yes && <div style={{ position: 'absolute', left: 0, right: 0, top: 1320, textAlign: 'center', font: `800 76px/1 ${FONT}`, color: GREEN, transform: `scale(${1.15 - 0.15 * ramp(l, CMP.match, CMP.match + 5)})` }}>✓ MATCH</div>}
      {no && <div style={{ position: 'absolute', left: 0, right: 0, top: 1320, textAlign: 'center', font: `800 76px/1 ${FONT}`, color: BAD, transform: `scale(${1.15 - 0.15 * ramp(l, CMP.no, CMP.no + 5)})` }}>✕ NO MATCH</div>}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center', opacity: l >= CMP.match ? 0 : ramp(t, 8, 12), font: `600 32px/1 ${FONT}`, color: '#bdb5ad' }}><span style={{ color: CYAN, fontWeight: 800 }}>this scan</span> vs <span style={{ color: VIO, fontWeight: 800 }}>the enrolled face</span></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1325, textAlign: 'center', opacity: ramp(l, CMP.merge, CMP.merge + 4), font: `800 70px/1 ${FONT}`, color: '#fff', transform: `scale(${1 + 0.04 * Math.sin(l / 4)})` }}>DOES IT MATCH?</div>
    </AbsoluteFill>
  );
};
