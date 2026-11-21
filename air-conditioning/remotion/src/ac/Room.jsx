// World layers (SVG). One 3/4 camera: back wall faces us, left wall (window) recedes, floor in perspective.
// The back wall is cut at x=1110 (wall section) and the outdoor side continues to the right (cutaway only).
// Every animated element is its own <g>: wall, window sash, curtain, fan blades, ice cubes, puddle,
// thermometer, AC cover, AC internals, refrigerant loop, drain hose, outdoor unit.
import React from 'react';
import { random } from 'remotion';
import {
  clamp, lerp, ramp, eout, acAppear, windowOpen, fanAngle, fanSpeed, trayIn, melt, coolAir, cutaway, acOn, temperature,
} from './timeline';

export const C = {
  ceiling: '#F7EEE1', back: '#F2E3CC', left: '#E7D1B3', floor: '#CFA77C', floorLine: '#B98E63',
  trim: '#FBF7F0', wood: '#8A5A3B', woodTop: '#A8714C', shadow: 'rgba(80,50,25,.16)',
  curtain: '#7FA796', curtainDark: '#668D7D', sky1: '#9FD3F1', sky2: '#FFE2A6', city: '#E8C59A',
  heat: '#FF7A1A', cool: '#3FA9F5', water: '#5BB8F0', copper: '#B9733E', hose: '#D9DDE1',
  acBody: '#FBFBF9', acShade: '#E6E7E4', unit: '#E4E7EA', unitDark: '#B9BFC6', ink: '#2B2F36', red: '#E2453C',
};

// ------------------------------------------------------------------ helpers
const P = (pts) => pts.map((p) => p.join(',')).join(' ');
const Arrow = ({ from, to, t, color = C.heat, size = 1, op = 1 }) => {
  // chevron arrow travelling from `from` to `to`, t in 0..1
  if (t <= 0 || t >= 1) return null;
  const x = lerp(from[0], to[0], t), y = lerp(from[1], to[1], t);
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]) * 180 / Math.PI;
  const fade = Math.min(1, t / 0.18, (1 - t) / 0.25);
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${size})`} opacity={fade * op}>
      <path d="M -22 -15 L 4 0 L -22 15" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -42 0 L 0 0" stroke={color} strokeWidth="9" strokeLinecap="round" />
    </g>
  );
};
const loop = (f, start, period) => ((f - start) % period + period) % period / period;

// ------------------------------------------------------------------ static architecture
const Architecture = () => (
  <g>
    {/* ceiling, walls, floor */}
    <polygon points={P([[-400, -600], [1110, -600], [1110, 430], [380, 430], [-400, 60]])} fill={C.ceiling} />
    <polygon points={P([[380, 430], [1110, 430], [1110, 1240], [380, 1240]])} fill={C.back} />
    <polygon points={P([[-400, 60], [380, 430], [380, 1240], [-400, 1650]])} fill={C.left} />
    <polygon points={P([[-400, 1650], [380, 1240], [1110, 1240], [1110, 2600], [-400, 2600]])} fill={C.floor} />
    {/* floor planks converging toward the back wall */}
    {[...Array(14)].map((_, i) => { const xb = 380 + i * 56; const xf = -900 + i * 170; return <line key={i} x1={xb} y1={1240} x2={xf} y2={2600} stroke={C.floorLine} strokeWidth="2" opacity=".45" />; })}
    {[1300, 1390, 1510, 1680, 1900].map((y, i) => <line key={`h${i}`} x1={-400} y1={y} x2={1110} y2={y} stroke={C.floorLine} strokeWidth="1.5" opacity=".25" />)}
    {/* soft ambient shading: corner + ceiling line */}
    <polygon points={P([[380, 430], [430, 430], [430, 1240], [380, 1240]])} fill="url(#cornerShade)" />
    <rect x={380} y={430} width={730} height={40} fill="url(#ceilShade)" />
    {/* baseboards */}
    <polygon points={P([[380, 1218], [1110, 1218], [1110, 1240], [380, 1240]])} fill={C.trim} />
    <polygon points={P([[-400, 1622], [380, 1218], [380, 1240], [-400, 1650]])} fill="#EFE6DA" />
    {/* framed print (generic art) */}
    <g>
      <rect x={742} y={682} width={150} height={112} rx={4} fill="#FFFDF8" stroke="#C9B79F" strokeWidth="5" />
      <rect x={756} y={696} width={122} height={84} fill="#F5D7AE" />
      <path d="M 756 780 L 790 742 L 818 764 L 850 728 L 878 760 L 878 780 Z" fill="#D9925C" />
      <circle cx={850} cy={714} r={10} fill="#FFF1C9" />
    </g>
    {/* rug + sunlight patch from the window */}
    <ellipse cx={640} cy={1430} rx={390} ry={95} fill="#C98A6B" opacity=".55" />
    <ellipse cx={640} cy={1430} rx={340} ry={74} fill="none" stroke="#E9B996" strokeWidth="4" opacity=".6" />
  </g>
);

// ------------------------------------------------------------------ window (left wall) + outside view + sash + curtain
const WIN = { A: [70, 560], B: [320, 640], Cc: [320, 1000], D: [70, 1060] };
const mid = (p, q, t = 0.5) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
const WindowView = ({ f, par }) => {
  const k = windowOpen(f);
  const { A, B, Cc, D } = WIN;
  const L = mid(A, D), R = mid(B, Cc);                           // meeting rail
  // lower sash slides up behind the upper sash
  const lA = mid(L, A, k), lB = mid(R, B, k), lC = mid(Cc, R, k), lD = mid(D, L, k);
  const shimmer = k;
  return (
    <g>
      <clipPath id="winClip"><polygon points={P([A, B, Cc, D])} /></clipPath>
      <g clipPath="url(#winClip)">
        <g transform={`translate(${par.x * 0.6} ${par.y * 0.6})`}>
          <rect x={0} y={480} width={360} height={620} fill="url(#sky)" />
          <circle cx={130} cy={640} r={70} fill="#FFF6D8" opacity=".9" />
          <circle cx={130} cy={640} r={130} fill="#FFF1C4" opacity=".35" />
          {[[40, 880, 60, 180], [105, 840, 45, 220], [160, 900, 70, 160], [235, 860, 50, 200], [290, 910, 60, 150]].map(([x, y, w, h], i) =>
            <rect key={i} x={x} y={y} width={w} height={h} fill={C.city} opacity=".85" />)}
          {/* heat shimmer outside */}
          {[0, 1, 2].map((i) => <path key={`s${i}`} d={`M ${40 + i * 90} ${1020 - ((f * 1.2 + i * 40) % 140)} q 12 -14 0 -28 q -12 -14 0 -28`} fill="none" stroke="#FFFFFF" strokeWidth="3" opacity={0.35 * shimmer} />)}
        </g>
        {/* upper sash glass tint + lower sash (moves) */}
        <polygon points={P([A, B, R, L])} fill="rgba(200,230,245,.28)" />
        <polygon points={P([lA, lB, lC, lD])} fill="rgba(200,230,245,.3)" stroke={C.trim} strokeWidth="12" />
        <line x1={mid(lA, lD)[0]} y1={mid(lA, lD)[1]} x2={mid(lB, lC)[0]} y2={mid(lB, lC)[1]} stroke={C.trim} strokeWidth="6" />
        <polygon points={P([A, B, R, L])} fill="none" stroke={C.trim} strokeWidth="12" />
        <line x1={L[0]} y1={L[1]} x2={R[0]} y2={R[1]} stroke={C.trim} strokeWidth="14" />
      </g>
      {/* frame + sill */}
      <polygon points={P([A, B, Cc, D])} fill="none" stroke={C.trim} strokeWidth="18" strokeLinejoin="round" />
      <polygon points={P([[52, 1062], [338, 1000], [360, 1016], [64, 1086]])} fill={C.trim} />
      <polygon points={P([[64, 1086], [360, 1016], [360, 1028], [64, 1100]])} fill="#DCCFBE" />
    </g>
  );
};

const Curtain = ({ f, side }) => {
  // hangs from a rod near the corner; bottom blows inward (toward the room) while the window is open
  const k = windowOpen(f);
  const gust = 0.55 + 0.45 * Math.sin(f / 11) * Math.sin(f / 23 + 1);
  const early = f < 160 ? 1.0 : 0.55;
  const w = k * gust * early;
  const x0 = side === 'r' ? 300 : 36, x1 = side === 'r' ? 372 : 96;
  const top = side === 'r' ? 600 : 520;
  const bot = side === 'r' ? 1080 : 1110;
  const swing = (side === 'r' ? 120 : 140) * w;
  const lift = 70 * w;
  const d = `M ${x0} ${top} L ${x1} ${top + 18}
    C ${x1 + 8 + swing * 0.3} ${top + 220} ${x1 + swing * 0.9} ${bot - 140 - lift} ${x1 + swing} ${bot - lift}
    L ${x0 + swing * 0.85} ${bot - lift * 0.7}
    C ${x0 + swing * 0.5} ${bot - 160} ${x0 - 6} ${top + 240} ${x0} ${top} Z`;
  const folds = [0.25, 0.5, 0.75].map((t) => {
    const xa = lerp(x0, x1, t);
    return `M ${xa} ${top + 10} C ${xa + swing * 0.2} ${top + 220} ${xa + swing * 0.75} ${bot - 150 - lift} ${xa + swing * 0.92} ${bot - lift * 0.85}`;
  });
  return (
    <g>
      <path d={d} fill={C.curtain} />
      {folds.map((fd, i) => <path key={i} d={fd} fill="none" stroke={C.curtainDark} strokeWidth="7" opacity=".55" />)}
      <path d={d} fill="url(#curtainLight)" opacity=".5" />
    </g>
  );
};

// ------------------------------------------------------------------ thermometer (+ readout tag)
const THERMO = { x: 452, top: 618, bot: 828 };
export const tempY = (t) => THERMO.bot - 14 - (t - 15) / 30 * (THERMO.bot - THERMO.top - 40);
const Thermometer = ({ f }) => {
  const t = temperature(f);
  const hot = clamp((t - 24) / 11);
  const col = `rgb(${Math.round(lerp(60, 226, hot))},${Math.round(lerp(150, 69, hot))},${Math.round(lerp(235, 60, hot))})`;
  const y = tempY(t);
  return (
    <g>
      <rect x={THERMO.x - 30} y={THERMO.top - 14} width={60} height={THERMO.bot - THERMO.top + 48} rx={30} fill="#FFFDF8" stroke="#D8C8B2" strokeWidth="3" />
      <rect x={THERMO.x - 30} y={THERMO.top - 14} width={60} height={THERMO.bot - THERMO.top + 48} rx={30} fill="url(#softShadowV)" opacity=".25" />
      {[15, 20, 25, 30, 35, 40, 45].map((v) => <line key={v} x1={THERMO.x + 9} x2={THERMO.x + 20} y1={tempY(v)} y2={tempY(v)} stroke="#9C8B76" strokeWidth="2.5" />)}
      <rect x={THERMO.x - 7} y={THERMO.top + 4} width={14} height={THERMO.bot - THERMO.top - 4} rx={7} fill="#F1F4F6" stroke="#C9D0D6" strokeWidth="2" />
      <rect x={THERMO.x - 4} y={y} width={8} height={THERMO.bot - y} rx={4} fill={col} />
      <circle cx={THERMO.x} cy={THERMO.bot + 10} r={15} fill={col} />
      {/* readout tag */}
      <g transform={`translate(${THERMO.x + 46} ${THERMO.top + 22})`} opacity={1 - cutaway(f)}>
        <rect x={0} y={0} width={132} height={64} rx={16} fill="#FFFFFF" stroke="#E2D6C6" strokeWidth="3" />
        <text x={66} y={45} textAnchor="middle" fontFamily="InterDisplay" fontWeight="800" fontSize="40" fill={col}>{Math.round(t)}°C</text>
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ table + fan + airflow + ice tray
const Table = () => (
  <g>
    <ellipse cx={680} cy={1338} rx={300} ry={26} fill={C.shadow} />
    {[[432, 1118], [918, 1118], [470, 1100], [880, 1100]].map(([x, y], i) => <rect key={i} x={x - 9} y={y} width={18} height={1335 - y} rx={6} fill={i < 2 ? C.wood : '#74492F'} />)}
    <polygon points={P([[452, 1048], [902, 1048], [952, 1108], [402, 1108]])} fill={C.woodTop} />
    <polygon points={P([[402, 1108], [952, 1108], [952, 1130], [402, 1130]])} fill={C.wood} />
    <polygon points={P([[452, 1048], [902, 1048], [952, 1108], [402, 1108]])} fill="url(#topSheen)" opacity=".5" />
  </g>
);

const FAN = { x: 578, y: 898, rx: 76, ry: 94 };
const Fan = ({ f }) => {
  const a = fanAngle(f), sp = fanSpeed(f);
  return (
    <g>
      <ellipse cx={560} cy={1066} rx={60} ry={15} fill={C.shadow} />
      <ellipse cx={556} cy={1058} rx={54} ry={14} fill="#EDEFEA" stroke="#CDD2CC" strokeWidth="3" />
      <rect x={550} y={950} width={12} height={110} rx={6} fill="#DADFD9" />
      <ellipse cx={545} cy={900} rx={34} ry={42} fill="#E3E7E1" />
      {/* blades (independent layer, rotate inside a 3/4-squashed disc) */}
      <g transform={`translate(${FAN.x} ${FAN.y}) scale(0.8 1)`}>
        <g transform={`rotate(${a})`} opacity={1 - sp * 0.35}>
          {[0, 120, 240].map((r) => <path key={r} transform={`rotate(${r})`} d="M 0 -8 C 30 -60 70 -70 80 -40 C 85 -20 40 -6 0 8 Z" fill="#8FC9BE" stroke="#73B0A4" strokeWidth="2" />)}
        </g>
        <circle r={86} fill="#9FD3C7" opacity={sp * 0.32} />
        <circle r={14} fill="#E9EEE8" stroke="#BFC7BE" strokeWidth="3" />
      </g>
      {/* guard */}
      <ellipse cx={FAN.x} cy={FAN.y} rx={FAN.rx} ry={FAN.ry} fill="none" stroke="#C8CEC6" strokeWidth="5" />
      {[0.35, 0.68].map((s) => <ellipse key={s} cx={FAN.x} cy={FAN.y} rx={FAN.rx * s} ry={FAN.ry * s} fill="none" stroke="#C8CEC6" strokeWidth="2.5" opacity=".8" />)}
      {[...Array(8)].map((_, i) => { const t = i / 8 * Math.PI * 2; return <line key={i} x1={FAN.x} y1={FAN.y} x2={FAN.x + Math.cos(t) * FAN.rx} y2={FAN.y + Math.sin(t) * FAN.ry} stroke="#C8CEC6" strokeWidth="2" opacity=".7" />; })}
      {/* switch light */}
      <circle cx={556} cy={1056} r={5} fill={sp > 0 ? '#7BD88F' : '#C9CDC8'} />
    </g>
  );
};

const Airflow = ({ f }) => {
  const sp = fanSpeed(f);
  if (sp <= 0) return null;
  const cool = coolAir(f);
  const col = cool > 0.05 ? `rgba(${Math.round(lerp(255, 63, cool))},${Math.round(lerp(255, 169, cool))},${Math.round(lerp(255, 245, cool))},.85)` : 'rgba(255,255,255,.8)';
  const lines = [[-40, 0], [-10, 0.4], [20, 0.8], [50, 0.2]];
  return (
    <g opacity={sp * (f < 620 ? 1 : 1 - ramp(f, 620, 650))}>
      {lines.map(([dy, ph], i) => {
        const y0 = FAN.y + dy;
        const d = `M ${FAN.x + 50} ${y0} C ${FAN.x + 150} ${y0 + 20 + dy * 0.3} ${FAN.x + 240} ${y0 + 60} ${FAN.x + 380} ${y0 + 90 + dy * 0.6}`;
        return <path key={i} d={d} fill="none" stroke={col} strokeWidth={cool > 0.05 ? 7 : 5} strokeLinecap="round" strokeDasharray="60 70" strokeDashoffset={-f * 9 - ph * 130} />;
      })}
    </g>
  );
};

const TRAY = { x: 652, y: 1050 };
const IceTray = ({ f }) => {
  const k = trayIn(f);
  if (k <= 0) return null;
  const m = melt(f);
  const off = (1 - k) * 380;
  const cubes = [[688, 1063], [728, 1060], [768, 1064], [808, 1061], [748, 1078]];
  return (
    <g transform={`translate(${off} 0)`}>
      <ellipse cx={TRAY.x + 92} cy={TRAY.y + 40} rx={110} ry={13} fill={C.shadow} />
      <polygon points={P([[656, 1052], [834, 1052], [846, 1088], [644, 1088]])} fill="#D7E1E8" stroke="#AFBCC6" strokeWidth="3" />
      <polygon points={P([[644, 1088], [846, 1088], [846, 1098], [644, 1098]])} fill="#B8C5CF" />
      {/* puddle (grows as the cubes shrink) */}
      <ellipse cx={745} cy={1074} rx={lerp(0, 86, m)} ry={lerp(0, 12, m)} fill={C.water} opacity={0.55 * Math.min(1, m * 3)} />
      <ellipse cx={725} cy={1070} rx={lerp(0, 40, m)} ry={lerp(0, 4, m)} fill="#FFFFFF" opacity={0.35 * m} />
      {/* cubes (each its own layer, shrink at slightly different rates) */}
      {cubes.map(([x, y], i) => {
        const s = clamp(1 - m * (0.95 + i * 0.03), 0, 1);
        if (s <= 0.02) return null;
        const r = 19 * s;
        return (
          <g key={i} transform={`translate(${x} ${y + (1 - s) * 8})`}>
            <rect x={-r} y={-r * 1.1} width={r * 2} height={r * 2} rx={r * 0.35} fill="#E9F6FF" stroke="#A9D4F0" strokeWidth="2.5" opacity=".95" />
            <rect x={-r * 0.6} y={-r * 0.8} width={r * 0.7} height={r * 0.4} rx={r * 0.2} fill="#FFFFFF" opacity=".9" />
          </g>
        );
      })}
      {/* the drop (close-up): falls 515-527, ripple 527-540 */}
      <Drop f={f} x={735} y0={991} y1={1074} start={515} land={527} />
    </g>
  );
};

/** a single water drop that falls from y0 to y1 and makes a ripple (shared by the tray and the drain hose) */
export const Drop = ({ f, x, y0, y1, start, land, form = 0, ripple = true }) => {
  if (f < start - form || f > land + 16) return null;
  const grow = form ? clamp((f - (start - form)) / form) : 1;
  const t = clamp((f - start) / (land - start));
  const y = lerp(y0, y1, t * t);
  const rt = clamp((f - land) / 14);
  return (
    <g>
      {f <= land && <path transform={`translate(${x} ${y}) scale(${grow})`} d="M 0 -12 C 5 -4 8 1 8 5 A 8 8 0 1 1 -8 5 C -8 1 -5 -4 0 -12 Z" fill={C.water} stroke="#2F8FD0" strokeWidth="1.2" />}
      {ripple && f > land && [0, 0.35].map((d, i) => <ellipse key={i} cx={x} cy={y1} rx={4 + 26 * clamp(rt - d)} ry={(4 + 26 * clamp(rt - d)) * 0.3} fill="none" stroke="#FFFFFF" strokeWidth="2" opacity={(1 - clamp(rt - d)) * 0.9} />)}
    </g>
  );
};

// ------------------------------------------------------------------ hot air through the window
const HotAir = ({ f }) => {
  const k = windowOpen(f) * (f < 160 ? 1 : 0.35) * (1 - ramp(f, 560, 600));
  if (k <= 0.01) return null;
  return (
    <g opacity={k}>
      {[[640, 0], [760, 0.3], [880, 0.6], [980, 0.15]].map(([y, ph], i) => (
        <path key={i} d={`M 160 ${y} C 260 ${y - 40} 330 ${y + 50} 420 ${y + 10} S 560 ${y - 30} 640 ${y + 30}`} fill="none" stroke={C.heat} strokeWidth="6"
          strokeLinecap="round" strokeDasharray="70 90" strokeDashoffset={-f * 7 - ph * 160} opacity=".75" />
      ))}
    </g>
  );
};

// ------------------------------------------------------------------ AC indoor unit (cover + internals) + refrigerant + drain
const AC = { x: 600, y: 488, w: 362, h: 124 };
const LOOP_BLUE = 'M 1246 548 L 1236 548 L 1236 640 L 1170 640 L 1110 582 L 962 578 L 912 552 L 646 552 L 646 538 L 912 538 L 912 524 L 646 524 L 646 510 L 912 510';
const LOOP_ORANGE = 'M 912 510 L 936 512 L 962 542 L 1110 542 L 1170 600 L 1316 600 L 1316 735 L 1276 735 L 1276 548 L 1261 548 L 1261 725 L 1246 725 L 1246 548';
const DRAIN = 'M 930 572 L 958 606 L 1110 616 L 1172 664 L 1182 664 L 1182 1146';

const IndoorUnit = ({ f }) => {
  const c = cutaway(f), on = acOn(f);
  const cover = 1 - c * 0.88;
  const louver = on * 22;
  return (
    <g>
      <rect x={AC.x + 8} y={AC.y + 16} width={AC.w} height={AC.h} rx={26} fill={C.shadow} />
      {/* internals: housing, coil (fins), blower, drain pan */}
      <g opacity={0.25 + 0.75 * c}>
        <rect x={AC.x} y={AC.y} width={AC.w} height={AC.h} rx={24} fill="#4A5058" />
        <rect x={632} y={500} width={292} height={60} rx={6} fill="#C8D1DA" />
        {[...Array(48)].map((_, i) => <line key={i} x1={636 + i * 6} y1={502} x2={636 + i * 6} y2={558} stroke="#9EAAB6" strokeWidth="1.5" />)}
        <rect x={632} y={500} width={292} height={60} rx={6} fill={C.cool} opacity={0.18 * on} />
        <rect x={634} y={562} width={300} height={10} rx={3} fill="#7C8792" />
        <rect x={650} y={576} width={258} height={26} rx={13} fill="#353A41" />
        {[...Array(18)].map((_, i) => <line key={`b${i}`} x1={650 + ((i * 15 + f * 6 * on) % 258)} y1={578} x2={650 + ((i * 15 + f * 6 * on) % 258)} y2={600} stroke="#5D646D" strokeWidth="3" />)}
      </g>
      {/* cover (fades in the cutaway) */}
      <g opacity={cover}>
        <rect x={AC.x} y={AC.y} width={AC.w} height={AC.h} rx={24} fill={C.acBody} stroke="#DFE1DD" strokeWidth="3" />
        <rect x={AC.x + 18} y={AC.y + 12} width={AC.w - 36} height={10} rx={5} fill={C.acShade} />
        <rect x={AC.x} y={AC.y + AC.h - 40} width={AC.w} height={40} rx={20} fill="url(#acShade)" />
        <circle cx={AC.x + AC.w - 34} cy={AC.y + 70} r={5} fill={on > 0.5 ? '#46C2F0' : '#CFD3D0'} />
      </g>
      {/* louver flap */}
      <g transform={`translate(${AC.x + 24} ${AC.y + AC.h - 6}) rotate(${louver})`}>
        <rect x={0} y={-4} width={AC.w - 48} height={9} rx={4} fill="#ECEDEA" stroke="#D2D5D1" strokeWidth="2" />
      </g>
    </g>
  );
};

const CoolOut = ({ f }) => {
  const on = acOn(f);
  if (on <= 0) return null;
  return (
    <g opacity={on * 0.9}>
      {[0, 1, 2, 3].map((i) => {
        const x0 = 650 + i * 80;
        return <path key={i} d={`M ${x0} 622 C ${x0 - 20} 700 ${x0 - 70} 760 ${x0 - 140} 830`} fill="none" stroke={C.cool} strokeWidth="6" strokeLinecap="round"
          strokeDasharray="40 60" strokeDashoffset={-f * 5 - i * 25} opacity=".7" />;
      })}
    </g>
  );
};

const Trunking = ({ f }) => {
  const c = cutaway(f);
  return (
    <g>
      {/* copper lines + drain hose (visible through the trunking in the cutaway) */}
      <g opacity={0.15 + 0.85 * c}>
        <path d="M 962 542 L 1110 542 L 1170 600 L 1236 600" fill="none" stroke={C.copper} strokeWidth="11" strokeLinejoin="round" />
        <path d="M 962 578 L 1110 582 L 1170 640 L 1236 640" fill="none" stroke={C.copper} strokeWidth="8" strokeLinejoin="round" />
        <path d={DRAIN} fill="none" stroke={C.hose} strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
        <path d={DRAIN} fill="none" stroke="#B5BBC1" strokeWidth="12" strokeDasharray="2 6" strokeLinejoin="round" />
      </g>
      {/* white trunking cover along the back wall (normal view) */}
      <rect x={962} y={530} width={160} height={64} rx={8} fill="#F8F8F5" stroke="#E0DFDA" strokeWidth="2" opacity={1 - c * 0.85} />
    </g>
  );
};

const Refrigerant = ({ f }) => {
  const c = cutaway(f), on = acOn(f);
  if (c <= 0.05) return null;
  const off = -f * 4.5 * on;
  return (
    <g opacity={c}>
      <path d={`${LOOP_BLUE} ${LOOP_ORANGE.replace('M', 'L')}`} fill="none" stroke="#FFFFFF" strokeWidth="2" opacity=".35" />
      <path d={LOOP_BLUE} fill="none" stroke={C.cool} strokeWidth="7" strokeLinecap="round" strokeDasharray="8 18" strokeDashoffset={off} opacity={on} />
      <path d={LOOP_ORANGE} fill="none" stroke={C.heat} strokeWidth="7" strokeLinecap="round" strokeDasharray="8 18" strokeDashoffset={off} opacity={on} />
    </g>
  );
};

// ------------------------------------------------------------------ wall section + outside + outdoor unit
const Outside = ({ f, par }) => (
  <g>
    <g transform={`translate(${par.x * 0.5} ${par.y * 0.5})`}>
      <rect x={1170} y={-700} width={1000} height={3400} fill="url(#skyOut)" />
      {[[1400, 1100, 90, 380], [1520, 1180, 120, 300], [1680, 1060, 80, 420], [1790, 1150, 110, 330], [1950, 1080, 90, 400]].map(([x, y, w, h], i) =>
        <rect key={i} x={x} y={y} width={w} height={h} fill={C.city} opacity=".8" />)}
      <rect x={1170} y={1480} width={1000} height={1400} fill="#D7B88E" opacity=".6" />
    </g>
    {/* exterior wall face below/above the unit (light render) */}
    <rect x={1170} y={-700} width={14} height={3400} fill="#E9DDCB" />
  </g>
);

const WallSection = () => (
  <g>
    <rect x={1110} y={-700} width={62} height={3400} fill="#C9B59B" />
    {[...Array(60)].map((_, i) => <line key={i} x1={1110} y1={-700 + i * 60} x2={1172} y2={-640 + i * 60} stroke="#AE9879" strokeWidth="3" />)}
    <rect x={1110} y={-700} width={62} height={3400} fill="none" stroke="#9B8467" strokeWidth="4" />
    {/* floor slab section */}
    <rect x={1110} y={1240} width={62} height={70} fill="#B9A589" />
  </g>
);

const OutdoorUnit = ({ f }) => {
  const c = cutaway(f), on = acOn(f);
  const comp = ramp(f, 840, 860) * (1 - ramp(f, 905, 930));
  const fa = f * 14 * on;
  return (
    <g>
      {/* brackets */}
      <path d="M 1184 760 L 1300 760 L 1184 680 Z" fill="none" stroke="#8D949B" strokeWidth="8" strokeLinejoin="round" />
      <ellipse cx={1378} cy={770} rx={150} ry={14} fill="rgba(60,50,40,.18)" />
      {/* internals */}
      <g opacity={0.3 + 0.7 * c}>
        <rect x={1232} y={518} width={292} height={226} rx={14} fill="#5A6068" />
        {[...Array(6)].map((_, i) => <line key={i} x1={1242 + i * 7} y1={532} x2={1242 + i * 7} y2={736} stroke="#9AA5B1" strokeWidth="2" />)}
        <rect x={1240} y={528} width={44} height={210} fill="#C8D1DA" opacity=".55" />
        <g>
          <rect x={1290} y={642} width={52} height={92} rx={22} fill={comp > 0 ? '#FFB067' : '#2E3238'} stroke={comp > 0 ? C.heat : '#1E2125'} strokeWidth="4" />
          <rect x={1290} y={642} width={52} height={92} rx={22} fill="none" stroke={C.heat} strokeWidth={10} opacity={comp * (0.5 + 0.5 * Math.sin(f / 3))} />
        </g>
      </g>
      {/* cover */}
      <g opacity={1 - c * 0.8}>
        <rect x={1232} y={518} width={292} height={226} rx={14} fill={C.unit} stroke="#C9CED3" strokeWidth="3" />
      </g>
      {/* fan grille (always visible) */}
      <g transform={`translate(1418 632)`}>
        <circle r={84} fill="#3B4047" opacity={0.85} />
        <g transform={`rotate(${fa})`}>{[0, 90, 180, 270].map((r) => <path key={r} transform={`rotate(${r})`} d="M 0 -6 C 22 -50 56 -58 66 -32 C 70 -16 30 -4 0 6 Z" fill="#8C959F" />)}</g>
        {[30, 55, 80].map((r) => <circle key={r} r={r} fill="none" stroke="#C9CED3" strokeWidth="3" />)}
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ heat arrows, moisture, labels
const HeatArrows = ({ f }) => {
  const a = ramp(f, 690, 712) * (1 - ramp(f, 1010, 1030));
  const b = ramp(f, 780, 800) * (1 - ramp(f, 1010, 1030));
  if (a <= 0 && b <= 0) return null;
  const inPaths = [[[640, 820], [700, 600]], [[740, 840], [790, 600]], [[840, 820], [880, 600]]];
  const outPaths = [[[1380, 560], [1400, 400]], [[1430, 560], [1480, 410]], [[1480, 575], [1555, 440]]];
  return (
    <g>
      {inPaths.map(([p, q], i) => [0, 0.5].map((d) => <Arrow key={`i${i}${d}`} from={p} to={q} t={loop(f, 690 + i * 9, 60) + d - (loop(f, 690 + i * 9, 60) + d > 1 ? 1 : 0)} op={a} size={0.9} />))}
      {outPaths.map(([p, q], i) => [0, 0.5].map((d) => <Arrow key={`o${i}${d}`} from={p} to={q} t={loop(f, 780 + i * 11, 60) + d - (loop(f, 780 + i * 11, 60) + d > 1 ? 1 : 0)} op={b} size={0.9} />))}
    </g>
  );
};

const Moisture = ({ f }) => {
  if (f < 1026 || f > 1205) return null;
  const drops = [...Array(14)].map((_, i) => ({ x: 650 + i * 19 + random(`mx${i}`) * 8, y: 540 + random(`my${i}`) * 16, t0: 1030 + random(`mt${i}`) * 34 }));
  const pan = ramp(f, 1066, 1104);
  const flow = ramp(f, 1096, 1112) * (1 - ramp(f, 1195, 1205));
  return (
    <g>
      {drops.map((d, i) => {
        const g = clamp((f - d.t0) / 16), fall = clamp((f - d.t0 - 28) / 10);
        if (g <= 0 || fall >= 1) return null;
        return <circle key={i} cx={d.x} cy={lerp(d.y, 568, fall * fall)} r={4.5 * g} fill={C.water} stroke="#2F8FD0" strokeWidth="1" />;
      })}
      <rect x={636} y={566 - 5 * pan} width={296} height={5 * pan} fill={C.water} opacity=".85" />
      <path d={DRAIN} fill="none" stroke={C.water} strokeWidth="6" strokeLinecap="round" strokeDasharray="14 18" strokeDashoffset={-f * 6} opacity={flow} />
      {/* final drop from the hose end (close-up, echoes the tray drop) */}
      <Drop f={f} x={1182} y0={1150} y1={1237} start={1180} land={1196} form={10} ripple={false} />
    </g>
  );
};

const Label = ({ x, y, text, op, anchor = 'middle' }) => {
  if (op <= 0) return null;
  const w = text.length * 17.5 + 36;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return (
    <g opacity={op}>
      <rect x={x0} y={y - 32} width={w} height={50} rx={25} fill="rgba(11,30,63,.88)" />
      <text x={x0 + w / 2} y={y + 3} textAnchor="middle" fontFamily="InterDisplay" fontWeight="800" fontSize="30" fill="#FFFFFF">{text}</text>
    </g>
  );
};

// ------------------------------------------------------------------ the world
export const World = ({ f, par }) => {
  const c = cutaway(f);
  const lab = (a, b, e) => ramp(f, a, a + 12) * (1 - ramp(f, b, b + 12)) * (e ?? 1);
  return (
    <g>
      <Outside f={f} par={par} />
      <WallSection />
      <OutdoorUnit f={f} />
      <Architecture />
      <WindowView f={f} par={par} />
      <Curtain f={f} side="l" />
      <Curtain f={f} side="r" />
      <Thermometer f={f} />
      {/* the AC doesn't exist yet in the "tries" (window, fan, ice): it appears when it's invented (18-21 s) */}
      {acAppear(f) > 0 && (
        <g opacity={acAppear(f)} transform={`translate(780 550) scale(${0.85 + 0.15 * acAppear(f)}) translate(-780 -550)`}>
          <Trunking f={f} />
          <IndoorUnit f={f} />
        </g>
      )}
      <Refrigerant f={f} />
      <CoolOut f={f} />
      <HotAir f={f} />
      <g transform={`translate(${par.x * 0.04} ${par.y * 0.04})`}>
        <Table />
        <Fan f={f} />
        <IceTray f={f} />
        <Airflow f={f} />
      </g>
      <HeatArrows f={f} />
      <Moisture f={f} />
      <Label x={780} y={452} text="Indoor coil" op={lab(700, 1150, c)} />
      <Label x={1330} y={488} text="Outdoor coil" op={lab(790, 1150, c)} />
      <Label x={1330} y={800} text="Compressor" op={lab(840, 930, c)} />
      <Label x={1196} y={960} text="Drain hose" anchor="start" op={lab(1100, 1150, c)} />
      {/* foreground plant (most parallax) */}
      <g transform={`translate(${par.x * 0.1} ${par.y * 0.1})`}>
        <rect x={980} y={1150} width={70} height={90} rx={10} fill="#C8835E" />
        {[[-40, -150], [-10, -190], [20, -160], [45, -120], [-55, -95]].map(([dx, dy], i) =>
          <path key={i} d={`M 1015 1155 Q ${1015 + dx * 0.4} ${1155 + dy * 0.5} ${1015 + dx} ${1155 + dy}`} fill="none" stroke="#5E8D5A" strokeWidth="14" strokeLinecap="round" />)}
      </g>
    </g>
  );
};

export const Defs = () => (
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.sky1} /><stop offset="1" stopColor={C.sky2} /></linearGradient>
    <linearGradient id="skyOut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A9D8F2" /><stop offset=".55" stopColor="#FFE6B3" /><stop offset="1" stopColor="#F3D3A6" /></linearGradient>
    <linearGradient id="cornerShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="rgba(120,80,40,.12)" /><stop offset="1" stopColor="rgba(120,80,40,0)" /></linearGradient>
    <linearGradient id="ceilShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(120,80,40,.10)" /><stop offset="1" stopColor="rgba(120,80,40,0)" /></linearGradient>
    <linearGradient id="curtainLight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFF4D6" stopOpacity=".6" /><stop offset="1" stopColor="#FFF4D6" stopOpacity="0" /></linearGradient>
    <linearGradient id="softShadowV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#B49A7C" /></linearGradient>
    <linearGradient id="topSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFE2B8" stopOpacity=".6" /><stop offset="1" stopColor="#FFE2B8" stopOpacity="0" /></linearGradient>
    <linearGradient id="acShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#D9DBD7" stopOpacity=".8" /></linearGradient>
    <radialGradient id="sunPatch"><stop offset="0" stopColor="#FFE9B0" stopOpacity=".55" /><stop offset="1" stopColor="#FFE9B0" stopOpacity="0" /></radialGradient>
  </defs>
);
