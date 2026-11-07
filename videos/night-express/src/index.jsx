import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {NightExpress} from './NightExpress';

const Root = () => (
	<Composition id="NightExpress" component={NightExpress} durationInFrames={500} fps={30} width={1920} height={1080} />
);
registerRoot(Root);
