import React from 'react';
import { Composition, Still, registerRoot } from 'remotion';
import { StylePreview } from './style/StylePreview';
import { AirConditioning } from './ac/Short';
import { TOTAL, FPS, W, H } from './ac/timeline';

const Root = () => (
  <>
    <Composition id="AirConditioning" component={AirConditioning} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    {['room_closed', 'room_ac', 'outside_ac'].map((s) => <Still key={s} id={`Style-${s.replace('_', '-')}`} component={StylePreview} width={W} height={H} defaultProps={{ shot: s }} />)}
  </>
);

registerRoot(Root);
