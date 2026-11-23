import { Composition } from 'remotion';
import { MirrorFaceID } from './MirrorFaceID';
import { DEFAULT_TEST, FPS, TOTAL } from './script';

export const Root: React.FC = () => (
  <Composition id="MirrorFaceID" component={MirrorFaceID} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920}
    defaultProps={DEFAULT_TEST} />
);
