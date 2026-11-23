import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, Label, clamp, ramp } from '../theme';
import { FaceStage } from './FaceStage';
import { DI, PHONE, PhoneFront } from './Phone';

// Scene 2 (2.5–10 s, 225 frames). Local frames.
const CUT_TO_FACE = 114;   // 6.3 s
const PUSH = [63, 105];    // push into the TrueDepth area, 4.6–6.0 s

export const TrueDepth: React.FC = () => {
  const fr = useCurrentFrame();
  if (fr < CUT_TO_FACE) {
    // match cut: starts as a full-screen glow (like the reflected screen), settles to the phone
    const settle = ramp(fr, 0, 16, 2.05, 1);
    const push = ramp(fr, PUSH[0], PUSH[1], 0, 1);
    const s = settle * (1 + 3.6 * push * push);
    const diY = PHONE.cy - PHONE.h / 2 + 13 + DI.top + DI.h / 2;
    const oy = interpolate(push, [0, 1], [900, diY], clamp);
    const ty = interpolate(push, [0, 1], [0, 960 - diY], clamp);
    return (
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 40% at 50% 45%, #2a1d14 0%, #120d0a 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, transformOrigin: `540px ${oy}px`, transform: `translateY(${ty}px) scale(${s})` }}>
          <PhoneFront glow={ramp(fr, PUSH[0] + 10, PUSH[1], 1, 0.35)} emit={ramp(fr, 80, 100)} t={fr} />
        </div>
      </AbsoluteFill>
    );
  }
  const l = fr - CUT_TO_FACE;               // 0..111
  return (
    <AbsoluteFill>
      <FaceStage t={0} zoom={1 + 0.05 * (l / 111)}
        dotO={(d) => ramp(l, 6 + d[3] * 50, 12 + d[3] * 50)}
        dotR={(d) => (1.5 + 1.1 * d[2]) * (1 + 1.6 * (1 - ramp(l, 6 + d[3] * 50, 16 + d[3] * 50)))} />
      <Label text="INFRARED DOTS" x={90} y={330} o={ramp(l, 36, 44) * (1 - ramp(l, 100, 108))} />
    </AbsoluteFill>
  );
};
