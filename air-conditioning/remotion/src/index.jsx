import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { AirConditioning } from './ac/Short';
import { TOTAL, FPS, W, H } from './ac/timeline';

const Root = () => (
  <Composition id="AirConditioning" component={AirConditioning} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);

registerRoot(Root);
