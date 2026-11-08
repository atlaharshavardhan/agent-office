import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ResendOtp} from './ResendOtp';

const Root = () => <Composition id="ResendOtp" component={ResendOtp} durationInFrames={300} fps={30} width={1080} height={1920} />;
registerRoot(Root);
