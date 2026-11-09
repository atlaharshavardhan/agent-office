import React from 'react';

// iPhone-style frame. Content is laid out in iOS points (393 × 852) and scaled by the caller.
export const PW = 393;
export const PH = 852;

const SignalBars = () => (
	<svg width="19" height="12" viewBox="0 0 19 12">
		{[0, 1, 2, 3].map((i) => (
			<rect key={i} x={i * 5} y={9 - i * 3} width="3.4" height={3 + i * 3} rx="1" fill="#fff" />
		))}
	</svg>
);

const Battery = () => (
	<svg width="27" height="13" viewBox="0 0 27 13">
		<rect x="0.5" y="0.5" width="23" height="12" rx="3.5" fill="none" stroke="#fff" strokeOpacity="0.45" />
		<rect x="2.5" y="2.5" width="17" height="8" rx="2" fill="#fff" />
		<rect x="24.6" y="4.2" width="1.8" height="4.6" rx="0.9" fill="#fff" fillOpacity="0.45" />
	</svg>
);

export const StatusBar = () => (
	<div style={{position: 'absolute', top: 0, left: 0, width: PW, height: 54, color: '#fff', fontFamily: 'Inter, sans-serif'}}>
		<div style={{position: 'absolute', left: 50, top: 18, fontSize: 17, fontWeight: 600, letterSpacing: -0.2}}>9:41</div>
		<div style={{position: 'absolute', left: (PW - 124) / 2, top: 11, width: 124, height: 36, borderRadius: 20, background: '#000'}} />
		<div style={{position: 'absolute', right: 34, top: 20, display: 'flex', alignItems: 'center', gap: 6}}>
			<SignalBars />
			<span style={{fontSize: 15, fontWeight: 700, letterSpacing: -0.2}}>5G</span>
			<Battery />
		</div>
	</div>
);

export const Phone = ({children, style}) => (
	<div
		style={{
			position: 'absolute',
			width: PW + 24,
			height: PH + 24,
			borderRadius: 66,
			background: '#2E3D78',
			padding: 12,
			boxShadow: '0 30px 60px rgba(0,0,0,0.45), 0 8px 18px rgba(0,0,0,0.3), inset 0 0 0 2px #3D4E90',
			...style,
		}}
	>
		<div style={{position: 'relative', width: PW, height: PH, borderRadius: 54, overflow: 'hidden', background: '#121C45'}}>
			{children}
			<StatusBar />
			<div style={{position: 'absolute', bottom: 9, left: (PW - 140) / 2, width: 140, height: 5, borderRadius: 3, background: '#fff', opacity: 0.8}} />
		</div>
	</div>
);

// Cartoon thumb. Its fingertip (pad) sits at the origin of its own coordinate space.
export const Thumb = ({x, y, press = 0, rotate = -18, scale = 1}) => (
	<svg
		width="360"
		height="760"
		viewBox="-120 -60 360 760"
		style={{position: 'absolute', left: x - 120 * scale, top: y - 60 * scale, transform: `scale(${scale})`, transformOrigin: '120px 60px', overflow: 'visible', pointerEvents: 'none'}}
	>
		<g transform={`rotate(${rotate}) translate(0 ${press * 10})`}>
			{/* soft drop shadow */}
			<rect x="-58" y="-28" width="150" height="560" rx="75" fill="#000" opacity="0.22" transform="translate(14 22)" />
			{/* sleeve */}
			<rect x="-78" y="380" width="190" height="320" rx="40" fill="#3D8BFD" />
			<rect x="-78" y="380" width="190" height="34" rx="14" fill="#2f6fd6" />
			{/* thumb */}
			<rect x="-58" y="-28" width="150" height="440" rx="75" fill="#F2B48C" />
			<path d="M-58 180 Q -40 260 -58 330" stroke="#d99268" strokeWidth="6" fill="none" strokeLinecap="round" />
			<path d="M 0 250 q 22 10 44 0" stroke="#d99268" strokeWidth="6" fill="none" strokeLinecap="round" />
			{/* nail */}
			<rect x="-26" y="-6" width="90" height="110" rx="40" fill="#FBD9C2" />
			<rect x="-14" y="6" width="26" height="44" rx="13" fill="#fff" opacity="0.55" />
		</g>
	</svg>
);
