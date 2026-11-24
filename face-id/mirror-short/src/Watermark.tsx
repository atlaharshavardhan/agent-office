import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';

// Channel rule 15/22: logo + @TheInvisiTech on every Short. A clear one at the right edge,
// vertical centre (clear of the like/comment column), softly blended; plus a faint one drifting
// through the middle so it can't be cropped off. Not shown on the end card.
export const Watermark: React.FC = () => {
  const fr = useCurrentFrame();
  const k = fr / 1470;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <Img src={staticFile('watermark-clear.png')} style={{ position: 'absolute', right: 34, top: fr >= 180 && fr < 204 ? 560 : 965,   // moved up while the phone is held there
        height: 50, opacity: 0.42, mixBlendMode: 'screen', filter: 'saturate(0.85)' }} />
      <Img src={staticFile('watermark-clear.png')} style={{ position: 'absolute', left: 160 + 220 * k, top: 760 + 260 * Math.sin(k * Math.PI), height: 64, opacity: 0.07, mixBlendMode: 'screen' }} />
    </AbsoluteFill>
  );
};
