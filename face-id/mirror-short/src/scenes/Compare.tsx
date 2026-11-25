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
  // matching as a calculation: this scan's numbers in one column, the enrolled face's numbers in the other, checked row by
  // row. Close numbers are joined by "≈"; when every row agrees it is a match and the lock opens. Then the other case:
  // a different face gives different numbers, the rows show "≠" and the lock stays shut. The values are illustrative.
  const t = l - CMP.check, io = (x: number) => x * x * (3 - 2 * x), o3 = (x: number) => 1 - Math.pow(1 - x, 3);
  const st = l >= CMP.no ? 2 : l >= CMP.match ? 1 : 0, tm = l - (st === 2 ? CMP.no : CMP.match), col = st === 1 ? GREEN : st === 2 ? BAD : null;
  const pop = st ? ramp(tm, 0, 6, 0, 1, o3) : 1, shake = st === 2 ? 12 * Math.sin(tm * 2.4) * (1 - ramp(tm, 0, 10)) : 0;
  const EN = ['0.647', '-0.329', '1.412', '0.081', '-0.908', '0.531', '-0.270'], OK = ['0.651', '-0.332', '1.406', '0.078', '-0.915', '0.537', '-0.264'], NO = ['0.214', '0.871', '-0.530', '1.302', '0.119', '-0.746', '0.958'];
  const SC = st === 2 ? NO : OK, Y0 = 800, DY = 92, XL = 410, XR = 830, FS = 66, N = EN.length, R = 118, TICKS = 48, spin = (t / 26) % 1, YH = 512, YK = 1530;
  const NUM = (k: number) => (0.11 + 0.88 * (Math.sin(k * 12.9898) * 43758.5453 % 1 + 1) % 1).toFixed(2);
  const rowAt = (i: number) => (st ? (st === 2 ? i * 1.5 : -99) : 12 + i * (Math.max(20, CMP.match - CMP.check - 22) / N));       // when row i is checked
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>{bg}
      <AbsoluteFill style={{ background: col ? `radial-gradient(60% 45% at 50% 55%, ${col}30, transparent 70%)` : 'none', opacity: pop }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, transformOrigin: '540px 1050px', transform: `translateX(${shake}px) scale(${1.06 - 0.06 * pop})` }}>
        <defs><linearGradient id="chip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b3760" /><stop offset="1" stopColor="#15132a" /></linearGradient></defs>
        {/* whose numbers they are: this scan on the left, the enrolled face (in our ring) on the right */}
        <g transform={st === 2 ? `translate(290 ${YH}) scale(1.22 0.86) translate(-290 ${-YH})` : undefined}><Cloud cx={290} cy={YH} k={0.36} yaw={st === 2 ? yaw + 40 : yaw} pitch={pitch} color={col ?? CYAN} r={1.5} o={ramp(t, 0, 6)} /></g>
        <g transform={`translate(710 ${YH})`} opacity={ramp(t, 2, 8)}>
          <circle r={R + 18} fill="rgba(4,4,6,.9)" />
          {Array.from({ length: TICKS }, (_, i) => { const a = (i / TICKS) * 2 * Math.PI - Math.PI / 2, lit = st ? i / TICKS < ramp(tm, 0, 8) + 0.02 : ((i / TICKS - spin + 1) % 1) < 0.24, r0 = R - 10, r1 = R + (lit ? 12 : 7);
            return <line key={i} x1={r0 * Math.cos(a)} y1={r0 * Math.sin(a)} x2={r1 * Math.cos(a)} y2={r1 * Math.sin(a)} stroke={lit ? col ?? VIO : '#5d5a6a'} strokeWidth={5} strokeLinecap="round" opacity={lit ? 1 : 0.6} />; })}
        </g>
        <Cloud cx={710} cy={YH + 4} k={0.25} yaw={-yaw} pitch={pitch} color={st === 1 ? GREEN : VIO} r={1.3} o={ramp(t, 2, 8)} />
        {/* the two columns, checked row by row */}
        {EN.map((e, i) => { const y = Y0 + i * DY, on = ramp(t, 3 + i * 1.2, 7 + i * 1.2), k = st === 1 ? 1 : ramp(st === 2 ? tm : t, rowAt(i), rowAt(i) + 4, 0, 1, o3), hot = !st && k > 0 && k < 1;
          const live = !st && t < 6 + i * 1.2, c = st === 2 ? BAD : st === 1 ? GREEN : '#e9e6f5';
          return (<g key={i} opacity={on} style={{ font: `700 ${FS}px ui-monospace, Menlo, monospace` }}>
            {hot && <rect x={110} y={y - 62} width={760} height={84} rx={14} fill="#fff" opacity={0.08} />}
            <text x={XL} y={y} textAnchor="end" fill={st ? c : k > 0 ? '#fff' : CYAN}>{live ? NUM(i * 7 + Math.floor(l / 2)) + '0' : SC[i]}</text>
            <text x={XR} y={y} textAnchor="end" fill={st === 1 ? GREEN : k > 0 && !st ? '#fff' : VIO}>{e}</text>
            <g opacity={k} stroke={st ? c : '#fff'} strokeWidth={4} strokeLinecap="round">
              <line x1={XL + 24} y1={y - 22} x2={XL + 24 + 52 * k} y2={y - 22} /><line x1={XR - 250 - 52 * k} y1={y - 22} x2={XR - 250} y2={y - 22} />
            </g>
            <text x={(XL + XR - 226) / 2} y={y - 2} textAnchor="middle" fill={st ? c : '#fff'} opacity={k} style={{ font: `800 58px ${FONT}` }}>{st === 2 ? '≠' : '≈'}</text>
          </g>); })}
        {/* the secure chip that does the comparing */}
        <g transform={`translate(540 ${YK}) scale(${0.5 + 0.06 * (st ? pop : ramp(t, 2, 12, 0, 1, io))})`} opacity={ramp(t, 2, 10)}>
          {Array.from({ length: 6 }, (_, k) => { const o = -90 + k * 36, CH = 230; return <g key={k} stroke="#a79fe0" strokeWidth={7} strokeLinecap="round"><line x1={o} y1={-CH / 2 - 40} x2={o} y2={-CH / 2} /><line x1={o} y1={CH / 2} x2={o} y2={CH / 2 + 40} /><line x1={-CH / 2 - 40} y1={o} x2={-CH / 2} y2={o} /><line x1={CH / 2} y1={o} x2={CH / 2 + 40} y2={o} /></g>; })}
          <rect x={-115} y={-115} width={230} height={230} rx={32} fill="url(#chip)" stroke={col ?? '#c9c0ff'} strokeWidth={4} />
          <circle r={84 + 6 * Math.sin(l / 4)} fill={col ?? '#7fe3ea'} opacity={col ? 0.22 : 0.1} />
          <path d={st === 1 ? 'M -30 -8 v -24 a 30 30 0 0 1 60 0 v 4' : 'M -30 -8 v -24 a 30 30 0 0 1 60 0 v 24'} transform={st === 1 ? `translate(0 ${-16 * pop})` : undefined} stroke={col ?? '#7fe3ea'} strokeWidth={15} strokeLinecap="round" fill="none" />
          <rect x={-48} y={-8} width={96} height={74} rx={16} fill={col ?? '#7fe3ea'} />
        </g>
      </svg>
      <Label text="THIS SCAN" x={290} y={YH + 140} o={ramp(t, 3, 8)} size={26} align="center" color={st === 2 ? BAD : CYAN} />
      <Label text="ENROLLED" x={710} y={YH + 140} o={ramp(t, 3, 8)} size={26} align="center" color={VIO} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1668, textAlign: 'center', opacity: st ? 1 : ramp(t, 8, 14), transform: `scale(${1.25 - 0.25 * pop})`, font: `800 ${st === 2 ? 50 : 58}px/1 ${FONT}`, color: col ?? '#fff' }}>{st === 1 ? '✓ MATCH · UNLOCKS' : st === 2 ? '✕ NO MATCH · STAYS LOCKED' : 'Comparing…'}</div>
      <div style={{ position: 'absolute', left: 80, top: 1790, font: `600 24px/1 ${FONT}`, color: '#8f8aa3' }}>Values illustrative</div>
    </AbsoluteFill>
  );
};
