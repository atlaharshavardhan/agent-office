import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ResendOtp} from './ResendOtp';
import {WomanSegment} from './WomanSegment';

const Root = () => (
	<>
		<Composition id="ResendOtp" component={ResendOtp} durationInFrames={300} fps={30} width={1080} height={1920} />
		<Composition id="WomanSegment" component={WomanSegment} durationInFrames={690} fps={30} width={1080} height={1920} />
	</>
);
registerRoot(Root);
