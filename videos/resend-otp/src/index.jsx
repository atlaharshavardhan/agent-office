import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ResendOtp} from './ResendOtp';
import {WomanSegment} from './WomanSegment';
import {ResendTap} from './ResendTap';

const Root = () => (
	<>
		<Composition id="ResendOtp" component={ResendOtp} durationInFrames={300} fps={30} width={1920} height={1080} />
		<Composition id="WomanSegment" component={WomanSegment} durationInFrames={690} fps={30} width={1920} height={1080} />
		<Composition id="ResendTap" component={ResendTap} durationInFrames={150} fps={30} width={1920} height={1080} />
	</>
);
registerRoot(Root);
