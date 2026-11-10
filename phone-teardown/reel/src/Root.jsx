import { Composition } from 'remotion';
import { Reel, FPS, DURATION_S } from './Reel';

export const Root = () => (
  <Composition
    id="DuoReel"
    component={Reel}
    durationInFrames={Math.round(DURATION_S * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
