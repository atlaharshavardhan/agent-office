import React from 'react';
import { AbsoluteFill } from 'remotion';
import { WK, setWide } from './wide';
/* draws a tall-layout scene full-screen in a 1920 x 1080 frame */
export const WideWrap: React.FC<{ bg?: string; children: React.ReactNode }> = ({ bg = '#070a22', children }) => {
  setWide(true);
  return <AbsoluteFill style={{ backgroundColor: bg, overflow: 'hidden' }}>
    <style>{'.widewrap svg{overflow:visible}'}</style>
    <div className="widewrap" style={{ position: 'absolute', left: 960 - 540 * WK, top: 540 - 960 * WK + 16, width: 1080, height: 1920, transform: `scale(${WK})`, transformOrigin: '0 0' }}>{children}</div>
  </AbsoluteFill>; };
