import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { C, Label, ramp } from '../theme';
import { Scan3D } from './Scan3D';

// Scene 3 (6–19 s, 390 frames). s = local frame.
//   0– 60  tight side profile: the phone faces him; quick push to the TrueDepth sensor area
//  60–180  cut to his face from the phone's viewpoint -> infrared camera view; the dot pattern
//          appears in one capture and stays pinned to the skin
// 180–300  capture frozen: nose tip = closer, cheek = farther; dots -> shaded depth map (aligned)
// 300–390  only the reconstructed depth map turns slightly
// From 60 on the head is a real 3D relief (Head3D): it turns a few degrees while it is scanned.
const VIEW = { x: 180, y: 240, w: 460 }, K = 1080 / VIEW.w;          // crop of bathroom_side.png (941 x 1672)
const CAM = [(507 - VIEW.x) * K, (603 - VIEW.y) * K];               // top of the phone, facing him

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

// From s = 60 the 3D scan plays (Scan3D): the iPhone fires the dots, they fly through space and land
// on his head, turn cyan as depth points, and the head becomes a 3D depth map. Its 349-frame
// timeline is stretched slightly to fill the 330 frames up to 0:19.
export const Scan: React.FC = () => {
  const s = useCurrentFrame();
  return s < 60 ? <Side s={s} /> : <Scan3D g={((s - 60) * 349) / 330} />;
};
