import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { FPS, HOOK_CUTS } from '../script';
import { clamp } from '../theme';

// Digital push on excerpt 3 (keyed to source time) so the generated phone's round camera
// cutout is pushed out of frame before it becomes the focus; the glow stays centred.
const PUSH = { t: [2.77, 3.0, 3.25, 3.5, 3.77], s: [1.0, 1.25, 1.6, 1.85, 2.0], cx: [0.6, 0.61, 0.55, 0.5, 0.5], cy: [0.5, 0.5, 0.57, 0.49, 0.45] };

const Clip: React.FC<{ srcStart: number; push?: boolean }> = ({ srcStart, push }) => {
  const fr = useCurrentFrame();
  let style: React.CSSProperties = { width: 1080, height: 1920, objectFit: 'cover' };
  if (push) {
    const t = srcStart + fr / FPS;
    const s = interpolate(t, PUSH.t, PUSH.s, clamp);
    const cx = Math.min(Math.max(interpolate(t, PUSH.t, PUSH.cx, clamp), 0.5 / s), 1 - 0.5 / s);
    const cy = Math.min(Math.max(interpolate(t, PUSH.t, PUSH.cy, clamp), 0.5 / s), 1 - 0.5 / s);
    style = { ...style, transformOrigin: '0 0', transform: `translate(${540 - cx * 1080 * s}px, ${960 - cy * 1920 * s}px) scale(${s})` };
  }
  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <OffthreadVideo src={staticFile('mirror_clip.mp4')} trimBefore={Math.round(srcStart * FPS)} muted style={style} />
    </AbsoluteFill>
  );
};

export const Hook: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      {HOOK_CUTS.map((c, i) => {
        const el = (
          <Sequence key={c.name} name={c.name} from={from} durationInFrames={c.dur} layout="none">
            <Clip srcStart={c.srcStart} push={i === 2} />
          </Sequence>
        );
        from += c.dur;
        return el;
      })}
    </AbsoluteFill>
  );
};
