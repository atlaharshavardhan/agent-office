import React from 'react';
import { Composition } from 'remotion';
import { Prototype } from './Prototype';

export const Root: React.FC = () => (
  <>
    <Composition id="Prototype" component={Prototype} durationInFrames={240} fps={30} width={1080} height={1920} />
  </>
);
