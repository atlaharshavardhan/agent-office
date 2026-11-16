import React from 'react';
/* One switch for the picture shape, so every V4 scene can render as 16:9 or as the 9:16 Short from the same code. */
export const F = { W: 1920, H: 1080, v: false };
export const setFrame = (v: boolean) => { F.v = v; F.W = v ? 1080 : 1920; F.H = v ? 1920 : 1080; };
/* a tall frame needs a wider lens to keep the same things in view */
export const vfov = (fov: number) => (F.v ? Math.min(86, fov * 1.72) : fov);
/* where a fixed title sits: unchanged in 16:9; in the Short it moves into the title zone at the top, because the spoken captions own the lower third */
export const tr = (x: number, y: number) => { if (!F.v) return `translate(${x} ${y})`; const left = x < 700, top = y < 560; return `translate(${left ? 70 : 540} ${top ? 300 + Math.max(0, y - 150) * 0.35 : 290}) scale(${left ? (top ? 0.92 : 1.2) : 0.8})`; };
/* keep a pinned label inside the safe part of the Short */
export const clampX = (x: number, w: number) => (F.v ? Math.max(w / 2 + 30, Math.min(940 - w / 2, x)) : x);
export const Vert: React.FC<{ children: React.ReactNode }> = ({ children }) => { setFrame(true); return <>{children}</>; };
export const Horiz: React.FC<{ children: React.ReactNode }> = ({ children }) => { setFrame(false); return <>{children}</>; };
/* a dark edge round fixed titles, so they read over bright parts of the picture */
export const EDGE = { style: { paintOrder: 'stroke', stroke: '#070a22', strokeWidth: 7, strokeLinejoin: 'round' } as React.CSSProperties };
