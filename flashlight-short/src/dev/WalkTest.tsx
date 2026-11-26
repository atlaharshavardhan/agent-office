import { AbsoluteFill } from 'remotion';
import { Svg, Person, FRD } from '../kit';
import { walkPose } from '../storyboard';
export const WalkTest: React.FC = () => (
  <AbsoluteFill style={{ background: '#55607a' }}><Svg>
    {[0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].map((ph, i) => <g key={i} transform={`translate(${(i % 4) * 260 + 10} ${Math.floor(i / 4) * 950 + 20}) scale(0.85)`}><Person who="friend" pal={FRD} pose={walkPose(ph)} /></g>)}
  </Svg></AbsoluteFill>
);
