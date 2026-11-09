import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

// "Resend code" tap shot, 1920×1080 (YouTube 16:9), 30 fps, 150 frames.
// Same background as the existing shot (navy, big soft circles, faint dots, "…" chat bubbles),
// without the stray caption box; button motion rebuilt.
const C = {
	bg: '#0B1430',
	circle: '#0F1C44',
	bubble: '#1A2A63',
	bubbleDot: '#3A4F95',
	star: '#3A4F95',
	frame: '#2E3D78',
	frameEdge: '#3D4E90',
	screen: '#121C45',
	box: '#18245A',
	boxLine: '#33437F',
	text: '#FFFFFF',
	muted: '#8D9AC8',
	coral: '#FF6B4A',
	badge: '#FFC83A',
	skin: '#F2A877',
	skinShade: '#DE8F5E',
	nail: '#FBD3B8',
};
const FONT = 'Inter, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const io = Easing.bezier(0.65, 0, 0.35, 1);

const TAPS = [64, 90, 114];

// ───────── background ─────────
const STARS = Array.from({length: 30}, (_, i) => ({x: (i * 379 + 60) % 1900, y: (i * 701 + 140) % 1060, r: 2.5 + (i % 3), s: (i * 0.37) % 1}));

const ChatBubble = ({x, y, w, rot, f, k}) => (
	<div style={{position: 'absolute', left: x, top: y + Math.sin(f / 30 + k) * 10, transform: `rotate(${rot + Math.sin(f / 40 + k) * 2}deg)`}}>
		<div style={{position: 'relative', width: w, height: w * 0.62, borderRadius: w * 0.26, background: C.bubble, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: w * 0.08}}>
			{[0, 1, 2].map((d) => (
				<div key={d} style={{width: w * 0.12, height: w * 0.12, borderRadius: '50%', background: C.bubbleDot, opacity: 0.6 + 0.4 * Math.sin(f / 6 - d * 0.9 + k)}} />
			))}
			<div style={{position: 'absolute', bottom: -w * 0.12, left: w * 0.16, width: 0, height: 0, borderLeft: `${w * 0.1}px solid transparent`, borderRight: `${w * 0.1}px solid transparent`, borderTop: `${w * 0.18}px solid ${C.bubble}`, transform: 'rotate(18deg)'}} />
		</div>
	</div>
);

const Background = ({f}) => (
	<AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
		{/* big soft circles, slow drift (far layer) */}
		{[
			{x: 230, y: 170, r: 360, k: 0},
			{x: 1780, y: 660, r: 380, k: 2},
			{x: 360, y: 1080, r: 260, k: 4},
		].map((c, i) => (
			<div key={i} style={{position: 'absolute', left: c.x - c.r + Math.sin(f / 80 + c.k) * 18, top: c.y - c.r + Math.cos(f / 90 + c.k) * 18, width: c.r * 2, height: c.r * 2, borderRadius: '50%', background: C.circle}} />
		))}
		{/* faint dots */}
		{STARS.map((s, i) => (
			<div key={i} style={{position: 'absolute', left: s.x, top: s.y - f * 0.15, width: s.r * 2, height: s.r * 2, borderRadius: '50%', background: C.star, opacity: 0.5 + 0.5 * Math.sin(f / 12 + s.s * 20)}} />
		))}
		{/* chat bubbles (near layer, a bit faster) */}
		<ChatBubble x={250} y={330 - f * 0.4} w={140} rot={-6} f={f} k={0} />
		<ChatBubble x={1500} y={190 - f * 0.4} w={110} rot={8} f={f} k={1.5} />
		<ChatBubble x={1560} y={860 - f * 0.4} w={150} rot={-5} f={f} k={3} />
		<ChatBubble x={330} y={800 - f * 0.4} w={100} rot={6} f={f} k={4.5} />
	</AbsoluteFill>
);

// ───────── phone ─────────
const PW = 393;
const PH = 820;

const StatusBar = () => (
	<div style={{position: 'absolute', top: 0, left: 0, width: PW, height: 54, color: C.text, fontFamily: FONT}}>
		<div style={{position: 'absolute', left: 44, top: 18, fontSize: 17, fontWeight: 800}}>9:41</div>
		<div style={{position: 'absolute', left: (PW - 116) / 2, top: 12, width: 116, height: 34, borderRadius: 18, background: '#050914'}} />
		<div style={{position: 'absolute', right: 30, top: 20, display: 'flex', alignItems: 'center', gap: 6}}>
			<svg width="19" height="12" viewBox="0 0 19 12">
				{[0, 1, 2, 3].map((i) => (
					<rect key={i} x={i * 5} y={9 - i * 3} width="3.4" height={3 + i * 3} rx="1" fill="#fff" />
				))}
			</svg>
			<span style={{fontSize: 14, fontWeight: 800}}>5G</span>
			<svg width="27" height="13" viewBox="0 0 27 13">
				<rect x="0.75" y="0.75" width="22.5" height="11.5" rx="3.5" fill="none" stroke="#fff" strokeWidth="1.5" />
				<rect x="2.6" y="2.6" width="18.8" height="7.8" rx="2" fill="#fff" />
				<rect x="24.4" y="4.2" width="1.8" height="4.6" rx="0.9" fill="#fff" />
			</svg>
		</div>
	</div>
);

// ───────── composition ─────────
export const ResendTap = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();

	// camera: wide → close-up on the button
	const push = interpolate(f, [16, 52], [0, 1], {...clamp, easing: io});
	const camS = 1 + push * 0.62;

	// tap physics
	let press = 0;
	let shake = 0;
	let count = 0;
	TAPS.forEach((t, i) => {
		const d = f - t;
		press = Math.max(press, interpolate(d, [-4, 0, 6], [0, 1, 0], clamp));
		if (d >= 0) {
			count = i + 1;
			shake += [4, 8, 13][i] * Math.exp(-d / 5) * Math.sin(d * 2.1);
		}
	});
	// thumb: enters, then dips on each tap
	const enter = interpolate(f, [40, 60], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
	const lift = TAPS.reduce((m, t) => Math.min(m, interpolate(Math.abs(f - t), [0, 9], [0, 1], clamp)), 1);
	const exit = interpolate(f, [128, 146], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});

	// phone geometry in phone points; button centre
	const btn = {x: PW / 2, y: 560, w: 230, h: 62};
	const sc = 1.05; // phone scale in the wide shot
	const phoneLeft = 960 - ((PW + 26) * sc) / 2;
	const phoneTop = 540 - ((PH + 26) * sc) / 2 + 10;
	const btnStageY = phoneTop + (13 + btn.y) * sc;

	return (
		<AbsoluteFill>
			<Background f={f} />
			<AbsoluteFill style={{transform: `scale(${camS})`, transformOrigin: `960px ${btnStageY - 150}px`}}>
				{/* phone */}
				<div style={{position: 'absolute', left: phoneLeft, top: phoneTop, width: PW + 26, height: PH + 26, transform: `scale(${sc})`, transformOrigin: '0 0'}}>
					<div style={{position: 'relative', width: PW + 26, height: PH + 26, borderRadius: 64, background: C.frame, padding: 13, boxSizing: 'border-box', boxShadow: `0 30px 60px rgba(0,0,0,0.45), inset 0 0 0 2px ${C.frameEdge}`}}>
						<div style={{position: 'relative', width: PW, height: PH, borderRadius: 52, overflow: 'hidden', background: C.screen, fontFamily: FONT}}>
							<StatusBar />
							<div style={{position: 'absolute', top: 136, width: '100%', textAlign: 'center', color: C.text, fontSize: 31, fontWeight: 800, letterSpacing: -0.5}}>Verify it's you</div>
							<div style={{position: 'absolute', top: 182, width: '100%', textAlign: 'center', color: C.muted, fontSize: 16, fontWeight: 500}}>Enter the 6-digit code we sent</div>
							<div style={{position: 'absolute', top: 300, width: '100%', display: 'flex', justifyContent: 'center', gap: 8}}>
								{Array.from({length: 6}, (_, i) => (
									<div key={i} style={{width: 50, height: 68, borderRadius: 12, background: C.box, border: `2px solid ${C.boxLine}`, boxSizing: 'border-box'}} />
								))}
							</div>
							<div style={{position: 'absolute', top: 498, width: '100%', textAlign: 'center', color: C.muted, fontSize: 15, fontWeight: 500}}>Didn't get a code?</div>

							{/* tap ripples: pill-shaped rings growing out of the button, in front of it, never over the label */}
							{TAPS.map((t, i) => {
								const p = interpolate(f - t, [0, 16], [0, 1], clamp);
								if (f < t || p >= 1) return null;
								const grow = Easing.out(Easing.cubic)(p);
								return (
									<div
										key={i}
										style={{
											position: 'absolute',
											left: btn.x - btn.w / 2,
											top: btn.y - btn.h / 2,
											width: btn.w,
											height: btn.h,
											borderRadius: btn.h / 2,
											border: `4px solid ${C.coral}`,
											boxSizing: 'border-box',
											opacity: 0.85 * (1 - p),
											transform: `scale(${1 + grow * 0.22}, ${1 + grow * 0.28})`,
										}}
									/>
								);
							})}

							{/* button */}
							<div
								style={{
									position: 'absolute',
									left: btn.x - btn.w / 2,
									top: btn.y - btn.h / 2,
									width: btn.w,
									height: btn.h,
									borderRadius: btn.h / 2,
									background: C.coral,
									color: '#fff',
									display: 'grid',
									placeItems: 'center',
									fontSize: 21,
									fontWeight: 800,
									letterSpacing: -0.2,
									boxShadow: `0 ${10 - press * 7}px ${22 - press * 14}px rgba(0,0,0,${0.4 - press * 0.15})`,
									transform: `translateX(${shake}px) rotate(${shake * 0.3}deg) scale(${1 + press * 0.04}, ${1 - press * 0.08})`,
								}}
							>
								Resend code
								{count > 0 && (
									<div
										style={{
											position: 'absolute',
											right: -12,
											top: -16,
											width: 38,
											height: 38,
											borderRadius: 19,
											background: C.badge,
											color: '#1d1400',
											display: 'grid',
											placeItems: 'center',
											fontSize: 20,
											fontWeight: 800,
											boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
											transform: `scale(${spring({frame: f - TAPS[count - 1], fps, config: {damping: 8, stiffness: 260}}) * 1})`,
										}}
									>
										{count}
									</div>
								)}
							</div>
							<div style={{position: 'absolute', bottom: 10, left: (PW - 120) / 2, width: 120, height: 4, borderRadius: 2, background: '#fff', opacity: 0.85}} />
						</div>
					</div>
				</div>

				{/* thumb (flat), fingertip lands on the button's lower right */}
				{(() => {
					const tipX = phoneLeft + (13 + btn.x + 92) * sc + (enter + exit) * 300;
					const tipY = phoneTop + (13 + btn.y + 26) * sc + (enter + exit) * 500 + lift * 24 - press * 4;
					return (
						<svg width="460" height="900" viewBox="-60 -40 460 900" style={{position: 'absolute', left: tipX - 60 * 0.42, top: tipY - 40 * 0.42, transform: 'scale(0.42)', transformOrigin: '0 0', overflow: 'visible'}}>
							<g transform="rotate(-28)">
								<rect x="-56" y="-30" width="150" height="760" rx="75" fill={C.skin} />
								<path d="M 70 40 Q 92 300 70 720" stroke={C.skinShade} strokeWidth="38" fill="none" strokeLinecap="round" />
								<rect x="-30" y="-12" width="96" height="112" rx="46" fill={C.nail} />
							</g>
						</svg>
					);
				})()}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
