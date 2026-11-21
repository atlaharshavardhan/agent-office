// Flat, straight-on 2D side cutaway through the WINDOW and the WINDOW AC (22-40 s). Room on the left, the window
// (wall section + lowered sash) in the middle, outside on the right. ONE box straddles the window: front half in
// the room (indoor coil + blower), back half outside (compressor + fan + outdoor coil). The camera only pans/zooms.
// Heat = orange CHEVRON ARROWS. Refrigerant = round MARKERS on one closed loop inside the box. Water = blue drops.
import React from 'react';
import { random } from 'remotion';
import { C, Drop } from './Room';
import { clamp, lerp, ramp } from './timeline';

// ------------------------------------------------------------------ geometry (2D coords = screen px at camera 540,960,1)
const BOX = { x0: 170, x1: 930, y0: 600, y1: 880 };          // the one AC box
const WALL = { x0: 470, x1: 590 };                            // wall / window frame thickness
const PART = 530;                                             // insulated partition inside the box
const COIL_IN = { x0: 198, x1: 248, y0: 626, y1: 844 };
const BLOWER = { x: 340, y: 740, r: 62 };
const COMP = { x: 595, y: 745, w: 46, h: 96 };
const FANO = { x: 760, y: 742, r: 70 };
const COIL_OUT = { x0: 868, x1: 916, y0: 638, y1: 846 };
const PAN = { y: 862, h: 12 };
export const OUTLET = { x: 915, y: 880 };                     // drain hole at the outdoor end, bottom of the box

// closed refrigerant loop (starts at the indoor-coil inlet)
const LOOP = [[205, 852], [205, 634], [222, 634], [222, 838], [239, 838], [239, 618],    // indoor coil (evaporator)
  [610, 618], [610, 752],                                                               // suction line -> compressor
  [610, 832], [625, 832], [625, 752],                                                   // through the compressor
  [625, 642], [875, 642], [875, 840], [892, 840], [892, 646], [909, 646], [909, 852],    // outdoor coil (condenser)
  [205, 852]];                                                                          // liquid line back to the indoor coil
const IDX = { coilOut: 5, compIn: 7, compOut: 10, condOut: 17 };
const SEG = (() => { const c = [0]; for (let i = 1; i < LOOP.length; i++) c.push(c[i - 1] + Math.hypot(LOOP[i][0] - LOOP[i - 1][0], LOOP[i][1] - LOOP[i - 1][1])); return c; })();
const TOTAL = SEG[SEG.length - 1];
const at = (s) => {
  s = ((s % TOTAL) + TOTAL) % TOTAL;
  let i = 1; while (SEG[i] < s) i++;
  const t = (s - SEG[i - 1]) / (SEG[i] - SEG[i - 1] || 1);
  return [lerp(LOOP[i - 1][0], LOOP[i][0], t), lerp(LOOP[i - 1][1], LOOP[i][1], t)];
};
const BLUE = [63, 169, 245], ORANGE = [255, 122, 26], HOT = [255, 84, 30];
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], clamp(t)))).join(',')})`;
const colourAt = (s) => {
  s = ((s % TOTAL) + TOTAL) % TOTAL;
  const r = (i, j) => (s - SEG[i]) / (SEG[j] - SEG[i]);
  if (s <= SEG[IDX.coilOut]) return mix(BLUE, ORANGE, s / SEG[IDX.coilOut]);
  if (s <= SEG[IDX.compIn]) return mix(ORANGE, ORANGE, 0);
  if (s <= SEG[IDX.compOut]) return mix(ORANGE, HOT, r(IDX.compIn, IDX.compOut));
  if (s <= SEG[IDX.condOut]) return mix(HOT, BLUE, r(IDX.compOut, IDX.condOut));
  return mix(BLUE, BLUE, 0);
};
const pts = (a) => a.map((p) => p.join(',')).join(' ');

// ------------------------------------------------------------------ timing (frames; narration 22.1-33.8 s, 34.1-39.8 s)
const T = {
  heatIn: [680, 770], lead: 728, speed: 16, comp: [800, 846], heatOut: [834, 914],
  beads: 1030, pan: [1060, 1096], flow: [1090, 1150], dropForm: 1170, dropFall: 1180, dropLand: 1192,
};

const HeatArrow = ({ from, to, t, op = 1 }) => {
  if (t <= 0 || t >= 1) return null;
  const x = lerp(from[0], to[0], t), y = lerp(from[1], to[1], t);
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]) * 180 / Math.PI;
  const fade = Math.min(1, t / 0.15, (1 - t) / 0.25);
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`} opacity={fade * op}>
      <path d="M -48 0 L -6 0" stroke={C.heat} strokeWidth="11" strokeLinecap="round" />
      <path d="M -24 -18 L 4 0 L -24 18" fill="none" stroke={C.heat} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
const cyc = (f, start, period, off = 0) => ((((f - start) / period + off) % 1) + 1) % 1;

const Label = ({ x, y, text, op, tip }) => {
  if (op <= 0) return null;
  const w = text.length * 17 + 38;
  return (
    <g opacity={op}>
      {tip && <line x1={x} y1={y + 6} x2={tip[0]} y2={tip[1]} stroke="#0B1E3F" strokeWidth="3" />}
      {tip && <circle cx={tip[0]} cy={tip[1]} r="5" fill="#0B1E3F" />}
      <rect x={x - w / 2} y={y - 31} width={w} height={46} rx={23} fill="rgba(11,30,63,.92)" />
      <text x={x} y={y + 1} textAnchor="middle" fontFamily="InterDisplay" fontWeight="800" fontSize="29" fill="#FFFFFF">{text}</text>
    </g>
  );
};

export const Cutaway2D = ({ f }) => {
  const heatIn = ramp(f, T.heatIn[0], T.heatIn[0] + 10) * (1 - ramp(f, T.heatIn[1], T.heatIn[1] + 12));
  const heatOut = ramp(f, T.heatOut[0], T.heatOut[0] + 10) * (1 - ramp(f, T.heatOut[1], T.heatOut[1] + 12));
  const comp = ramp(f, T.comp[0], T.comp[0] + 8) * (1 - ramp(f, T.comp[1], T.comp[1] + 10));
  const lab = (a, b) => ramp(f, a, a + 10) * (1 - ramp(f, b, b + 10));
  const lead = (f - T.lead) * T.speed;
  const N = 9, gap = TOTAL / N;
  const markers = lead > 0 ? [...Array(N)].map((_, i) => lead - i * gap).filter((s) => s >= 0) : [];
  const trace = clamp(lead / TOTAL);
  const markerFade = 1 - ramp(f, 1012, 1030);
  const beads = [...Array(12)].map((_, i) => ({ x: 202 + (i % 3) * 17 + random(`bx${i}`) * 6, y: 640 + random(`by${i}`) * 190, t0: T.beads + random(`bt${i}`) * 28 }));
  const pan = ramp(f, ...T.pan);
  const flow = ramp(f, T.flow[0], T.flow[0] + 8) * (1 - ramp(f, 1196, 1210));
  const flowLead = clamp((f - T.flow[0]) / (T.flow[1] - T.flow[0]));
  const spin = f * 9;
  return (
    <g>
      {/* room (left) */}
      <rect x={-700} y={-600} width={WALL.x0 + 700} height={3000} fill={C.back} />
      <rect x={-700} y={1300} width={WALL.x0 + 700} height={1200} fill={C.floor} />
      <rect x={-700} y={1278} width={WALL.x0 + 700} height={22} fill={C.trim} />
      {/* outside (right) */}
      <rect x={WALL.x1} y={-600} width={1400} height={3000} fill="url(#skyOut)" />
      <circle cx={1010} cy={420} r={90} fill="#FFF3CF" opacity=".75" />
      {[[650, 1180, 80, 420], [760, 1240, 110, 380], [890, 1150, 70, 450], [990, 1210, 120, 400], [1110, 1170, 90, 430]].map(([x, y, w, h], i) =>
        <rect key={i} x={x} y={y} width={w} height={h} fill={C.city} opacity=".75" />)}
      {/* wall section above the window and below the unit; window frame + lowered sash resting on the unit */}
      {[[-600, 330], [BOX.y1 + 20, 2600]].map(([y0, y1], k) => (
        <g key={k}>
          <rect x={WALL.x0} y={y0} width={WALL.x1 - WALL.x0} height={y1 - y0} fill="#C9B59B" />
          {[...Array(Math.ceil((y1 - y0) / 52))].map((_, i) => <line key={i} x1={WALL.x0} y1={y0 + i * 52} x2={WALL.x1} y2={Math.min(y1, y0 + i * 52 + 60)} stroke="#AE9879" strokeWidth="3" />)}
        </g>
      ))}
      <rect x={WALL.x0 - 6} y={330} width={WALL.x1 - WALL.x0 + 12} height={18} fill={C.trim} />
      <rect x={WALL.x0 - 14} y={BOX.y1} width={WALL.x1 - WALL.x0 + 40} height={20} fill={C.trim} />
      <rect x={516} y={348} width={34} height={BOX.y0 - 348} fill="#F4F6F7" stroke={C.trim} strokeWidth="6" />
      <rect x={524} y={360} width={18} height={BOX.y0 - 372} fill="rgba(170,215,240,.55)" />
      <rect x={510} y={BOX.y0 - 18} width={46} height={18} fill={C.trim} />
      {/* brackets under the outdoor half */}
      <path d={`M ${WALL.x1} 960 L 840 ${BOX.y1 + 4} M ${WALL.x1} ${BOX.y1 + 4} L 900 ${BOX.y1 + 4}`} stroke="#8D949B" strokeWidth="10" strokeLinecap="round" />

      {/* ---------------- the box (cutaway) */}
      <rect x={BOX.x0 + 10} y={BOX.y0 + 16} width={BOX.x1 - BOX.x0} height={BOX.y1 - BOX.y0} rx={18} fill={C.shadow} />
      <rect x={BOX.x0} y={BOX.y0} width={BOX.x1 - BOX.x0} height={BOX.y1 - BOX.y0} rx={18} fill="#4C525A" />
      <rect x={BOX.x0} y={BOX.y0} width={PART - BOX.x0} height={BOX.y1 - BOX.y0} rx={18} fill="#566069" />
      <rect x={PART - 6} y={BOX.y0 + 6} width={12} height={BOX.y1 - BOX.y0 - 12} fill="#2F343A" />
      {/* front grille (room side) */}
      <rect x={BOX.x0} y={BOX.y0} width={22} height={BOX.y1 - BOX.y0} rx={10} fill="#F2F3EF" />
      {[...Array(12)].map((_, i) => <line key={i} x1={BOX.x0 + 4} y1={BOX.y0 + 18 + i * 22} x2={BOX.x0 + 18} y2={BOX.y0 + 26 + i * 22} stroke="#C9CDC8" strokeWidth="3" />)}
      {/* indoor coil */}
      <rect x={COIL_IN.x0} y={COIL_IN.y0} width={COIL_IN.x1 - COIL_IN.x0} height={COIL_IN.y1 - COIL_IN.y0} rx={6} fill="#C8D1DA" />
      {[...Array(28)].map((_, i) => <line key={i} x1={COIL_IN.x0 + 2} y1={COIL_IN.y0 + 4 + i * 7.6} x2={COIL_IN.x1 - 2} y2={COIL_IN.y0 + 4 + i * 7.6} stroke="#9EAAB6" strokeWidth="2" />)}
      {/* blower */}
      <g transform={`translate(${BLOWER.x} ${BLOWER.y})`}>
        <circle r={BLOWER.r} fill="#30353C" />
        <g transform={`rotate(${spin})`}>{[...Array(14)].map((_, i) => <line key={i} transform={`rotate(${i * 360 / 14})`} x1={0} y1={-26} x2={0} y2={-BLOWER.r + 6} stroke="#6A727C" strokeWidth="5" />)}</g>
        <circle r={22} fill="#454B53" />
      </g>
      {/* compressor */}
      <rect x={COMP.x} y={COMP.y} width={COMP.w} height={COMP.h} rx={20} fill={comp > 0.05 ? '#FFB067' : '#2A2E34'} stroke={comp > 0.05 ? C.heat : '#1E2125'} strokeWidth="4" />
      <rect x={COMP.x - 8} y={COMP.y - 8} width={COMP.w + 16} height={COMP.h + 16} rx={26} fill="none" stroke={C.heat} strokeWidth="8" opacity={comp * (0.55 + 0.45 * Math.sin(f / 2.5))} />
      {/* outdoor fan */}
      <g transform={`translate(${FANO.x} ${FANO.y})`}>
        <circle r={FANO.r} fill="#3B4047" />
        <g transform={`rotate(${f * 14})`}>{[0, 90, 180, 270].map((r) => <path key={r} transform={`rotate(${r})`} d="M 0 -6 C 20 -46 52 -54 62 -30 C 65 -14 26 -4 0 6 Z" fill="#8C959F" />)}</g>
        <circle r={12} fill="#C9CED3" />
      </g>
      {/* outdoor coil */}
      <rect x={COIL_OUT.x0} y={COIL_OUT.y0} width={COIL_OUT.x1 - COIL_OUT.x0} height={COIL_OUT.y1 - COIL_OUT.y0} rx={6} fill="#C8D1DA" />
      {[...Array(27)].map((_, i) => <line key={i} x1={COIL_OUT.x0 + 2} y1={COIL_OUT.y0 + 4 + i * 7.6} x2={COIL_OUT.x1 - 2} y2={COIL_OUT.y0 + 4 + i * 7.6} stroke="#9EAAB6" strokeWidth="2" />)}
      {/* drain pan along the bottom, sloping to the outlet at the outdoor end */}
      <rect x={BOX.x0 + 24} y={PAN.y} width={BOX.x1 - BOX.x0 - 30} height={PAN.h} rx={4} fill="#7C8792" />
      <rect x={BOX.x0 + 24} y={PAN.y + PAN.h - 6 * pan} width={BOX.x1 - BOX.x0 - 30} height={6 * pan} fill={C.water} opacity=".9" />
      {flow > 0 && <line x1={BOX.x0 + 30} y1={PAN.y + 7} x2={lerp(BOX.x0 + 30, OUTLET.x, flowLead)} y2={PAN.y + 7} stroke={C.water} strokeWidth="7" strokeLinecap="round" strokeDasharray="20 14" strokeDashoffset={-f * 6} opacity={flow} />}
      <rect x={OUTLET.x - 10} y={BOX.y1 - 6} width={20} height={10} rx={3} fill="#22262B" />
      <rect x={BOX.x0} y={BOX.y0} width={BOX.x1 - BOX.x0} height={BOX.y1 - BOX.y0} rx={18} fill="none" stroke="#E6E8E4" strokeWidth="6" />

      {/* ---------------- refrigerant: copper loop inside the box + markers */}
      <polyline points={pts(LOOP)} fill="none" stroke={C.copper} strokeWidth="8" strokeLinejoin="round" opacity=".95" />
      {trace > 0 && <polyline points={pts(LOOP)} fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" opacity={0.7 * markerFade}
        strokeDasharray={`${TOTAL}`} strokeDashoffset={TOTAL * (1 - trace)} />}
      {markers.map((s, i) => { const [x, y] = at(s); return <circle key={`m${i}`} cx={x} cy={y} r={12} fill={colourAt(s)} stroke="#FFFFFF" strokeWidth="4" opacity={markerFade} />; })}

      {/* ---------------- 1. room heat -> indoor coil (through the front grille) */}
      {heatIn > 0 && [722, 782, 838].map((y, i) => [0, 0.5].map((o) => (
        <HeatArrow key={`hi${i}${o}`} from={[-20, y]} to={[188, y]} t={cyc(f, T.heatIn[0] + i * 7, 44, o)} op={heatIn} />)))}
      {/* cool air back into the room (upper front, wavy — not arrows) */}
      {f < 1205 && [640, 672].map((y, i) => (
        <path key={`c${i}`} d={`M 165 ${y} q -60 -10 -110 10 q -50 20 -110 6`} fill="none" stroke={C.cool} strokeWidth="6" strokeLinecap="round"
          strokeDasharray="30 36" strokeDashoffset={f * 4 + i * 20} opacity=".7" />))}
      {/* ---------------- 4. outdoor coil -> outside air */}
      {heatOut > 0 && [[[925, 680], [1050, 600]], [[925, 742], [1060, 742]], [[925, 806], [1050, 880]]].map(([p, q], i) => [0, 0.5].map((o) => (
        <HeatArrow key={`ho${i}${o}`} from={p} to={q} t={cyc(f, T.heatOut[0] + i * 6, 42, o)} op={heatOut} />)))}

      {/* ---------------- water: beads on the indoor coil -> pan -> outlet -> drop outside */}
      {f >= T.beads && f < 1210 && beads.map((d, i) => {
        const g = clamp((f - d.t0) / 14), fall = clamp((f - d.t0 - 24) / 10);
        if (g <= 0 || fall >= 1) return null;
        return <circle key={`w${i}`} cx={d.x} cy={lerp(d.y, PAN.y + 4, fall * fall)} r={5.5 * g} fill={C.water} stroke="#2F8FD0" strokeWidth="1.5" />;
      })}
      <Drop f={f} x={OUTLET.x} y0={OUTLET.y + 6} y1={OUTLET.y + 6 + 87} start={T.dropFall} land={T.dropLand} form={T.dropFall - T.dropForm} ripple={false} through />

      {/* ---------------- labels next to the parts */}
      <Label x={224} y={560} text="Indoor coil" tip={[224, 628]} op={lab(684, 1150)} />
      <Label x={845} y={560} text="Outdoor coil" tip={[892, 640]} op={lab(826, 1150)} />
      <Label x={596} y={560} text="Compressor" tip={[618, 748]} op={lab(796, 900)} />
      <Label x={400} y={958} text="Refrigerant" tip={[400, 852]} op={lab(752, 800)} />
      <Label x={790} y={1020} text="Drain outlet" tip={[915, 884]} op={lab(1092, 1152)} />
    </g>
  );
};
