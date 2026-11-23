import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, FONT, Label, clamp, ramp } from '../theme';
import { Head3D, headPoint } from './Head3D';

// Scene 3 (6–19 s, 390 frames). s = local frame.
//   0– 60  tight side profile: the phone faces him; quick push to the TrueDepth sensor area
//  60–180  cut to his face from the phone's viewpoint -> infrared camera view; the dot pattern
//          appears in one capture and stays pinned to the skin
// 180–300  capture frozen: nose tip = closer, cheek = farther; dots -> shaded depth map (aligned)
// 300–390  only the reconstructed depth map turns slightly
// From 60 on the head is a real 3D relief (Head3D): it turns a few degrees while it is scanned.
const VIEW = { x: 180, y: 240, w: 460 }, K = 1080 / VIEW.w;          // crop of bathroom_side.png (941 x 1672)
const CAM = [(507 - VIEW.x) * K, (603 - VIEW.y) * K];               // top of the phone, facing him
const NOSE = { x: 221, y: 648, d: 1.0 }, CHEEK = { x: 292, y: 700, d: 0.53 };

const Side: React.FC<{ s: number }> = ({ s }) => {
  const push = ramp(s, 40, 58, 0, 1, (x) => x * x);
  const z = (1 + 0.03 * (s / 40)) * (1 + 2.4 * push);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: `${CAM[0]}px ${CAM[1]}px`, transform: `translate(${(540 - CAM[0]) * push}px, ${(960 - CAM[1]) * push}px) scale(${z})` }}>
        <Img src={staticFile('bathroom_side.png')} style={{ position: 'absolute', left: -VIEW.x * K, top: -VIEW.y * K, width: 941 * K, height: 1672 * K }} />
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: ramp(s, 6, 10) * (1 - ramp(s, 38, 42)) }}>
        <path d={`M ${CAM[0]} ${CAM[1] - 20} V 716`} stroke={C.label} strokeWidth={3} />
        <circle cx={CAM[0]} cy={CAM[1]} r={9} fill="none" stroke={C.label} strokeWidth={3} />
      </svg>
      <Label text="TRUEDEPTH CAMERA" x={CAM[0]} y={660} o={ramp(s, 6, 10) * (1 - ramp(s, 38, 42))} size={28} align="center" color={C.label} />
    </AbsoluteFill>
  );
};

const Mark: React.FC<{ x: number; y: number; text: string; lx: number; ly: number; o: number }> = ({ x, y, text, lx, ly, o }) => (
  <>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: o }}>
      <path d={`M ${lx - 60} ${ly + 2} L ${x} ${y}`} stroke="#fff" strokeWidth={3} fill="none" />
      <circle cx={x} cy={y} r={15} fill="none" stroke={C.amber} strokeWidth={4} /><circle cx={x} cy={y} r={5} fill="#fff" />
    </svg>
    <div style={{ position: 'absolute', left: lx, top: ly, opacity: o, transform: 'translateX(-100%)', padding: '12px 20px', borderRadius: 10, background: 'rgba(10,8,7,.72)', border: `2px solid ${C.amber}`, font: `800 36px/1 ${FONT}`, letterSpacing: '0.12em', color: '#fff' }}>{text}</div>
  </>
);

export const Scan: React.FC = () => {
  const s = useCurrentFrame();
  if (s < 60) return <Side s={s} />;
  const zoom = interpolate(s, [60, 180], [1, 1.06], clamp);            // slow push, frozen from the capture on
  const toIr = ramp(s, 70, 75);
  const dots = ramp(s, 84, 87) * (1 - ramp(s, 250, 268));              // one quick capture; fades into the depth map
  const toDepth = ramp(s, 238, 262);
  // the head is a 3D object: it turns slowly during the scan, holds still while the capture is frozen,
  // and only the finished depth reconstruction turns at the end
  const az = interpolate(s, [60, 180, 300, 332, 366, 390], [-7, 7, 7, -11, 9, 3], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const [nx, ny] = headPoint(NOSE, az, zoom), [cx, cy] = headPoint(CHEEK, az, zoom);
  const freeze = ramp(s, 180, 183);
  const corner = (x: number, y: number, dx: number, dy: number) => `M ${x + dx * 46} ${y} H ${x} V ${y + dy * 46}`;
  return (
    <AbsoluteFill>
      <Head3D az={az} zoom={zoom} irMix={toIr} depthMix={toDepth} dotO={dots} />
      {/* capture flash + frame brackets when the frame is frozen */}
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: 0.22 * ramp(s, 84, 85) * (1 - ramp(s, 85, 89)) }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: freeze * (1 - ramp(s, 296, 300)) }} stroke="#fff" strokeWidth={4} fill="none">
        <path d={corner(120, 520, 1, 1)} /><path d={corner(900, 520, -1, 1)} /><path d={corner(120, 1500, 1, -1)} /><path d={corner(900, 1500, -1, -1)} />
      </svg>
      <Label text="INFRARED CAMERA VIEW" x={505} y={445} o={toIr * (1 - ramp(s, 238, 244))} size={28} align="center" color={C.label} />
      <Label text="DEPTH MAP" x={505} y={445} o={ramp(s, 250, 256)} size={28} align="center" color={C.label} />
      <Mark x={nx} y={ny} text="CLOSER" lx={250} ly={ny + 150} o={ramp(s, 192, 196) * (1 - ramp(s, 380, 386))} />
      <Mark x={cx} y={cy} text="FARTHER" lx={860} ly={cy + 190} o={ramp(s, 204, 208) * (1 - ramp(s, 380, 386))} />
      <div style={{ position: 'absolute', left: 80, top: 1562, opacity: 0.5 * toIr * (1 - toDepth), font: `600 22px/1 ${FONT}`, color: '#b5ada5' }}>Illustration · the real dots are invisible · fewer dots drawn than projected</div>
    </AbsoluteFill>
  );
};
