import { useCurrentFrame } from 'remotion';
import { Scan3D } from './Scan3D';

// Scene 3 (10–19 s): continues the 3D scan that starts at the end of scene 2 (79 frames earlier).
export const DepthMap: React.FC = () => <Scan3D g={79 + useCurrentFrame()} />;
