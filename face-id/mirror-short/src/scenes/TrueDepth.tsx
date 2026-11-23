import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, FACE, Label, clamp, ramp } from '../theme';
import { FaceStage } from './FaceStage';
import { DI, PHONE, PhoneFront } from './Phone';

// Scene 2 (2.5–10 s, 225 frames). Local frames.
const CUT_TO_FACE = 114;   // 6.3 s
const PUSH = [88, 102];    // quick push into the TrueDepth area, 5.4–5.9 s

export const TrueDepth: React.FC = () => {
  const fr = useCurrentFrame();
  if (fr < CUT_TO_FACE) {
    // match cut: starts as a full-screen glow (like the reflected screen), settles to the phone
    const settle = ramp(fr, 0, 6, 2.05, 1);
    const push = ramp(fr, PUSH[0], PUSH[1], 0, 1);
    const drift = 1 + 0.16 * ramp(fr, 6, PUSH[0], 0, 1, (x) => x);   // keep moving while the line plays
    const s = settle * drift * (1 + 3.6 * push * push);
    const diY = PHONE.cy - PHONE.h / 2 + 13 + DI.top + DI.h / 2;
    const oy = interpolate(push, [0, 1], [900, diY], clamp);
    const ty = interpolate(push, [0, 1], [0, 960 - diY], clamp);
    return (
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 40% at 50% 45%, #2a1d14 0%, #120d0a 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, transformOrigin: `540px ${oy}px`, transform: `translateY(${ty}px) scale(${s})` }}>
          <PhoneFront glow={ramp(fr, PUSH[0] + 4, PUSH[1], 1, 0.35)} emit={ramp(fr, 92, 100)} t={fr} />
        </div>
      </AbsoluteFill>
    );
  }
  const l = fr - CUT_TO_FACE;               // 0..110
  const z = 1 + 0.05 * (l / 110);
  // phone in the foreground, bottom of frame; its Dynamic Island fires the dots up at the face
  const PH = { dx: 70, dy: 1166 };
  const di: [number, number] = [540 + PH.dx, PHONE.cy - PHONE.h / 2 + 13 + DI.top + DI.h / 2 + PH.dy];
  // Dots appear directly on the skin, spreading out from the nose and eyes (no flying lights).
  const HIT = { x: 290, y: 610 };                       // source px: between nose and eye
  const appear = (d: number[]) => 8 + (Math.hypot(d[0] - HIT.x, d[1] - HIT.y) / 430) * 36 + d[3] * 5;
  const spread = ramp(l, 8, 48);
  const beamO = ramp(l, 2, 6) * (1 - ramp(l, 52, 60));
  const hx = HIT.x * FACE.s, hy = HIT.y * FACE.s - 5, hw = 50 + 190 * spread;
  return (
    <AbsoluteFill>
      <FaceStage t={0} zoom={z} ir={1}
        dotO={(d) => ramp(l, appear(d), appear(d) + 3)}
        dotR={(d) => (1.4 + 0.9 * d[2]) * (1 + 0.8 * (1 - ramp(l, appear(d), appear(d) + 6)))} />
      {/* narrow infrared beam from the Dynamic Island to the face */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}>
        <defs>
          <linearGradient id="beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={C.ir} stopOpacity="0.7" /><stop offset="1" stopColor={C.ir} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polygon points={`${di[0] - 10},${di[1]} ${di[0] + 10},${di[1]} ${hx + hw},${hy} ${hx - hw},${hy}`} fill="url(#beam)" opacity={beamO * (0.75 + 0.25 * Math.sin(l * 1.7))} />
        <circle cx={di[0]} cy={di[1]} r={22} fill={C.ir} opacity={beamO} />
        <circle cx={di[0]} cy={di[1]} r={9} fill="#fff" opacity={beamO} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${PH.dx}px, ${PH.dy}px)` }}>
        <PhoneFront glow={0.22} />
      </div>
      <Label text="INFRARED DOTS" x={90} y={330} o={ramp(l, 44, 47) * (1 - ramp(l, 104, 108))} color={C.ir} />
    </AbsoluteFill>
  );
};
