import React from 'react';

// Flat stand-in for the woman (same character as the earlier woman frames).
// slump 0..1 drops head + shoulders; sigh 0..1 closes eyes and shows a breath puff.
const C = {
	teal: '#14B8A6',
	skin: '#C68A62',
	skinDark: '#A86E4A',
	red: '#E5484D',
	amber: '#F5A623',
	orange: '#F5A623',
};

export const Woman = ({slump = 0, sigh = 0, look = 0}) => {
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
