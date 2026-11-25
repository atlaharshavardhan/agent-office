import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, Label, ramp } from '../theme';
import { headDots, turnDot } from './dotHead';
import { Orbit3D } from './Orbit3D';

// Scene 4 (20.4–28.6 s, 246 frames). Four short shots, cut on the voiceover; no lock screen and no result.
//   0– 79  the infrared image, full frame                       "It also captures an infrared image."
//  79–121  depth point cloud + infrared image, side by side     "Your iPhone uses both"
// 121–210  Comparing…: his face as a white dot cloud in a ring of ticks, turning left / right / up / down
//                                                                "to check whether the face matches the one you"
// 210–246  the ring fills: DOES IT MATCH?                       "enrolled."
export const CMP = { both: 70, check: 109, merge: 9999, match: 9999, no: 9999 };   // 9999 = not shown: the scene ends while still comparing, so the result stays a surprise
const CROP = { x: 106, y: 200, w: 540, h: 720 };                    // face region of the 752 x 1344 stills
const CYAN = '#7fe3ea', VIO = '#b9a2ff', GREEN = '#59d98a', BAD = '#ff2d46';
const DOTS = headDots(1, 2), RING_DOTS = headDots(0.78);

const Card: React.FC<{ x: number; y: number; w: number; sweep?: number }> = ({ x, y, w, sweep }) => {
  const k = w / CROP.w, h = CROP.h * k;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: 22, border: `3px solid ${C.violetDim}`, background: '#000', boxShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
      <div style={{ position: 'absolute', left: w / 2 - 540 * (w / 760), top: h / 2 - 900 * (w / 760), width: 1080, height: 1920, transformOrigin: '0 0', transform: `scale(${w / 760})` }}>
        <Orbit3D g={150} ex={{ view: { az: 0, dist: 2250 }, tone: 'ir', dotO: 0, bg: '#0b0a0d' }} />
      </div>
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
  // matching: this scan (cyan) and the enrolled face (violet) are turned into numbers and sent into the secure chip, which
  // compares them. It ends while still comparing: no result is shown.
  const t = l - CMP.check, CYc = 800, HK = 0.4, CH = 250;
  const NUM = (k: number) => (0.11 + 0.88 * (Math.sin(k * 12.9898) * 43758.5453 % 1 + 1) % 1).toFixed(2);
  const io = (x: number) => x * x * (3 - 2 * x);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>{bg}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="chip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b3760" /><stop offset="1" stopColor="#15132a" /></linearGradient></defs>
        <Cloud cx={170} cy={CYc} k={HK} yaw={yaw} pitch={pitch} color={CYAN} r={1.5} o={ramp(t, 0, 8)} />
        <Cloud cx={910} cy={CYc} k={HK} yaw={yaw} pitch={pitch} color={VIO} r={1.5} o={ramp(t, 4, 12)} />
        {/* the chip */}
        <g transform={`translate(540 ${CYc}) scale(${0.8 + 0.2 * ramp(t, 2, 12, 0, 1, io)})`} opacity={ramp(t, 2, 10)}>
          {Array.from({ length: 7 }, (_, k) => { const o = -105 + k * 35; return <g key={k} stroke="#a79fe0" strokeWidth={7} strokeLinecap="round"><line x1={o} y1={-CH / 2 - 44} x2={o} y2={-CH / 2} /><line x1={o} y1={CH / 2} x2={o} y2={CH / 2 + 44} /><line x1={-CH / 2 - 44} y1={o} x2={-CH / 2} y2={o} /><line x1={CH / 2} y1={o} x2={CH / 2 + 44} y2={o} /></g>; })}
          <rect x={-CH / 2} y={-CH / 2} width={CH} height={CH} rx={34} fill="url(#chip)" stroke="#c9c0ff" strokeWidth={4} />
          <circle r={96 + 6 * Math.sin(l / 4)} fill="#7fe3ea" opacity={0.1} />
          <g transform={`scale(${1 + 0.05 * Math.sin(l / 4)})`}>
            <path d="M -30 -8 v -24 a 30 30 0 0 1 60 0 v 24" stroke="#7fe3ea" strokeWidth={15} strokeLinecap="round" fill="none" />
            <rect x={-48} y={-8} width={96} height={74} rx={16} fill="#7fe3ea" />
          </g>
        </g>
        {/* numbers travel from each face into the chip */}
        {[0, 1].map((side) => Array.from({ length: 3 }, (_, r) => Array.from({ length: 1 }, (_, c) => {
          const u = ((t / 26) + r * 0.31 + c * 0.5) % 1, x0 = side ? 810 : 270, x1 = side ? 745 : 335, x = x0 + (x1 - x0) * u, o = ramp(t, 10, 16) * Math.min(1, u * 5) * (1 - Math.max(0, (u - 0.7) / 0.3));
          return <text key={`${side}${r}${c}`} x={x} y={CYc - 60 + r * 62} textAnchor="middle" fill={side ? VIO : CYAN} opacity={o} style={{ font: `700 30px ui-monospace, Menlo, monospace` }}>{NUM(side * 50 + r * 7 + c * 3 + Math.floor(t / 26 + r * 0.31 + c * 0.5))}</text>;
        })))}
      </svg>
      <Label text="THIS SCAN" x={170} y={CYc + 200} o={ramp(t, 4, 10)} size={25} align="center" color={CYAN} />
      <Label text="ENROLLED" x={910} y={CYc + 200} o={ramp(t, 8, 14)} size={25} align="center" color={VIO} />
      <Label text="SECURE ENCLAVE" x={540} y={CYc + 215} o={ramp(t, 8, 14)} size={27} align="center" color="#7fe3ea" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1250, textAlign: 'center', opacity: ramp(t, 12, 18), font: `800 62px/1 ${FONT}`, color: '#fff' }}>Comparing…</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1335, textAlign: 'center', opacity: ramp(t, 16, 22), font: `600 32px/1.3 ${FONT}`, color: '#bdb5ad' }}>the two sets of numbers are checked<br />inside the chip, never as a photo</div>
    </AbsoluteFill>
  );
};
