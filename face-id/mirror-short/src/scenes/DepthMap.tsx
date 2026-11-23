import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import data from '../dots.json';
import { C, FACE, FONT, Label, clamp, ramp } from '../theme';
import { FaceStage, WARP_PX } from './FaceStage';

// Scene 3 (10–19 s, 270 frames).
const Z = 1.2, O: [number, number] = [330, 600];
const NOSE = { x: 221, y: 648, d: 1.0 }, EYE = { x: 325, y: 552, d: 0.3 };
const SPOT = { x: 280, y: 630 };  // nose + near cheek

const disp = (x: number, y: number) => [(O[0] + (x - O[0]) * Z) * FACE.s, (O[1] + (y - O[1]) * Z) * FACE.s - 5];

export const DepthMap: React.FC = () => {
  const l = useCurrentFrame();
  const t = interpolate(l, [0, 15, 75, 135, 160, 205, 270], [0, 0, 1, -0.7, 0, 0, 0.6], clamp);
  const warp = ramp(l, 10, 60);
  const spot = ramp(l, 15, 30) * (1 - ramp(l, 110, 140));
  const toMap = ramp(l, 160, 195);
  const dotFade = 1 - ramp(l, 178, 205);
  const call = ramp(l, 205, 215);
  const pt = (p: { x: number; y: number; d: number }) => disp(p.x + data.A * t * p.d + WARP_PX * warp * p.d, p.y);
  const [nx, ny] = pt(NOSE), [ex, ey] = pt(EYE);
  return (
    <AbsoluteFill>
      <FaceStage t={t} zoom={Z} origin={O} warp={warp} faceDim={1 - ramp(l, 150, 175)} faceO={1 - ramp(l, 172, 200)} depthO={toMap}
        dotO={(d) => {
          const dist = Math.hypot(d[0] - SPOT.x, d[1] - SPOT.y);
          const dim = 1 - 0.7 * spot * Math.min(1, Math.max(0, (dist - 110) / 120));
          return dim * dotFade;
        }} />
      {/* nose / cheek spotlight ring */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {(() => { const [sx, sy] = disp(SPOT.x + data.A * t * 0.8 + WARP_PX * warp * 0.8, SPOT.y); return (
          <ellipse cx={sx} cy={sy} rx={245} ry={230} fill="none" stroke={C.ir} strokeWidth={3} strokeDasharray="10 12" opacity={spot * 0.8} />); })()}
        {call > 0 && <g opacity={call} stroke={C.label} strokeWidth={3} fill="none">
          <path d={`M ${nx - 12} ${ny} L 380 ${ny + 120}`} /><circle cx={nx} cy={ny} r={9} fill={C.label} />
          <path d={`M ${ex - 10} ${ey - 6} L 380 ${ey - 170}`} /><circle cx={ex} cy={ey} r={9} fill={C.label} />
        </g>}
      </svg>
      <Label text="NOSE · CLOSEST" x={90} y={ny + 100} o={call} size={30} />
      <Label text="EYES · SET BACK" x={90} y={ey - 220} o={call} size={30} />
      <Label text="DEPTH MAP" x={90} y={300} o={ramp(l, 188, 198)} />
      {/* near / far legend */}
      <div style={{ position: 'absolute', left: 830, top: 300, opacity: ramp(l, 195, 210), display: 'flex', gap: 14, alignItems: 'stretch', font: `800 24px/1 ${FONT}`, color: C.label, letterSpacing: '0.12em' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 240 }}><span>NEAR</span><span>FAR</span></div>
        <div style={{ width: 22, height: 240, borderRadius: 11, background: 'linear-gradient(#fff, #000)', border: `2px solid ${C.violet}` }} />
      </div>
    </AbsoluteFill>
  );
};
