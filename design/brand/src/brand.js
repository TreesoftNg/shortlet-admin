// Sunmade brand primitives — refined S-building mark, custom "A" and lockups.
const C = {
  teal: '#10695B', deep: '#0B4A40', gold: '#F8A42F',
  sand: '#F7F2EA', ink: '#15201D', white: '#FFFFFF',
};

// The S-building mark: three roof chevrons joined into an "S" with a flat base.
// Drawn on a 152 x 112 grid with one stroke weight so every band, gap and corner matches.
const MARK_VIEWBOX = '0 0 152 112';
const MARK_TOP = 'M140 24.8 L76 12 L12 24.8 L12 49.8 L76 37 L140 49.8';
const MARK_BOTTOM = 'M12 74.8 L76 62 L140 74.8 L140 100 L12 100';

function mark({ color = C.teal, height = 64, stroke = 14.5 } = {}) {
  const w = height * 152 / 112;
  return `<svg width="${w}" height="${height}" viewBox="${MARK_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" style="display:block;flex:none">
    <g fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
      <path d="${MARK_TOP}"/><path d="${MARK_BOTTOM}"/>
    </g>
  </svg>`;
}

// Custom "A": no crossbar, with the gold triangle inside from the original logo.
function glyphA({ color = C.teal, accent = C.gold, height = 40 } = {}) {
  return `<svg width="${height * 1.02}" height="${height}" viewBox="-1 -1 102 102" xmlns="http://www.w3.org/2000/svg" style="display:block;flex:none">
    <path d="M40 0H60L100 100H77L50 29L23 100H0Z" fill="${color}" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M50 52L64 99H36Z" fill="${accent}" stroke="${accent}" stroke-width="5" stroke-linejoin="round"/>
  </svg>`;
}

// Wordmark: SUNM + custom A + DE, with the tagline stretched to the same width.
function wordmark({ color = C.teal, accent = C.gold, sub = null, size = 48, font = "'Plus Jakarta Sans'", weight = 800, tagline = true } = {}) {
  const cap = size * 0.72;           // cap height of the display font
  const track = size * 0.05;
  const span = t => `<span style="font-family:${font},sans-serif;font-weight:${weight};font-size:${size}px;line-height:${cap}px;height:${cap}px;letter-spacing:${track}px;color:${color};display:block">${t}</span>`;
  const id = 'w' + Math.random().toString(36).slice(2, 8);
  const tag = tagline
    ? `<div data-fit="${id}" style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:${size * 0.26}px;color:${sub || color};white-space:nowrap;width:max-content;align-self:flex-start;line-height:1;margin-top:${size * 0.3}px">APARTMENTS &amp; SUITES</div>`
    : '';
  return `<div style="display:inline-flex;flex-direction:column">
    <div id="${id}" style="display:flex;align-items:flex-end;gap:${track}px">${span('SUNM')}${glyphA({ color, accent, height: cap })}${span('DE')}</div>${tag}
  </div>`;
}

function lockup({ layout = 'h', size = 48, color = C.teal, accent = C.gold, sub = null, markColor = null, font, weight } = {}) {
  const w = wordmark({ color, accent, sub, size, font, weight });
  if (layout === 'v') {
    return `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:${size * 0.5}px">${mark({ color: markColor || color, height: size * 1.7 })}${w}</div>`;
  }
  return `<div style="display:inline-flex;align-items:center;gap:${size * 0.45}px">${mark({ color: markColor || color, height: size * 1.8 })}${w}</div>`;
}

function appIcon({ size = 120, bg = C.teal, color = C.white, radius = 0.225 } = {}) {
  return `<div style="width:${size}px;height:${size}px;border-radius:${size * radius}px;background:${bg};display:grid;place-items:center;flex:none">${mark({ color, height: size * 0.42 })}</div>`;
}

// Stretch each tagline so it spans exactly the wordmark width.
function fitTaglines() {
  document.querySelectorAll('[data-fit]').forEach(el => {
    const target = document.getElementById(el.dataset.fit).getBoundingClientRect().width;
    const n = el.textContent.length;
    el.style.letterSpacing = '0px';
    const base = el.getBoundingClientRect().width;
    const ls = (target - base) / (n - 1);
    el.style.letterSpacing = ls + 'px';
    el.style.marginRight = -ls + 'px';
  });
}

function renderLogos() {
  const j = s => JSON.parse(s || '{}');
  document.querySelectorAll('[data-lockup]').forEach(el => el.innerHTML = lockup(j(el.dataset.lockup)));
  document.querySelectorAll('[data-mark]').forEach(el => el.innerHTML = mark(j(el.dataset.mark)));
  document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = appIcon(j(el.dataset.icon)));
  document.querySelectorAll('[data-word]').forEach(el => el.innerHTML = wordmark(j(el.dataset.word)));
  fitTaglines();
  if (document.fonts) document.fonts.ready.then(fitTaglines);
  window.addEventListener('load', fitTaglines);
  setTimeout(fitTaglines, 800);
}

// ---- Icon directions (round 2) --------------------------------------------
// Shared 152 x 112 grid. "S" = one continuous stroke of two roof bands joined into an S.
const S_CONT = 'M140 49.8 L76 37 L12 49.8 L12 74.8 L76 62 L140 74.8 L140 100 L12 100';
const ROOF = 'M140 24.8 L76 12 L12 24.8';
let _mid = 0;
const svgWrap = (inner, height, vb = '0 0 152 112') => {
  const [, , vw, vh] = vb.split(' ').map(Number);
  return `<svg width="${height * vw / vh}" height="${height}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" style="display:block;flex:none">${inner}</svg>`;
};
const strokeG = (d, color, w = 14.5) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// Solid house silhouette with two chevron slits that carve an S.
function houseShape(fill) {
  const id = 'h' + (++_mid);
  return `<defs><mask id="${id}"><rect x="-20" y="-20" width="200" height="160" fill="#fff"/>
      <g stroke="#000" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M175 58.4 L144 52 L76 38 L36 46.2"/><path d="M-23 86.2 L8 80 L76 66 L116 74.2"/></g></mask></defs>
    <path d="M8 26 L76 12 L144 26 V104 H8 Z" fill="${fill}" stroke="${fill}" stroke-width="8" stroke-linejoin="round" mask="url(#${id})"/>`;
}

const ICONS = {
  // 1 — gold roof floating over a single continuous teal S
  roof: ({ color = C.teal, accent = C.gold, height = 64 } = {}) =>
    svgWrap(strokeG(ROOF, accent) + strokeG(S_CONT, color), height),
  // 2 — solid house with a floating gold roof above it
  solidRoof: ({ color = C.teal, accent = C.gold, height = 64 } = {}) =>
    svgWrap(strokeG('M144 5.75 L76 -8.25 L8 5.75', accent) + houseShape(color), height, '0 -18 152 128'),
  // 3 — bold solid house, S cut out as negative space
  solid: ({ color = C.teal, height = 64 } = {}) => svgWrap(houseShape(color), height, '0 4 152 108'),
  // 4 — gold tile with the teal solid house (reverse of the badge)
  goldTile: ({ color = C.teal, accent = C.gold, height = 64 } = {}) =>
    svgWrap(`<rect x="0" y="0" width="152" height="152" rx="36" fill="${accent}"/><g transform="translate(26 30) scale(0.66)">${houseShape(color)}</g>`, height, '0 0 152 152'),
  // 5 — teal badge with the white solid house
  badge: ({ color = C.teal, height = 64 } = {}) =>
    svgWrap(`<rect x="0" y="0" width="152" height="152" rx="36" fill="${color}"/><g transform="translate(26 30) scale(0.66)">${houseShape('#fff')}</g>`, height, '0 0 152 152'),
  // 6 — teal circle with white S and gold roof
  circle: ({ color = C.teal, accent = C.gold, height = 64 } = {}) =>
    svgWrap(`<circle cx="76" cy="76" r="76" fill="${color}"/><g transform="translate(30 32) scale(0.6)">${strokeG(ROOF, accent, 16)}${strokeG(S_CONT, '#fff', 16)}</g>`, height, '0 0 152 152'),
};

function lockup2({ icon = 'roof', size = 44, color = C.teal, accent = C.gold, markColor = null, iconScale = 1.9 } = {}) {
  const m = ICONS[icon]({ color: markColor || color, accent, height: size * iconScale });
  return `<div style="display:inline-flex;align-items:center;gap:${size * 0.45}px">${m}${wordmark({ color, accent, size })}</div>`;
}

function renderIcons2() {
  const j = s => JSON.parse(s || '{}');
  document.querySelectorAll('[data-lockup2]').forEach(el => el.innerHTML = lockup2(j(el.dataset.lockup2)));
  document.querySelectorAll('[data-icon2]').forEach(el => { const o = j(el.dataset.opts); el.innerHTML = ICONS[el.dataset.icon2](o); });
  fitTaglines();
  if (document.fonts) document.fonts.ready.then(fitTaglines);
  setTimeout(fitTaglines, 800);
}

// ---- Solid House + Gold Roof, v2 (parametric) -------------------------------
// Built as explicit outlines so band thickness, gaps and corner radii are exact.
// W = band thickness, G = gap/slot, Wr = roof thickness, H = half width, s = roof slope,
// oh = roof overhang, r = corner radius (slot ends are always fully round).

// Round every corner of a closed polygon. radii[i] overrides r for vertex i.
function roundedPath(pts, r, radii = {}) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const A = pts[(i - 1 + n) % n], V = pts[i], B = pts[(i + 1) % n];
    const la = Math.hypot(A[0] - V[0], A[1] - V[1]), lb = Math.hypot(B[0] - V[0], B[1] - V[1]);
    const u1 = [(A[0] - V[0]) / la, (A[1] - V[1]) / la], u2 = [(B[0] - V[0]) / lb, (B[1] - V[1]) / lb];
    const ang = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])));
    const rr = radii[i] ?? r;
    let t = rr / Math.tan(ang / 2);
    t = Math.min(t, la / 2, lb / 2);
    const rad = t * Math.tan(ang / 2);
    const T1 = [V[0] + u1[0] * t, V[1] + u1[1] * t], T2 = [V[0] + u2[0] * t, V[1] + u2[1] * t];
    const d1 = [-u1[0], -u1[1]], cross = d1[0] * u2[1] - d1[1] * u2[0];
    out.push({ T1, T2, rad, sweep: cross > 0 ? 1 : 0 });
  }
  const f = v => v.toFixed(2);
  let d = `M${f(out[0].T2[0])} ${f(out[0].T2[1])}`;
  for (let i = 1; i <= n; i++) {
    const c = out[i % n];
    d += ` L${f(c.T1[0])} ${f(c.T1[1])}`;
    if (c.rad > 0.01) d += ` A${f(c.rad)} ${f(c.rad)} 0 0 ${c.sweep} ${f(c.T2[0])} ${f(c.T2[1])}`;
  }
  return d + 'Z';
}

// Final proportions (approved direction): W 21, G 12, roof 16, overhang 10, radius 5, slope 0.22.
const HR_FINAL = { W: 21, G: 12, Wr: 16, H: 60, s: 0.22, oh: 10, r: 5 };
function houseRoofGeometry({ W = 21, G = 12, Wr = 16, Gr = null, H = 60, s = 0.22, oh = 10, Wc = null, r = 5, rRoof = null } = {}) {
  Wc = Wc ?? W; Gr = Gr ?? G; rRoof = rRoof ?? r;
  const sH = s * H, k = H - Wc, B = 3 * W + 2 * G + sH;
  const house = [
    [0, 0], [H, sH], [H, W + sH], [0, W], [-k, W + s * k], [-k, W + G + s * k], [0, W + G], [H, W + G + sH],
    [H, B], [-H, B], [-H, 2 * W + 2 * G + sH], [0, 2 * W + 2 * G], [k, 2 * W + 2 * G + s * k], [k, 2 * W + G + s * k],
    [0, 2 * W + G], [-H, 2 * W + G + sH], [-H, sH],
  ];
  // slot closed ends (indices 4,5 and 12,13) are fully rounded
  const slotR = G / 2;
  const houseD = roundedPath(house, r, { 4: slotR, 5: slotR, 12: slotR, 13: slotR, 0: r * 0.6, 3: r * 0.6, 6: r * 0.6, 11: r * 0.6, 14: r * 0.6 });
  const E = H + oh, top = -Gr - Wr, bot = -Gr;
  const roof = [[0, top], [E, top + s * E], [E, bot + s * E], [0, bot], [-E, bot + s * E], [-E, top + s * E]];
  const roofD = roundedPath(roof, rRoof, { 0: rRoof * 0.6, 3: rRoof * 0.6 });
  const pad = 2, x0 = -E - pad, y0 = top - pad, w = 2 * E + 2 * pad, h = B - top + 2 * pad;
  return { houseD, roofD, viewBox: `${x0.toFixed(2)} ${y0.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`, w, h };
}

function markHR({ color = C.teal, accent = C.gold, height = 64, ...p } = {}) {
  const g = houseRoofGeometry(p);
  return `<svg width="${(height * g.w / g.h).toFixed(2)}" height="${height}" viewBox="${g.viewBox}" xmlns="http://www.w3.org/2000/svg" style="display:block;flex:none">
    <path d="${g.roofD}" fill="${accent}"/><path d="${g.houseD}" fill="${color}"/></svg>`;
}
ICONS.hr = markHR;

function lockupHR({ layout = 'h', size = 44, color = C.teal, accent = C.gold, markColor = null, roofColor = null, iconScale = null } = {}) {
  const w = wordmark({ color, accent, size });
  if (layout === 'v') {
    const m = markHR({ color: markColor || color, accent: roofColor || accent, height: size * (iconScale || 2.3) });
    return `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:${size * 0.55}px">${m}${w}</div>`;
  }
  const m = markHR({ color: markColor || color, accent: roofColor || accent, height: size * (iconScale || 1.9) });
  return `<div style="display:inline-flex;align-items:center;gap:${size * 0.5}px">${m}${w}</div>`;
}
function appIconHR({ size = 120, bg = C.teal, color = C.white, accent = C.gold, radius = 0.225 } = {}) {
  return `<div style="width:${size}px;height:${size}px;border-radius:${size * radius}px;background:${bg};display:grid;place-items:center;flex:none">${markHR({ color, accent, height: size * 0.56 })}</div>`;
}
function renderHR() {
  const j = s => JSON.parse(s || '{}');
  document.querySelectorAll('[data-hr-lockup]').forEach(el => el.innerHTML = lockupHR(j(el.dataset.hrLockup)));
  document.querySelectorAll('[data-hr-mark]').forEach(el => el.innerHTML = markHR(j(el.dataset.hrMark)));
  document.querySelectorAll('[data-hr-icon]').forEach(el => el.innerHTML = appIconHR(j(el.dataset.hrIcon)));
  document.querySelectorAll('[data-icon2]').forEach(el => { el.innerHTML = ICONS[el.dataset.icon2](j(el.dataset.opts)); });
  fitTaglines();
  if (document.fonts) document.fonts.ready.then(fitTaglines);
  setTimeout(fitTaglines, 800);
}

// ---- Final logo: tile icon + wordmark ---------------------------------------
// tile: 'teal' (default), 'white' (for teal backgrounds)
function tileIcon({ size = 64, tile = 'teal' } = {}) {
  return tile === 'white'
    ? appIconHR({ size, bg: C.white, color: C.teal })
    : appIconHR({ size });
}
function lockupTile({ layout = 'h', size = 44, color = C.teal, accent = C.gold, tile = 'teal' } = {}) {
  const w = wordmark({ color, accent, size });
  if (layout === 'v') return `<div style="display:inline-flex;flex-direction:column;align-items:center;gap:${size * 0.5}px">${tileIcon({ size: size * 2.1, tile })}${w}</div>`;
  return `<div style="display:inline-flex;align-items:center;gap:${size * 0.42}px">${tileIcon({ size: size * 1.5, tile })}${w}</div>`;
}
function renderFinal() {
  const j = s => JSON.parse(s || '{}');
  document.querySelectorAll('[data-final]').forEach(el => el.innerHTML = lockupTile(j(el.dataset.final)));
  document.querySelectorAll('[data-tile]').forEach(el => el.innerHTML = tileIcon(j(el.dataset.tile)));
  fitTaglines();
  if (document.fonts) document.fonts.ready.then(fitTaglines);
  setTimeout(fitTaglines, 800);
}
