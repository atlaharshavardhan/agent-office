import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { FONT, ramp } from '../theme';

// Scene 7 (43–45 s, exactly 60 frames).
export const EndCard: React.FC = () => {
  const l = useCurrentFrame();
  const a = ramp(l, 0, 14);
  return (
    <AbsoluteFill style={{ backgroundColor: '#0e0b09', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ opacity: a, transform: `translate(-20px, -60px) scale(${0.98 + 0.02 * a})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <Img src={staticFile('logo.png')} style={{ width: 150, height: 150, borderRadius: 75 }} />
        <div style={{ font: `800 96px/1 ${FONT}`, color: '#f6f1ea', letterSpacing: '-0.01em' }}>InvisiTech</div>
        <div style={{ font: `600 36px/1 ${FONT}`, color: '#b9aa96' }}>@TheInvisiTech</div>
      </div>
    </AbsoluteFill>
  );
};
