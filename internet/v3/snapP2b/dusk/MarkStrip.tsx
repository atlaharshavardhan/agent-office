import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import '@fontsource/manrope/700.css';
import { FONT } from '../lib/palette';
/* the horizontal watermark, rendered once as a see-through PNG (420 x 64) and laid over the film in the final join */
export const MarkStrip: React.FC = () => (
  <AbsoluteFill style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
    <Img src={staticFile('logo.png')} style={{ width: 46, height: 46, borderRadius: 23 }} />
    <span style={{ font: `700 32px ${FONT.ui}`, color: '#fff', letterSpacing: '0.01em', textShadow: '0 2px 6px rgba(0,0,0,.55)' }}>@TheInvisiTech</span>
  </AbsoluteFill>);
