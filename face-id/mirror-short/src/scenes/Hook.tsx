import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { FPS, HOOK, SCENES, f } from '../script';
import { HandPhone } from './HandPhone';

// The rear mirror take. `k` = frame of the hook (for the slow settle at the start and the blur into the match cut).
const Take: React.FC<{ k: number }> = ({ k }) => (
  <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
    <OffthreadVideo src={staticFile('mirror_clip.mp4')} trimBefore={Math.round(HOOK.srcStart * FPS)} muted
      style={{ width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${1 + 0.03 * Math.min(1, k / HOOK.freeze)})`,
        filter: k > HOOK.cut - 4 ? `blur(${(k - (HOOK.cut - 4)) * 2}px)` : undefined }} />
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
