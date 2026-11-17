// InvisiTech faceless character kit (original artwork, SVG).
// person({ x, y, s, pose, outfit, skin, hair, rim, flip, prop }) -> SVG <g> string
// Feet at (x, y); s = scale (1 = 420 px tall). Faces are intentionally blank:
// characters stand for roles (voter, founder, investor, CEO), never real people.
(function () {
  let uid = 0;
  const OUTFITS = {
    suit:   { top: '#1d2230', top2: '#0e1118', leg: '#141822', shirt: '#e9edf3', tie: '#E5484D' },
    jacket: { top: '#121214', top2: '#050506', leg: '#17191d', shirt: '#26292e', tie: null },   // leather jacket
    hoodie: { top: '#2b3a4a', top2: '#18222d', leg: '#2a2f38', shirt: null, tie: null, hood: true },
    kurta:  { top: '#c9a46a', top2: '#8e6f40', leg: '#e8e2d4', shirt: null, tie: null },
    casual: { top: '#3d5a40', top2: '#22352a', leg: '#2c3440', shirt: null, tie: null },
    blazer: { top: '#5a2a35', top2: '#331720', leg: '#1d1f26', shirt: '#f1e9e1', tie: null },
  };
  // pose: angles (deg) for [upperArmL, foreArmL, upperArmR, foreArmR], legs spread, lean
  const POSES = {
    stand:  { a: [8, 4, -8, -4], legs: 10, lean: 0 },
    walk:   { a: [-18, -6, 16, 12], legs: 26, lean: 4, step: true },
    vote:   { a: [8, 4, -70, -40], legs: 10, lean: -3 },
    laptop: { a: [30, 80, -30, -80], legs: 10, lean: 0 },
    phone:  { a: [10, 4, -40, -120], legs: 10, lean: -6, headDown: true },
    panic:  { a: [160, 30, -160, -30], legs: 18, lean: 0 },
    point:  { a: [8, 4, -95, -5], legs: 12, lean: 2 },
  };
  function arm(x, y, a1, a2, len, col, skin, w) {
    const r1 = a1 * Math.PI / 180, r2 = (a1 + a2) * Math.PI / 180;
    const ex = x + Math.sin(r1) * len, ey = y + Math.cos(r1) * len;
    const hx = ex + Math.sin(r2) * len * 0.92, hy = ey + Math.cos(r2) * len * 0.92;
    return { svg: `<path d="M${x},${y} L${ex},${ey} L${hx},${hy}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${x},${y} L${ex},${ey} L${hx},${hy}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${hx}" cy="${hy}" r="${w * 0.5}" fill="${skin}"/>`, hx, hy };
  }
  window.person = function ({ x = 0, y = 0, s = 1, pose = 'stand', outfit = 'suit', skin = '#b07a55', hair = '#151112',
                              rim = '#76B900', flip = false, prop = null, hairStyle = 'short', alpha = 1 } = {}) {
    const o = OUTFITS[outfit], P = POSES[pose], id = 'p' + (uid++);
    const H = 420, sh = 120, shoulderY = -H * 0.70, hipY = -H * 0.42;
    const g = [];
    g.push(`<defs><linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.top}"/><stop offset="1" stop-color="${o.top2}"/></linearGradient>
      <linearGradient id="${id}r" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${rim}" stop-opacity=".85"/><stop offset=".25" stop-color="${rim}" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}h" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${skin}" stop-opacity="1"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>`);
    // ground shadow
    g.push(`<ellipse cx="0" cy="4" rx="${sh * 0.75}" ry="14" fill="rgba(0,0,0,.55)"/>`);
    // legs
    const lg = P.legs, step = P.step ? 22 : 0;
    g.push(`<path d="M-22,${hipY - 20} L${-lg - step},-8 M22,${hipY - 20} L${lg + step},-8" stroke="rgba(255,255,255,.16)" stroke-width="45" stroke-linecap="round"/>`);
    g.push(`<path d="M-22,${hipY - 20} L${-lg - step},-8 M22,${hipY - 20} L${lg + step},-8" stroke="${o.leg}" stroke-width="40" stroke-linecap="round"/>`);
    g.push(`<ellipse cx="${-lg - step - 6}" cy="-4" rx="30" ry="12" fill="#0a0a0b"/><ellipse cx="${lg + step + 6}" cy="-4" rx="30" ry="12" fill="#0a0a0b"/>`);
    // arms behind torso (left)
    const L = arm(-sh / 2 + 12, shoulderY + 14, P.a[0], P.a[1], 78, o.top2, skin, 30);
    g.push(L.svg);
    // torso
    const tw = sh, tb = hipY + 10;
    g.push(`<path d="M${-tw / 2},${shoulderY + 30} Q${-tw / 2},${shoulderY} ${-tw / 2 + 30},${shoulderY} L${tw / 2 - 30},${shoulderY} Q${tw / 2},${shoulderY} ${tw / 2},${shoulderY + 30} L${tw / 2 - 8},${tb} L${-tw / 2 + 8},${tb} Z" fill="url(#${id}t)"/>`);
    if (o.shirt) g.push(`<path d="M-20,${shoulderY} L0,${shoulderY + 70} L20,${shoulderY} Z" fill="${o.shirt}"/>`);
    if (o.tie) g.push(`<path d="M-7,${shoulderY + 10} L7,${shoulderY + 10} L10,${shoulderY + 95} L0,${shoulderY + 108} L-10,${shoulderY + 95} Z" fill="${o.tie}"/>`);
    if (outfit === 'suit' || outfit === 'jacket' || outfit === 'blazer') g.push(`<path d="M-22,${shoulderY} L-4,${shoulderY + 90} M22,${shoulderY} L4,${shoulderY + 90}" stroke="rgba(255,255,255,.12)" stroke-width="3"/>`);
    if (o.hood) g.push(`<path d="M-40,${shoulderY + 4} Q0,${shoulderY + 40} 40,${shoulderY + 4}" stroke="${o.top2}" stroke-width="12" fill="none"/><path d="M-12,${shoulderY + 30} L-14,${shoulderY + 80} M12,${shoulderY + 30} L14,${shoulderY + 80}" stroke="#d9dee6" stroke-width="3"/>`);
    // rim light on torso
    g.push(`<path d="M${-tw / 2},${shoulderY + 30} Q${-tw / 2},${shoulderY} ${-tw / 2 + 30},${shoulderY} L${tw / 2 - 30},${shoulderY} Q${tw / 2},${shoulderY} ${tw / 2},${shoulderY + 30} L${tw / 2 - 8},${tb} L${-tw / 2 + 8},${tb} Z" fill="url(#${id}r)"/>`);
    // neck + head (faceless)
    const hy = shoulderY - 62 + (P.headDown ? 10 : 0), hx = P.headDown ? 8 : 0;
    g.push(`<rect x="-14" y="${shoulderY - 26}" width="28" height="32" rx="8" fill="${skin}"/>`);
    g.push(`<ellipse cx="${hx}" cy="${hy}" rx="44" ry="52" fill="url(#${id}h)"/>`);
    g.push(`<path d="M${hx + 44},${hy - 10} A44,52 0 0 1 ${hx + 30},${hy + 38}" stroke="${rim}" stroke-width="4" fill="none" opacity=".8"/>`);
    if (hairStyle === 'short') g.push(`<path d="M${hx - 45},${hy - 6} Q${hx - 48},${hy - 62} ${hx},${hy - 56} Q${hx + 48},${hy - 60} ${hx + 45},${hy - 8} Q${hx + 30},${hy - 34} ${hx},${hy - 36} Q${hx - 30},${hy - 34} ${hx - 45},${hy - 6} Z" fill="${hair}"/>`);
    if (hairStyle === 'long') g.push(`<path d="M${hx - 47},${hy + 40} Q${hx - 56},${hy - 64} ${hx},${hy - 58} Q${hx + 56},${hy - 64} ${hx + 47},${hy + 40} L${hx + 34},${hy + 44} Q${hx + 36},${hy - 30} ${hx},${hy - 34} Q${hx - 36},${hy - 30} ${hx - 34},${hy + 44} Z" fill="${hair}"/>`);
    if (hairStyle === 'grey') g.push(`<path d="M${hx - 45},${hy - 4} Q${hx - 46},${hy - 60} ${hx},${hy - 55} Q${hx + 46},${hy - 60} ${hx + 45},${hy - 4} Q${hx + 26},${hy - 30} ${hx},${hy - 30} Q${hx - 26},${hy - 30} ${hx - 45},${hy - 4} Z" fill="#a9aeb6"/>`);
    // right arm in front
    const R = arm(sh / 2 - 12, shoulderY + 14, P.a[2], P.a[3], 78, o.top, skin, 30);
    g.push(R.svg);
    // props held in the right hand
    if (prop === 'phone') g.push(`<g transform="translate(${R.hx - 22},${R.hy - 58})"><rect width="44" height="78" rx="8" fill="#0b0c0e" stroke="#555" stroke-width="2"/><rect x="4" y="6" width="36" height="64" rx="4" fill="#200608"/><path d="M8,20 L18,32 L26,28 L36,58" stroke="#E5484D" stroke-width="4" fill="none"/></g>`);
    if (prop === 'ballot') g.push(`<g transform="translate(${R.hx - 30},${R.hy - 50}) rotate(-8)"><rect width="60" height="44" rx="4" fill="#F3F1EA"/><path d="M10,22 L22,32 L44,10" stroke="#E5484D" stroke-width="5" fill="none"/></g>`);
    if (prop === 'laptop') g.push(`<g transform="translate(-70,${hipY - 30})"><path d="M0,40 L140,40 L150,52 L-10,52 Z" fill="#9aa2ad"/><rect x="10" y="-50" width="120" height="90" rx="6" fill="#20252c"/><rect x="18" y="-42" width="104" height="74" rx="3" fill="#0f2a10"/><path d="M26,10 L50,-6 L74,2 L110,-30" stroke="#76B900" stroke-width="4" fill="none"/></g>`);
    if (prop === 'box') g.push(`<g transform="translate(${R.hx - 46},${R.hy - 40})"><rect width="92" height="64" rx="4" fill="#7b5a36"/><path d="M0,14 L92,14" stroke="#5c4228" stroke-width="3"/></g>`);
    return `<g transform="translate(${x},${y}) scale(${flip ? -s : s},${s}) rotate(${P.lean})" opacity="${alpha}">${g.join('')}</g>`;
  };
})();
