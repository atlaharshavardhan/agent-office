import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoDistance, geoInterpolate, geoOrthographic, geoPath} from 'd3-geo';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import {ARCS, CITY, DOTS, ROUTE_LEG1, ROUTE_LEG2, india} from './data';
import TEX_POINTS from './texPoints.json';
import {Globe} from './Globe';

const fontFamily = 'Inter, sans-serif';
const W = 1920;
const H = 1080;
const ORANGE = '#ff8a2a';
const GOLD = '#ffc477';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const io = Easing.bezier(0.65, 0, 0.35, 1);
const R0 = 410;
const R1 = 2350;

// ---------- camera ----------
function camera(f) {
	const lon = interpolate(f, [0, 200], [12, 80], {...clamp, easing: io});
	const lat = interpolate(f, [0, 200], [14, 22.5], {...clamp, easing: io});
	const R = interpolate(f, [165, 275], [R0, R1], {...clamp, easing: Easing.bezier(0.55, 0, 0.2, 1)});
	const drift = interpolate(f, [275, 500], [0, 1], clamp);
	const cy = interpolate(f, [165, 275], [H / 2, H / 2 + 20], {...clamp, easing: io});
	return {lon: lon + drift * 0.6, lat: lat - drift * 0.25, R: R * (1 + drift * 0.035), cx: W / 2, cy};
}

// ---------- light points (unit vectors precomputed for fast culling) ----------
const toVec = (lon, lat) => {
	const a = (lon * Math.PI) / 180;
	const b = (lat * Math.PI) / 180;
	return [Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a), Math.sin(b)];
};
const POINTS = [
	...TEX_POINTS.map(([lon, lat, b], i) => ({lon, lat, b: 0.25 + b * 0.75, size: 0.5 + b * 0.8, seed: (i * 0.618) % 1, tex: true})),
	...DOTS.map((d) => ({lon: d.lon, lat: d.lat, b: 0.3 + d.hot * 0.7, size: d.r * 0.75, seed: d.seed, india: d.india, border: d.border})),
].map((p) => ({...p, v: toVec(p.lon, p.lat)}));

const Lights = ({projection, cam, zoomT, frame, fade}) => {
	const ref = useRef(null);
	useLayoutEffect(() => {
		const ctx = ref.current.getContext('2d');
		ctx.clearRect(0, 0, W, H);
		ctx.globalCompositeOperation = 'lighter';
		const c = toVec(cam.lon, cam.lat);
		const scale = Math.pow(cam.R / R0, 0.55);
		for (const p of POINTS) {
			const cosA = p.v[0] * c[0] + p.v[1] * c[1] + p.v[2] * c[2];
			if (cosA < 0.03) continue;
			const [x, y] = projection([p.lon, p.lat]);
			if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
			const tw = 0.8 + 0.2 * Math.sin(frame * (0.05 + p.seed * 0.1) + p.seed * 50);
			const inIndia = p.india;
			let a = Math.min(1, cosA * 3) * tw * p.b * fade;
			if (!p.tex) a *= inIndia ? 0.6 + 0.4 * zoomT : 0.45;
			if (!inIndia) a *= 1 - 0.55 * zoomT * (p.tex ? 0.6 : 1);
			if (p.border) a *= 0.5 + 0.7 * zoomT;
			const r = p.size * scale;
			// soft halo + hot core
			ctx.fillStyle = `rgba(255,150,60,${(a * 0.16).toFixed(3)})`;
			ctx.beginPath();
			ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = p.b > 0.75 ? `rgba(255,236,200,${a.toFixed(3)})` : `rgba(255,196,120,${a.toFixed(3)})`;
			ctx.beginPath();
			ctx.arc(x, y, Math.max(r, 0.45), 0, Math.PI * 2);
			ctx.fill();
		}
	}, [projection, cam, zoomT, frame, fade]);
	return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0}} />;
};

// ---------- stars ----------
const STARS = (() => {
	let s = 99;
	const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
	return Array.from({length: 900}, () => {
		const x = r() * W;
		const y = r() * H;
		// denser band toward the upper right, like a Milky Way streak
		const band = Math.exp(-Math.pow((y - (H * 0.9 - x * 0.55)) / 160, 2));
		return {x, y, rad: 0.3 + Math.pow(r(), 3) * 1.6, a: 0.25 + r() * 0.75, seed: r(), keep: r() < 0.45 + band * 0.55};
	}).filter((st) => st.keep);
})();

// Catmull–Rom densify a lon/lat polyline so the drawn line and the train share one path.
function densify(pts, per = 14) {
	const out = [];
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[Math.max(i - 1, 0)];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[Math.min(i + 2, pts.length - 1)];
		for (let s = 0; s < per; s++) {
			const t = s / per;
			const t2 = t * t;
			const t3 = t2 * t;
			out.push([0, 1].map((k) =>
				0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3),
			));
		}
	}
	out.push(pts[pts.length - 1]);
	return out;
}
const ROUTE = [...densify(ROUTE_LEG1), ...densify(ROUTE_LEG2).slice(1)];
const ITARSI_IDX = densify(ROUTE_LEG1).length - 1;

const Label = ({x, y, text, side = 'right', appear}) => {
	if (appear <= 0.001) return null;
	const dx = side === 'right' ? 14 : -14;
	return (
		<div
			style={{
				position: 'absolute',
				left: x + dx,
				top: y - 34,
				transform: `translateX(${side === 'right' ? 0 : -100}%) scale(${0.7 + 0.3 * appear})`,
				transformOrigin: side === 'right' ? 'left bottom' : 'right bottom',
				opacity: appear,
				padding: '7px 16px',
				borderRadius: 999,
				background: 'rgba(4,10,24,0.85)',
				border: '2px solid rgba(255,255,255,0.75)',
				color: 'white',
				fontFamily,
				fontWeight: 600,
				fontSize: 22,
				letterSpacing: 0.2,
				whiteSpace: 'nowrap',
				boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
			}}
		>
			{text}
		</div>
	);
};

export const NightExpress = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cam = camera(frame);

	const projection = useMemo(
		() => geoOrthographic().rotate([-cam.lon, -cam.lat]).scale(cam.R).translate([cam.cx, cam.cy]).clipAngle(90),
		[cam.lon, cam.lat, cam.R, cam.cx, cam.cy],
	);
	const path = geoPath(projection);
	const center = [cam.lon, cam.lat];

	const intro = interpolate(frame, [0, 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const zoomT = interpolate(cam.R, [R0, R1], [0, 1], clamp);

	// ---------- flight arcs ----------
	const arcsOpacity = interpolate(frame, [168, 200], [1, 0], clamp);
	const arcEls = [];
	if (arcsOpacity > 0) {
		ARCS.forEach(([a, b, start], i) => {
			const t = interpolate(frame, [start, start + 46], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
			if (t <= 0) return;
			const interp = geoInterpolate(a, b);
			const dist = geoDistance(a, b);
			const lift = 0.06 + dist * 0.12;
			const N = 60;
			const pts = [];
			for (let k = 0; k <= N * t; k++) {
				const s = k / N;
				const p = interp(s);
				const h = 1 + lift * Math.sin(Math.PI * s);
				const ang = geoDistance(p, center);
				const visible = Math.cos(ang) > 0 || h * Math.sin(ang) > 1;
				const [px, py] = projection(p);
				pts.push(visible ? [cam.cx + (px - cam.cx) * h, cam.cy + (py - cam.cy) * h] : null);
			}
			const segs = [];
			let cur = [];
			for (const p of pts) {
				if (p) cur.push(p);
				else if (cur.length) {
					segs.push(cur);
					cur = [];
				}
			}
			if (cur.length) segs.push(cur);
			const d = segs.map((s) => 'M' + s.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')).join('');
			const head = pts[pts.length - 1];
			const land = interpolate(frame - start - 46, [0, 20], [1, 0], clamp);
			arcEls.push(
				<g key={'arc' + i} opacity={arcsOpacity * intro}>
					<path d={d} fill="none" stroke={GOLD} strokeWidth={4} strokeOpacity={0.14} strokeLinecap="round" />
					<path d={d} fill="none" stroke="#ffd9a3" strokeWidth={1.3} strokeOpacity={0.85} strokeLinecap="round" />
					{t < 1 && head ? <circle cx={head[0]} cy={head[1]} r={3} fill="#fff" /> : null}
					{t >= 1 && head ? <circle cx={head[0]} cy={head[1]} r={2 + 8 * (1 - land)} fill="none" stroke="#ffe2c4" strokeOpacity={land} strokeWidth={1.5} /> : null}
				</g>,
			);
		});
	}

	// ---------- train route ----------
	const leg1 = interpolate(frame, [292, 352], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const leg2 = interpolate(frame, [372, 432], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const progressIdx = leg2 > 0 ? ITARSI_IDX + leg2 * (ROUTE.length - 1 - ITARSI_IDX) : leg1 * ITARSI_IDX;
	const routeShow = interpolate(frame, [270, 290], [0, 1], clamp);
	const rp = ROUTE.map((p) => projection(p));
	const whole = Math.floor(progressIdx);
	const frac = progressIdx - whole;
	const drawn = rp.slice(0, whole + 1);
	if (whole < rp.length - 1) {
		const a = rp[whole];
		const b = rp[whole + 1];
		drawn.push([a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac]);
	}
	const routeD = drawn.length > 1 ? 'M' + drawn.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L') : '';
	const fullD = 'M' + rp.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L');
	const train = drawn[drawn.length - 1];

	const [mx, my] = projection(CITY.mumbai);
	const [ix, iy] = projection(CITY.itarsi);
	const [px, py] = projection(CITY.patna);
	const pop = (f0) => spring({frame: frame - f0, fps, config: {damping: 14, stiffness: 160}});
	const mumbaiA = pop(278);
	const itarsiA = pop(348);
	const patnaA = pop(428);
	const pillA = pop(390);
	const stationPulse = (f0) => interpolate(frame - f0, [0, 30], [0, 1], clamp);

	return (
		<AbsoluteFill style={{background: '#010208', fontFamily}}>
			{/* stars */}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="milky" cx="85%" cy="12%" r="55%">
						<stop offset="0%" stopColor="#8fb0ff" stopOpacity="0.10" />
						<stop offset="100%" stopColor="#8fb0ff" stopOpacity="0" />
					</radialGradient>
				</defs>
				<rect width={W} height={H} fill="url(#milky)" />
				{STARS.map((s, i) => (
					<circle
						key={i}
						cx={(s.x - frame * 0.15 * (0.4 + s.seed) + W) % W}
						cy={s.y}
						r={s.rad}
						fill="#fff"
						opacity={s.a * (0.7 + 0.3 * Math.sin(frame * 0.08 + s.seed * 30)) * (1 - zoomT)}
					/>
				))}
			</svg>

			<Globe width={W} height={H} lon={cam.lon} lat={cam.lat} R={cam.R} cx={cam.cx} cy={cam.cy} t={frame} zoom={zoomT} fade={intro} />
			<Lights projection={projection} cam={cam} zoomT={zoomT} frame={frame} fade={intro} />

			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="halo">
						<stop offset="0%" stopColor="#ffb06a" stopOpacity="0.9" />
						<stop offset="35%" stopColor="#ff8a3a" stopOpacity="0.35" />
						<stop offset="100%" stopColor="#ff8a3a" stopOpacity="0" />
					</radialGradient>
					<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="6" result="b" />
						<feMerge>
							<feMergeNode in="b" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* India outline glow, grows in with the zoom */}
				<path d={path(india)} fill="#ffb878" fillOpacity={0.03 * zoomT} stroke={GOLD} strokeOpacity={0.35 * zoomT} strokeWidth={5} strokeLinejoin="round" filter="url(#glow)" />
				<path d={path(india)} fill="none" stroke="#ffe0bd" strokeOpacity={0.35 * zoomT} strokeWidth={1.1} strokeLinejoin="round" />

				<g>{arcEls}</g>

				{routeShow > 0 && (
					<g opacity={routeShow}>
						<path d={fullD} fill="none" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={3} strokeDasharray="2 8" strokeLinecap="round" />
						{routeD && (
							<>
								<path d={routeD} fill="none" stroke="#ff5a00" strokeWidth={20} strokeOpacity={0.5} strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
								<path d={routeD} fill="none" stroke="#ff5a00" strokeWidth={7.5} strokeLinecap="round" strokeLinejoin="round" />
								<path d={routeD} fill="none" stroke="#fff6ec" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
							</>
						)}
						<circle cx={mx} cy={my} r={6 * mumbaiA} fill="#fff" />
						{itarsiA > 0.01 && (
							<g transform={`translate(${ix} ${iy}) scale(${itarsiA})`}>
								<circle r={10 + 22 * stationPulse(348)} fill="none" stroke="#fff" strokeOpacity={0.6 * (1 - stationPulse(348))} strokeWidth={2} />
								<circle r={10} fill="#07102a" stroke="#fff" strokeWidth={2.5} />
								<circle r={4} fill="#fff" />
							</g>
						)}
						{patnaA > 0.01 && (
							<g transform={`translate(${px} ${py}) scale(${patnaA})`}>
								<circle r={10 + 22 * stationPulse(428)} fill="none" stroke="#fff" strokeOpacity={0.6 * (1 - stationPulse(428))} strokeWidth={2} />
								<circle r={7} fill="#fff" />
							</g>
						)}
						{train && progressIdx > 0.05 && progressIdx < ROUTE.length - 1.01 && (
							<g>
								<circle cx={train[0]} cy={train[1]} r={24} fill="url(#halo)" />
								<circle cx={train[0]} cy={train[1]} r={7} fill="#fff" stroke={ORANGE} strokeWidth={3} />
							</g>
						)}
					</g>
				)}
			</svg>

			<Label x={mx} y={my} text="Mumbai" side="left" appear={Math.min(mumbaiA, 1) * routeShow} />
			<Label x={ix} y={iy - 4} text="Itarsi Jn." appear={Math.min(itarsiA, 1)} />
			<Label x={px} y={py - 4} text="Patna" appear={Math.min(patnaA, 1)} />

			{pillA > 0.01 && (
				<div
					style={{
						position: 'absolute',
						left: 70,
						bottom: 64,
						opacity: Math.min(pillA, 1),
						transform: `translateY(${(1 - pillA) * 30}px)`,
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						padding: '13px 30px 13px 22px',
						borderRadius: 999,
						background: 'rgba(4,10,24,0.88)',
						border: '2px solid rgba(255,186,130,0.75)',
						color: 'white',
						fontWeight: 600,
						fontSize: 26,
						boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 30px rgba(255,140,60,0.15)',
					}}
				>
					<span style={{width: 11, height: 11, borderRadius: 99, background: ORANGE, boxShadow: `0 0 12px ${ORANGE}`, opacity: 0.6 + 0.4 * Math.sin(frame / 5)}} />
					Night Express · {Math.round(interpolate(frame, [390, 420], [0, 120], clamp))} km/h
				</div>
			)}

			<AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,${0.5 - zoomT * 0.15}) 100%)`}} />
		</AbsoluteFill>
	);
};
