import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';

// ───────── design tokens ─────────
const T = {
	bg: '#0B1630',
	panel: '#13234A',
	line: '#2C4378',
	text: '#EAF0FF',
	muted: '#8FA3D1',
	coral: '#FF6B4A',
	amber: '#F5A623',
	grey: '#5B6782',
	red: '#E5484D',
};
const FONT = 'Inter, sans-serif';
const W = 1920;
const H = 1080;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const io = Easing.bezier(0.65, 0, 0.35, 1);
const SHADOW = '0 18px 40px rgba(0,0,0,0.35), 0 4px 10px rgba(0,0,0,0.25)';

// ───────── timeline (frames @ 30 fps), snapped to the generated voice ─────────
// Voice start frames. Line lengths (s): 1.96 1.66 2.67 2.62 2.24 2.88 4.52 · PA 2.05
export const VO = {l01: 8, l03: 99, l04: 185, l05: 269, l06: 342, l07: 437};
export const S = {
	s2: 0, // her phone, now                               "But it's not always this fast."
	dive: 56, // time rewind: clock spins 9:41 → 9:21, blue-grey tint, film grain
	s3: 96, // Verify screen, thumb taps Send code          "At the last station, she asked for a code,"
	tap: 156,
	s4: 182, // pull out: crowd + one tower                 "with hundreds of people on one tower."
	s5: 266, // push into the queue                         "Her code got stuck in the queue."
	s6: 342, // her card drops into her phone, EXPIRED      "It arrived minutes later, already expired."
	grey: 390,
	stamp: 398,
	s7: 435, // life of a code                              "A code only lives a few minutes, so a late code is a dead code."
	end: 590,
};

const useSpr = (at, config = {damping: 14, stiffness: 170}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: f - at, fps, config});
};

// ───────── shared visuals ─────────
// Background (same as the Resend tap shot): navy, big soft circles, faint dots, "…" chat bubbles.
// Two parallax layers: circles drift slowly (far), chat bubbles float up faster (near).
const BG = {base: '#0B1430', circle: '#0F1C44', bubble: '#1A2A63', dot: '#3A4F95'};
const STARS = Array.from({length: 30}, (_, i) => ({x: (i * 379 + 60) % 1900, y: (i * 701 + 140) % 1060, r: 2.5 + (i % 3), s: (i * 0.37) % 1}));

const ChatBubble = ({x, y, w, rot, f, k}) => (
	<div style={{position: 'absolute', left: x, top: y + Math.sin(f / 30 + k) * 10, transform: `rotate(${rot + Math.sin(f / 40 + k) * 2}deg)`}}>
		<div style={{position: 'relative', width: w, height: w * 0.62, borderRadius: w * 0.26, background: BG.bubble, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: w * 0.08}}>
			{[0, 1, 2].map((d) => (
				<div key={d} style={{width: w * 0.12, height: w * 0.12, borderRadius: '50%', background: BG.dot, opacity: 0.6 + 0.4 * Math.sin(f / 6 - d * 0.9 + k)}} />
			))}
			<div style={{position: 'absolute', bottom: -w * 0.12, left: w * 0.16, width: 0, height: 0, borderLeft: `${w * 0.1}px solid transparent`, borderRight: `${w * 0.1}px solid transparent`, borderTop: `${w * 0.18}px solid ${BG.bubble}`, transform: 'rotate(18deg)'}} />
		</div>
	</div>
);

const Bubbles = ({f}) => {
	const wrapY = (y) => ((y % 1240) + 1240) % 1240 - 160;
	return (
		<AbsoluteFill style={{background: BG.base, overflow: 'hidden'}}>
			{[
				{x: 230, y: 170, r: 360, k: 0},
				{x: 1780, y: 660, r: 380, k: 2},
				{x: 360, y: 1080, r: 260, k: 4},
			].map((c, i) => (
				<div key={i} style={{position: 'absolute', left: c.x - c.r + Math.sin(f / 80 + c.k) * 18, top: c.y - c.r + Math.cos(f / 90 + c.k) * 18, width: c.r * 2, height: c.r * 2, borderRadius: '50%', background: BG.circle}} />
			))}
			{STARS.map((st, i) => (
				<div key={i} style={{position: 'absolute', left: st.x, top: wrapY(st.y - f * 0.15 + 160), width: st.r * 2, height: st.r * 2, borderRadius: '50%', background: BG.dot, opacity: 0.5 + 0.5 * Math.sin(f / 12 + st.s * 20)}} />
			))}
			<ChatBubble x={250} y={wrapY(330 - f * 0.4 + 160)} w={140} rot={-6} f={f} k={0} />
			<ChatBubble x={1500} y={wrapY(190 - f * 0.4 + 160)} w={110} rot={8} f={f} k={1.5} />
			<ChatBubble x={1560} y={wrapY(860 - f * 0.4 + 160)} w={150} rot={-5} f={f} k={3} />
			<ChatBubble x={330} y={wrapY(800 - f * 0.4 + 160)} w={100} rot={6} f={f} k={4.5} />
		</AbsoluteFill>
	);
};

const Grain = ({f, opacity = 0.06}) => (
	<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none', mixBlendMode: 'overlay'}}>
		<filter id="grain">
			<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 97} stitchTiles="stitch" />
			<feColorMatrix type="saturate" values="0" />
		</filter>
		<rect width={W} height={H} filter="url(#grain)" />
	</svg>
);

const Chip = ({text, show, top = 48, left = null, color = T.amber, dark = '#2a1a00'}) => (
	<div style={{position: 'absolute', top: top - (1 - show) * 90, ...(left === null ? {width: '100%', justifyContent: 'center'} : {left}), display: 'flex', opacity: show, zIndex: 20}}>
		<div style={{padding: '12px 26px', borderRadius: 999, background: color, color: dark, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 3, boxShadow: SHADOW}}>{text}</div>
	</div>
);

// ───────── brand + headline (same as the Resend OTP video) ─────────
const HEAD = 'Poppins, sans-serif';
const Brand = () => (
	<div style={{position: 'absolute', top: 44, left: 56, display: 'flex', zIndex: 30}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px', borderRadius: 999, background: '#16244f', boxShadow: '0 6px 16px rgba(0,0,0,0.3)', fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: '#fff', letterSpacing: 0.5}}>
			<span style={{width: 16, height: 16, borderRadius: 5, background: '#4C9BFF', transform: 'rotate(45deg)'}} />
			InvisiTech
		</div>
	</div>
);
// Left-column headline; words pop in at absolute frames. lines: [{size, words: [{text, at, color}]}]
const Headline = ({f, fps, lines, top = 330, out = 1e9}) => {
	const o = interpolate(f, [out, out + 8], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', top, left: 110, width: 960, fontFamily: HEAD, fontWeight: 800, color: '#fff', lineHeight: 1.12, opacity: o, zIndex: 10}}>
			{lines.map((line, li) => (
				<div key={li} style={{fontSize: line.size || 96, marginBottom: 6}}>
					{line.words.map((w, wi) => {
						const sv = spring({frame: f - w.at, fps, config: {damping: 12, stiffness: 200}});
						return (
							<span key={wi} style={{display: 'inline-block', marginRight: '0.24em', color: w.color || '#fff', opacity: Math.min(1, sv * 1.5), transform: `translateY(${(1 - sv) * 40}px) scale(${0.6 + 0.4 * sv})`, textShadow: '0 6px 14px rgba(0,0,0,0.35)'}}>
								{w.text}
							</span>
						);
					})}
				</div>
			))}
		</div>
	);
};

// ───────── phone ─────────
const PW = 393;
const PH = 852;

const OneBar = () => (
	<svg width="19" height="12" viewBox="0 0 19 12">
		{[0, 1, 2, 3].map((i) => (
			<rect key={i} x={i * 5} y={9 - i * 3} width="3.4" height={3 + i * 3} rx="1" fill="#fff" opacity={i === 0 ? 1 : 0.28} />
		))}
	</svg>
);

// Rolling clock digits: value is minutes past 9:00 (can be fractional while spinning).
const Clock = ({minutes}) => {
	const m = Math.max(0, minutes);
	const whole = Math.floor(m);
	const frac = m - whole;
	const roll = (n) => (
		<span style={{display: 'inline-block', height: 22, overflow: 'hidden', verticalAlign: 'top'}}>
			<span style={{display: 'block', transform: `translateY(${-frac * 22}px)`}}>
				<span style={{display: 'block', height: 22}}>{String(n % 60).padStart(2, '0')}</span>
				<span style={{display: 'block', height: 22}}>{String((n + 1) % 60).padStart(2, '0')}</span>
			</span>
		</span>
	);
	return (
		<span>
			9:{roll(whole)}
		</span>
	);
};

const StatusBar = ({minutes}) => (
	<div style={{position: 'absolute', top: 0, left: 0, width: PW, height: 54, color: '#fff', fontFamily: FONT, zIndex: 3}}>
		<div style={{position: 'absolute', left: 50, top: 17, fontSize: 17, fontWeight: 700, lineHeight: '22px'}}>
			<Clock minutes={minutes} />
		</div>
		<div style={{position: 'absolute', left: (PW - 124) / 2, top: 11, width: 124, height: 36, borderRadius: 20, background: '#000'}} />
		<div style={{position: 'absolute', right: 32, top: 20, display: 'flex', alignItems: 'center', gap: 6}}>
			<OneBar />
			<span style={{fontSize: 15, fontWeight: 800}}>5G</span>
			<svg width="27" height="13" viewBox="0 0 27 13">
				<rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="#fff" strokeOpacity="0.45" />
				<rect x="2.5" y="2.5" width="12" height="8" rx="2" fill="#fff" />
				<rect x="24.6" y="4.2" width="1.8" height="4.6" rx="0.9" fill="#fff" fillOpacity="0.45" />
			</svg>
		</div>
	</div>
);

const Phone = ({minutes = 41, tint = 0, children}) => (
	<div style={{position: 'relative', width: PW + 24, height: PH + 24, borderRadius: 66, background: '#2E3D78', padding: 12, boxShadow: `0 30px 60px rgba(0,0,0,0.45), inset 0 0 0 2px #3D4E90`}}>
		<div style={{position: 'relative', width: PW, height: PH, borderRadius: 54, overflow: 'hidden', background: '#121C45'}}>
			<div style={{position: 'absolute', inset: 0, filter: `saturate(${1 - tint * 0.25})`}}>{children}</div>
			{/* cool blue-grey flashback tint */}
			<div style={{position: 'absolute', inset: 0, background: '#7f9cd6', mixBlendMode: 'color', opacity: tint * 0.18, pointerEvents: 'none'}} />
			<StatusBar minutes={minutes} />
			<div style={{position: 'absolute', bottom: 9, left: (PW - 140) / 2, width: 140, height: 5, borderRadius: 3, background: '#fff', opacity: 0.8}} />
		</div>
	</div>
);

// Notification card for her OTP
const CodeNote = ({grey = 0, stamp = 0, strike = 0, width = 345}) => {
	const g = grey > 0.5;
	return (
		<div style={{position: 'relative', width, borderRadius: 22, padding: '16px 18px', background: g ? T.grey : T.amber, color: g ? '#d5dbea' : '#2a1a00', fontFamily: FONT, boxShadow: SHADOW, transition: 'none'}}>
			<div style={{fontSize: 13, fontWeight: 700, opacity: 0.8, letterSpacing: 0.5}}>MESSAGES · JM-MYBANK-T</div>
			<div style={{position: 'relative', display: 'inline-block', fontSize: 34, fontWeight: 800, letterSpacing: 4, marginTop: 4}}>
				731 064
				<span style={{position: 'absolute', left: -4, top: '50%', height: 5, borderRadius: 3, background: T.red, width: `${strike * 106}%`}} />
			</div>
			<div style={{fontSize: 14, fontWeight: 600, marginTop: 2}}>is your OTP. Valid for 3 min.</div>
			{stamp > 0.01 && (
				<div style={{position: 'absolute', right: 14, top: 26, padding: '4px 14px', border: `5px solid ${T.red}`, borderRadius: 12, color: T.red, background: T.grey, fontWeight: 800, fontSize: 30, letterSpacing: 3, opacity: Math.min(1, stamp * 1.4), transform: `rotate(-12deg) scale(${2.6 - 1.6 * Math.min(stamp, 1.05)})`}}>EXPIRED</div>
			)}
		</div>
	);
};

// Same screen as the Resend OTP video.
const LockIcon = ({color, size = 18}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<rect x="4" y="10" width="16" height="12" rx="3" fill={color} />
		<path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={color} strokeWidth="2.6" fill="none" />
	</svg>
);
const VerifyScreen = ({f, press = 0, toast = 0, note = null, ripple = 0, count = 0, badgePop = 1, shake = 0}) => (
	<div style={{position: 'absolute', inset: 0, fontFamily: FONT, color: '#fff'}}>
		<div style={{position: 'absolute', top: 66, left: 20, fontSize: 17, color: '#4C9BFF', fontWeight: 500}}>‹ MyBank</div>
		<div style={{position: 'absolute', top: 128, left: (PW - 72) / 2, width: 72, height: 72, borderRadius: 22, background: '#18213a', display: 'grid', placeItems: 'center', boxShadow: '0 6px 14px rgba(0,0,0,0.35)'}}>
			<LockIcon color="#4C9BFF" size={34} />
		</div>
		<div style={{position: 'absolute', top: 226, width: '100%', textAlign: 'center', fontSize: 28, fontWeight: 700}}>Verify it's you</div>
		<div style={{position: 'absolute', top: 270, width: '100%', textAlign: 'center', fontSize: 16, lineHeight: 1.45, color: '#8D96AD'}}>
			Enter the 6-digit code sent to
			<br />
			+91 ••••• 4821
		</div>
		<div style={{position: 'absolute', top: 350, width: '100%', display: 'flex', justifyContent: 'center', gap: 9}}>
			{Array.from({length: 6}, (_, i) => (
				<div key={i} style={{width: 46, height: 58, borderRadius: 12, background: '#18245A', border: '2px solid #33437F'}} />
			))}
		</div>
		<div style={{position: 'absolute', top: 432, width: '100%', textAlign: 'center', color: '#8D96AD', fontSize: 15, fontWeight: 500}}>Didn't get a code?</div>
		{ripple > 0 && ripple < 1 && (
			<div style={{position: 'absolute', top: 460, left: (PW - 290) / 2, width: 290, height: 60, borderRadius: 30, border: `4px solid ${T.coral}`, boxSizing: 'border-box', opacity: 0.85 * (1 - ripple), transform: `scale(${1 + Easing.out(Easing.cubic)(ripple) * 0.2}, ${1 + Easing.out(Easing.cubic)(ripple) * 0.3})`}} />
		)}
		<div
			style={{
				position: 'absolute',
				top: 460,
				left: (PW - 290) / 2,
				width: 290,
				height: 60,
				borderRadius: 30,
				background: T.coral,
				color: '#fff',
				display: 'grid',
				placeItems: 'center',
				fontSize: 20,
				fontWeight: 800,
				boxShadow: `0 ${10 - press * 7}px ${22 - press * 14}px rgba(0,0,0,${0.4 - press * 0.15})`,
				transform: `translateX(${shake}px) rotate(${shake * 0.3}deg) scale(${1 + press * 0.04}, ${1 - press * 0.08})`,
			}}
		>
			Resend code
			{count > 0 && (
				<div style={{position: 'absolute', right: -12, top: -16, width: 38, height: 38, borderRadius: 19, background: '#FFC83A', color: '#1d1400', fontSize: 20, fontWeight: 800, display: 'grid', placeItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.35)', transform: `scale(${badgePop})`}}>{count}</div>
			)}
		</div>
		{toast > 0.01 && (
			<div style={{position: 'absolute', top: 548, width: '100%', display: 'flex', justifyContent: 'center', opacity: Math.min(1, toast * 1.5), transform: `translateY(${(1 - toast) * 20}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 14, background: '#1E2B60', border: '1px solid #33437F', fontSize: 16, fontWeight: 700, color: '#fff'}}>
					<span style={{width: 14, height: 14, borderRadius: 7, border: '3px solid #8D96AD', borderTopColor: 'transparent', transform: `rotate(${f * 14}deg)`}} />
					Sending code…
				</div>
			</div>
		)}
		{note}
	</div>
);

// Flat thumb (same art as the Resend tap shot). (x, y) = fingertip.
const Thumb = ({x, y, k = 0.56}) => (
	<svg width="460" height="900" viewBox="-60 -40 460 900" style={{position: 'absolute', left: x - 60 * k, top: y - 40 * k, transform: `scale(${k})`, transformOrigin: '0 0', overflow: 'visible'}}>
		<g transform="rotate(-28)">
			<rect x="-56" y="-30" width="150" height="1600" rx="75" fill="#F2A877" />
			<path d="M 70 40 Q 92 300 76 1560" stroke="#DE8F5E" strokeWidth="38" fill="none" strokeLinecap="round" />
			<rect x="-30" y="-12" width="96" height="112" rx="46" fill="#FBD3B8" />
		</g>
	</svg>
);

// Mini-phone position above her head (train shot) and full-frame position.
const FULL = {x: 1350, y: 592, s: 1.1};
const PhoneAt = ({x, y, s, rot = 0, children}) => (
	<div style={{position: 'absolute', left: x - (PW + 24) / 2, top: y - (PH + 24) / 2, transform: `rotate(${rot}deg) scale(${s})`, transformOrigin: 'center center'}}>{children}</div>
);

// ───────── tower + queue (flat) ─────────
const Tower = ({lights}) => (
	<svg width="360" height="760" viewBox="0 0 360 760">
		<path d="M180 40 L 70 740 M180 40 L 290 740 M 120 420 L 240 420 M 96 580 L 264 580 M 146 260 L 214 260 M 120 420 L 214 260 M 240 420 L 146 260 M 96 580 L 240 420 M 264 580 L 120 420 M 82 680 L 278 680 M 96 580 L 278 680 M 264 580 L 82 680" stroke="#9aa6c2" strokeWidth="13" strokeLinecap="round" fill="none" />
		<rect x="150" y="120" width="60" height="26" rx="8" fill="#c3cbe0" />
		<rect x="120" y="170" width="44" height="80" rx="10" fill="#c3cbe0" />
		<rect x="196" y="170" width="44" height="80" rx="10" fill="#c3cbe0" />
		<circle cx="180" cy="30" r="14" fill={T.red} opacity={lights} />
		<circle cx="96" cy="420" r="10" fill={T.red} opacity={1 - lights * 0.6} />
		<circle cx="264" cy="420" r="10" fill={T.red} opacity={1 - lights * 0.6} />
	</svg>
);

const QueueCard = ({mine, life = null, wait = 0}) => (
	<div style={{position: 'relative', width: 128, height: 150, borderRadius: 24, background: mine ? T.amber : '#1c3263', border: mine ? 'none' : `2px solid ${T.line}`, boxShadow: SHADOW, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: mine ? '#2a1a00' : T.muted, fontFamily: FONT, fontWeight: 800}}>
		<svg width="54" height="38" viewBox="0 0 30 21">
			<rect x="1.2" y="1.2" width="27.6" height="18.6" rx="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
			<path d="M2 3l13 9 13-9" fill="none" stroke="currentColor" strokeWidth="2.4" />
		</svg>
		<div style={{fontSize: 20, letterSpacing: 2}}>{mine ? 'HERS' : 'OTP'}</div>
		{mine && life && (
			<div style={{position: 'absolute', top: -58, left: '50%', transform: `translateX(-50%) scale(${wait})`, padding: '6px 14px', borderRadius: 999, background: '#fff', color: T.bg, fontSize: 22, fontWeight: 800, boxShadow: SHADOW, whiteSpace: 'nowrap'}}>
				⏳ {life}
			</div>
		)}
	</div>
);

// ───────── the scene ─────────
export const WomanScene = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sp = (at, config = {damping: 14, stiffness: 170}) => spring({frame: f - at, fps, config});

	// flashback state (S2 → S7)
	const inFlash = f >= S.dive;
	const grainOn = interpolate(f, [S.dive, S.dive + 10], [0, 1], clamp);

	let shot;

	// ── S2 + S3: full phone, rewind, then the tap ──
	if (f < S.s4) {
		const rewind = interpolate(f, [S.dive, S.dive + 30], [41, 21], {...clamp, easing: Easing.inOut(Easing.quad)});
		const tint = interpolate(f, [S.dive, S.dive + 20], [0, 1], clamp);
		const chip = f >= S.dive + 10 ? sp(S.dive + 10) : 0;
		const intro = sp(0, {damping: 18, stiffness: 120});
		const thumbIn = interpolate(f, [S.s3 + 10, S.tap - 8], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
		const press = interpolate(f, [S.tap - 4, S.tap, S.tap + 6], [0, 1, 0], clamp);
		const ripple = interpolate(f, [S.tap, S.tap + 16], [0, 1], clamp);
		const lift = interpolate(Math.abs(f - S.tap), [0, 9], [0, 1], clamp);
		const thumbOut = interpolate(f, [S.tap + 6, S.tap + 20], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
		const toast = sp(S.tap + 2);
		const shake = f >= S.tap && f < S.tap + 8 ? Math.sin((f - S.tap) * 3) * (8 - (f - S.tap)) * 0.6 : 0;
		// stage coordinates of the Send code button
		const btnX = FULL.x;
		const btnY = FULL.y + (502 - (PH + 24) / 2) * FULL.s;
		const btnShake = f >= S.tap ? 5 * Math.exp(-(f - S.tap) / 5) * Math.sin((f - S.tap) * 2.1) : 0;
		const badgePop = sp(S.tap, {damping: 8, stiffness: 260});
		const arcs = [0, 1, 2].map((k) => interpolate(f, [S.tap + 4 + k * 6, S.tap + 26 + k * 6], [0, 1], clamp));
		shot = (
			<>
				<AbsoluteFill style={{background: T.bg}}>
					<Bubbles f={f} />
				</AbsoluteFill>
				<PhoneAt x={FULL.x} y={FULL.y + (1 - intro) * 60} s={FULL.s * (0.94 + 0.06 * intro)}>
					<Phone minutes={rewind} tint={tint}>
						<VerifyScreen f={f} press={press} ripple={ripple} shake={btnShake} count={f >= S.tap ? 1 : 0} badgePop={badgePop} toast={f >= S.tap ? toast : 0} />
					</Phone>
				</PhoneAt>
				{/* signal arcs from the top of the phone */}
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					{arcs.map((p, k) =>
						p > 0 && p < 1 ? (
							<path key={k} d={`M ${FULL.x - 60 - p * 140} ${110 - p * 30} Q ${FULL.x} ${50 - p * 70} ${FULL.x + 60 + p * 140} ${110 - p * 30}`} stroke={T.coral} strokeWidth={8} fill="none" strokeLinecap="round" opacity={1 - p} />
						) : null,
					)}
				</svg>
				{f >= S.s3 && (
					<Thumb x={btnX + 108 + (thumbIn + thumbOut) * 300} y={btnY + 26 + (thumbIn + thumbOut) * 520 + lift * 26 - press * 4} />
				)}
				<Chip text="20 MIN EARLIER" show={Math.min(1, chip)} top={220} left={110} />
				{f < S.dive + 4 ? (
					<Headline f={f} fps={fps} out={S.dive - 4} lines={[{words: [{text: 'But', at: VO.l01}, {text: "it's", at: VO.l01 + 4}, {text: 'not', at: VO.l01 + 8}]}, {size: 84, words: [{text: 'always', at: VO.l01 + 14}, {text: 'this', at: VO.l01 + 22, color: T.coral}, {text: 'fast.', at: VO.l01 + 28, color: T.coral}]}]} />
				) : f < S.s3 ? (
					<Headline f={f} fps={fps} out={S.s3 - 4} lines={[{words: [{text: '20', at: S.dive + 6, color: T.amber}, {text: 'minutes', at: S.dive + 9, color: T.amber}]}, {size: 84, words: [{text: 'earlier…', at: S.dive + 14}]}]} />
				) : (
					<Headline f={f} fps={fps} lines={[{size: 76, words: [{text: 'At', at: VO.l03}, {text: 'the', at: VO.l03 + 4}, {text: 'last', at: VO.l03 + 8}, {text: 'station,', at: VO.l03 + 14}]}, {size: 76, words: [{text: 'she', at: VO.l03 + 40}, {text: 'asked', at: VO.l03 + 44}, {text: 'for', at: VO.l03 + 52}, {text: 'a', at: VO.l03 + 56, color: T.coral}, {text: 'code.', at: VO.l03 + 60, color: T.coral}]}]} />
				)}
			</>
		);
	}
	// ── S4 + S5: how the message travels ──
	// her request goes UP (phone → tower → bank) · the bank makes her code → SMS centre (operator)
	// → the code waits in the tower's queue to come DOWN, one at a time · hers waits while its life drains
	else if (f < S.s6 + 18) {
		const lf = f - S.s4;
		const shrink = spring({frame: lf, fps, config: {damping: 18, stiffness: 110}});
		const sceneIn = interpolate(lf, [0, 12], [0, 1], clamp);
		const toQueue = interpolate(f, [S.s5 - 6, S.s5 + 22], [0, 1], {...clamp, easing: io});
		const camS = 1 + 0.08 * toQueue;
		const towerLights = Math.floor(f / 15) % 2;
		const crowd = Array.from({length: 84}, (_, i) => ({x: 40 + ((i * 137) % 1840), row: Math.floor(i / 28), c: i % 4}));
		const crowdCols = ['#2a4a8f', '#3b3f86', '#22507a', '#4a3d7a'];
		// key points
		const P = {
			her: {x: 1180, y: 880}, // her phone in the crowd
			top: {x: 320, y: 170}, // tower antenna
			bank: {x: 1010, y: 64, w: 360, h: 124},
			smsc: {x: 1450, y: 64, w: 400, h: 124},
		};
		const bankC = {x: P.bank.x + P.bank.w / 2, y: P.bank.y + P.bank.h / 2};
		const smscC = {x: P.smsc.x + P.smsc.w / 2, y: P.smsc.y + P.smsc.h / 2};
		// 1. her request: phone → tower → bank
		const up1 = interpolate(lf, [14, 32], [0, 1], {...clamp, easing: io});
		const up2 = interpolate(lf, [32, 46], [0, 1], {...clamp, easing: io});
		const reqVisible = lf >= 14 && lf < 48;
		const req = up2 > 0 ? {x: P.top.x + (P.bank.x - P.top.x) * up2, y: P.top.y + (bankC.y - P.top.y) * up2} : {x: P.her.x + (P.top.x - P.her.x) * up1, y: P.her.y + (P.top.y - P.her.y) * up1 - Math.sin(up1 * Math.PI) * 120};
		const bankPulse = interpolate(lf, [46, 52, 60], [0, 1, 0], clamp);
		// 2. her code: bank → SMS centre → back of the queue
		const toSmsc = interpolate(lf, [52, 64], [0, 1], {...clamp, easing: io});
		const toQ = interpolate(lf, [64, 76], [0, 1], {...clamp, easing: io});
		// 3. queue at the tower: q = 0 back (right) … 6 front (left, next to the tower)
		const lane = {x: 560, y: 400, w: 1080};
		const slotX = (q) => lane.x + lane.w - 26 - 128 - q * 146;
		const TICKS = [S.s4 + 8, S.s4 + 40, S.s4 + 66, S.s5 + 6, S.s5 + 26, S.s5 + 46, S.s5 + 64];
		const ticksSince = (from) => TICKS.reduce((acc, t) => acc + (t >= from ? io(interpolate(f, [t, t + 12], [0, 1], clamp)) : 0), 0);
		// one card joins the back right after every tick, so the queue never has gaps
		const defs = [
			...[5, 4, 3, 2, 1, 0].map((q) => ({join: S.s4 - 40, q})),
			{join: S.s4 + 20, q: 0},
			{join: S.s4 + 52, q: 0},
			{join: S.s4 + 76, q: 0, mine: true},
			{join: S.s5 + 18, q: 0},
			{join: S.s5 + 38, q: 0},
			{join: S.s5 + 58, q: 0},
		];
		const lifeSec = Math.round(interpolate(f, [S.s4 + 52, S.s6], [180, 12], clamp));
		const life = `${Math.floor(lifeSec / 60)}:${String(lifeSec % 60).padStart(2, '0')}`;
		const wait = sp(S.s4 + 84);
		const leaveT = interpolate(f, [S.s6 - 4, S.s6 + 18], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
		const Node = ({n, title, sub, icon, pulse = 0, show}) => (
			<div style={{position: 'absolute', left: n.x, top: n.y, width: n.w, height: n.h, borderRadius: 24, background: T.panel, border: `2px solid ${pulse > 0.01 ? T.amber : T.line}`, boxShadow: SHADOW, display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', boxSizing: 'border-box', fontFamily: FONT, opacity: show, transform: `scale(${(0.9 + 0.1 * show) * (1 + pulse * 0.05)})`}}>
				<div style={{width: 64, height: 64, borderRadius: 18, background: '#1E2B60', display: 'grid', placeItems: 'center', flexShrink: 0}}>{icon}</div>
				<div>
					<div style={{color: T.text, fontWeight: 800, fontSize: 28, letterSpacing: 1, whiteSpace: 'nowrap'}}>{title}</div>
					<div style={{color: T.muted, fontWeight: 600, fontSize: 20, marginTop: 2, whiteSpace: 'nowrap'}}>{sub}</div>
				</div>
			</div>
		);
		const nodesIn = interpolate(lf, [6, 20], [0, 1], clamp);
		const arrow = (x1, y1, x2, y2, color, prog, dash) => {
			if (prog <= 0) return null;
			const x = x1 + (x2 - x1) * prog;
			const y = y1 + (y2 - y1) * prog;
			const ang = Math.atan2(y2 - y1, x2 - x1);
			return (
				<g>
					<line x1={x1} y1={y1} x2={x} y2={y} stroke={color} strokeWidth={5} strokeDasharray={dash ? '14 12' : 'none'} strokeLinecap="round" opacity={0.85} />
					{prog > 0.95 && <path d={`M ${x2} ${y2} l ${-20 * Math.cos(ang - 0.45)} ${-20 * Math.sin(ang - 0.45)} M ${x2} ${y2} l ${-20 * Math.cos(ang + 0.45)} ${-20 * Math.sin(ang + 0.45)}`} stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" />}
				</g>
			);
		};
		shot = (
			<>
				<AbsoluteFill style={{background: T.bg, opacity: sceneIn}}>
					<Bubbles f={f} />
					<AbsoluteFill style={{transform: `scale(${camS})`, transformOrigin: '1000px 470px'}}>
						{/* tower */}
						<div style={{position: 'absolute', left: P.top.x - 180, top: P.top.y - 30}}>
							<Tower lights={towerLights} />
						</div>
						{/* path arrows */}
						<svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
							{arrow(P.top.x + 30, P.top.y - 10, P.bank.x - 16, bankC.y, T.coral, interpolate(lf, [30, 46], [0, 1], clamp), true)}
							{arrow(P.bank.x + P.bank.w + 6, bankC.y, P.smsc.x - 14, smscC.y, T.amber, interpolate(lf, [50, 60], [0, 1], clamp), false)}
							{arrow(smscC.x, P.smsc.y + P.smsc.h + 8, smscC.x, lane.y - 16, T.amber, interpolate(lf, [60, 70], [0, 1], clamp), false)}
							{/* other phones' requests going up to the same tower */}
							{Array.from({length: 12}, (_, i) => {
								const p = (lf / 28 + i * 0.137) % 1;
								const sx = 80 + ((i * 263) % 1760);
								const x = sx + (P.top.x - sx) * p;
								const y = 860 + (P.top.y + 10 - 860) * p - Math.sin(p * Math.PI) * 80;
								return <circle key={i} cx={x} cy={y} r={7} fill={T.muted} opacity={(1 - p) * 0.7} />;
							})}
						</svg>
						{/* bank + SMS centre */}
						<Node
							n={P.bank}
							title="BANK"
							sub="makes your code"
							show={nodesIn}
							pulse={bankPulse}
							icon={
								<svg width="38" height="38" viewBox="0 0 24 24">
									<path d="M3 9l9-5 9 5z" fill={T.muted} />
									<rect x="5" y="10" width="2.6" height="8" fill={T.muted} />
									<rect x="10.7" y="10" width="2.6" height="8" fill={T.muted} />
									<rect x="16.4" y="10" width="2.6" height="8" fill={T.muted} />
									<rect x="3" y="19" width="18" height="2.4" fill={T.muted} />
								</svg>
							}
						/>
						<Node
							n={P.smsc}
							title="SMS CENTRE"
							sub="your mobile operator"
							show={nodesIn}
							pulse={interpolate(lf, [62, 66, 72], [0, 1, 0], clamp)}
							icon={
								<svg width="40" height="32" viewBox="0 0 30 21">
									<rect x="1.2" y="1.2" width="27.6" height="18.6" rx="4" fill="none" stroke={T.muted} strokeWidth="2.4" />
									<path d="M2 3l13 9 13-9" fill="none" stroke={T.muted} strokeWidth="2.4" />
								</svg>
							}
						/>
						{/* crowd */}
						{crowd.map((p, i) => {
							const y = 820 + p.row * 70 + Math.sin(lf / 7 + i) * 3;
							return (
								<div key={i} style={{position: 'absolute', left: p.x + (p.row % 2) * 30, top: y}}>
									<div style={{width: 38, height: 38, borderRadius: 19, background: crowdCols[p.c], margin: '0 auto'}} />
									<div style={{width: 60, height: 90, borderRadius: '24px 24px 8px 8px', background: crowdCols[(p.c + 1) % 4], marginTop: 4}} />
									<div style={{position: 'absolute', left: 21, top: 52, width: 18, height: 28, borderRadius: 4, background: '#cdd8f2'}} />
								</div>
							);
						})}
						{/* queue at the tower: codes wait to come DOWN */}
						<div style={{position: 'absolute', left: lane.x, top: lane.y, width: lane.w, height: 190, borderRadius: 30, background: T.panel, border: `2px solid ${T.line}`}} />
						<div style={{position: 'absolute', left: lane.x + 24, top: lane.y + 206, fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: T.muted}}>← WAITING FOR A FREE SLOT · 1 AT A TIME</div>
						{defs
							.filter((d) => f >= d.join)
							.map((d, i) => {
								const q = d.q + ticksSince(d.join);
								const enter = d.join < S.s4 ? 1 : sp(d.join, {damping: 14, stiffness: 180});
								// past the front: go to the tower and drop down into the crowd
								const out = interpolate(q, [6, 7], [0, 1], clamp);
								if (out >= 1 && !d.mine) return null;
								const bump = TICKS.reduce((a, t) => a + (f >= t && f < t + 12 ? Math.sin((f - t) * 1.2) * (12 - (f - t)) * 0.5 : 0), 0);
								let x = slotX(Math.min(q, 6)) + bump;
								let y = lane.y + 20 - (1 - enter) * 160;
								let scale = 1;
								let op = Math.min(1, enter * 2);
								if (out > 0) {
									x = x + (P.top.x - 64 - x) * out;
									y = y + (700 - y) * out * out;
									scale = 1 - 0.6 * out;
									op *= 1 - out;
								}
								if (d.mine && leaveT > 0) {
									x = x + (P.top.x - 40 - x) * Math.min(1, leaveT * 1.6);
									y = y + 640 * leaveT * leaveT;
									scale = 1 + leaveT * 1.8;
								}
								return (
									<div key={i} style={{position: 'absolute', left: x, top: y, opacity: op, zIndex: d.mine ? 3 : 2, transform: `scale(${scale})`}}>
										<QueueCard mine={d.mine} life={d.mine ? life : null} wait={wait} />
									</div>
								);
							})}
						{/* her code card on its way: bank → SMS centre → queue */}
						{lf >= 52 && lf < 76 && (
							<div
								style={{
									position: 'absolute',
									left: (toQ > 0 ? smscC.x + (slotX(0) + 64 - smscC.x) * toQ : bankC.x + (smscC.x - bankC.x) * toSmsc) - 64,
									top: (toQ > 0 ? smscC.y + 130 + (lane.y + 20 + 75 - smscC.y - 130) * toQ : bankC.y + 130) - 75,
									transform: `scale(${0.55 + 0.45 * Math.max(toQ, 0)})`,
									zIndex: 4,
								}}
							>
								<QueueCard mine />
							</div>
						)}
						{/* her request (coral) */}
						{reqVisible && (
							<div style={{position: 'absolute', left: req.x - 70, top: req.y - 22, display: 'flex', alignItems: 'center', gap: 10, zIndex: 5}}>
								<div style={{width: 26, height: 26, borderRadius: 13, background: T.coral, boxShadow: SHADOW}} />
								<div style={{padding: '6px 14px', borderRadius: 12, background: T.coral, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 22}}>her request</div>
							</div>
						)}
						{/* counter */}
						<div style={{position: 'absolute', left: 560, top: 240, padding: '14px 24px', borderRadius: 18, background: T.panel, border: `2px solid ${T.line}`, color: T.text, fontFamily: FONT, fontWeight: 800, fontSize: 34, boxShadow: SHADOW, opacity: interpolate(lf, [10, 22], [0, 1], clamp)}}>
							{Math.round(interpolate(lf, [10, 70], [20, 600], clamp))}+ phones <span style={{color: T.muted}}>·</span> 1 tower
						</div>
					</AbsoluteFill>
				</AbsoluteFill>
				{/* her phone shrinking into the crowd (S4 entry) */}
				{lf < 22 && (
					<PhoneAt x={interpolate(shrink, [0, 1], [FULL.x, P.her.x])} y={interpolate(shrink, [0, 1], [FULL.y, P.her.y + 20])} s={interpolate(shrink, [0, 1], [FULL.s, 0.05])}>
						<Phone minutes={21} tint={1}>
							<VerifyScreen f={f} sent />
						</Phone>
					</PhoneAt>
				)}
			</>
		);
	}
	// ── S6: her card arrives, expired ──
	else if (f < S.s7) {
		const lf = f - S.s6;
		const phoneIn = sp(S.s6 + 6, {damping: 16, stiffness: 140});
		const drop = sp(S.s6 + 16, {damping: 12, stiffness: 150});
		const grey = interpolate(f, [S.grey - 4, S.grey + 4], [0, 1], clamp);
		const stamp = sp(S.stamp, {damping: 10, stiffness: 260});
		const strike = interpolate(f, [S.stamp + 4, S.stamp + 14], [0, 1], clamp);
		const shake = f >= S.stamp && f < S.stamp + 10 ? Math.sin((f - S.stamp) * 2.6) * (10 - (f - S.stamp)) * 1.4 : 0;
		const label = sp(S.stamp + 12);
		const zoomOut = interpolate(f, [S.s7 - 10, S.s7], [1, 0.92], clamp);
		shot = (
			<>
				<AbsoluteFill style={{background: T.bg}}>
					<Bubbles f={f} />
				</AbsoluteFill>
				<PhoneAt x={FULL.x + shake} y={FULL.y + (1 - phoneIn) * 900} s={FULL.s * zoomOut}>
					<Phone minutes={26} tint={1}>
						<VerifyScreen
							f={f}
							sent
							note={
								<div style={{position: 'absolute', top: 64 - (1 - drop) * 260, left: 24, opacity: Math.min(1, drop * 2)}}>
									<CodeNote grey={grey} stamp={stamp} strike={strike} />
								</div>
							}
						/>
					</Phone>
				</PhoneAt>
				{/* label */}
				<div style={{position: 'absolute', left: 110, top: 600, opacity: Math.min(1, label * 1.4), transform: `translateY(${(1 - label) * 30}px)`, fontFamily: FONT}}>
					<div style={{padding: '18px 26px', borderRadius: 20, background: T.panel, border: `2px solid ${T.line}`, boxShadow: SHADOW}}>
						<div style={{fontSize: 34, fontWeight: 800, color: T.text}}>valid 3 min</div>
						<div style={{fontSize: 34, fontWeight: 800, color: T.red, marginTop: 4}}>arrived after 5</div>
					</div>
				</div>
				<Chip text="9:26 · 5 MIN LATER" show={Math.min(1, sp(S.s6 + 10))} top={200} left={110} />
				<Headline f={f} fps={fps} top={300} lines={[{size: 84, words: [{text: 'It', at: VO.l06}, {text: 'arrived', at: VO.l06 + 4}, {text: 'late.', at: VO.l06 + 14}]}, {size: 84, words: [{text: 'Already', at: VO.l06 + 50, color: T.red}, {text: 'expired.', at: VO.l06 + 60, color: T.red}]}]} />
				{lf < 0 && null}
			</>
		);
	}
	// ── S7: a code only lives a few minutes ──
	else {
		const lf = f - S.s7;
		const bar = interpolate(f, [S.s7 + 10, S.s7 + 52], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
		const arrive = sp(S.s7 + 60);
		const late = VO.l07 + Math.round(2.2 * 30); // "so a late code…"
		const dead = VO.l07 + Math.round(3.37 * 30); // "…dead code"
		const head1 = sp(S.s7 + 4);
		const head2 = sp(late);
		const deadPop = sp(dead, {damping: 9, stiffness: 220});
		const BAR = {x: 330, y: 560, w: 1260};
		shot = (
			<>
				<AbsoluteFill style={{background: T.bg}}>
					<Bubbles f={f} />
				</AbsoluteFill>
				<div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 76, color: T.text, opacity: Math.min(1, head1 * 1.4), transform: `translateY(${(1 - head1) * 30}px)`}}>
					A code lives <span style={{color: T.amber}}>3 minutes</span>
				</div>
				{/* life bar */}
				<div style={{position: 'absolute', left: BAR.x, top: BAR.y, width: BAR.w, height: 40, borderRadius: 20, background: T.panel, border: `2px solid ${T.line}`}} />
				<div style={{position: 'absolute', left: BAR.x, top: BAR.y, width: BAR.w * 0.6 * bar, height: 40, borderRadius: 20, background: T.amber}} />
				{[0, 1, 2, 3, 4, 5].map((m) => (
					<div key={m} style={{position: 'absolute', left: BAR.x + (BAR.w * m) / 5 - 70, top: BAR.y + 60, width: 140, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: T.muted}}>
						{m} min
					</div>
				))}
				<div style={{position: 'absolute', left: BAR.x + BAR.w * 0.6 - 6, top: BAR.y - 26, width: 12, height: 92, borderRadius: 6, background: T.text, opacity: bar}} />
				<div style={{position: 'absolute', left: BAR.x + BAR.w * 0.6 - 120, top: BAR.y - 80, width: 240, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 28, color: T.text, opacity: bar}}>
					code dies
				</div>
				{/* her late card arriving at 5 min */}
				<div style={{position: 'absolute', left: BAR.x + BAR.w - 64, top: BAR.y - 170 + (1 - arrive) * -200, opacity: Math.min(1, arrive * 1.5), transform: `rotate(${(1 - arrive) * 20}deg)`}}>
					<div style={{width: 128, height: 128, borderRadius: 26, background: T.grey, display: 'grid', placeItems: 'center', boxShadow: SHADOW, fontFamily: FONT, fontWeight: 800, color: '#d5dbea', fontSize: 22}}>
						<svg width="54" height="38" viewBox="0 0 30 21">
							<rect x="1.2" y="1.2" width="27.6" height="18.6" rx="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
							<path d="M2 3l13 9 13-9" fill="none" stroke="currentColor" strokeWidth="2.4" />
						</svg>
					</div>
					<div style={{position: 'absolute', top: 140, left: -40, width: 210, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 26, color: T.red}}>arrived ✕</div>
				</div>
				{/* late code = dead code */}
				<div style={{position: 'absolute', top: 790, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 92, color: T.text, opacity: Math.min(1, head2 * 1.4), transform: `translateY(${(1 - head2) * 30}px)`}}>
					Late code ={' '}
					<span style={{display: 'inline-block', color: T.red, transform: `scale(${0.6 + 0.4 * Math.min(1.08, deadPop)})`, opacity: Math.min(1, deadPop * 2)}}>dead code</span>
				</div>
				<Chip text="20 MIN EARLIER" show={1} />
				{lf < 0 && null}
			</>
		);
	}

	return (
		<AbsoluteFill style={{background: T.bg}}>
			{shot}
			<Brand />
			{inFlash && grainOn > 0 && <Grain f={f} opacity={0.06 * grainOn} />}

			{/* voice */}
			{Object.entries(VO).map(([k, at]) => (
				<Sequence key={k} from={at}>
					<Audio src={staticFile(`audio/${k}.mp3`)} />
				</Sequence>
			))}
			{/* sound effects */}
			{[
				['rewind', S.dive + 2, 0.55],
				['tap', S.tap, 0.8],
				['ping', S.tap + 6, 0.5],
				['whoosh', S.s4 - 2, 0.45],
				['crowd', S.s4 + 4, 0.35],
				['tick', S.s5 + 14, 0.6],
				['tick', S.s5 + 34, 0.6],
				['tick', S.s5 + 54, 0.6],
				['whoosh', S.s6 - 4, 0.5],
				['stamp', S.stamp, 0.9],
			].map(([name, at, vol], i) => (
				<Sequence key={'sfx' + i} from={at}>
					<Audio src={staticFile(`audio/sfx_${name}.wav`)} volume={vol} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
