import '@fontsource/inter/500.css';
import '@fontsource/inter/700.css';
import { Composition } from 'remotion';
import { DUR, FPS, VacuumTeardown } from './VacuumTeardown';

export const Root: React.FC = () => (
  <Composition id="VacuumTeardown" component={VacuumTeardown} durationInFrames={DUR} fps={FPS} width={1080} height={1920} />
);
