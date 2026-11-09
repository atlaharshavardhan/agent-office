import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

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
const bubbleSeeds = Array.from({length: 18}, (_, i) => ({
	x: (i * 397) % 1920,
	y: (i * 613) % 1080,
	w: 90 + ((i * 53) % 120),
	far: i % 2 === 0,
	tailLeft: i % 3 === 0,
}));

// Two-layer parallax of soft chat-bubble shapes drifting upward.
const Bubbles = ({f}) => (
	<AbsoluteFill style={{overflow: 'hidden'}}>
		{bubbleSeeds.map((b, i) => {
			const speed = b.far ? 0.35 : 0.8;
			const y = ((b.y - f * speed) % 1240 + 1240) % 1240 - 120;
			const x = b.x + Math.sin((f + i * 40) / 70) * (b.far ? 10 : 22);
			const s = b.far ? 0.7 : 1.1;
			return (
				<div key={i} style={{position: 'absolute', left: x, top: y, width: b.w * s, height: b.w * 0.62 * s, borderRadius: 26 * s, background: T.panel, opacity: b.far ? 0.55 : 0.85}}>
					<div style={{position: 'absolute', bottom: -10 * s, [b.tailLeft ? 'left' : 'right']: 18 * s, width: 22 * s, height: 22 * s, background: T.panel, transform: 'rotate(45deg)', borderRadius: 4}} />
				</div>
			);
		})}
	</AbsoluteFill>
);

const Grain = ({f, opacity = 0.06}) => (
	<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity, pointerEvents: 'none', mixBlendMode: 'overlay'}}>
		<filter id="grain">
			<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 97} stitchTiles="stitch" />
			<feColorMatrix type="saturate" values="0" />
		</filter>
		<rect width={W} height={H} filter="url(#grain)" />
	</svg>
);

const Chip = ({text, show, top = 48, color = T.amber, dark = '#2a1a00'}) => (
	<div style={{position: 'absolute', top: top - (1 - show) * 90, width: '100%', display: 'flex', justifyContent: 'center', opacity: show, zIndex: 20}}>
		<div style={{padding: '12px 26px', borderRadius: 999, background: color, color: dark, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 3, boxShadow: SHADOW}}>{text}</div>
	</div>
);

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
	<div style={{position: 'relative', width: PW + 24, height: PH + 24, borderRadius: 66, background: '#1b2442', padding: 12, boxShadow: `${SHADOW}, inset 0 0 0 2px ${T.line}`}}>
		<div style={{position: 'relative', width: PW, height: PH, borderRadius: 54, overflow: 'hidden', background: T.bg}}>
			<div style={{position: 'absolute', inset: 0, filter: `saturate(${1 - tint * 0.45})`}}>{children}</div>
			{/* cool blue-grey flashback tint */}
			<div style={{position: 'absolute', inset: 0, background: '#7f9cd6', mixBlendMode: 'color', opacity: tint * 0.35, pointerEvents: 'none'}} />
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

const VerifyScreen = ({f, press = 0, toast = 0, note = null, sent = false}) => (
	<div style={{position: 'absolute', inset: 0, fontFamily: FONT, color: T.text}}>
		<div style={{position: 'absolute', top: 64, left: 20, fontSize: 17, fontWeight: 600, color: T.muted}}>‹ MyBank</div>
		<div style={{position: 'absolute', top: 128, left: (PW - 70) / 2, width: 70, height: 70, borderRadius: 22, background: T.panel, display: 'grid', placeItems: 'center', boxShadow: SHADOW}}>
			<svg width="32" height="32" viewBox="0 0 24 24">
				<rect x="4" y="10" width="16" height="12" rx="3" fill={T.muted} />
				<path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={T.muted} strokeWidth="2.6" fill="none" />
			</svg>
		</div>
		<div style={{position: 'absolute', top: 222, width: '100%', textAlign: 'center', fontSize: 28, fontWeight: 800}}>Verify it's you</div>
		<div style={{position: 'absolute', top: 266, width: '100%', textAlign: 'center', fontSize: 16, fontWeight: 500, color: T.muted}}>Enter the 6-digit code we sent</div>
		<div style={{position: 'absolute', top: 320, width: '100%', display: 'flex', justifyContent: 'center', gap: 9}}>
			{Array.from({length: 6}, (_, i) => (
				<div key={i} style={{width: 46, height: 58, borderRadius: 12, background: T.panel, border: `2px solid ${i === 0 ? T.muted : T.line}`}} />
			))}
		</div>
		<div
			style={{
				position: 'absolute',
				top: 430,
				left: (PW - 290) / 2,
				width: 290,
				height: 60,
				borderRadius: 30,
				background: sent ? T.panel : T.coral,
				color: sent ? T.muted : '#fff',
				display: 'grid',
				placeItems: 'center',
				fontSize: 19,
				fontWeight: 800,
				boxShadow: `0 ${8 - press * 6}px ${18 - press * 12}px rgba(0,0,0,0.35)`,
				transform: `scale(${1 - press * 0.06})`,
			}}
		>
			{sent ? 'Code sent' : 'Send code'}
		</div>
		{toast > 0.01 && (
			<div style={{position: 'absolute', top: 520, width: '100%', display: 'flex', justifyContent: 'center', opacity: Math.min(1, toast * 1.5), transform: `translateY(${(1 - toast) * 20}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 14, background: T.panel, border: `1px solid ${T.line}`, fontSize: 16, fontWeight: 700, color: T.text}}>
					<span style={{width: 14, height: 14, borderRadius: 7, border: `3px solid ${T.muted}`, borderTopColor: 'transparent', transform: `rotate(${f * 14}deg)`}} />
					Sending code…
				</div>
			</div>
		)}
		{note}
	</div>
);

// Simple flat thumb (fingertip at its own origin).
const Thumb = ({x, y, press = 0}) => (
	<svg width="300" height="640" viewBox="-110 -40 300 640" style={{position: 'absolute', left: x - 110, top: y - 40 + press * 10, overflow: 'visible'}}>
		<g transform="rotate(-22)">
			<rect x="-60" y="-24" width="140" height="560" rx="70" fill="#C68A62" />
			<rect x="-30" y="-6" width="82" height="104" rx="38" fill="#E3B595" />
			<rect x="-80" y="400" width="180" height="200" rx="36" fill={T.line} />
		</g>
	</svg>
);

// Mini-phone position above her head (train shot) and full-frame position.
const FULL = {x: 960, y: 572, s: 1.0};
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
		const press = interpolate(f, [S.tap - 4, S.tap, S.tap + 5], [0, 1, 0], clamp);
		const thumbOut = interpolate(f, [S.tap + 6, S.tap + 20], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
		const toast = sp(S.tap + 2);
		const shake = f >= S.tap && f < S.tap + 8 ? Math.sin((f - S.tap) * 3) * (8 - (f - S.tap)) * 0.6 : 0;
		// stage coordinates of the Send code button
		const btnX = FULL.x;
		const btnY = FULL.y + (460 - PH / 2) * FULL.s;
		const arcs = [0, 1, 2].map((k) => interpolate(f, [S.tap + 4 + k * 6, S.tap + 26 + k * 6], [0, 1], clamp));
		shot = (
			<>
				<AbsoluteFill style={{background: T.bg}}>
					<Bubbles f={f} />
				</AbsoluteFill>
				<PhoneAt x={FULL.x + shake} y={FULL.y + (1 - intro) * 60} s={FULL.s * (0.94 + 0.06 * intro)}>
					<Phone minutes={rewind} tint={tint}>
						<VerifyScreen f={f} press={press} toast={f >= S.tap ? toast : 0} sent={f >= S.tap + 30} />
					</Phone>
				</PhoneAt>
				{/* signal arcs from the top of the phone */}
				<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
					{arcs.map((p, k) =>
						p > 0 && p < 1 ? (
							<path key={k} d={`M ${960 - 60 - p * 140} ${50 - p * 30} Q 960 ${-10 - p * 70} ${960 + 60 + p * 140} ${50 - p * 30}`} stroke={T.coral} strokeWidth={8} fill="none" strokeLinecap="round" opacity={1 - p} />
						) : null,
					)}
				</svg>
				{f >= S.s3 && (
					<Thumb x={btnX + 90 + thumbIn * 360 + thumbOut * 360} y={btnY + 6 + thumbIn * 520 + thumbOut * 520} press={press} />
				)}
				<Chip text="20 MIN EARLIER" show={Math.min(1, chip)} />
			</>
		);
	}
	// ── S4 + S5: crowd, one tower, the queue ──
	else if (f < S.s6 + 18) {
		const lf = f - S.s4;
		// her phone shrinks into the crowd
		const shrink = spring({frame: lf, fps, config: {damping: 18, stiffness: 110}});
		const sceneIn = interpolate(lf, [0, 12], [0, 1], clamp);
		// camera: wide at S4, push into the queue at S5, follow her card out at S6
		const toQueue = interpolate(f, [S.s5 - 6, S.s5 + 22], [0, 1], {...clamp, easing: io});
		const camS = 1 + 0.32 * toQueue;
		const camX = -260 * toQueue;
		const camY = 120 * toQueue;
		// queue
		const TICKS = [S.s5 + 14, S.s5 + 34, S.s5 + 54];
		const shifted = (from) => TICKS.reduce((a, t) => a + (t >= from ? io(interpolate(f, [t, t + 10], [0, 1], clamp)) : 0), 0);
		const defs = [
			{join: S.s4 + 18, slot: 4},
			{join: S.s4 + 24, slot: 3},
			{join: S.s4 + 30, slot: 2},
			{join: S.s4 + 36, slot: 1},
			{join: S.s4 + 42, slot: 0, mine: true},
			{join: S.s5 + 24, slot: 0},
			{join: S.s5 + 44, slot: 0},
			{join: S.s5 + 64, slot: 0},
		];
		const lane = {x: 1010, y: 360};
		const lifeSec = Math.round(interpolate(f, [S.s4 + 42, S.s6], [180, 12], clamp));
		const life = `${Math.floor(lifeSec / 60)}:${String(lifeSec % 60).padStart(2, '0')}`;
		const wait = sp(S.s4 + 56);
		const towerLights = Math.floor(f / 15) % 2;
		const crowd = Array.from({length: 84}, (_, i) => ({x: 40 + ((i * 137) % 1840), row: Math.floor(i / 28), c: i % 4}));
		const crowdCols = ['#2a4a8f', '#3b3f86', '#22507a', '#4a3d7a'];
		// her card leaving at S6
		const leaveT = interpolate(f, [S.s6 - 4, S.s6 + 18], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
		shot = (
			<>
				<AbsoluteFill style={{background: T.bg, opacity: sceneIn}}>
					<Bubbles f={f} />
					<AbsoluteFill style={{transform: `translate(${camX}px, ${camY}px) scale(${camS})`, transformOrigin: '1300px 450px'}}>
						{/* tower */}
						<div style={{position: 'absolute', left: 620, top: 140}}>
							<Tower lights={towerLights} />
						</div>
						{/* incoming arcs from the crowd towards the tower */}
						<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
							{Array.from({length: 14}, (_, i) => {
								const p = ((lf / 26 + i * 0.137) % 1);
								const sx = 80 + ((i * 263) % 1760);
								const sy = 860;
								const x = sx + (800 - sx) * p;
								const y = sy + (180 - sy) * p - Math.sin(p * Math.PI) * 80;
								return <circle key={i} cx={x} cy={y} r={7} fill={T.muted} opacity={(1 - p) * 0.8} />;
							})}
						</svg>
						{/* crowd of phones */}
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
						{/* queue lane + gate */}
						<div style={{position: 'absolute', left: lane.x, top: lane.y, width: 760, height: 190, borderRadius: 30, background: T.panel, border: `2px solid ${T.line}`}} />
						<div style={{position: 'absolute', left: lane.x + 24, top: lane.y + 206, fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: T.muted}}>QUEUE · 1 AT A TIME →</div>
						{defs
							.filter((d) => f >= d.join)
							.map((d, i) => {
								const slot = d.slot + shifted(d.join);
								const enter = sp(d.join, {damping: 14, stiffness: 180});
								const leave = interpolate(slot, [4, 5], [1, 0], clamp);
								if (leave <= 0) return null;
								// impatient bump when the queue moves
								const bump = TICKS.reduce((a, t) => a + (f >= t && f < t + 12 ? Math.sin((f - t) * 1.2) * (12 - (f - t)) * 0.5 : 0), 0);
								let x = lane.x + 26 + slot * 146 + bump;
								let y = lane.y + 20 - (1 - enter) * 140 + (1 - leave) * 40;
								let scale = 1;
								if (d.mine && leaveT > 0) {
									x += leaveT * 260;
									y += leaveT * 700;
									scale = 1 + leaveT * 1.6;
								}
								return (
									<div key={i} style={{position: 'absolute', left: x, top: y, opacity: Math.min(1, enter * 2) * leave, zIndex: d.mine ? 3 : 2, transform: `scale(${scale})`}}>
										<QueueCard mine={d.mine} life={d.mine ? life : null} wait={wait} />
									</div>
								);
							})}
						{/* counter */}
						<div style={{position: 'absolute', left: 120, top: 210, padding: '16px 26px', borderRadius: 18, background: T.panel, border: `2px solid ${T.line}`, color: T.text, fontFamily: FONT, fontWeight: 800, fontSize: 36, boxShadow: SHADOW, opacity: interpolate(lf, [10, 22], [0, 1], clamp) * (1 - toQueue)}}>
							{Math.round(interpolate(lf, [10, 70], [20, 600], clamp))}+ phones <span style={{color: T.muted}}>·</span> 1 tower
						</div>
					</AbsoluteFill>
				</AbsoluteFill>
				{/* her phone shrinking into the crowd (S4 entry) */}
				{lf < 22 && (
					<PhoneAt x={interpolate(shrink, [0, 1], [FULL.x, 1180])} y={interpolate(shrink, [0, 1], [FULL.y, 900])} s={interpolate(shrink, [0, 1], [FULL.s, 0.05])}>
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
				<div style={{position: 'absolute', left: FULL.x + 290, top: 330, opacity: Math.min(1, label * 1.4), transform: `translateX(${(1 - label) * 40}px)`, fontFamily: FONT}}>
					<div style={{padding: '18px 26px', borderRadius: 20, background: T.panel, border: `2px solid ${T.line}`, boxShadow: SHADOW}}>
						<div style={{fontSize: 34, fontWeight: 800, color: T.text}}>valid 3 min</div>
						<div style={{fontSize: 34, fontWeight: 800, color: T.red, marginTop: 4}}>arrived after 5</div>
					</div>
				</div>
				<Chip text="9:26 · 5 MIN LATER" show={Math.min(1, sp(S.s6 + 10))} />
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
