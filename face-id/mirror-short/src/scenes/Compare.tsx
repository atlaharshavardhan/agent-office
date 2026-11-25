import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, Label, ramp } from '../theme';
import { headDots, turnDot } from './dotHead';

// Scene 4 (20.4–28.6 s, 246 frames). Four short shots, cut on the voiceover; no lock screen and no result.
//   0– 79  the infrared image, full frame                       "It also captures an infrared image."
//  79–121  depth point cloud + infrared image, side by side     "Your iPhone uses both"
// 121–210  Comparing…: his face as a white dot cloud in a ring of ticks, turning left / right / up / down
//                                                                "to check whether the face matches the one you"
// 210–246  the ring fills: DOES IT MATCH?                       "enrolled."
export const CMP = { both: 57, check: 85, match: 133, no: 166 };
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
  // matching, stacked top to bottom: this scan (cyan dot face), the secure chip, and the enrolled face inside our ring of
  // ticks (violet). Numbers run down from the scan and up from the enrolled face into the chip, which compares them.
  // It ends while still comparing: no result is shown.
  const t = l - CMP.check, CH = 230, YS = 590, YC = 1000, YE = 1425, R = 195, TICKS = 72, spin = (t / 26) % 1;
  const NUM = (k: number) => (0.11 + 0.88 * (Math.sin(k * 12.9898) * 43758.5453 % 1 + 1) % 1).toFixed(2);
  const io = (x: number) => x * x * (3 - 2 * x);
  // then the two outcomes, one after the other and fast: a match (everything goes green, the lock opens) and no match
  // (a different face on top, everything goes red, the lock stays shut). This is how the check works in general,
  // not the result of the mirror test.
  const st = l >= CMP.no ? 2 : l >= CMP.match ? 1 : 0, tm = l - (st === 2 ? CMP.no : CMP.match), col = st === 1 ? GREEN : st === 2 ? BAD : null;
  const pop = st ? ramp(tm, 0, 6, 0, 1, (x) => 1 - Math.pow(1 - x, 3)) : 1, shake = st === 2 ? 12 * Math.sin(tm * 2.4) * (1 - ramp(tm, 0, 10)) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>{bg}
      <AbsoluteFill style={{ background: col ? `radial-gradient(60% 45% at 50% 52%, ${col}33, transparent 70%)` : 'none', opacity: pop }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, transformOrigin: '540px 1000px', transform: `translateX(${shake}px) scale(${1.07 - 0.07 * pop})` }}>
        <defs><linearGradient id="chip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b3760" /><stop offset="1" stopColor="#15132a" /></linearGradient></defs>
        {/* this scan */}
        <g transform={st === 2 ? `translate(540 ${YS}) scale(1.22 0.86) translate(-540 ${-YS})` : undefined}><Cloud cx={540} cy={YS} k={0.56} yaw={st === 2 ? yaw + 40 : yaw} pitch={pitch} color={col ?? CYAN} r={1.7} o={ramp(t, 0, 8)} /></g>
        {/* enrolled face, in the ring */}
        <g transform={`translate(540 ${YE})`} opacity={ramp(t, 4, 12)}>
          <circle r={R + 26} fill="rgba(4,4,6,.9)" />
          {Array.from({ length: TICKS }, (_, i) => { const a = (i / TICKS) * 2 * Math.PI - Math.PI / 2, lit = st ? i / TICKS < ramp(tm, 0, 8) + 0.02 : ((i / TICKS - spin + 1) % 1) < 0.24, r0 = R - 16, r1 = R + (lit ? 14 : 9);
            return <line key={i} x1={r0 * Math.cos(a)} y1={r0 * Math.sin(a)} x2={r1 * Math.cos(a)} y2={r1 * Math.sin(a)} stroke={lit ? col ?? VIO : '#5d5a6a'} strokeWidth={lit ? 6 : 5} strokeLinecap="round" opacity={lit ? 1 : 0.6} />; })}
        </g>
        <Cloud cx={540} cy={YE + 6} k={0.42} yaw={-yaw} pitch={pitch} color={st === 1 ? GREEN : VIO} r={1.6} o={ramp(t, 4, 12)} />
        {/* the chip */}
        <g transform={`translate(540 ${YC}) scale(${0.8 + 0.2 * ramp(t, 2, 12, 0, 1, io)})`} opacity={ramp(t, 2, 10)}>
          {Array.from({ length: 6 }, (_, k) => { const o = -90 + k * 36; return <g key={k} stroke="#a79fe0" strokeWidth={7} strokeLinecap="round"><line x1={o} y1={-CH / 2 - 40} x2={o} y2={-CH / 2} /><line x1={o} y1={CH / 2} x2={o} y2={CH / 2 + 40} /><line x1={-CH / 2 - 40} y1={o} x2={-CH / 2} y2={o} /><line x1={CH / 2} y1={o} x2={CH / 2 + 40} y2={o} /></g>; })}
          <rect x={-CH / 2} y={-CH / 2} width={CH} height={CH} rx={32} fill="url(#chip)" stroke="#c9c0ff" strokeWidth={4} />
          <circle r={84 + 6 * Math.sin(l / 4)} fill={col ?? '#7fe3ea'} opacity={col ? 0.22 : 0.1} />
          <g transform={`scale(${0.9 + 0.05 * Math.sin(l / 4)})`}>
            <path d={st === 1 ? 'M -30 -8 v -24 a 30 30 0 0 1 60 0 v 4' : 'M -30 -8 v -24 a 30 30 0 0 1 60 0 v 24'} transform={st === 1 ? `translate(0 ${-16 * pop})` : undefined} stroke={col ?? '#7fe3ea'} strokeWidth={15} strokeLinecap="round" fill="none" />
            <rect x={-48} y={-8} width={96} height={74} rx={16} fill={col ?? '#7fe3ea'} />
          </g>
        </g>
        {/* numbers travel into the chip: down from the scan, up from the enrolled face */}
        {[0, 1].map((side) => [0, 1, 2].map((c) => { const u = ((t / 26) + c * 0.33) % 1, y0 = side ? YE - R - 30 : YS + 205, y1 = side ? YC + CH / 2 + 62 : YC - CH / 2 - 44, o = (st ? 0 : 1) * ramp(t, 10, 16) * Math.min(1, u * 5) * (1 - Math.max(0, (u - 0.7) / 0.3));
          return <text key={`${side}${c}`} x={420 + c * 120} y={y0 + (y1 - y0) * u} textAnchor="middle" fill={side ? VIO : CYAN} opacity={o} style={{ font: `700 32px ui-monospace, Menlo, monospace` }}>{NUM(side * 50 + c * 7 + Math.floor(t / 26 + c * 0.33))}</text>; }))}
      </svg>
      <Label text="THIS SCAN" x={850} y={YS - 26} o={ramp(t, 4, 10)} size={27} align="center" color={CYAN} />
      <Label text="SECURE ENCLAVE" x={195} y={YC - 24} o={ramp(t, 8, 14)} size={23} align="center" color="#7fe3ea" />
      <Label text="ENROLLED" x={880} y={YE - 26} o={ramp(t, 8, 14)} size={27} align="center" color={VIO} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1668, textAlign: 'center', opacity: st ? 1 : ramp(t, 12, 18), transform: `scale(${1.25 - 0.25 * pop})`, font: `800 ${st === 2 ? 50 : 58}px/1 ${FONT}`, color: col ?? '#fff' }}>{st === 1 ? '✓ MATCH · UNLOCKS' : st === 2 ? '✕ NO MATCH · STAYS LOCKED' : 'Comparing…'}</div>
    </AbsoluteFill>
  );
};
