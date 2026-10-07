// Generates the site's original illustrations (100% hand-authored SVG — no
// third-party artwork, photos, logos or fonts) into public/images/.
// Run: npm run art:gen. Real fleet photos uploaded in /admin take precedence.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PINK = "#FF007F";
const CYAN = "#00F3FF";
const SUN = "#FFD23F";
const ORANGE = "#FF6A2A";
const NIGHT = "#12061F";
const INK = "#0B0414";

// ───────────── shared defs ─────────────
const defs = (id: string, extra = "") => `
<defs>
  <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#14052B"/>
    <stop offset=".32" stop-color="#4A1474"/>
    <stop offset=".58" stop-color="#C21E78"/>
    <stop offset=".78" stop-color="#FF5A3C"/>
    <stop offset="1" stop-color="#FFB43C"/>
  </linearGradient>
  <radialGradient id="${id}-sun" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#FFF6C4"/>
    <stop offset=".55" stop-color="${SUN}"/>
    <stop offset="1" stop-color="#FF8A2A"/>
  </radialGradient>
  <radialGradient id="${id}-sunglow" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#FFB347" stop-opacity=".75"/>
    <stop offset="1" stop-color="#FF3D7F" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="${id}-sea" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8A2B8F"/>
    <stop offset=".45" stop-color="#3B1466"/>
    <stop offset="1" stop-color="#1A0838"/>
  </linearGradient>
  <linearGradient id="${id}-sand" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#E0794A"/>
    <stop offset=".5" stop-color="#9C3E52"/>
    <stop offset="1" stop-color="#3A1236"/>
  </linearGradient>
  <linearGradient id="${id}-body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#B14DFF"/>
    <stop offset=".55" stop-color="#7A1FD1"/>
    <stop offset="1" stop-color="#FF007F"/>
  </linearGradient>
  <linearGradient id="${id}-red" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FF4D6D"/>
    <stop offset="1" stop-color="#C2003F"/>
  </linearGradient>
  <linearGradient id="${id}-teal" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#3FF2E0"/>
    <stop offset="1" stop-color="#0A7FA8"/>
  </linearGradient>
  <linearGradient id="${id}-chrome" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F4F7FF"/>
    <stop offset=".5" stop-color="#8E97B5"/>
    <stop offset="1" stop-color="#E6ECFF"/>
  </linearGradient>
  <filter id="${id}-glow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  ${extra}
</defs>`;

const stars = (w: number, h: number, n: number, seed = 7) => {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, () => `<circle cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(rnd() * 1.4 + 0.4).toFixed(1)}" fill="#fff" opacity="${(rnd() * 0.6 + 0.3).toFixed(2)}"/>`).join("");
};

/** Palm tree silhouette; (x, y) = base of trunk, h = height, flip mirrors the lean. */
function palm(x: number, y: number, h: number, flip = false, fill = INK) {
  const s = h / 300;
  const lean = flip ? -1 : 1;
  const frond = (a: number, len: number) => {
    const rad = (a * Math.PI) / 180;
    const ex = Math.cos(rad) * len;
    const ey = Math.sin(rad) * len;
    const cx = ex * 0.5 - ey * 0.25;
    const cy = ey * 0.5 - Math.abs(ex) * 0.32 - 10;
    return `<path d="M0 0 Q${cx.toFixed(1)} ${(cy - 14).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(cx * 1.05).toFixed(1)} ${(cy + 10).toFixed(1)} 0 6 Z"/>`;
  };
  const fronds = [200, 225, 250, 290, 320, 345, 15, 160, 270].map((a, i) => frond(a, 120 - (i % 3) * 18)).join("");
  return `<g transform="translate(${x} ${y}) scale(${s * lean} ${s})" fill="${fill}">
    <path d="M-7 0 C-4 -90 18 -200 46 -290 L58 -286 C34 -200 12 -100 9 0 Z"/>
    <g transform="translate(52 -288)">${fronds}<circle cx="-6" cy="6" r="9"/><circle cx="8" cy="9" r="8"/></g>
  </g>`;
}

/** Big knobby tire + rim. */
const wheel = (cx: number, cy: number, r: number, id: string, rim = CYAN) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="none" stroke="#2A1A3E" stroke-width="7" stroke-dasharray="7 5"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="#251638" stroke="${rim}" stroke-width="2.5" filter="url(#${id}-glow)"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.2}" fill="url(#${id}-chrome)"/>`;

const spokeWheel = (cx: number, cy: number, r: number, id: string) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="13"/>
  <circle cx="${cx}" cy="${cy}" r="${r + 3}" fill="none" stroke="#2A1A3E" stroke-width="5" stroke-dasharray="6 6"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 8}" fill="none" stroke="url(#${id}-chrome)" stroke-width="3"/>
  ${Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * (r - 8)).toFixed(1)}" y2="${(cy + Math.sin(a) * (r - 8)).toFixed(1)}" stroke="#B9C0D8" stroke-width="1.2"/>`;
  }).join("")}
  <circle cx="${cx}" cy="${cy}" r="7" fill="url(#${id}-chrome)"/>`;

/** Quad bike, facing right. Local box ≈ 300 × 190, ground at y=190. */
const atv = (id: string) => `
<g>
  <ellipse cx="155" cy="190" rx="155" ry="12" fill="#000" opacity=".45"/>
  <path d="M112 104 L200 104 L192 134 L122 134 Z" fill="#1A0F26"/>
  <rect x="120" y="128" width="70" height="7" rx="3" fill="#2E1E44"/>
  ${wheel(70, 142, 48, id)}
  ${wheel(242, 144, 45, id)}
  <path d="M8 110 Q16 66 70 64 Q124 64 136 102 L136 112 L118 112 Q110 86 70 86 Q32 86 24 112 Z" fill="url(#${id}-body)"/>
  <path d="M186 106 Q194 70 242 68 Q290 70 300 106 L284 110 Q276 90 242 90 Q208 90 200 110 Z" fill="url(#${id}-body)"/>
  <path d="M112 102 L124 70 L204 62 L222 100 Z" fill="url(#${id}-body)"/>
  <path d="M120 98 L130 74 L198 68" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
  <path d="M58 66 Q104 50 156 56 L154 70 L60 76 Z" fill="#1A0F26"/>
  <path d="M66 64 Q104 54 150 58" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="3"/>
  <path d="M10 60 L84 56 M18 60 L18 70 M76 56 L76 66" stroke="#2E1E44" stroke-width="5" stroke-linecap="round"/>
  <path d="M220 60 L296 62 M290 62 L290 72" stroke="#2E1E44" stroke-width="5" stroke-linecap="round"/>
  <path d="M206 64 L218 28" stroke="#2E1E44" stroke-width="6" stroke-linecap="round"/>
  <path d="M198 28 L236 22" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <rect x="282" y="80" width="18" height="10" rx="3" fill="${CYAN}" filter="url(#${id}-glow)"/>
  <rect x="276" y="94" width="12" height="6" rx="2" fill="${CYAN}" opacity=".8" filter="url(#${id}-glow)"/>
  <path d="M8 110 Q16 66 70 64 Q124 64 136 102" fill="none" stroke="${PINK}" stroke-width="2.5" filter="url(#${id}-glow)"/>
  <path d="M186 106 Q194 70 242 68 Q290 70 300 106" fill="none" stroke="${CYAN}" stroke-width="2.5" filter="url(#${id}-glow)"/>
  <rect x="2" y="104" width="10" height="6" rx="2" fill="${PINK}" filter="url(#${id}-glow)"/>
</g>`;

/** Dirt bike, facing right. Local box ≈ 300 × 190. */
const dirtbike = (id: string) => `
<g>
  <ellipse cx="152" cy="190" rx="150" ry="10" fill="#000" opacity=".45"/>
  ${spokeWheel(64, 144, 44, id)}
  ${spokeWheel(240, 144, 44, id)}
  <path d="M64 144 L132 118 L140 126 L70 150 Z" fill="#2E1E44"/>
  <path d="M232 140 L200 50 M246 136 L212 48" stroke="url(#${id}-chrome)" stroke-width="7" stroke-linecap="round"/>
  <path d="M120 98 L172 100 L162 136 L126 132 Z" fill="#3A3550"/>
  <path d="M128 106 L164 108 M130 116 L160 118 M131 126 L158 127" stroke="#5E5878" stroke-width="2"/>
  <path d="M152 116 Q108 108 62 92 L58 100 Q104 118 150 126 Z" fill="url(#${id}-chrome)"/>
  <path d="M116 72 Q148 50 190 56 L214 78 L174 100 L130 96 Z" fill="url(#${id}-red)"/>
  <path d="M124 76 Q150 60 186 62" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3"/>
  <path d="M60 74 L166 64 L168 74 L64 84 Z" fill="${INK}"/>
  <path d="M14 70 L100 64 L104 74 L26 84 Z" fill="#F4F4FA"/>
  <path d="M14 70 L100 64" stroke="${PINK}" stroke-width="2" filter="url(#${id}-glow)"/>
  <path d="M196 90 Q240 78 276 94 L268 100 Q240 88 202 98 Z" fill="#F4F4FA"/>
  <path d="M206 44 L234 40" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <path d="M196 56 L214 50 L222 76 L204 80 Z" fill="#F4F4FA"/>
  <circle cx="211" cy="64" r="5" fill="${CYAN}" filter="url(#${id}-glow)"/>
  <text x="150" y="88" font-family="Arial Black, Arial, sans-serif" font-size="13" font-weight="900" fill="#fff" opacity=".85">27</text>
</g>`;

/** Step-through mini bike / scooter, facing right. */
const scooter = (id: string) => `
<g>
  <ellipse cx="150" cy="190" rx="125" ry="9" fill="#000" opacity=".45"/>
  ${wheel(78, 160, 30, id, PINK)}
  ${wheel(230, 160, 30, id, PINK)}
  <path d="M78 160 L120 138" stroke="#2E1E44" stroke-width="8" stroke-linecap="round"/>
  <path d="M48 148 Q44 108 94 102 L150 102 Q164 102 164 116 L154 146 Z" fill="url(#${id}-teal)"/>
  <path d="M150 138 L204 138 L208 148 L150 148 Z" fill="#1A0F26"/>
  <path d="M194 148 L206 96 Q210 82 226 84 L232 88 L218 148 Z" fill="url(#${id}-teal)"/>
  <path d="M230 160 L218 92" stroke="url(#${id}-chrome)" stroke-width="7" stroke-linecap="round"/>
  <path d="M222 86 L230 54" stroke="#2E1E44" stroke-width="6" stroke-linecap="round"/>
  <path d="M214 54 L248 48" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <rect x="232" y="60" width="14" height="10" rx="3" fill="${CYAN}" filter="url(#${id}-glow)"/>
  <path d="M66 96 Q100 84 148 92 L146 104 L72 108 Z" fill="${INK}"/>
  <path d="M206 140 Q232 128 258 142" fill="none" stroke="url(#${id}-teal)" stroke-width="8" stroke-linecap="round"/>
  <path d="M48 148 Q44 108 94 102 L150 102" fill="none" stroke="${CYAN}" stroke-width="2.5" filter="url(#${id}-glow)"/>
  <rect x="40" y="120" width="8" height="8" rx="2" fill="${PINK}" filter="url(#${id}-glow)"/>
</g>`;

/** Sunset backdrop: sky, stars, sun, sea, waves. Horizon at hy. */
function sunsetBackdrop(id: string, w: number, h: number, hy: number, sunX: number, sunR: number) {
  const reflections = Array.from({ length: 7 }, (_, i) => {
    const y = hy + 10 + i * ((h - hy) * 0.09);
    const rw = sunR * (1.1 - i * 0.12);
    return `<rect x="${sunX - rw / 2}" y="${y.toFixed(0)}" width="${rw.toFixed(0)}" height="${3 + i * 0.6}" rx="2" fill="${SUN}" opacity="${(0.55 - i * 0.06).toFixed(2)}"/>`;
  }).join("");
  return `
  <rect width="${w}" height="${hy + 2}" fill="url(#${id}-sky)"/>
  ${stars(w, hy * 0.45, Math.round(w / 12))}
  <circle cx="${sunX}" cy="${hy}" r="${sunR * 2.2}" fill="url(#${id}-sunglow)"/>
  <circle cx="${sunX}" cy="${hy}" r="${sunR}" fill="url(#${id}-sun)"/>
  <rect y="${hy}" width="${w}" height="${h - hy}" fill="url(#${id}-sea)"/>
  ${reflections}`;
}

const svg = (w: number, h: number, body: string, title: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

// ───────────── hero: sunset beach with quad + dirt bike ─────────────
function hero() {
  const id = "h";
  const W = 1600;
  const H = 900;
  const hy = 520;
  return svg(
    W,
    H,
    `${defs(id)}
    ${sunsetBackdrop(id, W, H, hy, 1120, 120)}
    <path d="M0 520 L0 300 L90 260 L170 300 L260 250 L380 330 L470 380 L540 440 L620 520 Z" fill="#2A0E44"/>
    <path d="M0 520 L0 360 L110 330 L210 370 L330 360 L430 430 L520 520 Z" fill="#1C0833"/>
    <path d="M1300 520 L1380 470 L1460 480 L1540 440 L1600 450 L1600 520 Z" fill="#2A0E44"/>
    <g fill="none" stroke="#FFD9F0" stroke-linecap="round" opacity=".55">
      <path d="M560 600 Q760 585 980 604 T1460 600" stroke-width="3"/>
      <path d="M380 660 Q620 640 860 668 T1600 650" stroke-width="4"/>
    </g>
    <path d="M0 900 L0 640 Q240 600 520 650 Q820 700 1100 760 Q1300 800 1600 790 L1600 900 Z" fill="url(#${id}-sand)"/>
    <path d="M0 640 Q240 600 520 650 Q820 700 1100 760 Q1300 800 1600 790" fill="none" stroke="#FFE3F2" stroke-opacity=".6" stroke-width="5"/>
    <path d="M120 800 Q360 760 620 790 M200 850 Q420 820 700 845" fill="none" stroke="#2A0E2E" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>
    <g transform="translate(560 520) scale(1.25)">${dirtbike(id)}</g>
    <g transform="translate(230 560) scale(1.75)">${atv(id)}</g>
    ${palm(330, 640, 420, true, "#0E0420")}
    ${palm(60, 900, 760, false)}
    ${palm(1530, 900, 700, true)}
    ${palm(1430, 840, 520, false)}
    <path d="M0 900 L0 760 Q60 730 110 770 Q150 720 210 780 Q260 760 300 820 L330 900 Z" fill="${INK}"/>
    <path d="M1600 900 L1600 790 Q1540 760 1500 800 Q1460 770 1420 820 L1390 900 Z" fill="${INK}"/>
    `,
    "Illustration: ATV and dirt bike on a Santa Teresa beach at sunset",
  );
}

// ───────────── fleet card images ─────────────
function vehicleCard(kind: "atv" | "dirtbike" | "scooter") {
  const id = `v${kind}`;
  const W = 640;
  const H = 420;
  const hy = 210;
  const v = kind === "atv" ? atv(id) : kind === "dirtbike" ? dirtbike(id) : scooter(id);
  // Keep the whole vehicle inside the central 420×420 square so it survives both
  // the near-square fleet-card crop and the 4:3 detail-page crop.
  const scale = kind === "scooter" ? 1.45 : 1.3;
  const centerX = kind === "scooter" ? 150 : kind === "atv" ? 155 : 152; // vehicle's own horizontal center
  const vx = Math.round(W / 2 - centerX * scale);
  return svg(
    W,
    H,
    `${defs(id)}
    ${sunsetBackdrop(id, W, H, hy, 470, 60)}
    <path d="M0 ${hy} L0 140 L70 120 L150 150 L230 190 L280 ${hy} Z" fill="#2A0E44"/>
    <path d="M0 420 L0 290 Q200 262 380 280 Q520 292 640 300 L640 420 Z" fill="url(#${id}-sand)"/>
    <path d="M0 290 Q200 262 380 280 Q520 292 640 300" fill="none" stroke="#FFE3F2" stroke-opacity=".55" stroke-width="3"/>
    ${palm(600, 330, 300, true)}
    ${palm(30, 300, 230, false, "#1C0833")}
    <g transform="translate(${vx} ${410 - 190 * scale}) scale(${scale})">${v}</g>`,
    kind === "atv" ? "Illustration: quad bike (ATV)" : kind === "dirtbike" ? "Illustration: dirt bike" : "Illustration: scooter",
  );
}

/** Narrow version for the fleet cards' portrait-ish image column (vehicle fully in frame). */
function vehicleCardCompact(kind: "atv" | "dirtbike" | "scooter") {
  const id = `c${kind}`;
  const W = 360;
  const H = 440;
  const hy = 230;
  const v = kind === "atv" ? atv(id) : kind === "dirtbike" ? dirtbike(id) : scooter(id);
  const scale = kind === "scooter" ? 1.05 : 0.95;
  const centerX = kind === "scooter" ? 150 : kind === "atv" ? 155 : 152;
  const vx = Math.round(W / 2 - centerX * scale);
  return svg(
    W,
    H,
    `${defs(id)}
    ${sunsetBackdrop(id, W, H, hy, 250, 48)}
    <path d="M0 ${hy} L0 170 L60 150 L120 180 L170 ${hy} Z" fill="#2A0E44"/>
    <path d="M0 440 L0 310 Q120 290 220 300 Q300 306 360 312 L360 440 Z" fill="url(#${id}-sand)"/>
    <path d="M0 310 Q120 290 220 300 Q300 306 360 312" fill="none" stroke="#FFE3F2" stroke-opacity=".55" stroke-width="3"/>
    ${palm(335, 330, 240, true)}
    ${palm(20, 310, 180, false, "#1C0833")}
    <g transform="translate(${vx} ${425 - 190 * scale}) scale(${scale})">${v}</g>`,
    kind === "atv" ? "Illustration: quad bike (ATV)" : kind === "dirtbike" ? "Illustration: dirt bike" : "Illustration: scooter",
  );
}

// ───────────── tour scene images ─────────────
function tourScene(kind: "atv-tour" | "dirt-bike-tour" | "camping" | "day-tour") {
  const id = `t${kind.replace(/-/g, "")}`;
  const W = 640;
  const H = 400;
  let body = "";
  if (kind === "atv-tour") {
    // Jungle waterfall with a quad at the pool.
    body = `
    <rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>
    ${stars(W, 120, 40)}
    <circle cx="500" cy="150" r="70" fill="url(#${id}-sunglow)"/>
    <path d="M0 400 L0 120 L90 60 L180 90 L250 40 L250 400 Z" fill="#1E3A2E"/>
    <path d="M390 400 L390 40 L470 70 L560 30 L640 90 L640 400 Z" fill="#1E3A2E"/>
    <path d="M250 40 L390 40 L390 300 L250 300 Z" fill="#163126"/>
    <g opacity=".95">${[262, 290, 318, 346, 372].map((x, i) => `<rect x="${x}" y="40" width="${16 - (i % 2) * 5}" height="270" rx="6" fill="#CFFBFF" opacity="${0.55 + (i % 3) * 0.15}"/>`).join("")}</g>
    <rect x="250" y="40" width="140" height="270" fill="${CYAN}" opacity=".18" filter="url(#${id}-soft)"/>
    <ellipse cx="320" cy="320" rx="230" ry="46" fill="#0E6E8C"/>
    <ellipse cx="320" cy="312" rx="150" ry="18" fill="#BFF8FF" opacity=".5"/>
    <path d="M0 400 L0 330 Q120 300 220 340 L260 400 Z" fill="#2A1A10"/>
    ${palm(70, 360, 260, false, "#0B1F17")}
    ${palm(600, 380, 300, true, "#0B1F17")}
    <g transform="translate(390 260) scale(.72)">${atv(id)}</g>`;
  } else if (kind === "dirt-bike-tour") {
    // Ridge line above the ocean with a dirt bike on the trail.
    body = `
    ${sunsetBackdrop(id, W, H, 230, 160, 55)}
    <path d="M0 260 L120 190 L220 230 L330 150 L440 210 L560 160 L640 200 L640 400 L0 400 Z" fill="#3A1460"/>
    <path d="M0 320 L150 250 L280 290 L420 220 L640 280 L640 400 L0 400 Z" fill="#24093F"/>
    <path d="M0 400 L0 360 Q200 300 360 320 Q520 340 640 300 L640 400 Z" fill="url(#${id}-sand)"/>
    <path d="M40 392 Q200 330 360 336 Q500 342 620 312" fill="none" stroke="#FFE3F2" stroke-opacity=".45" stroke-width="3" stroke-dasharray="10 8"/>
    ${palm(600, 380, 240, true)}
    <g transform="translate(250 200) scale(.85) rotate(-6 150 190)">${dirtbike(id)}</g>`;
  } else if (kind === "camping") {
    // Beach camp at night with a glowing tent and bonfire.
    body = `
    <rect width="${W}" height="${H}" fill="#120530"/>
    <rect width="${W}" height="240" fill="url(#${id}-sky)" opacity=".55"/>
    ${stars(W, 200, 120, 3)}
    <circle cx="520" cy="80" r="30" fill="#FFF3D6"/>
    <circle cx="532" cy="72" r="28" fill="#120530" opacity=".9"/>
    <rect y="230" width="${W}" height="70" fill="url(#${id}-sea)"/>
    <path d="M0 400 L0 290 Q240 270 420 290 Q560 300 640 290 L640 400 Z" fill="#3A1A3A"/>
    <path d="M150 340 L230 230 L310 340 Z" fill="#FF8A2A"/>
    <path d="M230 230 L262 340 L198 340 Z" fill="#FFD23F" opacity=".85"/>
    <path d="M150 340 L230 230 L310 340" fill="none" stroke="${PINK}" stroke-width="3" filter="url(#${id}-glow)"/>
    <circle cx="430" cy="330" r="60" fill="#FF8A2A" opacity=".35" filter="url(#${id}-soft)"/>
    <path d="M410 345 L450 345 M415 352 L445 338" stroke="#5A2A1A" stroke-width="7" stroke-linecap="round"/>
    <path d="M418 340 Q414 312 430 296 Q428 318 440 326 Q446 310 444 300 Q458 322 444 340 Z" fill="#FFD23F"/>
    <path d="M424 340 Q424 324 432 316 Q434 330 438 340 Z" fill="#FFF6C4"/>
    ${palm(40, 400, 300, false)}
    ${palm(610, 400, 260, true)}`;
  } else {
    // Hidden cove: rocks, turquoise water, quad on the sand.
    body = `
    ${sunsetBackdrop(id, W, H, 200, 330, 50)}
    <rect y="200" width="${W}" height="120" fill="#1BA3B8" opacity=".55"/>
    <path d="M0 200 L0 140 L60 120 L130 160 L170 200 Z" fill="#2A0E44"/>
    <path d="M520 200 L560 150 L640 140 L640 200 Z" fill="#2A0E44"/>
    <path d="M60 300 Q90 260 140 290 Q170 270 200 300 Z" fill="#1C0833"/>
    <path d="M460 296 Q500 250 560 286 Q600 270 640 292 L640 300 Z" fill="#1C0833"/>
    <path d="M0 400 L0 300 Q220 280 400 300 Q540 312 640 300 L640 400 Z" fill="url(#${id}-sand)"/>
    <path d="M0 300 Q220 280 400 300 Q540 312 640 300" fill="none" stroke="#FFF" stroke-opacity=".6" stroke-width="4"/>
    ${palm(40, 380, 280, false)}
    <g transform="translate(330 270) scale(.6)">${atv(id)}</g>`;
  }
  return svg(W, H, `${defs(id)}${body}`, `Illustration: ${kind.replace(/-/g, " ")} near Santa Teresa`);
}

const out = join(__dirname, "..", "public", "images");
mkdirSync(join(out, "vehicles"), { recursive: true });
mkdirSync(join(out, "tours"), { recursive: true });
writeFileSync(join(out, "hero-sunset.svg"), hero());
for (const k of ["atv", "dirtbike", "scooter"] as const) {
  writeFileSync(join(out, "vehicles", `${k}.svg`), vehicleCard(k));
  writeFileSync(join(out, "vehicles", `${k}-card.svg`), vehicleCardCompact(k));
}
for (const k of ["atv-tour", "dirt-bike-tour", "camping", "day-tour"] as const) writeFileSync(join(out, "tours", `${k}.svg`), tourScene(k));
console.log("art written to public/images");
