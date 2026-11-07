import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath} from 'd3-geo';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import {ARCS, CITY, DOTS, ROUTE_LEG1, ROUTE_LEG2} from './data';

const fontFamily = 'Inter, sans-serif';

const W = 1920;
const H = 1080;
const BG = '#040b1a';
const ORANGE = '#ff9a4a';
const graticule = geoGraticule10();

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const io = Easing.bezier(0.65, 0, 0.35, 1);

// ---------- camera ----------
function camera(f) {
	// spin toward India, then dive in
	const lon = interpolate(f, [0, 200], [-8, 80], {...clamp, easing: io});
	const lat = interpolate(f, [0, 200], [6, 22.5], {...clamp, easing: io});
	const R = interpolate(f, [165, 275], [380, 2350], {...clamp, easing: Easing.bezier(0.55, 0, 0.2, 1)});
	// tiny settle drift on the final shot
	const drift = interpolate(f, [275, 480], [0, 1], clamp);
	const cy = interpolate(f, [165, 275], [H / 2, H / 2 + 20], {...clamp, easing: io});
	return {lon: lon + drift * 0.6, lat: lat - drift * 0.25, R: R * (1 + drift * 0.035), cx: W / 2, cy};
}

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

// ---------- pieces ----------
const Label = ({x, y, text, side = 'right', appear}) => {
	const s = appear;
	if (s <= 0.001) return null;
	const dx = side === 'right' ? 14 : -14;
	return (
		<div
			style={{
				position: 'absolute',
				left: x + dx,
				top: y - 34,
				transform: `translateX(${side === 'right' ? 0 : -100}%) scale(${0.7 + 0.3 * s})`,
				transformOrigin: side === 'right' ? 'left bottom' : 'right bottom',
				opacity: s,
				padding: '7px 16px',
				borderRadius: 999,
				background: 'rgba(8,14,32,0.88)',
				border: '2px solid rgba(255,255,255,0.75)',
				color: 'white',
				fontFamily,
				fontWeight: 600,
				fontSize: 22,
				letterSpacing: 0.2,
				whiteSpace: 'nowrap',
				boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
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

	const intro = interpolate(frame, [0, 20], [0.15, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const zoomT = interpolate(cam.R, [380, 2350], [0, 1], clamp);
	const dotScale = Math.pow(cam.R / 380, 0.55);

	// ---------- city lights ----------
	const halos = [];
	const cores = [];
	for (let i = 0; i < DOTS.length; i++) {
		const d = DOTS[i];
		const ang = geoDistance([d.lon, d.lat], center);
		if (ang > Math.PI / 2 - 0.02) continue;
		const [x, y] = projection([d.lon, d.lat]);
		if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
		const limb = Math.min(1, Math.cos(ang) * 4); // fade at the edge of the globe
		const tw = 0.78 + 0.22 * Math.sin(frame * (0.05 + d.seed * 0.12) + d.seed * 40);
		const r = d.r * dotScale * (0.85 + 0.15 * Math.cos(ang));
		const op = limb * tw;
		if (d.hot > 0.5) {
			halos.push(<circle key={'h' + i} cx={x} cy={y} r={r * 3.2} fill="url(#halo)" opacity={op * 0.5 * (1 - 0.35 * zoomT)} />);
		}
		const col = d.hot > 0.7 ? ORANGE : d.hot > 0.3 ? '#ffc58f' : '#ffe6c8';
		cores.push(<circle key={'c' + i} cx={x} cy={y} r={r} fill={col} opacity={op * (0.55 + d.hot * 0.45)} />);
	}

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
				else if (cur.length) { segs.push(cur); cur = []; }
			}
			if (cur.length) segs.push(cur);
			const d = segs.map((s) => 'M' + s.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L')).join('');
			const head = pts[pts.length - 1];
			arcEls.push(
				<g key={'arc' + i} opacity={arcsOpacity}>
					<path d={d} fill="none" stroke={ORANGE} strokeWidth={4} strokeOpacity={0.18} strokeLinecap="round" />
					<path d={d} fill="none" stroke="#ffb878" strokeWidth={1.4} strokeOpacity={0.9} strokeLinecap="round" />
					{t < 1 && head ? <circle cx={head[0]} cy={head[1]} r={3} fill="#fff" /> : null}
					{t >= 1 && head ? <circle cx={head[0]} cy={head[1]} r={2.4 + 3 * interpolate(frame - start - 46, [0, 20], [1, 0], clamp)} fill="#ffe2c4" /> : null}
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

	const vignette = interpolate(zoomT, [0, 1], [0.55, 0.35]);

	return (
		<AbsoluteFill style={{background: BG, fontFamily}}>
			{/* starfield-ish backdrop glow */}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(40,70,140,0.18), rgba(0,0,0,0) 60%)'}} />
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: intro}}>
				<defs>
					<radialGradient id="sphere" cx={cam.cx - cam.R * 0.35} cy={cam.cy - cam.R * 0.45} r={cam.R * 1.5} gradientUnits="userSpaceOnUse">
						<stop offset="0%" stopColor="#24468f" />
						<stop offset="55%" stopColor="#16306a" />
						<stop offset="100%" stopColor="#0a1a40" />
					</radialGradient>
					<radialGradient id="atmo" cx={cam.cx} cy={cam.cy} r={cam.R * 1.12} gradientUnits="userSpaceOnUse">
						<stop offset="86%" stopColor="#3f6fd8" stopOpacity="0" />
						<stop offset="89.5%" stopColor="#5a8cff" stopOpacity="0.28" />
						<stop offset="100%" stopColor="#3f6fd8" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="halo">
						<stop offset="0%" stopColor="#ffb06a" stopOpacity="0.9" />
						<stop offset="35%" stopColor="#ff8a3a" stopOpacity="0.35" />
						<stop offset="100%" stopColor="#ff8a3a" stopOpacity="0" />
					</radialGradient>
					<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="6" result="b" />
						<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
					</filter>
				</defs>

				<g transform={`translate(${cam.cx} ${cam.cy}) scale(${0.92 + 0.08 * intro}) translate(${-cam.cx} ${-cam.cy})`}>
					<circle cx={cam.cx} cy={cam.cy} r={cam.R * 1.12} fill="url(#atmo)" />
					<path d={path({type: 'Sphere'})} fill="url(#sphere)" />
					<path d={path(graticule)} fill="none" stroke="#6f93e0" strokeOpacity={0.22 - zoomT * 0.08} strokeWidth={1} />
					<path d={path({type: 'Sphere'})} fill="none" stroke="#7fa2f0" strokeOpacity={0.55} strokeWidth={1.5} />
					<g>{halos}</g>
					<g>{cores}</g>
					<g>{arcEls}</g>

					{routeShow > 0 && (
						<g opacity={routeShow}>
							<path d={fullD} fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={3} strokeDasharray="2 8" strokeLinecap="round" />
							{routeD && (
								<>
									<path d={routeD} fill="none" stroke={ORANGE} strokeWidth={14} strokeOpacity={0.25} strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
									<path d={routeD} fill="none" stroke="#ff7a1f" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
									<path d={routeD} fill="none" stroke="#ffd2a6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
								</>
							)}
							{/* Mumbai origin */}
							<circle cx={mx} cy={my} r={6 * mumbaiA} fill="#fff" />
							{/* Itarsi junction marker */}
							{itarsiA > 0.01 && (
								<g transform={`translate(${ix} ${iy}) scale(${itarsiA})`}>
									<circle r={10 + 22 * stationPulse(348)} fill="none" stroke="#fff" strokeOpacity={0.6 * (1 - stationPulse(348))} strokeWidth={2} />
									<circle r={10} fill="#0b1630" stroke="#fff" strokeWidth={2.5} />
									<circle r={4} fill="#fff" />
								</g>
							)}
							{patnaA > 0.01 && (
								<g transform={`translate(${px} ${py}) scale(${patnaA})`}>
									<circle r={10 + 22 * stationPulse(428)} fill="none" stroke="#fff" strokeOpacity={0.6 * (1 - stationPulse(428))} strokeWidth={2} />
									<circle r={7} fill="#fff" />
								</g>
							)}
							{/* the train */}
							{train && progressIdx > 0.05 && progressIdx < ROUTE.length - 1.01 && (
								<g>
									<circle cx={train[0]} cy={train[1]} r={22} fill="url(#halo)" />
									<circle cx={train[0]} cy={train[1]} r={7} fill="#fff" stroke={ORANGE} strokeWidth={3} />
								</g>
							)}
						</g>
					)}
				</g>
			</svg>

			{/* labels */}
			<Label x={mx} y={my} text="Mumbai" side="left" appear={Math.min(mumbaiA, 1) * routeShow} />
			<Label x={ix} y={iy - 4} text="Itarsi Jn." appear={Math.min(itarsiA, 1)} />
			<Label x={px} y={py - 4} text="Patna" appear={Math.min(patnaA, 1)} />

			{/* status pill */}
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
						background: 'rgba(8,14,32,0.9)',
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

			{/* vignette */}
			<AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`}} />
		</AbsoluteFill>
	);
};
