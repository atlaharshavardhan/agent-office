import { useCurrentFrame } from 'remotion';
import { HandPhone } from './HandPhone';

// Scene 2 (2.5–6 s): stays on the phone in his hand (continues the hook's last shot, 30 frames in):
// zoom to its Dynamic Island and the Face ID animation. PhoneReveal.tsx (separate 3D phone) is unused.
export const TrueDepth: React.FC = () => <HandPhone f={30 + useCurrentFrame()} />;
