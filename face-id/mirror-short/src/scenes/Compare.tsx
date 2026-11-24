import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, Label, ramp } from '../theme';
import { headDots, turnDot } from './dotHead';

// Scene 4 (20.4–28.6 s, 246 frames). Four short shots, cut on the voiceover; no lock screen and no result.
//   0– 79  the infrared image, full frame                       "It also captures an infrared image."
//  79–121  depth point cloud + infrared image, side by side     "Your iPhone uses both"
// 121–210  this scan vs the enrolled face: two 3D point clouds turning together, compared point by point
//          and as numbers                                        "to check whether the face matches the one you"
// 210–246  the two clouds slide over each other                 "enrolled."
export const CMP = { both: 79, check: 121, merge: 210 };
const CROP = { x: 106, y: 200, w: 540, h: 720 };                    // face region of the 752 x 1344 stills
const CYAN = '#7fe3ea', VIO = '#b9a2ff';
const DOTS = headDots(1, 2);
const hash = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };
const LINKS = Array.from({ length: 12 }, (_, k) => Math.floor(hash(k + 3) * DOTS.length));
const NUMS = Array.from({ length: 7 }, (_, k) => ((hash(k + 40) * 2.6 - 1.3)).toFixed(3));

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
  // this scan vs the enrolled face
  const t = l - CMP.check, m = ramp(l, CMP.merge, CMP.merge + 14, 0, 1, (x) => x * x * (3 - 2 * x));
  const LX = 280 + 260 * m, RX = 800 - 260 * m, CY = 800 + 60 * m, K = 0.92 + 0.5 * m;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>{bg}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <Cloud cx={RX} cy={CY} k={K} yaw={yaw} pitch={pitch} color={VIO} r={2 + m} />
        <Cloud cx={LX} cy={CY} k={K} yaw={yaw} pitch={pitch} color={CYAN} r={2} o={1 - 0.25 * m} />
        {/* the same point on both faces is checked, one after another */}
        {m === 0 && LINKS.map((i, k) => { const on = ramp(t, 8 + k * 6, 12 + k * 6); if (on <= 0) return null; const [x, y] = turnDot(DOTS[i], yaw, pitch);
          return <g key={k} opacity={on * (0.35 + 0.65 * (1 - ramp(t, 20 + k * 6, 40 + k * 6)))}><line x1={LX + x * K} y1={CY + y * K} x2={RX + x * K} y2={CY + y * K} stroke="#fff" strokeWidth={1.6} strokeDasharray="5 6" /><circle cx={LX + x * K} cy={CY + y * K} r={8} fill="none" stroke="#fff" strokeWidth={2.5} /><circle cx={RX + x * K} cy={CY + y * K} r={8} fill="none" stroke="#fff" strokeWidth={2.5} /></g>; })}
      </svg>
      <Label text="THIS SCAN" x={280} y={480} o={1 - m} size={30} align="center" color={CYAN} />
      <Label text="ENROLLED FACE" x={800} y={480} o={1 - m} size={30} align="center" color={VIO} />
      {/* the face as numbers: each row is compared in turn */}
      {[280, 800].map((x, c) => (
        <div key={c} style={{ position: 'absolute', left: x - 110, top: 1150, width: 220, opacity: ramp(t, 14, 20) * (1 - m), font: `700 34px/1.5 ${FONT}`, fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}>
          {NUMS.map((n, k) => { const on = ramp(t, 22 + k * 8, 26 + k * 8); return <div key={k} style={{ color: on > 0.5 ? '#fff' : c ? VIO : CYAN, opacity: 0.45 + 0.55 * on }}>{n}</div>; })}
        </div>
      ))}
      <div style={{ position: 'absolute', left: 440, top: 1150, width: 200, opacity: ramp(t, 14, 20) * (1 - m), font: `800 34px/1.5 ${FONT}`, textAlign: 'center', color: '#fff' }}>
        {NUMS.map((_, k) => <div key={k} style={{ opacity: ramp(t, 22 + k * 8, 26 + k * 8) }}>↔</div>)}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', opacity: ramp(l, CMP.merge + 8, CMP.merge + 14), font: `800 64px/1 ${FONT}`, color: '#fff', transform: `scale(${1 + 0.04 * Math.sin(l / 4)})` }}>DOES IT MATCH?</div>
    </AbsoluteFill>
  );
};
