import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {WomanScene} from './WomanScene';

const Root = () => <Composition id="WomanScene" component={WomanScene} durationInFrames={590} fps={30} width={1920} height={1080} />;
registerRoot(Root);
