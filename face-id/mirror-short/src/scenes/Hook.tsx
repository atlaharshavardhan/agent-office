import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, HOOK, SCENES, f } from '../script';
import { HandPhone } from './HandPhone';

// The rear mirror take. `k` = frame of the hook (for the slow settle at the start and the blur into the match cut).
const Take: React.FC<{ k: number }> = ({ k }) => (
  <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
    <OffthreadVideo src={staticFile('mirror_clip_lock.mp4')} trimBefore={Math.round(HOOK.srcStart * FPS)} muted
      style={{ width: 1080, height: 1920, objectFit: 'cover', transformOrigin: '62% 36%',
        // a slow push while the first frame is held, eased back out during the take's own rush so it ends at the footage's own framing
        transform: `scale(${1 + 0.12 * Math.min(1, k / HOOK.freeze) * (1 - Math.min(1, Math.max(0, (k - HOOK.freeze - 20) / 22)))})` }} />
  </AbsoluteFill>
);
const Playing: React.FC = () => <Take k={HOOK.freeze + useCurrentFrame()} />;
const Held: React.FC = () => { const k = useCurrentFrame(); return <Freeze frame={0}><Take k={k} /></Freeze>; };
const Hand: React.FC = () => <HandPhone f={HOOK.handF + useCurrentFrame()} />;

export const Hook: React.FC = () => {
  const end = f(SCENES.hook[1]);
  return (
    <AbsoluteFill>
      <Sequence name="Hook · rear mirror angle (first frame held)" from={0} durationInFrames={HOOK.freeze} layout="none"><Held /></Sequence>
      <Sequence name="Hook · rear mirror take, pushes into the reflected phone" from={HOOK.freeze} durationInFrames={HOOK.cut - HOOK.freeze} layout="none"><Playing /></Sequence>
      <Sequence name="Hook · match cut to the phone, push to the Dynamic Island" from={HOOK.cut} durationInFrames={end - HOOK.cut} layout="none"><Hand /></Sequence>
    </AbsoluteFill>
  );
};
