import { Composition } from 'remotion';
import { MirrorFaceID } from './MirrorFaceID';
import { PhoneStill } from './scenes/Reveal';
import { DEFAULT_TEST, FPS, TOTAL } from './script';

export const Root: React.FC = () => (
  <>
  <Composition id="PhoneStill" component={PhoneStill} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  <Composition id="MirrorFaceID" component={MirrorFaceID} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920}
    defaultProps={DEFAULT_TEST} />
  </>
);
