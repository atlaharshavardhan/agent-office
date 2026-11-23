import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { C, clamp, ramp } from '../theme';
import { DI, PHONE, PhoneFront } from './Phone';

// Scene 2 (2.5–6 s, 105 frames): match cut from the reflected screen to the iPhone graphic,
// then one quick push into the TrueDepth sensor area.
const PUSH = [86, 101];

export const TrueDepth: React.FC = () => {
  const fr = useCurrentFrame();
  const settle = ramp(fr, 0, 6, 2.5, 1);
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
        <PhoneFront glow={ramp(fr, PUSH[0] + 4, PUSH[1], 1, 0.35)} />
      </div>
    </AbsoluteFill>
  );
};
