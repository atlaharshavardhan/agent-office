import {feature} from 'topojson-client';
import {geoContains} from 'd3-geo';
import land110 from 'world-atlas/land-110m.json';
import countries110 from 'world-atlas/countries-110m.json';
import countries50 from 'world-atlas/countries-50m.json';

// Deterministic RNG so every render frame sees the same dots.
const mulberry32 = (a) => () => {
	a |= 0;
	a = (a + 0x6d2b79f5) | 0;
	let t = Math.imul(a ^ (a >>> 15), 1 | a);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rand = mulberry32(20261107);
const gauss = () => {
	const u = Math.max(rand(), 1e-9);
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
};

export const land = feature(land110, land110.objects.land);
export const india = feature(countries50, countries50.objects.countries).features.find(
	(f) => f.id === '356',
);

// [lon, lat, weight]  — urban centres that get clusters of lights.
const HUBS = [
	// India (dense)
	[72.88, 19.07, 3], [77.21, 28.61, 3], [88.36, 22.57, 2.6], [80.27, 13.08, 2.4],
	[77.59, 12.97, 2.4], [78.49, 17.39, 2.4], [73.86, 18.52, 2], [72.57, 23.02, 2],
	[75.79, 26.91, 1.8], [80.95, 26.85, 2], [85.14, 25.6, 1.8], [77.41, 23.26, 1.5],
	[76.27, 9.93, 1.6], [79.09, 21.15, 1.5], [83.0, 25.32, 1.4], [85.82, 20.3, 1.3],
	[91.74, 26.14, 1.2], [75.86, 30.9, 1.4], [76.95, 11.0, 1.4], [83.3, 17.7, 1.4],
	[78.17, 26.22, 1.2], [70.8, 22.3, 1.2], [74.85, 32.7, 1], [77.76, 22.61, 1],
	[81.63, 21.25, 1.2], [86.43, 23.8, 1.2], [79.95, 23.18, 1.2], [75.71, 15.3, 1.1],
	// Neighbours
	[90.41, 23.81, 2.4], [67.0, 24.86, 2.2], [74.35, 31.55, 2], [73.05, 33.68, 1.4],
	[85.32, 27.71, 1.2], [79.86, 6.93, 1.2], [96.16, 16.84, 1.2], [69.17, 34.53, 1],
	// Middle East
	[55.27, 25.2, 1.6], [51.39, 35.69, 1.8], [46.68, 24.71, 1.4], [44.36, 33.31, 1.3],
	[31.24, 30.04, 2], [35.21, 31.77, 1], [28.98, 41.01, 1.8], [51.53, 25.29, 0.8],
	// Europe
	[-0.13, 51.5, 1.8], [2.35, 48.86, 1.8], [13.4, 52.52, 1.4], [12.5, 41.9, 1.3],
	[-3.7, 40.42, 1.3], [37.62, 55.75, 2], [30.52, 50.45, 1.2], [21.01, 52.23, 1.1],
	[4.9, 52.37, 1.1], [16.37, 48.21, 1], [23.73, 37.98, 1], [30.31, 59.94, 1.2],
	// Africa
	[3.38, 6.52, 1.8], [36.82, -1.29, 1.4], [28.05, -26.2, 1.6], [38.75, 9.0, 1.2],
	[-7.59, 33.57, 1.1], [32.58, 15.5, 1], [39.28, -6.8, 1], [15.3, -4.3, 1.4],
	[-17.45, 14.7, 0.8], [18.42, -33.92, 1],
	// East / SE Asia
	[116.4, 39.9, 2.6], [121.47, 31.23, 2.6], [113.26, 23.13, 2.4], [114.06, 22.54, 2],
	[104.07, 30.67, 2], [108.94, 34.34, 1.6], [114.3, 30.59, 1.8], [126.98, 37.57, 2],
	[139.69, 35.69, 2.6], [135.5, 34.69, 1.8], [121.56, 25.03, 1.4], [100.5, 13.75, 2],
	[106.82, -6.2, 2.4], [103.82, 1.35, 1.4], [120.98, 14.6, 2], [105.85, 21.03, 1.4],
	[106.66, 10.76, 1.6], [101.69, 3.14, 1.4], [123.43, 41.8, 1.4], [117.2, 39.13, 1.6],
	[112.55, -7.25, 1.4], [125.75, 39.03, 0.8], [87.62, 43.83, 0.8],
	// Central / North Asia
	[69.24, 41.3, 1], [76.89, 43.24, 0.9], [82.92, 55.03, 0.8], [60.6, 56.84, 0.8],
	// Oceania
	[151.21, -33.87, 1.6], [144.96, -37.81, 1.5], [153.03, -27.47, 1], [115.86, -31.95, 0.9],
	[174.76, -36.85, 0.8],
	// Americas (mostly on the far side, but visible when the globe turns)
	[-74.0, 40.71, 2], [-87.63, 41.88, 1.4], [-118.24, 34.05, 1.8], [-99.13, 19.43, 2],
	[-46.63, -23.55, 2.2], [-58.38, -34.6, 1.6], [-43.2, -22.9, 1.6], [-77.04, -12.05, 1.2],
	[-74.07, 4.71, 1.2], [-79.38, 43.65, 1.2],
];

const onLand = (p) => geoContains(land, p);

const dots = [];
// Clustered city lights around each hub.
for (const [lon, lat, w] of HUBS) {
	const n = Math.round(14 * w * w);
	const spread = 0.5 + w * 0.55;
	// the hub itself: a bright core
	dots.push({lon, lat, r: 1.6 + w * 0.55, hot: 1, seed: rand()});
	for (let i = 0; i < n; i++) {
		const d = Math.abs(gauss()) * spread;
		const a = rand() * Math.PI * 2;
		const p = [lon + (d * Math.cos(a)) / Math.cos((lat * Math.PI) / 180), lat + d * Math.sin(a)];
		if (!onLand(p)) continue;
		const big = rand() < 0.12;
		dots.push({lon: p[0], lat: p[1], r: big ? 1.4 + rand() * 1.6 : 0.5 + rand() * 0.8, hot: big ? 0.8 : rand() * 0.6, seed: rand()});
	}
}
// Sparse rural lights across all land.
for (let i = 0; i < 5200; i++) {
	const p = [rand() * 360 - 180, (Math.asin(rand() * 2 - 1) * 180) / Math.PI];
	if (p[1] < -58 || p[1] > 72) continue;
	if (!onLand(p)) continue;
	dots.push({lon: p[0], lat: p[1], r: 0.45 + rand() * 0.7, hot: rand() * 0.4, seed: rand()});
}
// Extra density inside India so the subcontinent reads clearly when zoomed.
let added = 0;
while (added < 1100) {
	const p = [68 + rand() * 29, 7 + rand() * 30];
	if (!geoContains(india, p)) continue;
	added++;
	const big = rand() < 0.07;
	dots.push({lon: p[0], lat: p[1], r: big ? 1.3 + rand() * 1.8 : 0.45 + rand() * 0.75, hot: big ? 0.9 : rand() * 0.5, seed: rand()});
}
// Lights tracing India's border and coastline, so the outline reads clearly.
const rings = india.geometry.type === 'Polygon' ? [india.geometry.coordinates] : india.geometry.coordinates;
for (const poly of rings) {
	const ring = poly[0];
	if (ring.length < 20) continue; // skip tiny islands
	for (let i = 0; i < ring.length - 1; i++) {
		const [a, b] = [ring[i], ring[i + 1]];
		const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
		const steps = Math.max(1, Math.round(len / 0.09));
		for (let k = 0; k < steps; k++) {
			const t = k / steps;
			const big = rand() < 0.1;
			dots.push({
				lon: a[0] + (b[0] - a[0]) * t + gauss() * 0.03,
				lat: a[1] + (b[1] - a[1]) * t + gauss() * 0.03,
				r: big ? 1.2 + rand() * 1.0 : 0.6 + rand() * 0.5,
				hot: big ? 0.85 : 0.35 + rand() * 0.3,
				seed: rand(),
				border: true,
			});
		}
	}
}
for (const d of dots) d.india = d.border || geoContains(india, [d.lon, d.lat]);
export const DOTS = dots;

export const CITY = {
	mumbai: [72.88, 19.07],
	delhi: [77.21, 28.61],
	kolkata: [88.36, 22.57],
	chennai: [80.27, 13.08],
	bengaluru: [77.59, 12.97],
	itarsi: [77.76, 22.61],
	patna: [85.14, 25.6],
	london: [-0.13, 51.5],
	paris: [2.35, 48.86],
	moscow: [37.62, 55.75],
	dubai: [55.27, 25.2],
	cairo: [31.24, 30.04],
	istanbul: [28.98, 41.01],
	nairobi: [36.82, -1.29],
	lagos: [3.38, 6.52],
	joburg: [28.05, -26.2],
	beijing: [116.4, 39.9],
	shanghai: [121.47, 31.23],
	tokyo: [139.69, 35.69],
	seoul: [126.98, 37.57],
	singapore: [103.82, 1.35],
	jakarta: [106.82, -6.2],
	bangkok: [100.5, 13.75],
	manila: [120.98, 14.6],
	sydney: [151.21, -33.87],
	dhaka: [90.41, 23.81],
	tehran: [51.39, 35.69],
};

const C = CITY;
// [from, to, startFrame]
export const ARCS = [
	[C.london, C.cairo, 10], [C.paris, C.moscow, 22], [C.lagos, C.london, 34],
	[C.istanbul, C.dubai, 46], [C.nairobi, C.dubai, 58], [C.joburg, C.nairobi, 66],
	[C.dubai, C.mumbai, 74], [C.moscow, C.delhi, 84], [C.london, C.delhi, 92],
	[C.tehran, C.delhi, 100], [C.mumbai, C.singapore, 108], [C.delhi, C.beijing, 114],
	[C.mumbai, C.nairobi, 120], [C.kolkata, C.tokyo, 126], [C.chennai, C.jakarta, 132],
	[C.delhi, C.shanghai, 138], [C.bengaluru, C.sydney, 142], [C.mumbai, C.london, 146],
	[C.kolkata, C.manila, 150], [C.delhi, C.seoul, 154], [C.mumbai, C.joburg, 158],
	[C.bengaluru, C.bangkok, 162], [C.dhaka, C.tokyo, 166], [C.delhi, C.dubai, 170],
];

// Mumbai → Itarsi → Patna, through the real junctions on the line.
export const ROUTE_LEG1 = [
	[72.88, 19.07], [73.13, 19.24], [73.56, 19.7], [73.79, 19.99], [74.44, 20.25],
	[75.56, 21.0], [75.78, 21.05], [76.35, 21.82], [77.1, 22.35], [77.76, 22.61],
];
export const ROUTE_LEG2 = [
	[77.76, 22.61], [78.8, 22.9], [79.95, 23.18], [80.39, 23.83], [80.83, 24.58],
	[81.85, 25.43], [83.12, 25.28], [83.98, 25.56], [84.66, 25.56], [85.14, 25.6],
];
