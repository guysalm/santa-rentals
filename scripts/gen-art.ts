// Generates the remaining original illustration (hand-authored SVG, no third-party
// artwork) into public/images/. Vehicles and most tours use the owner's photos in
// public/images/vehicles/; only the camping tour still uses this artwork.
// Run: npm run art:gen. Photos uploaded per tour in /admin take precedence.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PINK = "#FF007F";
const INK = "#0B0414";

const defs = (id: string) => `
<defs>
  <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#14052B"/>
    <stop offset=".32" stop-color="#4A1474"/>
    <stop offset=".58" stop-color="#C21E78"/>
    <stop offset=".78" stop-color="#FF5A3C"/>
    <stop offset="1" stop-color="#FFB43C"/>
  </linearGradient>
  <linearGradient id="${id}-sea" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8A2B8F"/>
    <stop offset=".45" stop-color="#3B1466"/>
    <stop offset="1" stop-color="#1A0838"/>
  </linearGradient>
  <filter id="${id}-glow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="3" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="${id}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
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

const svg = (w: number, h: number, body: string, title: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

/** Beach camp at night with a glowing tent and bonfire. */
function camping() {
  const id = "tcamping";
  const W = 640;
  const H = 400;
  return svg(
    W,
    H,
    `${defs(id)}
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
    ${palm(610, 400, 260, true)}`,
    "Illustration: beach camping near Santa Teresa",
  );
}

const out = join(__dirname, "..", "public", "images", "tours");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "camping.svg"), camping());
console.log("art written to public/images/tours");
