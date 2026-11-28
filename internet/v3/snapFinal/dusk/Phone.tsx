import React from 'react';
import { FONT } from '../lib/palette';

/* A small, realistic iPhone drawn in code (dark titanium body, Dynamic Island, status bar, Messages screen).
   Size is fixed at PW x PH; position it with left/top. `o` (0..1) pops it in and out. */
export const PW = 236, PH = 484, SCR = { x: 9, y: 9, w: PW - 18, h: PH - 18 };
const BLUE = '#0a84ff';
/* v18: the iPhone 18 Pro look (Cherry burgundy aluminium frame, smaller Dynamic Island, Camera Control button). Off by default so Part 1 stays as it was. */
export const IPhone: React.FC<{ left: number; top: number; o: number; name: string; avatar: string; k?: number; v18?: boolean | 'silver'; children: React.ReactNode }> = ({ left, top, o, name, avatar, k = 1, v18, children }) => (
  <div style={{ position: 'absolute', left, top, width: PW, height: PH, transform: `scale(${k})`, transformOrigin: '0 0' }}>
  <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, opacity: Math.min(1, o * 1.6), transform: `scale(${0.82 + 0.18 * o})`, transformOrigin: '50% 60%', filter: 'drop-shadow(0 26px 40px rgba(0,0,0,.6))', fontFamily: FONT.ui }}>
    {/* side buttons */}
    <div style={{ position: 'absolute', left: -3, top: 96, width: 4, height: 22, borderRadius: 2, background: v18 === 'silver' ? '#b9bcc4' : v18 ? '#8a3a4c' : '#5d6068' }} />
    <div style={{ position: 'absolute', left: -3, top: 132, width: 4, height: 40, borderRadius: 2, background: v18 === 'silver' ? '#b9bcc4' : v18 ? '#8a3a4c' : '#5d6068' }} />
    <div style={{ position: 'absolute', left: -3, top: 180, width: 4, height: 40, borderRadius: 2, background: v18 === 'silver' ? '#b9bcc4' : v18 ? '#8a3a4c' : '#5d6068' }} />
    <div style={{ position: 'absolute', right: -3, top: 150, width: 4, height: 62, borderRadius: 2, background: v18 === 'silver' ? '#b9bcc4' : v18 ? '#8a3a4c' : '#5d6068' }} />
    {v18 && <div style={{ position: 'absolute', right: -3, top: 330, width: 4, height: 34, borderRadius: 2, background: v18 === 'silver' ? '#d3d5da' : '#b45a6e' }} />}
    {/* titanium frame, then the black bezel, then the screen */}
    <div style={{ position: 'absolute', inset: 0, borderRadius: 46, background: v18 === 'silver' ? 'linear-gradient(135deg,#f4f4f6,#b9bcc4 30%,#8a8d96 60%,#e9eaee)' : v18 ? 'linear-gradient(135deg,#d9929f,#8a2e43 30%,#5a1a2b 60%,#c2788a)' : 'linear-gradient(135deg,#a9acb4,#4a4c54 30%,#2c2d33 60%,#8d9098)' }} />
    <div style={{ position: 'absolute', inset: 3, borderRadius: 43, background: '#050506' }} />
    <div style={{ position: 'absolute', left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, borderRadius: 37, background: '#000', overflow: 'hidden' }}>
      {/* status bar */}
      <div style={{ position: 'absolute', left: 22, top: 11, font: `800 13px ${FONT.ui}`, color: '#fff' }}>9:41</div>
      <div style={{ position: 'absolute', left: '50%', top: 8, width: v18 ? 46 : 66, height: v18 ? 18 : 20, marginLeft: v18 ? -23 : -33, borderRadius: 10, background: '#000', boxShadow: 'inset 0 0 0 1px #18181b' }}><div style={{ position: 'absolute', right: 9, top: 6, width: 8, height: 8, borderRadius: 4, background: '#12131c', boxShadow: 'inset 0 0 0 1px #24263a' }} /></div>
      <svg width={52} height={14} style={{ position: 'absolute', right: 16, top: 12 }}>
        {[0, 1, 2, 3].map((k) => <rect key={k} x={k * 4.4} y={9 - k * 2.4} width={3} height={3 + k * 2.4} rx={0.8} fill="#fff" />)}
        <path d="M21 5.2 a7.5 7.5 0 0 1 10.6 0 M23 7.6 a4.6 4.6 0 0 1 6.6 0" stroke="#fff" strokeWidth={1.7} fill="none" strokeLinecap="round" /><circle cx={26.3} cy={10.4} r={1.3} fill="#fff" />
        <rect x={35.5} y={2.5} width={14} height={9} rx={2.6} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={1} /><rect x={37} y={4} width={9.5} height={6} rx={1.4} fill="#fff" /><rect x={50.3} y={5.3} width={1.4} height={3.4} rx={0.7} fill="#fff" fillOpacity={0.5} />
      </svg>
      {/* Messages header */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 34, height: 62, background: 'rgba(28,28,30,.96)', borderBottom: '1px solid #2c2c2e' }}>
        <svg width={12} height={20} style={{ position: 'absolute', left: 10, top: 14 }}><path d="M9 2 L2 10 L9 18" stroke={BLUE} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{ position: 'absolute', left: '50%', top: 6, width: 30, height: 30, marginLeft: -15, borderRadius: 15, background: avatar, display: 'grid', placeItems: 'center', font: `800 15px ${FONT.ui}`, color: '#fff' }}>{name[0]}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 39, textAlign: 'center', font: `700 12px ${FONT.ui}`, color: '#fff' }}>{name} <span style={{ color: '#8e8e93' }}>›</span></div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 96, bottom: 0 }}>{children}</div>
      {/* home indicator */}
      <div style={{ position: 'absolute', left: '50%', bottom: 5, width: 84, height: 4, marginLeft: -42, borderRadius: 2, background: '#fff', opacity: 0.85 }} />
    </div>
  </div></div>);

export const Bubble: React.FC<{ mine?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({ mine, children, style }) => (
  <div style={{ width: 'fit-content', maxWidth: 170, marginLeft: mine ? 'auto' : 0, background: mine ? BLUE : '#26252a', color: '#fff', borderRadius: mine ? '17px 17px 5px 17px' : '17px 17px 17px 5px', padding: '6px 12px', font: `700 17px ${FONT.ui}`, ...style }}>{children}</div>);

/* the compose row: text field + round blue send arrow */
export const Compose: React.FC<{ bottom: number; text: React.ReactNode; press?: boolean; ready?: boolean }> = ({ bottom, text, press, ready }) => (
  <div style={{ position: 'absolute', left: 8, right: 8, bottom, height: 32, display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{ width: 26, height: 26, borderRadius: 13, background: '#2c2c2e', display: 'grid', placeItems: 'center', font: `700 18px ${FONT.ui}`, color: '#8e8e93', lineHeight: 1 }}>+</div>
    <div style={{ flex: 1, height: 30, borderRadius: 15, border: '1px solid #3a3a3c', display: 'flex', alignItems: 'center', padding: '0 4px 0 11px', font: `600 15px ${FONT.ui}`, color: '#fff' }}>
      <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden' }}>{text}</div>
      <div style={{ width: 23, height: 23, borderRadius: 12, background: ready ? BLUE : '#3a3a3c', display: 'grid', placeItems: 'center', transform: `scale(${press ? 1.35 : 1})`, boxShadow: press ? `0 0 14px 4px ${BLUE}` : 'none' }}>
        <svg width={12} height={13}><path d="M6 12 V2 M2 6 L6 2 L10 6" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
    </div>
  </div>);

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
/* a small iOS-style keyboard; `hit` is the key being tapped right now */
export const Keyboard: React.FC<{ hit?: string }> = ({ hit }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 142, background: '#1b1b1d', padding: '6px 3px 0' }}>
    {ROWS.map((r, ri) => <div key={ri} style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 6 }}>
      {ri === 2 && <div style={{ width: 25, height: 26, borderRadius: 5, background: '#3a3a3c', marginRight: 3, display: 'grid', placeItems: 'center', font: `700 12px ${FONT.ui}`, color: '#fff' }}>⇧</div>}
      {r.split('').map((c) => { const on = hit === c; return <div key={c} style={{ width: 18.3, height: 26, borderRadius: 5, background: on ? '#e9e9ee' : '#6b6b70', color: on ? '#000' : '#fff', display: 'grid', placeItems: 'center', font: `700 13px ${FONT.ui}`, transform: on ? 'scale(1.5) translateY(-7px)' : 'none', zIndex: on ? 2 : 1, position: 'relative' }}>{c}</div>; })}
      {ri === 2 && <div style={{ width: 25, height: 26, borderRadius: 5, background: '#3a3a3c', marginLeft: 3, display: 'grid', placeItems: 'center', font: `700 12px ${FONT.ui}`, color: '#fff' }}>⌫</div>}
    </div>)}
    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
      <div style={{ width: 44, height: 26, borderRadius: 5, background: '#3a3a3c', display: 'grid', placeItems: 'center', font: `700 11px ${FONT.ui}`, color: '#fff' }}>123</div>
      <div style={{ width: 106, height: 26, borderRadius: 5, background: '#6b6b70', display: 'grid', placeItems: 'center', font: `600 11px ${FONT.ui}`, color: '#fff' }}>space</div>
      <div style={{ width: 52, height: 26, borderRadius: 5, background: '#3a3a3c', display: 'grid', placeItems: 'center', font: `700 11px ${FONT.ui}`, color: '#fff' }}>return</div>
    </div>
  </div>);
