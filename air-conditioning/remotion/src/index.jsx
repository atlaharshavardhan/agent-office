import React from 'react';
import { Composition, Still, registerRoot } from 'remotion';
import { StylePreview } from './style/StylePreview';
import { BuildPreview } from './style/BuildPreview';
import { AirConditioning } from './ac/Short';
import { TOTAL, FPS, W, H } from './ac/timeline';

const Root = () => (
  <>
    <Composition id="AirConditioning" component={AirConditioning} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    {['room_closed', 'room_ac', 'outside_ac'].map((s) => <Still key={s} id={`Style-${s.replace('_', '-')}`} component={StylePreview} width={W} height={H} defaultProps={{ shot: s }} />)}
    {['w_closed', 'w_open', 'w_fan', 'w_ice'].map((s) => <Still key={s} id={`Build-${s.replace('_', '-')}`} component={BuildPreview} width={W} height={H} defaultProps={{ shot: s }} />)}
  </>
);

registerRoot(Root);
