import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import {StatusBar} from './Phone';

// "The woman" segment: ~23 s, 1920×1080 (YouTube 16:9), 30 fps. Flat InvisiTech style:
// dark navy, one bold accent per element, soft shadows, no glow.
const NAVY = '#0B1532';
const C = {
	orange: '#FF8A1F', // her OTP card
	teal: '#14B8A6', // her kurta
	purple: '#9B7BFF', // the tower
	red: '#FF4D5E', // expired
	amber: '#FFC233', // station board LEDs
	blue: '#4C9BFF',
	muted: '#8D96AD',
	skin: '#C68A62',
	skinDark: '#A86E4A',
};
const HEAD = 'Poppins, sans-serif';
const UI = 'Inter, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

export const W = {w1: 0, w2: 120, w3: 330, w4: 540, w5: 600, end: 690};

const useSpr = (at, cfg = {damping: 13, stiffness: 170}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return spring({frame: f - at, fps, config: cfg});
};

// ---------- shared pieces ----------
const Brand = () => (
	<div style={{position: 'absolute', top: 44, left: 56, display: 'flex', zIndex: 5}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px', borderRadius: 999, background: '#16244f', boxShadow: '0 6px 16px rgba(0,0,0,0.3)', fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: '#fff', letterSpacing: 0.5}}>
			<span style={{width: 16, height: 16, borderRadius: 5, background: C.blue, transform: 'rotate(45deg)'}} />
			InvisiTech
		</div>
	</div>
);

const Tag = ({text, at = 0, top = 48}) => {
	const s = useSpr(at);
	return (
		<div style={{position: 'absolute', top, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 5}}>
			<div style={{padding: '10px 26px', borderRadius: 12, background: '#cfd8ea', color: '#1b2540', fontFamily: UI, fontWeight: 700, fontSize: 30, letterSpacing: 3, boxShadow: '0 6px 14px rgba(0,0,0,0.3)', opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * -20}px)`}}>
				{text}
			</div>
		</div>
	);
};

const Caption = ({words, top = 130, size = 72, left = 0, width = '100%', align = 'center'}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<div style={{position: 'absolute', top, left, width, padding: '0 70px', boxSizing: 'border-box', textAlign: align, fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 1.12, color: '#fff', zIndex: 5}}>
			{words.map((w, i) => {
				const s = spring({frame: f - w.at, fps, config: {damping: 12, stiffness: 200}});
				return (
					<span key={i} style={{display: 'inline-block', marginRight: '0.24em', color: w.color || '#fff', opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 36}px) scale(${0.6 + 0.4 * s})`, textShadow: '0 6px 14px rgba(0,0,0,0.35)'}}>
						{w.text}
					</span>
				);
			})}
		</div>
	);
};

// Blue-grey "memory" grade: everything desaturates except elements rendered on top of it.
const Memory = ({amount, children}) => (
	<AbsoluteFill style={{isolation: 'isolate'}}>
		<AbsoluteFill style={{filter: `grayscale(${amount}) brightness(${1 - amount * 0.05})`}}>{children}</AbsoluteFill>
		<AbsoluteFill style={{background: '#4f78c4', mixBlendMode: 'multiply', opacity: amount * 0.7}} />
	</AbsoluteFill>
);

const Hourglass = ({size = 40, color = '#2a1600', t = 0}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" style={{transform: `rotate(${t}deg)`}}>
		<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
		<path d="M9 19c1-2 2-3 3-3s2 1 3 3z" fill={color} />
	</svg>
);

// OTP card used in the queue
const CodeCard = ({mine = false, grey = 0, w = 120, h = 150, wait = 0, children}) => (
	<div
		style={{
			position: 'relative',
			width: w,
			height: h,
			borderRadius: 20,
			background: mine ? (grey ? '#5d6476' : C.orange) : '#2a3557',
			boxShadow: '0 8px 16px rgba(0,0,0,0.35)',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 10,
			color: mine ? '#2a1600' : '#c8d0e6',
			fontFamily: UI,
			fontWeight: 800,
		}}
	>
		<svg width={w * 0.42} height={w * 0.3} viewBox="0 0 30 21">
			<rect x="1" y="1" width="28" height="19" rx="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
			<path d="M2 3l13 9 13-9" fill="none" stroke="currentColor" strokeWidth="2.4" />
		</svg>
		<div style={{fontSize: w * 0.17, letterSpacing: 2}}>OTP</div>
		{mine && wait > 0.01 && (
			<div style={{position: 'absolute', top: -26, right: -26, width: 62, height: 62, borderRadius: 31, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 6px 12px rgba(0,0,0,0.35)', transform: `scale(${wait})`}}>
				<Hourglass size={36} t={0} />
			</div>
		)}
		{children}
	</div>
);

// ---------- the woman ----------
// Seated, holding her phone. slump: 0..1 drops head + shoulders. sigh: 0..1 shows the puff.
const Woman = ({slump = 0, sigh = 0, look = 0}) => {
	const sh = slump * 18;
	const hd = slump * 34;
	return (
		<svg width="760" height="980" viewBox="0 0 760 980" style={{overflow: 'visible'}}>
			{/* seat back */}
			<rect x="150" y="70" width="460" height="1300" rx="70" fill="#2b4a8a" />
			<rect x="190" y="40" width="380" height="150" rx="60" fill="#33569c" />
			<rect x="150" y="70" width="460" height="1300" rx="70" fill="none" stroke="#3a5fa8" strokeWidth="6" />
			<g transform={`translate(0 ${sh})`}>
				{/* torso (kurta) */}
				<path d="M200 1400 L210 560 Q 220 470 300 450 L 460 450 Q 540 470 550 560 L 560 1400 Z" fill={C.teal} />
				{/* dupatta over left shoulder */}
				<path d="M300 450 Q 250 520 262 700 Q 268 820 236 1400 L 300 1400 Q 320 760 330 600 Q 340 500 360 452 Z" fill="#0e8d80" />
				{/* neckline */}
				<path d="M345 450 Q 380 505 415 450 Z" fill={C.skin} />
				{/* arms */}
				<path d="M215 600 Q 200 760 300 800 L 360 770 Q 290 730 300 600 Z" fill="#0fa392" />
				<path d="M545 600 Q 560 760 460 800 L 400 770 Q 470 730 460 600 Z" fill="#0fa392" />
				{/* phone + hands */}
				<g transform="translate(380 760) rotate(-8)">
					<rect x="-62" y="-110" width="124" height="220" rx="22" fill="#151a2b" />
					<rect x="-54" y="-100" width="108" height="200" rx="16" fill="#26324f" />
					<rect x="-40" y="-60" width="80" height="40" rx="8" fill={C.orange} opacity="0.9" />
				</g>
				<ellipse cx="318" cy="808" rx="40" ry="32" fill={C.skin} />
				<ellipse cx="442" cy="808" rx="40" ry="32" fill={C.skin} />
			</g>
			{/* head */}
			<g transform={`translate(380 ${330 + sh + hd * 0.6}) rotate(${slump * 6 + look * -3})`}>
				<rect x="-28" y="40" width="56" height="90" rx="20" fill={C.skinDark} />
				{/* hair back */}
				<ellipse cx="0" cy="-10" rx="118" ry="128" fill="#1d1a2b" />
				<circle cx="-70" cy="-100" r="52" fill="#1d1a2b" />
				{/* face */}
				<ellipse cx="0" cy="10" rx="92" ry="108" fill={C.skin} />
				{/* fringe */}
				<path d="M-100 -20 Q -90 -120 0 -118 Q 90 -120 102 -20 Q 60 -80 0 -78 Q -40 -80 -100 -20 Z" fill="#1d1a2b" />
				{/* bindi + earrings */}
				<circle cx="0" cy="-34" r="7" fill={C.red} />
				<circle cx="-94" cy="40" r="10" fill={C.amber} />
				<circle cx="94" cy="40" r="10" fill={C.amber} />
				{/* eyes: looking down at the phone, closed when sighing */}
				{sigh > 0.5 ? (
					<>
						<path d="M-50 16 q 18 12 36 0" stroke="#1d1a2b" strokeWidth="7" fill="none" strokeLinecap="round" />
						<path d="M14 16 q 18 12 36 0" stroke="#1d1a2b" strokeWidth="7" fill="none" strokeLinecap="round" />
					</>
				) : (
					<>
						<ellipse cx="-32" cy="22" rx="11" ry="8" fill="#1d1a2b" />
						<ellipse cx="32" cy="22" rx="11" ry="8" fill="#1d1a2b" />
						<path d="M-50 4 q 18 -8 36 -2" stroke="#1d1a2b" strokeWidth="5" fill="none" strokeLinecap="round" />
						<path d="M14 2 q 18 -6 36 2" stroke="#1d1a2b" strokeWidth="5" fill="none" strokeLinecap="round" />
					</>
				)}
				<path d="M0 34 q -8 22 4 26" stroke={C.skinDark} strokeWidth="5" fill="none" strokeLinecap="round" />
				{sigh > 0.5 ? <ellipse cx="6" cy="78" rx="12" ry="10" fill="#7a3a2c" /> : <path d="M-16 76 q 16 8 32 0" stroke="#7a3a2c" strokeWidth="6" fill="none" strokeLinecap="round" />}
			</g>
			{/* sigh puff */}
			{sigh > 0.01 && (
				<g transform={`translate(${470 + sigh * 40} ${420 + sh + hd}) scale(${sigh})`} opacity={Math.min(1, (1.4 - sigh) * 2)}>
					<path d="M0 0 q 30 -40 70 -10 q 40 -30 70 10 q 30 30 -10 50 q -40 30 -70 0 q -40 20 -60 -20 q -20 -10 0 -30 z" fill="#e9eef8" />
				</g>
			)}
		</svg>
	);
};

// Train compartment: window with night passing by, plus the woman.
const Train = ({f, slump = 0, sigh = 0}) => {
	const speed = f * 14;
	return (
		<AbsoluteFill style={{background: '#14214a'}}>
			{/* window */}
			<div style={{position: 'absolute', left: 120, top: 70, width: 1680, height: 560, borderRadius: 60, background: '#1f2d5a', padding: 26, boxShadow: 'inset 0 0 0 4px #2a3a70'}}>
				<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', background: '#060c22'}}>
					<div style={{position: 'absolute', right: 120, top: 70, width: 70, height: 70, borderRadius: 35, background: '#e9eef8'}} />
					<div style={{position: 'absolute', right: 100, top: 62, width: 70, height: 70, borderRadius: 35, background: '#060c22'}} />
					{Array.from({length: 24}, (_, i) => {
						const x = ((i * 173 - speed) % 1900 + 1900) % 1900 - 100;
						return <div key={i} style={{position: 'absolute', left: x, top: 300 + (i % 3) * 40, width: 10 + (i % 4) * 4, height: 10 + (i % 4) * 4, borderRadius: 3, background: i % 3 ? '#ffd27a' : '#ffffff', opacity: 0.85}} />;
					})}
					{/* hills */}
					<svg width="1628" height="508" style={{position: 'absolute', inset: 0}}>
						<path d="M0 420 Q 200 360 400 410 T 800 400 T 1200 410 T 1628 400 L 1628 508 L 0 508 Z" fill="#0d1838" />
					</svg>
				</div>
			</div>
			{/* table */}
						<div style={{position: 'absolute', left: 656, top: 156, transform: 'scale(0.8)', transformOrigin: '0 0'}}>
				<Woman slump={slump} sigh={sigh} />
			</div>
		</AbsoluteFill>
	);
};

// ---------- beats ----------
// W1 0–4 s: push into her phone, colour fades to blue-grey, "EARLIER · 21:47"
const W1 = () => {
	const f = useCurrentFrame();
	const t = interpolate(f, [0, 120], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const push = 1 + 1.5 * t;
	const grade = interpolate(f, [40, 100], [0, 1], clamp);
	return (
		<AbsoluteFill>
			<Memory amount={grade}>
				<AbsoluteFill style={{transform: `translateY(${-224 * t}px) scale(${push})`, transformOrigin: '960px 764px'}}>
					<Train f={f} />
				</AbsoluteFill>
			</Memory>
			{f > 70 && <Tag text="EARLIER · 21:47" at={72} />}
		</AbsoluteFill>
	);
};

// W2 4–11 s: crowd + one tower, code cards slide into the queue, her orange card waits ⏳
const QUEUE_SLOTS = 6;
const W2 = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const towerIn = spring({frame: f - 4, fps, config: {damping: 12, stiffness: 120}});
	// Queue of 5 slots (0 = back, by the tower; 4 = front). Every tick the front card leaves,
	// everyone shifts one slot forward and a new card joins at the back.
	const TICKS = [52, 92, 132, 172];
	const shiftAt = (f0) => TICKS.reduce((acc, t) => acc + Easing.inOut(Easing.cubic)(interpolate(f, [t, t + 16], [0, 1], clamp)) * (t >= f0 ? 1 : 0), 0);
	const cardsDef = [
		{join: 6, slot: 3},
		{join: 12, slot: 2},
		{join: 18, slot: 1},
		{join: 24, slot: 0},
		{join: 62, slot: 0, mine: true},
		{join: 102, slot: 0},
		{join: 142, slot: 0},
		{join: 182, slot: 0},
	];
	const cards = cardsDef
		.filter((c) => f >= c.join)
		.map((c, i) => ({i, mine: !!c.mine, slot: c.slot + shiftAt(c.join), enter: spring({frame: f - c.join, fps, config: {damping: 14, stiffness: 160}})}));
	const crowd = Array.from({length: 66}, (_, i) => ({x: 20 + ((i * 89) % 1860), row: Math.floor(i / 22), hue: i % 5}));
	const bodyCols = ['#5d6bb0', '#b0605d', '#5db08a', '#b0a05d', '#8a5db0'];
	const lane = {x: 520, y: 450, w: 760};
	return (
		<AbsoluteFill>
			<Memory amount={1}>
				<AbsoluteFill style={{background: '#14214a'}}>
					{/* platform */}
					<div style={{position: 'absolute', left: 0, top: 790, width: 1920, height: 300, background: '#1d2b5c'}} />
					<div style={{position: 'absolute', left: 0, top: 790, width: 1920, height: 14, background: '#e2c35a'}} />
					{/* crowd */}
					{crowd.map((p, i) => {
						const y = 830 + p.row * 80;
						const bob = Math.sin(f / 8 + i) * 4;
						return (
							<div key={i} style={{position: 'absolute', left: p.x + (p.row % 2) * 45, top: y + bob}}>
								<div style={{width: 46, height: 46, borderRadius: 23, background: ['#c68a62', '#a86e4a', '#e0b08a'][i % 3], margin: '0 auto'}} />
								<div style={{width: 74, height: 110, borderRadius: '30px 30px 10px 10px', background: bodyCols[p.hue], marginTop: 6}} />
								<div style={{position: 'absolute', left: 26, top: 64, width: 22, height: 34, borderRadius: 5, background: '#dfe6f5'}} />
							</div>
						);
					})}
					{/* "hundreds" counter */}
					<div style={{position: 'absolute', left: 1330, top: 520, padding: '12px 22px', borderRadius: 12, background: '#2a3557', color: '#fff', fontFamily: UI, fontWeight: 800, fontSize: 30}}>
						👥 {Math.round(interpolate(f, [20, 120], [40, 600], clamp))}+ on 1 tower
					</div>
					{/* queue lane */}
					<div style={{position: 'absolute', left: lane.x, top: lane.y, width: lane.w, height: 190, borderRadius: 30, background: '#0f1838', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.4)'}} />
					<div style={{position: 'absolute', left: lane.x + 20, top: lane.y - 44, fontFamily: UI, fontWeight: 800, fontSize: 28, color: C.muted, letterSpacing: 3}}>QUEUE →</div>
				</AbsoluteFill>
			</Memory>
			{/* tower */}
			<svg width="300" height="640" style={{position: 'absolute', left: 170, top: 250 + (1 - towerIn) * 300, opacity: towerIn}}>
				<path d="M150 40 L 60 620 M150 40 L 240 620 M 98 380 L 202 380 M 80 500 L 220 500 M 118 260 L 182 260 M 98 380 L 182 260 M 202 380 L 118 260 M 80 500 L 202 380 M 220 500 L 98 380" stroke={C.purple} strokeWidth="12" strokeLinecap="round" fill="none" />
				<circle cx="150" cy="40" r="20" fill={C.purple} />
				{[0, 1, 2].map((k) => {
					const p = ((f / 30 + k / 3) % 1);
					return <path key={k} d={`M ${150 - 40 - p * 80} ${40 - 30 - p * 50} A ${60 + p * 100} ${60 + p * 100} 0 0 1 ${150 + 40 + p * 80} ${40 - 30 - p * 50}`} stroke={C.purple} strokeWidth="8" fill="none" opacity={1 - p} strokeLinecap="round" />;
				})}
			</svg>
			{/* cards on top of the grade so hers keeps its colour */}
			{cards.map(({i, slot, enter, mine}) => {
				const x = lane.x + 25 + slot * 142;
				const leave = interpolate(slot, [4, 5], [1, 0], clamp);
				if (leave <= 0) return null;
				return (
					<div key={i} style={{position: 'absolute', left: x, top: lane.y + 20 - (1 - enter) * 160 + (1 - leave) * 60, opacity: Math.min(1, enter * 2) * leave, filter: mine ? 'none' : 'grayscale(1)', zIndex: mine ? 3 : 2}}>
						<CodeCard mine={mine} wait={mine ? spring({frame: f - 80, fps, config: {damping: 10, stiffness: 180}}) : 0} />
					</div>
				);
			})}
			<Tag text="EARLIER · 21:47" />
			<Caption
				words={[
					{text: 'Hundreds', at: 30},
					{text: 'of', at: 33},
					{text: 'people.', at: 36},
					{text: 'One', at: 70, color: C.purple},
					{text: 'tower.', at: 74, color: C.purple},
				]}
			/>
			{f > 85 && (
				<div style={{position: 'absolute', left: 560, top: 668, fontFamily: HEAD, fontWeight: 800, fontSize: 54, color: '#fff', opacity: interpolate(f, [86, 96], [0, 1], clamp), transform: `translateY(${interpolate(f, [86, 96], [20, 0], clamp)}px)`, textShadow: '0 6px 14px rgba(0,0,0,0.35)'}}>
					Her <span style={{color: C.orange}}>code</span> is stuck…
				</div>
			)}
		</AbsoluteFill>
	);
};

// W3 11–18 s: her card drops in, turns grey, EXPIRED stamps; "valid 3 min · arrived after 5"
const W3 = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const drop = spring({frame: f - 10, fps, config: {damping: 11, stiffness: 140}});
	const grey = interpolate(f, [60, 75], [0, 1], clamp);
	const stamp = spring({frame: f - 80, fps, config: {damping: 10, stiffness: 260}});
	const chip = spring({frame: f - 100, fps});
	const shake = f >= 80 && f < 92 ? Math.sin((f - 80) * 2.4) * (92 - f) * 1.2 : 0;
	return (
		<AbsoluteFill>
			<Memory amount={1}>
				<AbsoluteFill style={{background: '#14214a'}} />
			</Memory>
			<Tag text="EARLIER · 21:49 → 21:52" />
			<Caption top={190} size={84} left={820} width={1060} align="left" words={[{text: 'A', at: 120}, {text: 'late', at: 123}, {text: 'code', at: 126}, {text: 'is', at: 129}, {text: 'a', at: 132}, {text: 'dead', at: 136, color: C.red}, {text: 'code.', at: 140, color: C.red}]} />
			{/* her phone, big */}
			<div style={{position: 'absolute', left: 260, top: 130, width: 460, height: 920, borderRadius: 70, background: '#1d2433', padding: 16, boxShadow: '0 30px 60px rgba(0,0,0,0.45), inset 0 0 0 2px #2f3a52', transform: `translateX(${shake}px)`, filter: 'grayscale(0.8)'}}>
				<div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 56, overflow: 'hidden', background: '#0c1020'}}>
					<div style={{transform: 'scale(1.18)', transformOrigin: '0 0'}}>
						<StatusBar />
					</div>
					<div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: UI, fontSize: 30, fontWeight: 700, color: '#fff'}}>Messages</div>
				</div>
			</div>
			{/* her card drops into the phone and becomes the message */}
			<div style={{position: 'absolute', left: 290, top: 440 - (1 - drop) * 700, width: 400, transform: `translateX(${shake}px) rotate(${(1 - drop) * -12}deg)`}}>
				<div style={{position: 'relative', borderRadius: 26, padding: '22px 24px', background: grey > 0.5 ? '#4e5568' : C.orange, color: grey > 0.5 ? '#c3c8d6' : '#2a1600', fontFamily: UI, boxShadow: '0 10px 20px rgba(0,0,0,0.4)'}}>
					<div style={{fontSize: 20, fontWeight: 700, opacity: 0.8}}>JM-MYBANK-T · 21:52</div>
					<div style={{fontSize: 52, fontWeight: 800, letterSpacing: 4, marginTop: 6, position: 'relative', display: 'inline-block'}}>
						739 104
						<span style={{position: 'absolute', left: -6, top: '52%', height: 6, borderRadius: 3, background: C.red, width: `${interpolate(f, [86, 98], [0, 106], clamp)}%`}} />
					</div>
					<div style={{fontSize: 21, fontWeight: 600, marginTop: 6}}>is your OTP. Valid for 3 min.</div>
					{stamp > 0.01 && (
						<div style={{position: 'absolute', right: 18, top: 70, padding: '6px 18px', border: `6px solid ${C.red}`, borderRadius: 14, color: C.red, fontWeight: 800, fontSize: 40, letterSpacing: 3, background: '#4e5568', opacity: Math.min(1, stamp), transform: `rotate(-12deg) scale(${2.4 - 1.4 * stamp})`}}>EXPIRED</div>
					)}
				</div>
			</div>
			{/* life of the code: valid 0–3 min, arrived at 5 */}
			<div style={{position: 'absolute', left: 890, width: 860, top: 640, fontFamily: UI, color: '#fff', opacity: interpolate(f, [100, 112], [0, 1], clamp)}}>
				<div style={{position: 'relative', height: 34, borderRadius: 17, background: '#2a3147'}}>
					<div style={{position: 'absolute', left: 0, top: 0, height: 34, borderRadius: 17, width: `${interpolate(f, [104, 124], [0, 60], clamp)}%`, background: '#22C55E'}} />
					<div style={{position: 'absolute', left: '100%', top: -16, width: 10, height: 66, borderRadius: 4, marginLeft: -4, background: C.red, opacity: interpolate(f, [126, 132], [0, 1], clamp)}} />
				</div>
				<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 30, fontWeight: 700, color: C.muted}}>
					{['0', '1', '2', '3', '4', '5 min'].map((m) => <span key={m}>{m}</span>)}
				</div>
				<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 22, fontSize: 34, fontWeight: 800}}>
					<span style={{color: '#22C55E'}}>alive</span>
					<span style={{color: C.red}}>arrived ✕</span>
				</div>
			</div>
			{/* timing chip */}
			<div style={{position: 'absolute', top: 470, left: 890, display: 'flex', opacity: Math.min(1, chip * 1.5), transform: `translateY(${(1 - chip) * 30}px)`}}>
				<div style={{display: 'flex', gap: 18, fontFamily: UI, fontWeight: 800, fontSize: 40}}>
					<div style={{padding: '14px 22px', borderRadius: 16, background: '#203058', color: '#fff'}}>⏱ valid 3 min</div>
					<div style={{padding: '14px 22px', borderRadius: 16, background: C.red, color: '#fff'}}>arrived after 5</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// W4 18–20 s: back to colour in the train, she sighs, shoulders + head drop
const W4 = () => {
	const f = useCurrentFrame();
	const back = interpolate(f, [0, 14], [1, 0], clamp);
	const slump = interpolate(f, [16, 40], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const sigh = interpolate(f, [14, 34, 56], [0, 1, 1.4], clamp);
	return (
		<AbsoluteFill>
			<Memory amount={back}>
				<AbsoluteFill style={{transform: `scale(${1.3 - 0.1 * (f / 60)})`, transformOrigin: '960px 640px'}}>
					<Train f={540 + f} slump={slump} sigh={sigh} />
				</AbsoluteFill>
			</Memory>
		</AbsoluteFill>
	);
};

// W5 20–23 s: station board + popup "Itarsi Junction in 40 minutes"
const W5 = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const board = spring({frame: f, fps, config: {damping: 14, stiffness: 150}});
	const pop = spring({frame: f - 18, fps, config: {damping: 11, stiffness: 190}});
	const blink = Math.floor(f / 12) % 2;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'brightness(0.55)'}}>
				<Train f={600 + f} slump={1} />
			</AbsoluteFill>
			{/* station board */}
			<div style={{position: 'absolute', left: 460, top: 120, width: 1000, borderRadius: 30, background: '#0a0f1f', padding: '34px 40px', boxShadow: '0 24px 48px rgba(0,0,0,0.5), inset 0 0 0 4px #222c48', transform: `translateY(${(1 - board) * -400}px)`}}>
				<div style={{fontFamily: UI, fontWeight: 700, color: C.muted, fontSize: 28, letterSpacing: 4}}>NEXT STATION</div>
				<div style={{fontFamily: '"Courier New", monospace', fontWeight: 700, color: C.amber, fontSize: 96, letterSpacing: 6, marginTop: 6}}>ITARSI JN</div>
				<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 18, fontFamily: '"Courier New", monospace', fontWeight: 700, color: C.amber, fontSize: 48}}>
					<span>ETA 22:41</span>
					<span style={{opacity: blink ? 1 : 0.35}}>● 40 MIN</span>
				</div>
			</div>
			{/* popup */}
			<div style={{position: 'absolute', left: 510, top: 560, width: 900, borderRadius: 34, background: '#f4f6fb', padding: '28px 32px', display: 'flex', gap: 24, alignItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', opacity: Math.min(1, pop * 1.5), transform: `translateY(${(1 - pop) * 80}px) scale(${0.85 + 0.15 * pop})`}}>
				<div style={{width: 96, height: 96, borderRadius: 24, background: C.blue, display: 'grid', placeItems: 'center', fontSize: 54}}>🚆</div>
				<div style={{fontFamily: UI, color: '#0b1532'}}>
					<div style={{fontSize: 24, fontWeight: 700, color: '#5b6378'}}>RAIL ALERT · now</div>
					<div style={{fontSize: 40, fontWeight: 800, marginTop: 4}}>Itarsi Junction in 40 minutes</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const WomanSegment = () => (
	<AbsoluteFill style={{background: NAVY}}>
		<Sequence from={W.w1} durationInFrames={W.w2 - W.w1}>
			<W1 />
		</Sequence>
		<Sequence from={W.w2} durationInFrames={W.w3 - W.w2}>
			<W2 />
		</Sequence>
		<Sequence from={W.w3} durationInFrames={W.w4 - W.w3}>
			<W3 />
		</Sequence>
		<Sequence from={W.w4} durationInFrames={W.w5 - W.w4}>
			<W4 />
		</Sequence>
		<Sequence from={W.w5} durationInFrames={W.end - W.w5}>
			<W5 />
		</Sequence>
		<Brand />
	</AbsoluteFill>
);
