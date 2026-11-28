import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FPS, prog, lerp, easeOut, easeInOut } from '../lib/anim';
import { FONT } from '../lib/palette';
import { Night } from '../dusk/Extras';
import { IPhone } from '../dusk/Phone';
import { Photo } from './Arrive';

/* S1 opening beat of Part 2 (9:16 only): Meera, in London, takes the photo. Camera screen, shutter tap, white flash, the photo lands in the corner,
   a "3 MB" tag shows how big it is. 3 s, then the packets clip takes over. */
export const SNAP_FRAMES = 90;
const K = 2.2, LEFT = 280, TOP = 330;
export const Snap: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const pop = prog(f, 0, 0.35, easeOut), press = prog(f, 1.0, 1.12), flash = prog(f, 1.12, 1.2) * (1 - prog(f, 1.2, 1.6, easeOut)), thumb = prog(f, 1.35, 1.8, easeOut), tag = prog(f, 1.9, 2.3, easeOut);
  const drift = Math.sin(t * 1.6) * 3, zoom = 1 + 0.03 * easeInOut(Math.min(1, t / 1.2));
  return (
    <AbsoluteFill style={{ backgroundColor: '#070a22' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}><Night id="sn" f={f} stars={90} /></svg>
      <IPhone left={LEFT} top={TOP} o={pop} name="" avatar="#000" k={K}>
        <div style={{ position: 'absolute', left: -9, right: -9, top: -62, bottom: -9, background: '#000' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: -50, height: 292, overflow: 'hidden', borderRadius: 8 }}>
          <div style={{ width: 218, height: 292, transform: `scale(${zoom}) translate(${drift * 0.2}px, 0)`, transformOrigin: '50% 45%' }}>
            <svg width={218} height={292} viewBox="0 0 190 190" preserveAspectRatio="xMidYMid slice"><Photo /></svg>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 253, textAlign: 'center', font: `800 10px ${FONT.ui}`, color: '#ffd60a', letterSpacing: '.08em' }}>PHOTO</div>
        <div style={{ position: 'absolute', left: 109 - 24, top: 272, width: 48, height: 48, borderRadius: 24, border: '3px solid #fff', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 38, height: 38, borderRadius: 19, background: '#fff', transform: `scale(${1 - 0.14 * press * (1 - thumb)})` }} />
        </div>
        <div style={{ position: 'absolute', left: 14, top: 278, width: 36, height: 36, borderRadius: 7, border: '2px solid #fff', overflow: 'hidden', opacity: thumb, transform: `scale(${lerp(1.8, 1, thumb)})`, background: '#14183c' }}>
          <svg width={36} height={36} viewBox="0 0 190 190"><Photo /></svg></div>
        <div style={{ position: 'absolute', inset: -9, background: '#fff', opacity: flash * 0.9 }} />
      </IPhone>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 232, display: 'flex', justifyContent: 'center', opacity: tag }}>
        <div style={{ padding: '12px 30px', borderRadius: 30, background: 'rgba(10,14,36,.88)', border: '3px solid #5fe3ff', font: `800 36px/1 ${FONT.ui}`, color: '#fff', whiteSpace: 'nowrap' }}>photo · 3 MB</div></div>
    </AbsoluteFill>
  );
};
