// Animated scenes for the NVIDIA Short (script v3). window.renderAt(t) draws the frame at time t (s).
// Layout = the approved storyboard stills; this file only adds motion and timing.
const R = document.getElementById('root');
const html = (s) => R.insertAdjacentHTML('beforeend', s);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeIO = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const span = (t, a, d) => clamp((t - a) / d);          // 0..1 between a and a+d
const back = (x) => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
let TL = null;
const HOOK = (n) => `../renders/preview_frames/f_${String(n).padStart(4, '0')}.png`;

function bgImg(url, { blur = false, scale = 1, dy = 0, bright = 1 } = {}) {
  html(`<div class="bg ${blur ? 'blur' : ''}" style="background-image:url(${url});top:${-dy}px;bottom:${dy}px;transform:scale(${blur ? 1.1 * scale : scale});${bright !== 1 ? `filter:brightness(${bright})` : ''}"></div><div class="vign"></div>
    ${dy ? `<div style="position:absolute;left:0;right:0;bottom:0;height:${dy + 260}px;background:linear-gradient(transparent,#07090B 260px)"></div>` : ''}`);
}
function title(h, p, lt, delay = 0) {
  const a = easeOut(span(lt, delay, 0.45)), b = easeOut(span(lt, delay + 0.18, 0.45));
  html(`<div class="title"><h1 style="opacity:${a};transform:translateY(${(1 - a) * 40}px) scale(${0.94 + 0.06 * a})">${h}</h1>${p ? `<p style="opacity:${b}">${p}</p>` : ''}</div>`);
}
const disc = () => html(`<div class="disc">3D illustration · not affiliated with NVIDIA</div>`);
const src = (t, a) => html(`<div class="src" style="opacity:${a}">${t}</div>`);
function panel(inner, lt, style = '') {
  const a = easeOut(span(lt, 0.05, 0.4));
  html(`<div class="panel" style="${style};opacity:${a};transform:translateY(${(1 - a) * 60}px)">${inner}</div>`);
}
function caption(t) {
  const c = TL.captions.find((c, i) => t >= c.t0 - 0.05 && (t < (TL.captions[i + 1] ? TL.captions[i + 1].t0 - 0.05 : 1e9)));
  if (!c || t > TL.end - 0.2) return;
  const a = easeOut(span(t, c.t0 - 0.05, 0.12));
  html(`<div class="sub"><div style="opacity:${a};transform:translateY(${(1 - a) * 12}px)">${c.text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</div></div>`);
}
const count = (v, f, dec = 1) => (v * f).toFixed(dec);

const SC = [
  // 1 · hook: hold frame 1 (music hits), play the 90-frame Blender hook, hold the last frame
  (lt, d, t) => {
    let f, s = 1;
    if (lt < 0.5) { f = 1; s = 1 + 0.02 * lt; } else if (lt < 3.5) { f = 1 + Math.round((lt - 0.5) * 29.67); } else { f = 90; s = 1 + 0.025 * (lt - 3.5); }
    bgImg(HOOK(clamp(f, 1, 90)), { dy: 170, scale: s });
    title('<span class="r">−$1.8 TRILLION</span>', 'NVIDIA’s value · Oct 6 → Nov 13, 2026', lt, 2.05); disc(); },
  // 2 · India vs NVIDIA bars
  (lt) => { bgImg(HOOK(24), { blur: true }); title('Almost <span class="r">HALF</span> of India', 'India’s yearly GDP vs NVIDIA’s lost value', lt);
    const g1 = easeOut(span(lt, 0.25, 0.9)), g2 = easeOut(span(lt, 0.9, 0.9)), r = span(lt, 1.6, 0.4);
    panel(`<div style="text-align:center"><div style="font:800 64px InterD">$${count(4.15, g1, 2)}T</div><div style="width:230px;height:430px;margin:18px auto;display:flex;align-items:flex-end"><div style="width:100%;height:${430 * g1}px;border-radius:22px 22px 6px 6px;background:linear-gradient(#FF9933,#fff 50%,#138808)"></div></div><div class="label">India · 1 year GDP</div></div>
      <div style="text-align:center"><div style="font:800 64px InterD;color:var(--r)">$${count(1.8, g2)}T</div><div style="width:230px;height:430px;margin:18px auto;display:flex;align-items:flex-end"><div style="width:100%;height:${187 * g2}px;border-radius:22px 22px 6px 6px;background:linear-gradient(var(--r),#5a0f12);box-shadow:0 0 ${60 * g2}px rgba(229,72,77,.5)"></div></div><div class="label">NVIDIA lost value</div></div>`,
      lt, 'display:flex;align-items:flex-end;justify-content:space-around;padding-bottom:50px');
    html(`<div style="position:absolute;left:70px;right:140px;top:1192px;text-align:center;font:600 28px Inter;color:rgba(255,255,255,.6);opacity:${r}">≈ ₹164 lakh crore at ₹91 / $ · IMF WEO Apr 2026</div>`); },
  // 3 · data centre still, slow push-in
  (lt, d) => { bgImg('../renders/stills/scene03_datacenter.png', { scale: 1 + 0.07 * easeIO(lt / d) }); title('The chips <span class="g">AI runs on</span>', '', lt, 0.1); disc(); },
  // 4 · market value climbs to the record
  (lt, d) => { bgImg(HOOK(24), { blur: true }); title('<span class="g">$5.8T</span> record', 'World’s most valuable company · Oct 6, 2026', lt);
    const dr = easeIO(span(lt, 0.3, d * 0.7)), sh = easeOut(span(lt, 0.3 + d * 0.65, 0.4));
    panel(`<div class="label">NVIDIA market value</div>${graph(CAP, { h: 520, draw: dr, show: sh, label: `<text x="610" y="70" fill="#76B900" font-size="44" font-weight="800">$5.8T</text>` })}`, lt); },
  // 5 · the fall + three shock markers
  (lt, d) => { bgImg(HOOK(24), { blur: true }); title('Then: <span class="r">3 shocks</span>', 'within five weeks', lt);
    const dr = easeIO(span(lt, 0.15, d * 0.55));
    panel(`<div class="label">Oct 6 → Nov 13, 2026</div>${graph(DROP, { h: 520, min: 3, max: 6.2, redFrom: 0, draw: dr, marks: [[2, '1', back(span(lt, d * 0.45, 0.3))], [4, '2', back(span(lt, d * 0.6, 0.3))], [6, '3', back(span(lt, d * 0.75, 0.3))]] })}`, lt); },
  // 6 · ballot drops in, −9% stamps
  (lt) => { bgImg(HOOK(24), { blur: true }); title('<span class="r">1</span> · New rules', 'on AI data centres', lt);
    const b = back(span(lt, 0.2, 0.55)), n = span(lt, 1.6, 0.5), st = back(span(lt, 1.6, 0.35));
    panel(`<div style="width:560px;padding:34px;border-radius:24px;background:#F3F1EA;color:#15171a;opacity:${clamp(b * 2)};transform:translateY(${(1 - b) * -260}px) rotate(${-4 - (1 - b) * 10}deg);box-shadow:0 20px 60px rgba(0,0,0,.6)">
        <div style="font:800 30px Inter;letter-spacing:.1em">OFFICIAL BALLOT · LOCAL MEASURE</div>
        <div style="font:600 34px/1.25 Inter;margin:18px 0">Limit new AI data centres in this area?</div>
        <div style="font:700 34px Inter"><span style="display:inline-block;width:40px;height:40px;border:4px solid #15171a;vertical-align:middle;text-align:center;line-height:30px;color:var(--r)">${lt > 0.9 ? '✓' : ''}</span> YES &nbsp; <span style="display:inline-block;width:40px;height:40px;border:4px solid #15171a;vertical-align:middle"></span> NO</div></div>
      <div style="font:800 120px InterD;color:var(--r);text-shadow:0 0 40px rgba(229,72,77,.6);opacity:${clamp(st)};transform:scale(${0.6 + 0.4 * st})">−${Math.round(9 * clamp(n))}%</div><div class="label" style="opacity:${n}">in one day · Nov 5, 2026</div>`,
      lt, 'display:flex;flex-direction:column;align-items:center;gap:26px');
    src('Source: CNBC · fall came after the US midterms', span(lt, 1.8, 0.4)); },
  // 7 · the money loop draws itself, then the "?"
  (lt, d) => { bgImg(HOOK(24), { blur: true }); title('<span class="r">2</span> · The money loop', '', lt);
    const a1 = easeIO(span(lt, 0.3, 0.7)), a2 = easeIO(span(lt, 1.0, 0.7)), a3 = easeIO(span(lt, 1.7, 0.7)), q = back(span(lt, d * 0.62, 0.35));
    const node = (x, y, t, c, a) => `<g opacity="${a}" transform="translate(${x},${y}) scale(${0.7 + 0.3 * a})"><circle r="105" fill="#11151a" stroke="${c}" stroke-width="5"/><text text-anchor="middle" y="12" font-size="34" font-weight="800" fill="#fff">${t}</text></g>`;
    const arc = (dd, a) => `<path d="${dd}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - a}" fill="none" stroke="var(--r)" stroke-width="6" ${a > .97 ? 'marker-end="url(#ar)"' : ''}/>`;
    panel(`<svg width="770" height="600" viewBox="0 0 770 660"><defs><marker id="ar" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12z" fill="var(--r)"/></marker></defs>
      ${arc('M470,150 Q650,250 600,420', a1)}<text x="600" y="240" fill="#fff" font-size="28" font-weight="700" opacity="${a1}">invests $</text>
      ${arc('M470,540 Q330,610 210,520', a2)}<text x="250" y="625" fill="#fff" font-size="28" font-weight="700" opacity="${a2}">buys chips</text>
      ${arc('M140,410 Q90,240 250,150', a3)}<text x="10" y="260" fill="#fff" font-size="28" font-weight="700" opacity="${a3}">sales $</text>
      ${node(370, 130, 'NVIDIA', 'var(--g)', easeOut(span(lt, 0.1, 0.3)))}${node(590, 520, 'AI start-up', 'var(--s)', easeOut(span(lt, 0.8, 0.3)))}${node(150, 500, 'Chip order', 'var(--gold)', easeOut(span(lt, 1.5, 0.3)))}
      <text x="385" y="400" text-anchor="middle" font-size="150" font-weight="800" fill="var(--r)" opacity="${clamp(q)}" transform="translate(385 350) scale(${0.5 + 0.5 * q}) translate(-385 -350)">?</text></svg>`, lt);
    src('BofA est.: ~$70B stakes + ~$230B guarantees · CNBC, Aug 2026', span(lt, 0.6, 0.4)); },
  // 8 · spotlight on the empty chair
  (lt, d) => { bgImg(HOOK(24), { blur: true }); title('<span class="r">3</span> · CEO steps down', 'Nov 12, 2026 · board investigation', lt);
    const sp = easeIO(span(lt, 0.2, 0.8)), v = easeOut(span(lt, d * 0.55, 0.4)), flick = lt < 1.0 ? (Math.sin(lt * 40) > 0.3 ? 1 : 0.6) : 1;
    panel(`<svg width="870" height="690" viewBox="0 0 870 760" preserveAspectRatio="xMidYMid meet">
      <defs><radialGradient id="sp" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
      <g opacity="${sp * flick}"><polygon points="360,0 510,0 700,620 170,620" fill="url(#sp)"/><ellipse cx="435" cy="620" rx="260" ry="40" fill="rgba(255,255,255,.12)"/></g>
      <g fill="#030405" stroke="rgba(255,255,255,.25)" stroke-width="2" transform="translate(${(1 - easeOut(span(lt, 0, 0.6))) * 30} 0)"><rect x="345" y="230" width="180" height="230" rx="40"/><rect x="315" y="440" width="240" height="60" rx="26"/>
      <rect x="425" y="500" width="20" height="80"/><path d="M335,600 L435,575 L535,600" fill="none" stroke-width="12" stroke="#111"/></g>
      <text x="435" y="720" text-anchor="middle" fill="var(--r)" font-size="40" font-weight="800" opacity="${v}">Value falls below $4T</text></svg>`, lt, 'overflow:hidden;padding:0');
    src('Source: Bloomberg, CNBC · Nov 12, 2026', span(lt, 0.8, 0.4)); },
  // 9 · sales doubled vs share value falling
  (lt, d) => { bgImg(HOOK(24), { blur: true }); title('<span class="g">Bubble?</span> or <span class="r">correction?</span>', '', lt);
    const g1 = easeOut(span(lt, 0.6, 0.6)), g2 = easeOut(span(lt, 0.9, 0.8)), pc = span(lt, 1.6, 0.4), dr = easeIO(span(lt, 2.0, 1.4));
    panel(`<div style="flex:1"><div class="label" style="color:var(--g)">Sales (quarter)</div>
        <div style="display:flex;align-items:flex-end;gap:30px;height:440px;margin-top:40px">
          <div style="flex:1;text-align:center"><div style="font:800 40px InterD">$${count(46.7, g1)}B</div><div style="height:${160 * g1}px;background:rgba(118,185,0,.45);border-radius:14px 14px 4px 4px;margin-top:10px"></div><div class="label" style="margin-top:12px">Aug 2025</div></div>
          <div style="flex:1;text-align:center"><div style="font:800 40px InterD;color:var(--g)">$${count(96.2, g2)}B</div><div style="height:${330 * g2}px;background:var(--g);border-radius:14px 14px 4px 4px;margin-top:10px;box-shadow:0 0 50px rgba(118,185,0,.45)"></div><div class="label" style="margin-top:12px">Aug 2026</div></div></div>
        <div style="font:800 46px InterD;color:var(--g);margin-top:20px;text-align:center;opacity:${pc}">+106%</div></div>
      <div style="flex:1"><div class="label" style="color:var(--r)">Share value</div>${graph(DROP, { w: 360, h: 540, min: 3, max: 6.2, redFrom: 0, few: true, draw: dr })}</div>`, lt, 'display:flex;gap:30px'); },
  // 10 · back to the cracked chip, slow push
  (lt, d) => { bgImg(HOOK(90), { dy: 420, scale: 1 + 0.06 * easeIO(lt / d) }); title('A bet on the <span class="r">future</span>', 'The bet flipped, not the business', lt, 0.1); disc(); },
  // 11 · end card
  (lt) => { bgImg(HOOK(90), { blur: true });
    const a = easeOut(span(lt, 0.0, 0.5)), b = easeOut(span(lt, 0.3, 0.5));
    html(`<div style="position:absolute;left:86px;right:172px;top:451px;height:663px;border-radius:54px;overflow:hidden;border:1px solid rgba(255,255,255,.22);box-shadow:0 30px 80px rgba(0,0,0,.6);opacity:${a};transform:scale(${0.9 + 0.1 * a})">
      <div style="position:absolute;inset:0;background:url(${HOOK(90)}) center 65%/cover"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,4,6,.3),rgba(12,4,6,.82) 55%,rgba(8,3,4,.94))"></div>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;opacity:${b}">
        <img src="../storyboard/bg/logo.png" style="width:184px;height:184px;border-radius:50%;box-shadow:0 0 0 15px rgba(118,185,0,.12),0 0 50px rgba(118,185,0,.5)">
        <div style="margin-top:22px;font:800 97px/1 InterD">Invisi<span style="color:var(--g)">Tech</span></div>
        <div style="margin-top:14px;font:600 45px Inter">@TheInvisiTech</div>
        <div style="display:flex;gap:70px;margin-top:28px;font:600 34px Inter"><span>👍 Like</span><span>💬 Comment</span><span>➕ Follow</span></div>
        <div style="margin-top:28px;padding:20px 76px;border-radius:60px;background:#e53935;font:700 48px Inter;box-shadow:0 0 30px rgba(229,57,53,.55);transform:scale(${1 + 0.05 * Math.sin(lt * 6) * b})">Subscribe</div></div></div>`); },
];

window.setup = (tl) => { TL = tl; };
window.renderAt = (t) => {
  R.innerHTML = '';
  let i = TL.scenes.length - 1;
  while (i > 0 && t < TL.scenes[i]) i--;
  const s0 = TL.scenes[i], s1 = i < TL.scenes.length - 1 ? TL.scenes[i + 1] : TL.end;
  SC[i](t - s0, s1 - s0, t);
  caption(t);
  // short cross-dip between scenes
  const toNext = s1 - t, fromStart = t - s0;
  const dip = Math.max(i > 0 ? 1 - clamp(fromStart / 0.12) : 0, i < SC.length - 1 ? 1 - clamp(toNext / 0.08) : 0);
  if (i !== 10) html(`<div class="wm"><img src="../storyboard/bg/logo.png"><span>@TheInvisiTech</span></div>`);
  if (dip > 0) html(`<div style="position:absolute;inset:0;background:#000;opacity:${dip * 0.55}"></div>`);
  const fin = clamp((t - (TL.end - 0.35)) / 0.35);
  if (fin > 0) html(`<div style="position:absolute;inset:0;background:#000;opacity:${fin}"></div>`);
  return i;
};
