import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

// Photoreal night-side Earth drawn as an orthographic projection in a fragment shader.
// The math is the exact inverse of d3.geoOrthographic().rotate([-lon, -lat]), so SVG
// overlays projected with d3 line up pixel-for-pixel.

const VERT = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uDay, uLights, uClouds;
uniform vec2 uRes, uC;
uniform float uR, uL0, uP0, uT, uZoom, uFade;
out vec4 o;
const float PI = 3.14159265;
void main() {
	vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
	vec2 q = (px - uC) / uR; q.y = -q.y;
	float r = length(q);
	vec3 atmo = vec3(0.10, 0.72, 1.0);
	vec2 sun = normalize(vec2(0.8, 0.45));
	float dirF = 0.35 + 0.65 * max(dot(q / max(r, 1e-5), sun), 0.0);

	// outer atmosphere glow
	float d = max(r - 1.0, 0.0) * uR;
	float g = exp(-d / (7.0 + uR * 0.02)) * 0.95 + exp(-d / (30.0 + uR * 0.07)) * 0.28;
	g *= dirF;
	vec4 outside = vec4(atmo * g, g);

	vec4 inside = vec4(0.0);
	if (r < 1.0) {
		float z = sqrt(1.0 - r * r);
		float lr = atan(q.x, z), pr = asin(clamp(q.y, -1.0, 1.0));
		vec3 P = vec3(cos(pr) * cos(lr), cos(pr) * sin(lr), sin(pr));
		float lat = asin(clamp(P.z * cos(uP0) - P.x * sin(uP0), -1.0, 1.0));
		float lon = atan(P.y, P.x * cos(uP0) + P.z * sin(uP0)) - uL0;
		vec2 uv = vec2(fract((lon + PI) / (2.0 * PI)), (PI * 0.5 - lat) / PI);
		vec3 day = texture(uDay, uv).rgb;
		vec3 li = texture(uLights, uv).rgb;
		float cl = texture(uClouds, vec2(fract(uv.x - uT * 0.0025), uv.y)).r;

		// moonlit night palette: terrain survives as deep blues
		float lum = dot(day, vec3(0.35, 0.45, 0.2));
		float ocean = smoothstep(0.02, 0.12, day.b - max(day.r, day.g * 0.9));
		vec3 land = vec3(0.05, 0.10, 0.20) * 0.6 + lum * vec3(0.20, 0.30, 0.48);
		vec3 sea = vec3(0.010, 0.035, 0.11) + day * vec3(0.03, 0.06, 0.16);
		vec3 col = mix(land, sea, ocean) * (1.0 + uZoom * 0.25);
		col += vec3(0.30, 0.40, 0.55) * cl * (0.20 - uZoom * 0.08);

		// city-light glow from NASA Black Marble (sharp dots are drawn on top separately)
		float shade = 1.0 - cl * 0.45;
		col += vec3(1.0, 0.70, 0.35) * (li.g * 0.30 + li.b * 0.22) * shade;
		col += vec3(1.0, 0.86, 0.62) * li.r * 0.35 * shade * (1.0 - uZoom);

		col *= 0.45 + 0.55 * pow(z, 0.6);
		float fres = pow(1.0 - z, 2.2);
		col = mix(col, atmo * 0.85, clamp(fres * 1.15 * dirF, 0.0, 0.9));
		col += atmo * pow(1.0 - z, 10.0) * 0.7 * dirF;
		inside = vec4(col, 1.0);
	}
	float aa = clamp((1.0 - r) * uR + 0.5, 0.0, 1.0);
	o = mix(outside, inside, aa) * uFade;
}`;

const loadImg = (src) =>
	new Promise((res, rej) => {
		const i = new Image();
		i.crossOrigin = 'anonymous';
		i.onload = () => res(i);
		i.onerror = rej;
		i.src = src;
	});

export const Globe = ({width, height, lon, lat, R, cx, cy, t, zoom, fade}) => {
	const ref = useRef(null);
	const gl = useRef(null);
	const [ready, setReady] = useState(false);
	const [handle] = useState(() => delayRender('globe textures'));

	useEffect(() => {
		let alive = true;
		Promise.all(['tex/day.jpg', 'tex/lights.jpg', 'tex/clouds.jpg'].map((f) => loadImg(staticFile(f)))).then((imgs) => {
			if (!alive) return;
			const c = ref.current.getContext('webgl2', {preserveDrawingBuffer: true, premultipliedAlpha: true, antialias: false});
			const sh = (type, src) => {
				const s = c.createShader(type);
				c.shaderSource(s, src);
				c.compileShader(s);
				if (!c.getShaderParameter(s, c.COMPILE_STATUS)) throw new Error(c.getShaderInfoLog(s));
				return s;
			};
			const prog = c.createProgram();
			c.attachShader(prog, sh(c.VERTEX_SHADER, VERT));
			c.attachShader(prog, sh(c.FRAGMENT_SHADER, FRAG));
			c.linkProgram(prog);
			c.useProgram(prog);
			const buf = c.createBuffer();
			c.bindBuffer(c.ARRAY_BUFFER, buf);
			c.bufferData(c.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), c.STATIC_DRAW);
			const loc = c.getAttribLocation(prog, 'p');
			c.enableVertexAttribArray(loc);
			c.vertexAttribPointer(loc, 2, c.FLOAT, false, 0, 0);
			['uDay', 'uLights', 'uClouds'].forEach((name, i) => {
				const tex = c.createTexture();
				c.activeTexture(c.TEXTURE0 + i);
				c.bindTexture(c.TEXTURE_2D, tex);
				c.texImage2D(c.TEXTURE_2D, 0, c.RGBA, c.RGBA, c.UNSIGNED_BYTE, imgs[i]);
				c.generateMipmap(c.TEXTURE_2D);
				c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MIN_FILTER, c.LINEAR_MIPMAP_LINEAR);
				c.texParameteri(c.TEXTURE_2D, c.TEXTURE_MAG_FILTER, c.LINEAR);
				c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_S, c.REPEAT);
				c.texParameteri(c.TEXTURE_2D, c.TEXTURE_WRAP_T, c.CLAMP_TO_EDGE);
				c.uniform1i(c.getUniformLocation(prog, name), i);
			});
			const u = {};
			['uRes', 'uC', 'uR', 'uL0', 'uP0', 'uT', 'uZoom', 'uFade'].forEach((n) => (u[n] = c.getUniformLocation(prog, n)));
			gl.current = {c, u};
			setReady(true);
		}).catch((e) => {
			console.error(e);
		});
		return () => {
			alive = false;
		};
	}, []);

	useLayoutEffect(() => {
		if (!ready) return;
		const {c, u} = gl.current;
		c.viewport(0, 0, width, height);
		c.clearColor(0, 0, 0, 0);
		c.clear(c.COLOR_BUFFER_BIT);
		c.uniform2f(u.uRes, width, height);
		c.uniform2f(u.uC, cx, cy);
		c.uniform1f(u.uR, R);
		c.uniform1f(u.uL0, (-lon * Math.PI) / 180);
		c.uniform1f(u.uP0, (-lat * Math.PI) / 180);
		c.uniform1f(u.uT, t);
		c.uniform1f(u.uZoom, zoom);
		c.uniform1f(u.uFade, fade);
		c.drawArrays(c.TRIANGLE_STRIP, 0, 4);
		c.finish();
		continueRender(handle);
	}, [ready, width, height, lon, lat, R, cx, cy, t, zoom, fade, handle]);

	return <canvas ref={ref} width={width} height={height} style={{position: 'absolute', inset: 0}} />;
};
