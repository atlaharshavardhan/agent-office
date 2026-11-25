import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { HOOK, SCENES, f } from '../script';
import { HandPhone, TEAR as HAND_TEAR } from './HandPhone';

// Scene 2: stays on the phone in his hand (continues the hook's last shot): the push ends on its Dynamic Island as the
// TrueDepth parts appear; they are named, then explained one at a time.
const LEAD = HOOK.handF + f(SCENES.hook[1]) - HOOK.cut;
export const TEAR = HAND_TEAR - LEAD;
const DUR = f(SCENES.truedepth[1]) - f(SCENES.truedepth[0]), PX = 497, PY = 905;      // PX, PY: the dot projector in the island
const rnd = (i: number) => { const x = Math.sin((i + 1) * 78.233) * 43758.5453; return x - Math.floor(x); };
// The shot does not just cut to the dots: in its last third of a second the projector fires, a burst of red dots flies out
// of the island toward us and fills the frame, and the dots clip picks them up in mid-air. One action across the cut.
export const TrueDepth: React.FC = () => {
  const fr = useCurrentFrame(), t = fr - (DUR - 11), k = Math.max(0, t) / 11;
  return (
    <AbsoluteFill>
      <HandPhone f={LEAD + fr} />
      {t > 0 && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs><radialGradient id="td-fire"><stop offset="0" stopColor="#ff4d63" stopOpacity={0.95} /><stop offset="1" stopColor="#ff4d63" stopOpacity={0} /></radialGradient></defs>
        <circle cx={PX} cy={PY} r={40 + 1500 * k * k} fill="url(#td-fire)" opacity={0.75 * k} />
        {Array.from({ length: 150 }, (_, i) => { const a = rnd(i) * Math.PI * 2, sp = 0.25 + 0.75 * rnd(i + 200), u = Math.max(0, k - 0.25 * rnd(i + 400)) * sp, d = 1500 * u * u + 60 * u;
          return u > 0 ? <circle key={i} cx={PX + Math.cos(a) * d} cy={PY + Math.sin(a) * d} r={3 + 16 * u} fill="#ff6b7d" opacity={0.9} /> : null; })}
      </svg>}
    </AbsoluteFill>
  );
};
