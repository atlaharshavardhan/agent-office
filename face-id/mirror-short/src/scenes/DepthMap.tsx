import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import data from '../dots.json';
import { C, FONT, Label, clamp, ramp } from '../theme';
import { FaceStage, WARP_PX, toScreen, toSource } from './FaceStage';

// Scene 3 (10–19 s, 270 frames): the pattern on the face -> measured depth points -> depth map.
const Z = 1.2, O: [number, number] = [330, 600], DY = 150;
const NOSE = { x: 221, y: 648, d: 1.0 }, EYE = { x: 325, y: 552, d: 0.3 };
const CYAN = '#7fe3ea';

const Call: React.FC<{ title: string; sub: string; x: number; y: number; o: number }> = ({ title, sub, x, y, o }) => (
  <div style={{ position: 'absolute', left: x, top: y, opacity: o, padding: '12px 18px', background: 'rgba(10,8,7,.6)', borderRadius: 10 }}>
    <div style={{ font: `800 32px/1 ${FONT}`, letterSpacing: '0.14em', color: '#fff' }}>{title}</div>
    <div style={{ font: `600 27px/1 ${FONT}`, color: '#c9c2bb', marginTop: 10 }}>{sub}</div>
  </div>
);

export const DepthMap: React.FC = () => {
  const l = useCurrentFrame();
  const t = interpolate(l, [0, 10, 45, 95, 115, 180, 215], [0, 0, 1, -0.7, 0, 0, 0.6], clamp);
  const warp = ramp(l, 8, 30);
  const early = ramp(l, 14, 18) * (1 - ramp(l, 108, 112));      // "nose and cheeks" callouts
  const cyanAt = (d: number[]) => 116 + ((d[0] - 150) / 530) * 16 + d[3] * 4;   // sweep: camera reads the pattern
  const toMap = ramp(l, 165, 172);
  const dotFade = 1 - ramp(l, 168, 176);
  const late = ramp(l, 182, 186);
  const pt = (p: { x: number; y: number; d: number }) => toScreen(p.x + data.A * t * p.d + WARP_PX * warp * p.d, p.y, Z, O, DY);
  const [nx, ny] = pt(NOSE), [ex, ey] = pt(EYE);
  const stat = ramp(l, 126, 130) * (1 - ramp(l, 162, 165));
  return (
    <AbsoluteFill>
      <FaceStage t={t} zoom={Z} origin={O} dy={DY} warp={warp} dark={1} faceO={1 - ramp(l, 166, 173)} depthO={toMap}
        rays={{ from: toSource(-60, 700, Z, O, DY), o: 1 - ramp(l, 108, 116) }}
        dotO={() => dotFade}
        dotColor={(d) => (l >= cyanAt(d) ? CYAN : C.ir)} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g opacity={early} stroke="#fff" strokeWidth={2.5} fill="#fff">
          <path d={`M 330 740 L ${ex} ${ey}`} fill="none" /><circle cx={ex} cy={ey} r={7} />
          <path d={`M 190 1290 L ${nx} ${ny}`} fill="none" /><circle cx={nx} cy={ny} r={7} />
        </g>
        {late > 0 && <g opacity={late} stroke={C.label} strokeWidth={3} fill="none">
          <path d={`M ${nx - 12} ${ny} L 380 ${ny + 120}`} /><circle cx={nx} cy={ny} r={9} fill={C.label} />
          <path d={`M ${ex - 10} ${ey - 6} L 380 ${ey - 170}`} /><circle cx={ex} cy={ey} r={9} fill={C.label} />
        </g>}
      </svg>
      <Call title="EYE SOCKET" sub="farther: the pattern shifts less" x={70} y={650} o={early} />
      <Call title="NOSE" sub="closer: the pattern shifts more" x={70} y={1290} o={early} />
      <div style={{ position: 'absolute', left: 70, width: 870, top: 1400, textAlign: 'center', opacity: stat, color: CYAN, font: `800 104px/1 ${FONT}` }}>
        30,000+ <span style={{ fontSize: 42, letterSpacing: '0.06em' }}>DEPTH POINTS</span>
      </div>
      <Label text="NOSE · CLOSEST" x={90} y={ny + 100} o={late} size={30} />
      <Label text="EYES · SET BACK" x={90} y={ey - 220} o={late} size={30} />
      <Label text="DEPTH MAP" x={505} y={1420} o={ramp(l, 172, 176)} align="center" />
      <div style={{ position: 'absolute', left: 820, top: 520, opacity: ramp(l, 176, 180), display: 'flex', gap: 14, alignItems: 'stretch', font: `800 24px/1 ${FONT}`, color: C.label, letterSpacing: '0.12em' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 240 }}><span>NEAR</span><span>FAR</span></div>
        <div style={{ width: 22, height: 240, borderRadius: 11, background: 'linear-gradient(#fff, #000)', border: `2px solid ${C.violet}` }} />
      </div>
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: 0.5 * (1 - toMap), font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>Illustration · fewer dots drawn than fired</div>
    </AbsoluteFill>
  );
};
