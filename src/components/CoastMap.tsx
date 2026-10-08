import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import type { Locale, Tour } from "@/lib/types";
import { COAST, MISSION_ROUTES, PLACES, TERRAIN } from "@/content/map";

// Bright, flat daytime map palette (original artwork).
const C = {
  seaDeep: "#1F5FD0",
  sea: "#2C86EE",
  shallows: "#2BCBEF",
  beach: "#F8E36A",
  land: "#F3BE78",
  forest: "#7CCB6F",
  reserve: "#4FA65A",
  town: "#A77BE2",
  roadCasing: "#A3329A",
  road: "#E655D2",
  minor: "#FFFFFF",
  river: "#2F7FE6",
  label: "#141414",
};

/**
 * "Pick your mission": bright illustrated map of the Santa Teresa coast (original
 * artwork, inline SVG) with clickable places and one dashed route per tour.
 * Hovering a mission in the list highlights its route (CSS :has, no JS).
 */
export function CoastMap({ lang, dict, tours }: { lang: Locale; dict: Dictionary; tours: Tour[] }) {
  const missions = tours.filter((t) => MISSION_ROUTES[t.slug]);
  const highlight = missions
    .map((t) => `.coast-map:has([data-m="${t.slug}"]:hover) .route-${t.slug}{stroke-width:7;opacity:1}.coast-map:has([data-m="${t.slug}"]:hover) .route{opacity:.25}`)
    .join("");

  return (
    <div className="coast-map grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <style>{highlight}</style>
      {/* Tilted frame like the mockup */}
      <figure className="relative min-w-0 lg:[transform:perspective(1600px)_rotateY(-9deg)_rotate(-2.5deg)]">
        <div className="overflow-hidden rounded-xl border-[3px] border-cyan shadow-[0_0_0_1px_rgb(0_243_255/0.4),0_0_22px_rgb(0_243_255/0.6)]">
          <svg viewBox="0 0 800 600" role="img" aria-labelledby="coast-map-title" className="block h-auto w-full">
            <title id="coast-map-title">{`${dict.home.mapTitle} — Santa Teresa, Mal País, Montezuma, Cabo Blanco`}</title>
            <defs>
              <linearGradient id="cm-sea" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={C.seaDeep} />
                <stop offset="1" stopColor={C.sea} />
              </linearGradient>
              <clipPath id="cm-landclip">
                <path d={COAST.land} />
              </clipPath>
            </defs>

            {/* Sea, turquoise shallows, yellow beach, land */}
            <rect width="800" height="600" fill="url(#cm-sea)" />
            <path d={COAST.land} fill="none" stroke={C.shallows} strokeWidth="52" strokeLinejoin="round" />
            <path d={COAST.land} fill="none" stroke={C.beach} strokeWidth="18" strokeLinejoin="round" />
            <path d={COAST.land} fill={C.land} />

            <g clipPath="url(#cm-landclip)">
              {TERRAIN.forests.map((d) => (
                <path key={d} d={d} fill={C.forest} />
              ))}
              <path d={COAST.reserve} fill={C.reserve} />
              {TERRAIN.towns.map(([x, y, w, h]) => (
                <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="2" fill={C.town} stroke="#7E55C0" strokeWidth="1" />
              ))}
            </g>

            {/* Water labels */}
            <text x="60" y="400" fill="#fff" fillOpacity=".75" fontSize="22" fontStyle="italic" letterSpacing="8" fontFamily="var(--font-anton-face), Impact, sans-serif" transform="rotate(-62 60 400)">
              PACIFIC OCEAN
            </text>
            <text x="640" y="470" fill="#fff" fillOpacity=".7" fontSize="16" fontStyle="italic" letterSpacing="5" fontFamily="var(--font-anton-face), Impact, sans-serif" transform="rotate(-32 640 470)">
              {lang === "es" ? "GOLFO DE NICOYA" : "GULF OF NICOYA"}
            </text>

            {/* Rivers, hills, palms */}
            {TERRAIN.rivers.map((d) => (
              <path key={d} d={d} fill="none" stroke={C.river} strokeWidth="3.2" strokeLinecap="round" />
            ))}
            {TERRAIN.peaks.map((k) => (
              <g key={`${k.x}-${k.y}`} transform={`translate(${k.x} ${k.y}) scale(${k.s})`}>
                <path d="M-15 9 L0 -13 L15 9 Z" fill="#3E8E4C" />
                <path d="M0 -13 L-5 -6 L0 -8 L5 -6 Z" fill="#fff" />
              </g>
            ))}
            {TERRAIN.palms.map((p) => (
              <g key={`${p.x}-${p.y}`} transform={`translate(${p.x} ${p.y})`} stroke="#2E6B3A" strokeWidth="1.8" strokeLinecap="round" fill="none">
                <path d="M0 8 C0 3 1 -2 3 -6" />
                <path d="M3 -6 C-1 -9 -5 -8 -7 -5 M3 -6 C3 -10 6 -12 9 -11 M3 -6 C7 -8 10 -6 11 -3" />
              </g>
            ))}

            {/* Minor roads (white) and main roads (magenta) */}
            {TERRAIN.trails.map((d) => (
              <path key={d} d={d} fill="none" stroke={C.minor} strokeWidth="3" strokeLinecap="round" />
            ))}
            {COAST.roads.map((d) => (
              <g key={d}>
                <path d={d} fill="none" stroke={C.roadCasing} strokeWidth="10" strokeLinecap="round" />
                <path d={d} fill="none" stroke={C.road} strokeWidth="6.5" strokeLinecap="round" />
              </g>
            ))}

            {/* Mission routes (dashed, animated) + numbered badges */}
            {missions.map((t, i) => {
              const r = MISSION_ROUTES[t.slug];
              const [bx, by] = r.marker ? [r.marker.x, r.marker.y] : routeEnd(r.d);
              return (
                <g key={t.slug}>
                  <path d={r.d} fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".85" />
                  <path className={`route route-${t.slug} route-flow transition-all`} d={r.d} fill="none" stroke={r.color} strokeWidth="3.5" strokeLinecap="round" />
                  <a href={localePath(lang, `/tours/${t.slug}`)} aria-label={t.content[lang].title}>
                    <circle cx={bx} cy={by} r="13" fill={C.label} stroke={r.color} strokeWidth="3" />
                    <text x={bx} y={by + 6} fontSize="16" textAnchor="middle" fill="#fff" fontFamily="var(--font-anton-face), Impact, sans-serif">
                      {i + 1}
                    </text>
                  </a>
                </g>
              );
            })}

            {/* Places: dot + bold black label (HQ gets a pink pin) */}
            {PLACES.map((p) => {
              const label = p.hq ? `${p.name} · ${dict.home.homeBase}` : p.name;
              const lx = p.labelSide === "left" ? p.x - 12 : p.x + 12;
              const anchor = p.labelSide === "left" ? "end" : "start";
              const place = (
                <g>
                  {p.hq ? (
                    <>
                      <path d={`M${p.x} ${p.y} c-7 -10 -12 -15 -12 -22 a12 12 0 1 1 24 0 c0 7 -5 12 -12 22z`} fill="#FF007F" stroke="#fff" strokeWidth="2.5" />
                      <circle cx={p.x} cy={p.y - 22} r="5" fill="#fff" />
                    </>
                  ) : (
                    <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke={C.label} strokeWidth="3" />
                  )}
                  <text
                    x={lx}
                    y={p.hq ? p.y - 16 : p.y + 6}
                    textAnchor={anchor}
                    fontSize={p.hq ? 21 : 16}
                    letterSpacing="1"
                    fill={C.label}
                    stroke="#fff"
                    strokeWidth="4"
                    paintOrder="stroke"
                    fontFamily="var(--font-anton-face), Impact, sans-serif"
                  >
                    {label.toUpperCase()}
                  </text>
                </g>
              );
              return p.href ? (
                <a key={p.id} href={localePath(lang, p.href)} aria-label={p.name} className="cursor-pointer hover:opacity-80">
                  {place}
                </a>
              ) : (
                <g key={p.id}>{place}</g>
              );
            })}

            {/* Compass */}
            <g transform="translate(728 70)">
              <circle r="28" fill="#fff" fillOpacity=".85" stroke={C.label} strokeWidth="2" />
              <path d="M0 -22 L6 0 L0 22 L-6 0 Z" fill="#FF007F" />
              <path d="M0 0 L6 0 L0 22 Z" fill={C.label} />
              <text y="-34" textAnchor="middle" fill={C.label} fontSize="15" fontFamily="var(--font-anton-face), Impact, sans-serif">
                N
              </text>
            </g>
            <text x="16" y="588" fill="#fff" fillOpacity=".8" fontSize="11" fontFamily="var(--font-inter), sans-serif">
              {dict.home.mapNote}
            </text>
          </svg>
        </div>
        {/* Angled green banner breaking out of the frame's bottom-right corner */}
        <p className="absolute -bottom-5 right-2 rotate-[-6deg] rounded-md border-2 border-black bg-gradient-to-b from-[#3BE07A] to-[#16A34A] px-4 py-1 font-anton text-xl uppercase tracking-wider text-[#04140A] shadow-[0_0_18px_rgb(34_197_94/0.65),4px_4px_0_#000] sm:-right-6 sm:px-5 sm:py-1.5 sm:text-3xl">
          {dict.home.mapTitle}
        </p>
      </figure>

      <div className="min-w-0">
        <p className="mb-4 text-muted">{dict.home.mapLead}</p>
        <ul className="space-y-3">
          {missions.map((t, i) => {
            const r = MISSION_ROUTES[t.slug];
            return (
              <li key={t.slug} data-m={t.slug}>
                <Link
                  href={localePath(lang, `/tours/${t.slug}`)}
                  className="panel card-hover flex items-center gap-4 px-4 py-3"
                  style={{ borderColor: r.color, boxShadow: `0 0 12px ${r.color}55, inset 0 0 10px ${r.color}22` }}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 font-display text-lg" style={{ borderColor: r.color, color: r.color, boxShadow: `0 0 10px ${r.color}` }} aria-hidden>
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl leading-tight tracking-wide line-clamp-2 sm:truncate">{t.content[lang].title}</span>
                    <span className="text-xs text-muted">
                      {dict.categories[t.category].name} · {t.overnight ? dict.common.overnight : `${t.durationHours} ${dict.common.hours}`}
                    </span>
                  </span>
                  <span className="price-cyan text-xl">{formatUSD(t.priceCents)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Last coordinate pair of an SVG path (where a route ends). */
function routeEnd(d: string): [number, number] {
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  return [nums[nums.length - 2], nums[nums.length - 1]];
}
