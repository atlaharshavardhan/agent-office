// World layers (SVG). One 3/4 camera: back wall faces us, left wall (window) recedes, floor in perspective.
// The back wall is cut at x=1110 (wall section) and the outdoor side continues to the right (cutaway only).
// Every animated element is its own <g>: wall, window sash, curtain, fan blades, ice cubes, puddle,
// thermometer, AC cover, AC internals, refrigerant loop, drain hose, outdoor unit.
import React from 'react';
import { random } from 'remotion';
import {
  clamp, lerp, ramp, eout, acAppear, windowOpen, breeze, winAcIn, winAcGaps, fanAngle, fanSpeed, trayIn, melt, coolAir, cutaway, acOn, temperature,
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
    <polygon points={P([[-400, -600], [1900, -600], [1900, 430], [380, 430], [-400, 60]])} fill={C.ceiling} />
    <polygon points={P([[380, 430], [1900, 430], [1900, 1240], [380, 1240]])} fill={C.back} />
    <polygon points={P([[-400, 60], [380, 430], [380, 1240], [-400, 1650]])} fill={C.left} />
    <polygon points={P([[-400, 1650], [380, 1240], [1900, 1240], [1900, 2600], [-400, 2600]])} fill={C.floor} />
    {/* floor planks converging toward the back wall */}
    {[...Array(14)].map((_, i) => { const xb = 380 + i * 56; const xf = -900 + i * 170; return <line key={i} x1={xb} y1={1240} x2={xf} y2={2600} stroke={C.floorLine} strokeWidth="2" opacity=".45" />; })}
    {[1300, 1390, 1510, 1680, 1900].map((y, i) => <line key={`h${i}`} x1={-400} y1={y} x2={1900} y2={y} stroke={C.floorLine} strokeWidth="1.5" opacity=".25" />)}
    {/* soft ambient shading: corner + ceiling line */}
    <polygon points={P([[380, 430], [430, 430], [430, 1240], [380, 1240]])} fill="url(#cornerShade)" />
    <rect x={380} y={430} width={1520} height={40} fill="url(#ceilShade)" />
    {/* baseboards */}
    <polygon points={P([[380, 1218], [1900, 1218], [1900, 1240], [380, 1240]])} fill={C.trim} />
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
      <WindowAC f={f} />
      {/* frame + sill */}
      <polygon points={P([A, B, Cc, D])} fill="none" stroke={C.trim} strokeWidth="18" strokeLinejoin="round" />
      <polygon points={P([[52, 1062], [338, 1000], [360, 1016], [64, 1086]])} fill={C.trim} />
      <polygon points={P([[64, 1086], [360, 1016], [360, 1028], [64, 1100]])} fill="#DCCFBE" />
    </g>
  );
};

// point in the window plane: u 0 (near edge, x 70) -> 1 (corner side, x 320); v 0 (top) -> 1 (sill)
const WP = (u, v) => { const { A, B, Cc, D } = WIN; const t = mid(A, B, u), b = mid(D, Cc, u); return mid(t, b, v); };
const add = (p, n, k = 1) => [p[0] + n[0] * k, p[1] + n[1] * k];
const WinAC = { u0: 0.08, u1: 0.92, v0: 0.66, v1: 1.0, n: [34, 7] };
const WindowAC = ({ f }) => {
  const s = winAcIn(f);
  if (s <= 0) return null;
  const { u0, u1, v0, v1, n } = WinAC;
  const off = add([0, 0], n, 5 * (1 - s));                     // slides in from the room side
  const q = (u, v, k = 1) => add(add(WP(u, v), n, k), off);
  const top = [q(u0, v0, 0), q(u1, v0, 0), q(u1, v0), q(u0, v0)];
  const face = [q(u0, v0), q(u1, v0), q(u1, v1), q(u0, v1)];
  const side = [q(u0, v0, 0), q(u0, v0), q(u0, v1), q(u0, v1, 0)];
  const g = winAcGaps(f);
  const gap = (ua, ub) => [WP(ua, v0), WP(ub, v0), WP(ub, v1), WP(ua, v1)];
  const louvers = [0.12, 0.2, 0.28, 0.36].map((t) => [q(lerp(u0, u1, 0.06), lerp(v0, v1, t)), q(lerp(u0, u1, 0.7), lerp(v0, v1, t))]);
  const slots = [...Array(9)].map((_, i) => { const u = lerp(u0, u1, 0.08 + i * 0.07); return [q(u, lerp(v0, v1, 0.52)), q(u, lerp(v0, v1, 0.9))]; });
  return (
    <g opacity={clamp(s * 1.4)}>
      {/* accordion side panels fill the gaps between the unit and the frame */}
      {g > 0 && [gap(0, u0 * g), gap(1 - (1 - u1) * g, 1)].map((pp, i) => (
        <g key={i}>
          <polygon points={P(pp)} fill="#EEEDE8" stroke="#CFCEC8" strokeWidth="2" />
          {[0.25, 0.5, 0.75].map((t) => { const a = mid(pp[0], pp[1], t), b = mid(pp[3], pp[2], t); return <line key={t} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#CFCEC8" strokeWidth="2" />; })}
        </g>))}
      <polygon points={P(side)} fill="#D8DAD6" />
      <polygon points={P(top)} fill="#F1F2EF" />
      <polygon points={P(face)} fill="#FAFAF7" stroke="#D9DBD6" strokeWidth="3" strokeLinejoin="round" />
      {louvers.map(([a, b], i) => <line key={`l${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#C9CDC8" strokeWidth="3" />)}
      {slots.map(([a, b], i) => <line key={`s${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#D2D5D0" strokeWidth="3" />)}
      <polygon points={P([q(lerp(u0, u1, 0.76), lerp(v0, v1, 0.12)), q(lerp(u0, u1, 0.94), lerp(v0, v1, 0.12)), q(lerp(u0, u1, 0.94), lerp(v0, v1, 0.4)), q(lerp(u0, u1, 0.76), lerp(v0, v1, 0.4))])} fill="#E7E9E5" />
      {(() => { const p = q(lerp(u0, u1, 0.85), lerp(v0, v1, 0.26)); return <circle cx={p[0]} cy={p[1]} r={4} fill={acOn(f) > 0.5 ? '#46C2F0' : '#C9CDC8'} />; })()}
    </g>
  );
};
export const WIN_AC_FRONT = () => WP(0.45, 0.72);

const Curtain = ({ f, side }) => {
  // hangs from a rod near the corner; bottom blows inward (toward the room) while the window is open
  const k = breeze(f);
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

const FAN = { x: 578, y: 944, rx: 70, ry: 86 };
const Fan = ({ f }) => {
  const a = fanAngle(f), sp = fanSpeed(f);
  return (
    <g>
      <ellipse cx={560} cy={1066} rx={60} ry={15} fill={C.shadow} />
      <ellipse cx={556} cy={1058} rx={54} ry={14} fill="#EDEFEA" stroke="#CDD2CC" strokeWidth="3" />
      <rect x={550} y={1000} width={12} height={60} rx={6} fill="#DADFD9" />
      <ellipse cx={547} cy={944} rx={32} ry={40} fill="#E3E7E1" />
      {/* blades (independent layer, rotate inside a 3/4-squashed disc) */}
      <g transform={`translate(${FAN.x} ${FAN.y}) scale(0.8 1)`}>
        <g transform={`rotate(${a})`} opacity={1 - sp * 0.35}>
          {[0, 120, 240].map((r) => <path key={r} transform={`rotate(${r})`} d="M 0 -8 C 28 -54 64 -64 73 -36 C 77 -18 36 -6 0 8 Z" fill="#8FC9BE" stroke="#73B0A4" strokeWidth="2" />)}
        </g>
        <circle r={78} fill="#9FD3C7" opacity={sp * 0.32} />
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
  if (sp <= 0 || f > 600) return null;
  const cool = coolAir(f);
  const down = `rgba(${Math.round(lerp(255, 63, cool))},${Math.round(lerp(255, 169, cool))},${Math.round(lerp(255, 245, cool))},.9)`;
  const lanes = [-34, -12, 10, 32];
  return (
    <g opacity={sp * (1 - ramp(f, 560, 590))}>
      {lanes.map((dy, i) => {
        const y0 = FAN.y + dy * 0.8, yT = 1040 + i * 6;
        const up = `M ${FAN.x + 40} ${y0} C ${FAN.x + 90} ${y0 + 10} ${672} ${yT - 30} ${700} ${yT}`;              // fan -> over the cubes
        const dn = `M ${700} ${yT} L ${836} ${yT + 2} C ${880} ${yT + 3} ${930} ${yT - 10} ${1000} ${yT - 30}`;     // over and past the tray
        return (
          <g key={i}>
            <path d={up} fill="none" stroke="rgba(255,255,255,.88)" strokeWidth="5" strokeLinecap="round" strokeDasharray="36 46" strokeDashoffset={-f * 7 - i * 20} />
            <path d={dn} fill="none" stroke={down} strokeWidth={5 + 2 * cool} strokeLinecap="round" strokeDasharray="36 46" strokeDashoffset={-f * 7 - i * 20 - 30} />
          </g>
        );
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
      <Drop f={f} x={735} y0={991} y1={1074} start={515} land={527} form={10} />
    </g>
  );
};

/** a single water drop that falls from y0 to y1 and makes a ripple (shared by the tray and the drain hose) */
export const Drop = ({ f, x, y0, y1, start, land, form = 0, ripple = true, through = false }) => {
  // forms for `form` frames, falls y0 -> y1 between start and land (same size and timing for the tray and the hose)
  const end = through ? land + 14 : land + 16;
  if (f < start - form || f > end) return null;
  const grow = form ? clamp((f - (start - form)) / form) : 1;
  const t = clamp((f - start) / (land - start));
  const v = (y1 - y0) * 2 / (land - start);                       // speed at landing (keeps falling if `through`)
  const y = f <= land ? lerp(y0, y1, t * t) : y1 + v * (f - land);
  const rt = clamp((f - land) / 14);
  const shape = <path transform={`translate(${x} ${y}) scale(${grow})`} d="M 0 -12 C 5 -4 8 1 8 5 A 8 8 0 1 1 -8 5 C -8 1 -5 -4 0 -12 Z" fill={C.water} stroke="#2F8FD0" strokeWidth="1.2" />;
  return (
    <g>
      {(f <= land || through) && <g opacity={through && f > land ? 1 - rt : 1}>{shape}</g>}
      {ripple && f > land && [0, 0.35].map((d, i) => <ellipse key={i} cx={x} cy={y1} rx={4 + 26 * clamp(rt - d)} ry={(4 + 26 * clamp(rt - d)) * 0.3} fill="none" stroke="#FFFFFF" strokeWidth="2" opacity={(1 - clamp(rt - d)) * 0.9} />)}
    </g>
  );
};

// ------------------------------------------------------------------ hot air through the window
const HotAir = ({ f }) => {
  const k = breeze(f) * (f < 170 ? ramp(f, 30, 50) : 0.3) * (1 - ramp(f, 330, 360));
  if (k <= 0.01) return null;
  return (
    <g opacity={k}>
      {[[880, 0], [930, 0.3], [975, 0.6], [1015, 0.15]].map(([y, ph], i) => (
        <path key={i} d={`M ${90 + i * 40} ${y} C ${200 + i * 30} ${y - 30} ${300} ${y + 30} ${400} ${y - 10} S ${520} ${y - 60} ${620} ${y - 40}`} fill="none" stroke={C.heat} strokeWidth="7"
          strokeLinecap="round" strokeDasharray="60 70" strokeDashoffset={-f * 7 - ph * 130} opacity=".85" />
      ))}
    </g>
  );
};

// ------------------------------------------------------------------ AC indoor unit (cover + internals) + refrigerant + drain
const AC = { x: 600, y: 488, w: 362, h: 124 };

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

const Trunking = () => (
  // white pipe cover running from the indoor unit along the wall (pipes go through the wall behind it)
  <g>
    <rect x={962} y={530} width={190} height={64} rx={8} fill="#F8F8F5" stroke="#E0DFDA" strokeWidth="2" />
    <rect x={962} y={584} width={190} height={10} rx={4} fill="#ECEBE6" />
  </g>
);

// ------------------------------------------------------------------ the world
const WindowAcAir = ({ f }) => {
  const on = acOn(f);
  if (on <= 0) return null;
  const [x, y] = [WP(0.45, 0.72)[0] + 40, WP(0.45, 0.72)[1]];
  return (
    <g opacity={on * 0.9}>
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${x + i * 14} ${y - 10 + i * 16} C ${x + 120} ${y - 40 + i * 20} ${x + 220} ${y + 10 + i * 18} ${x + 330} ${y - 20 + i * 24}`} fill="none" stroke={C.cool}
          strokeWidth="6" strokeLinecap="round" strokeDasharray="44 56" strokeDashoffset={-f * 6 - i * 25} opacity=".75" />
      ))}
    </g>
  );
};

export const World = ({ f, par }) => (
  <g>
    <Architecture />
    <WindowView f={f} par={par} />
    <Curtain f={f} side="l" />
    <Curtain f={f} side="r" />
    <Thermometer f={f} />
    {/* no wall-mounted AC anywhere: the back wall stays empty */}
    <WindowAcAir f={f} />
    <HotAir f={f} />
    <g transform={`translate(${par.x * 0.04} ${par.y * 0.04})`}>
      <Table />
      <Fan f={f} />
      <IceTray f={f} />
      <Airflow f={f} />
    </g>
    {/* foreground plant (most parallax) */}
    <g transform={`translate(${par.x * 0.1} ${par.y * 0.1})`}>
      <rect x={980} y={1150} width={70} height={90} rx={10} fill="#C8835E" />
      {[[-40, -150], [-10, -190], [20, -160], [45, -120], [-55, -95]].map(([dx, dy], i) =>
        <path key={i} d={`M 1015 1155 Q ${1015 + dx * 0.4} ${1155 + dy * 0.5} ${1015 + dx} ${1155 + dy}`} fill="none" stroke="#5E8D5A" strokeWidth="14" strokeLinecap="round" />)}
    </g>
  </g>
);

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
