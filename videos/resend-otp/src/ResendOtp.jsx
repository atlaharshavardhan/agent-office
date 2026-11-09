import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import {Phone, PH, PW} from './Phone';

// 16:9 YouTube layout (1920×1080): headline on the left, phone on the right.

// ---------- brand ----------
const NAVY = '#0B1532';
const C = {
	coral: '#FF6B4A', // Resend button
	badge: '#FFC83A', // tap counter
	amber: '#FFB020',
	blue: '#4C9BFF', // OTP codes
	red: '#FF4D5E', // expired
	purple: '#9B7BFF', // countdown
	green: '#22C55E', // success
	muted: '#8D96AD',
};
const HEAD = 'Poppins, sans-serif';
const UI = 'Inter, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

const CODES = ['482913', '107364', '659201'];

// ---------- timeline (frames @ 30fps) ----------
export const T = {
	s1: 0, // 0–3s    "Code late? You tap Resend. Again. And again."
	s2: 90, // 3–6.5s  "Now three codes, and the old ones may not work."
	s3: 195, // 6.5–8.5s "Wait for the countdown."
	s4: 255, // 8.5–10s "Use the newest one."
	end: 300,
};
const TAPS = [30, 51, 70]; // "Resend" · "Again" · "And again"

// ---------- shared bits ----------
const useSpring = (at, cfg = {damping: 13, stiffness: 180}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: frame - at, fps, config: cfg});
};

// Same background as the Resend tap shot: navy, big soft circles, faint dots, "…" chat bubbles.
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
const Background = () => {
	const f = useCurrentFrame();
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
			<ChatBubble x={880} y={wrapY(150 - f * 0.4 + 160)} w={110} rot={8} f={f} k={1.5} />
			<ChatBubble x={1720} y={wrapY(900 - f * 0.4 + 160)} w={130} rot={-5} f={f} k={3} />
			<ChatBubble x={760} y={wrapY(880 - f * 0.4 + 160)} w={100} rot={6} f={f} k={4.5} />
		</AbsoluteFill>
	);
};

// Flat thumb (same art as the Resend tap shot). (x, y) = fingertip, in phone coordinates.
const Thumb = ({x, y, k = 0.5}) => (
	<svg width="460" height="900" viewBox="-60 -40 460 900" style={{position: 'absolute', left: x - 60 * k, top: y - 40 * k, transform: `scale(${k})`, transformOrigin: '0 0', overflow: 'visible'}}>
		<g transform="rotate(-28)">
			<rect x="-56" y="-30" width="150" height="1600" rx="75" fill="#F2A877" />
			<path d="M 70 40 Q 92 300 76 1560" stroke="#DE8F5E" strokeWidth="38" fill="none" strokeLinecap="round" />
			<rect x="-30" y="-12" width="96" height="112" rx="46" fill="#FBD3B8" />
		</g>
	</svg>
);

const Brand = () => (
	<div style={{position: 'absolute', top: 44, left: 56, display: 'flex'}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px', borderRadius: 999, background: '#16244f', boxShadow: '0 6px 16px rgba(0,0,0,0.3)', fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: '#fff', letterSpacing: 0.5}}>
			<span style={{width: 16, height: 16, borderRadius: 5, background: C.blue, transform: 'rotate(45deg)'}} />
			InvisiTech
		</div>
	</div>
);

// Words pop in one at a time. parts: [{t, text, color, at}]
const Headline = ({lines, top = 330}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<div style={{position: 'absolute', top, left: 110, width: 900, textAlign: 'left', fontFamily: HEAD, fontWeight: 800, color: '#fff', lineHeight: 1.12}}>
			{lines.map((line, li) => (
				<div key={li} style={{fontSize: line.size || 96, marginBottom: 6}}>
					{line.words.map((w, wi) => {
						const s = spring({frame: frame - w.at, fps, config: {damping: 12, stiffness: 200}});
						return (
							<span
								key={wi}
								style={{
									display: 'inline-block',
									marginRight: '0.24em',
									color: w.color || '#fff',
									opacity: Math.min(1, s * 1.5),
									transform: `translateY(${(1 - s) * 40}px) scale(${0.6 + 0.4 * s})`,
									textShadow: '0 6px 14px rgba(0,0,0,0.35)',
								}}
							>
								{w.text}
							</span>
						);
					})}
				</div>
			))}
		</div>
	);
};

// Places the phone on stage: phone point (px, py) lands at stage (sx, sy) at scale s.
const Camera = ({px, py, sx, sy, s, rotate = 0, children}) => (
	<div
		style={{
			position: 'absolute',
			left: 0,
			top: 0,
			width: PW + 24,
			height: PH + 24,
			transformOrigin: '0 0',
			transform: `translate(${sx}px, ${sy}px) rotate(${rotate}deg) scale(${s}) translate(${-(px + 12)}px, ${-(py + 12)}px)`,
		}}
	>
		{children}
	</div>
);

const SceneIn = ({children}) => {
	const s = useSpring(0, {damping: 16, stiffness: 220});
	return <AbsoluteFill style={{opacity: Math.min(1, s * 2), transform: `scale(${1.08 - 0.08 * s})`}}>{children}</AbsoluteFill>;
};

// ---------- phone screens ----------
const LockIcon = ({color, size = 18}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<rect x="4" y="10" width="16" height="12" rx="3" fill={color} />
		<path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={color} strokeWidth="2.6" fill="none" />
	</svg>
);

const VerifyScreen = ({hideButton = false, shake = 0, pressed = 0, sent = 0, ripples = [], badgePop = 1, locked = 0, timer = '0:30', digits = '', focus = 0, banner = null}) => (
	<div style={{position: 'absolute', inset: 0, fontFamily: UI, color: '#fff'}}>
		<div style={{position: 'absolute', top: 66, left: 20, fontSize: 17, color: C.blue, fontWeight: 500}}>‹ MyBank</div>
		<div style={{position: 'absolute', top: 128, left: (PW - 72) / 2, width: 72, height: 72, borderRadius: 22, background: '#18213a', display: 'grid', placeItems: 'center', boxShadow: '0 6px 14px rgba(0,0,0,0.35)'}}>
			<LockIcon color={C.blue} size={34} />
		</div>
		<div style={{position: 'absolute', top: 226, width: '100%', textAlign: 'center', fontSize: 28, fontWeight: 700}}>Verify it's you</div>
		<div style={{position: 'absolute', top: 270, width: '100%', textAlign: 'center', fontSize: 16, lineHeight: 1.45, color: C.muted}}>
			Enter the 6-digit code sent to
			<br />
			+91 ••••• 4821
		</div>
		<div style={{position: 'absolute', top: 350, left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: 9}}>
			{Array.from({length: 6}, (_, i) => {
				const ch = digits[i] || '';
				const isFocus = i === Math.min(digits.length, 5) && focus;
				return (
					<div
						key={i}
						style={{
							width: 46,
							height: 58,
							borderRadius: 12,
							background: '#18245A',
							border: `2px solid ${ch ? C.green : isFocus ? C.blue : '#33437F'}`,
							display: 'grid',
							placeItems: 'center',
							fontSize: 28,
							fontWeight: 700,
							color: '#fff',
						}}
					>
						{ch}
					</div>
				);
			})}
		</div>
		{!hideButton && <div style={{position: 'absolute', top: 432, width: '100%', textAlign: 'center', color: C.muted, fontSize: 15, fontWeight: 500}}>Didn't get a code?</div>}
		{/* tap ripples: coral pill rings growing out of the button, never over the label */}
		{!hideButton &&
			ripples.map((p, i) =>
				p > 0 && p < 1 ? (
					<div key={i} style={{position: 'absolute', top: 460, left: (PW - 290) / 2, width: 290, height: 60, borderRadius: 30, border: `4px solid ${C.coral}`, boxSizing: 'border-box', opacity: 0.85 * (1 - p), transform: `scale(${1 + Easing.out(Easing.cubic)(p) * 0.2}, ${1 + Easing.out(Easing.cubic)(p) * 0.3})`}} />
				) : null,
			)}
		{/* Resend button */}
		<div
			style={{
				display: hideButton ? 'none' : 'flex',
				position: 'absolute',
				top: 460,
				left: (PW - 290) / 2,
				width: 290,
				height: 60,
				borderRadius: 30,
				background: locked ? '#232a54' : C.coral,
				color: locked ? '#c9cfe0' : '#fff',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 10,
				fontSize: 20,
				fontWeight: 800,
				boxShadow: `0 ${10 - pressed * 7}px ${22 - pressed * 14}px rgba(0,0,0,${0.4 - pressed * 0.15})`,
				transform: `translateX(${shake}px) rotate(${shake * 0.3}deg) scale(${1 + pressed * 0.04}, ${1 - pressed * 0.08})`,
			}}
		>
			{locked ? (
				<>
					<LockIcon color={C.purple} size={20} />
					Resend in {timer}
				</>
			) : (
				'Resend code'
			)}
			{sent > 0 && !locked && (
				<div style={{position: 'absolute', right: -12, top: -16, width: 38, height: 38, borderRadius: 19, background: C.badge, color: '#1d1400', fontSize: 20, fontWeight: 800, display: 'grid', placeItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.35)', transform: `scale(${badgePop})`}}>
					{sent}
				</div>
			)}
		</div>
		{banner}
	</div>
);

const Bubble = ({code, grey = 0, strike = 0, stamp = 0, highlight = 0, enter = 1, compact = false}) => (
	<div
		style={{
			position: 'relative',
			width: compact ? 330 : 300,
			padding: '14px 16px',
			borderRadius: 20,
			borderBottomLeftRadius: compact ? 20 : 6,
			background: '#1E2B60',
			border: `3px solid ${highlight ? C.green : 'transparent'}`,
			boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
			fontFamily: UI,
			fontSize: 15.5,
			lineHeight: 1.4,
			color: '#e6e9f2',
			opacity: enter * (1 - grey * 0.6),
			filter: `grayscale(${grey})`,
			transform: `translateY(${(1 - enter) * -60}px) scale(${(0.85 + 0.15 * enter) * (1 + highlight * 0.04)})`,
			transformOrigin: 'left center',
		}}
	>
		{compact && <div style={{fontSize: 12.5, color: C.muted, fontWeight: 600, marginBottom: 4}}>MESSAGES · JM-MYBANK-T · now</div>}
		<span style={{position: 'relative', display: 'inline-block', fontSize: 21, fontWeight: 800, letterSpacing: 1.5, color: highlight ? C.green : C.blue}}>
			{code}
			<span style={{position: 'absolute', left: -4, top: '52%', height: 4, borderRadius: 2, width: `${strike * 108}%`, background: C.red}} />
		</span>{' '}
		is your OTP for MyBank login. Valid for 5 min. Do not share it.
		{stamp > 0.01 && (
			<div style={{position: 'absolute', right: 12, top: 10, padding: '3px 10px', border: `3px solid ${C.red}`, borderRadius: 8, color: C.red, fontWeight: 800, fontSize: 14, letterSpacing: 1.5, background: '#1E2B60', opacity: Math.min(1, stamp), transform: `rotate(-10deg) scale(${2 - stamp})`}}>EXPIRED</div>
		)}
	</div>
);

const MessagesHeader = () => (
	<div style={{position: 'absolute', top: 58, left: 0, width: '100%', paddingBottom: 12, borderBottom: '1px solid #2a3a72', fontFamily: UI, textAlign: 'center'}}>
		<div style={{position: 'absolute', left: 18, top: 16, fontSize: 30, color: C.blue}}>‹</div>
		<div style={{width: 50, height: 50, margin: '0 auto', borderRadius: 25, background: '#2b3552', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 17}}>JM</div>
		<div style={{color: '#fff', fontSize: 14, fontWeight: 600, marginTop: 6}}>JM-MYBANK-T ›</div>
	</div>
);

// ---------- scenes ----------
const Scene1 = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	let pressed = 0;
	let shake = 0;
	let sent = 0;
	TAPS.forEach((t, i) => {
		const d = f - t;
		pressed = Math.max(pressed, interpolate(d, [-4, 0, 6], [0, 1, 0], clamp));
		if (d >= 0) {
			sent = i + 1;
			shake += [4, 8, 13][i] * Math.exp(-d / 5) * Math.sin(d * 2.1);
		}
	});
	const ripples = TAPS.map((t) => interpolate(f - t, [0, 16], [0, 1], clamp) * (f >= t ? 1 : 0));
	const badgePop = sent ? spring({frame: f - TAPS[sent - 1], fps, config: {damping: 8, stiffness: 260}}) : 0;
	// thumb: enters from bottom right, dips on each tap, presses the button's edge (not the text)
	const enter = interpolate(f, [4, 22], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
	const lift = TAPS.reduce((m, t) => Math.min(m, interpolate(Math.abs(f - t), [0, 9], [0, 1], clamp)), 1);
	const push = interpolate(f, [0, 80], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	return (
		<SceneIn>
			<Headline
				lines={[
					{words: [{text: 'Code', at: 3}, {text: 'late?', at: 6}]},
					{size: 84, words: [{text: 'Resend.', at: TAPS[0], color: C.coral}, {text: 'Again.', at: TAPS[1], color: C.coral}]},
					{size: 84, words: [{text: 'And', at: TAPS[2], color: C.coral}, {text: 'again.', at: TAPS[2] + 3, color: C.coral}]},
				]}
			/>
			<Camera px={196} py={470} sx={1350} sy={640} s={1.1 + push * 0.12}>
				<Phone>
					<VerifyScreen pressed={pressed} shake={shake} sent={sent} ripples={ripples} badgePop={badgePop} />
				</Phone>
				<Thumb x={12 + PW / 2 + 98 + enter * 260} y={12 + 490 + 24 + enter * 420 + lift * 22 - pressed * 4} />
			</Camera>
		</SceneIn>
	);
};

const Scene2 = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const drops = [6, 17, 28].map((t) => spring({frame: f - t, fps, config: {damping: 12, stiffness: 170}}));
	const grey = interpolate(f, [46, 56], [0, 1], clamp);
	const strike = interpolate(f, [54, 66], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const stamp = spring({frame: f - 64, fps, config: {damping: 11, stiffness: 220}});
	const push = interpolate(f, [0, 105], [1.2, 1.26], clamp);
	return (
		<SceneIn>
			<Headline
				top={360}
				lines={[
					{words: [{text: 'Now', at: 3}, {text: '3', at: 6, color: C.blue}, {text: 'codes…', at: 9, color: C.blue}]},
					{size: 72, words: [{text: 'old', at: 44}, {text: 'ones', at: 47}, {text: 'may', at: 52, color: C.red}, {text: 'not', at: 55, color: C.red}, {text: 'work.', at: 58, color: C.red}]},
				]}
			/>
			<Camera px={196} py={300} sx={1350} sy={520} s={push} rotate={1.5}>
				<Phone>
					<div style={{position: 'absolute', inset: 0}}>
						<MessagesHeader />
						<div style={{position: 'absolute', top: 160, left: 16, display: 'flex', flexDirection: 'column', gap: 14}}>
							{CODES.map((code, i) => (
								<Bubble key={code} code={code} enter={drops[i]} grey={i < 2 ? grey : 0} strike={i < 2 ? strike : 0} stamp={i < 2 ? stamp : 0} />
							))}
						</div>
					</div>
				</Phone>
			</Camera>
		</SceneIn>
	);
};

const Scene3 = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const lock = interpolate(f, [2, 10], [0, 1], clamp);
	const padDrop = spring({frame: f - 3, fps, config: {damping: 9, stiffness: 160}});
	const sec = 30 - Math.floor(f / 30);
	const tickT = f % 30;
	const flip = spring({frame: tickT, fps, config: {damping: 12, stiffness: 260}});
	const timer = `0:${String(sec).padStart(2, '0')}`;
	const ring = 1 - (f / 30) / 30;
	const R = 150;
	const circ = 2 * Math.PI * R;
	return (
		<SceneIn>
			<Headline
				top={150}
				lines={[{size: 88, words: [{text: 'Wait', at: 2}, {text: 'for', at: 5}, {text: 'the', at: 8}, {text: 'countdown.', at: 12, color: C.purple}]}]}
			/>
			<Camera px={196} py={490} sx={1350} sy={660} s={1.24} rotate={-1}>
				<Phone>
					<VerifyScreen locked={lock > 0.5 ? 1 : 0} timer={timer} />
					{/* padlock clamps onto the button */}
					<div style={{position: 'absolute', left: PW / 2 + 118, top: 440 - (1 - padDrop) * 120, opacity: Math.min(1, padDrop * 2), transform: `rotate(${(1 - padDrop) * 30}deg)`}}>
						<div style={{width: 46, height: 46, borderRadius: 14, background: C.purple, display: 'grid', placeItems: 'center', boxShadow: '0 6px 12px rgba(0,0,0,0.35)'}}>
							<LockIcon color="#fff" size={24} />
						</div>
					</div>
				</Phone>
			</Camera>
			{/* big timer illustration */}
			<div style={{position: 'absolute', left: 160, top: 420, width: 380, height: 380, transform: `scale(${spring({frame: f, fps, config: {damping: 12, stiffness: 170}})})`}}>
				<svg width="380" height="380" style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.4))'}}>
					<circle cx="190" cy="190" r="178" fill="#141f45" />
					<circle cx="190" cy="190" r={R} fill="none" stroke="#24305c" strokeWidth="22" />
					<circle cx="190" cy="190" r={R} fill="none" stroke={C.purple} strokeWidth="22" strokeLinecap="round" strokeDasharray={`${circ * ring} ${circ}`} transform="rotate(-90 190 190)" />
					<rect x="168" y="-6" width="44" height="26" rx="8" fill={C.purple} />
				</svg>
				<div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 104, color: '#fff'}}>
					<span style={{display: 'inline-block', transform: `translateY(${(1 - flip) * -18}px) scale(${1.12 - 0.12 * flip})`, opacity: 0.55 + 0.45 * Math.min(1, flip)}}>{timer}</span>
				</div>
			</div>
		</SceneIn>
	);
};

const Scene4 = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const bannerIn = spring({frame: f - 1, fps, config: {damping: 13, stiffness: 190}});
	const hl = interpolate(f, [5, 10], [0, 1], clamp);
	const typed = Math.max(0, Math.min(6, Math.floor((f - 11) / 2.6)));
	const tick = spring({frame: f - 29, fps, config: {damping: 9, stiffness: 200}});
	return (
		<SceneIn>
			<Headline
				top={420}
				lines={[{size: 92, words: [{text: 'Use', at: 2}, {text: 'the', at: 4}, {text: 'newest', at: 7, color: C.green}, {text: 'one.', at: 11}]}]}
			/>
			<Camera px={196} py={360} sx={1350} sy={560} s={1.24} rotate={-1.5}>
				<Phone>
					<VerifyScreen
						hideButton
						digits={CODES[2].slice(0, typed)}
						focus={1}
						banner={
							<div style={{position: 'absolute', top: 60 - (1 - bannerIn) * 140, left: 18}}>
								<Bubble code={CODES[2]} highlight={hl} compact />
							</div>
						}
					/>
					{tick > 0.01 && (
						<div style={{position: 'absolute', inset: 0, background: `rgba(12,16,32,${0.55 * Math.min(1, tick)})`, display: 'grid', placeItems: 'center'}}>
							<div style={{transform: `scale(${tick})`, textAlign: 'center'}}>
								<div style={{width: 150, height: 150, borderRadius: 75, background: C.green, display: 'grid', placeItems: 'center', boxShadow: '0 14px 28px rgba(0,0,0,0.4)', margin: '0 auto'}}>
									<svg width="84" height="84" viewBox="0 0 24 24">
										<path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24" strokeDashoffset={24 * (1 - Math.min(1, tick))} />
									</svg>
								</div>
								<div style={{fontFamily: UI, fontWeight: 700, fontSize: 26, color: '#fff', marginTop: 16}}>Verified</div>
							</div>
						</div>
					)}
				</Phone>
			</Camera>
		</SceneIn>
	);
};

// ---------- composition ----------
export const ResendOtp = () => {
	return (
		<AbsoluteFill style={{background: BG.base}}>
			<Background />
			<Sequence from={T.s1} durationInFrames={T.s2 - T.s1}>
				<Scene1 />
			</Sequence>
			<Sequence from={T.s2} durationInFrames={T.s3 - T.s2}>
				<Scene2 />
			</Sequence>
			<Sequence from={T.s3} durationInFrames={T.s4 - T.s3}>
				<Scene3 />
			</Sequence>
			<Sequence from={T.s4} durationInFrames={T.end - T.s4}>
				<Scene4 />
			</Sequence>
			<Brand />
		</AbsoluteFill>
	);
};
