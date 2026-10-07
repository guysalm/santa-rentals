import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { formatUSD } from "@/lib/money";
import type { Locale, Tour } from "@/lib/types";
import { COAST, MISSION_ROUTES, PLACES, TERRAIN } from "@/content/map";

/**
 * "Pick your mission": retro neon map of the Santa Teresa coast (original
 * artwork, inline SVG) with clickable area pins and one glowing route per tour.
 * Hovering a mission in the list highlights its route (CSS :has, no JS).
 */
export function CoastMap({ lang, dict, tours }: { lang: Locale; dict: Dictionary; tours: Tour[] }) {
  const missions = tours.filter((t) => MISSION_ROUTES[t.slug]);
  const highlight = missions
    .map((t) => `.coast-map:has([data-m="${t.slug}"]:hover) .route-${t.slug}{stroke-width:7;opacity:1}.coast-map:has([data-m="${t.slug}"]:hover) .route{opacity:.25}`)
    .join("");

  return (
    <div className="coast-map grid items-start gap-8 lg:grid-cols-[1.35fr_1fr]">
      <style>{highlight}</style>
      <figure className="relative lg:-rotate-1">
        <div className="panel overflow-hidden p-0">
        <svg viewBox="0 0 800 600" role="img" aria-labelledby="coast-map-title" className="block h-auto w-full">
          <title id="coast-map-title">{`${dict.home.mapTitle} — Santa Teresa, Mal País, Montezuma, Cabo Blanco`}</title>
          <defs>
            <pattern id="cm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="#7FD8FF" strokeOpacity=".07" />
            </pattern>
            <pattern id="cm-trees" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="6" r="2.4" fill="#0B2A1E" fillOpacity=".55" />
              <circle cx="16" cy="15" r="2" fill="#0B2A1E" fillOpacity=".45" />
            </pattern>
            <linearGradient id="cm-sea" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#082035" />
              <stop offset="1" stopColor="#040E1A" />
            </linearGradient>
            <linearGradient id="cm-land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#245A42" />
              <stop offset=".6" stopColor="#17402F" />
              <stop offset="1" stopColor="#0E2C20" />
            </linearGradient>
            <filter id="cm-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sea + grid */}
          <rect width="800" height="600" fill="url(#cm-sea)" />
          <rect width="800" height="600" fill="url(#cm-grid)" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={COAST.land} fill="none" stroke="#7FD8FF" strokeOpacity={0.16 - i * 0.05} strokeWidth="1.5" strokeDasharray="14 10" transform={`translate(${-12 - i * 12} ${9 + i * 9})`} />
          ))}

          {/* Land: sandy shore, jungle green, tree texture, hill contours, clean coastline */}
          <path d={COAST.land} fill="#E9C27A" stroke="#E9C27A" strokeWidth="10" strokeLinejoin="round" />
          <path d={COAST.land} fill="url(#cm-land)" />
          <path d={COAST.land} fill="url(#cm-trees)" />
          <path d={COAST.reserve} fill="#0A2A1C" opacity=".75" />
          {[0.94, 0.88].map((s) => (
            <path key={s} d={COAST.land} fill="none" stroke="#3E8A66" strokeOpacity=".5" transform={`translate(${800 * (1 - s) * 0.9} ${-8}) scale(${s})`} />
          ))}
          <path d={COAST.land} fill="none" stroke="#F6F1E2" strokeWidth="1.6" />

          {/* Water labels */}
          <text x="60" y="400" fill="#00F3FF" fillOpacity=".5" fontSize="22" fontStyle="italic" letterSpacing="8" fontFamily="var(--font-bebas), Impact, sans-serif" transform="rotate(-62 60 400)">
            PACIFIC OCEAN
          </text>
          <text x="640" y="470" fill="#00F3FF" fillOpacity=".45" fontSize="16" fontStyle="italic" letterSpacing="5" fontFamily="var(--font-bebas), Impact, sans-serif" transform="rotate(-32 640 470)">
            {lang === "es" ? "GOLFO DE NICOYA" : "GULF OF NICOYA"}
          </text>

          {/* Terrain detail */}
          {TERRAIN.rivers.map((d) => (
            <path key={d} d={d} fill="none" stroke="#5CC8FF" strokeWidth="2.4" strokeLinecap="round" opacity=".85" />
          ))}
          {TERRAIN.peaks.map((k) => (
            <g key={`${k.x}-${k.y}`} transform={`translate(${k.x} ${k.y}) scale(${k.s})`}>
              <path d="M-16 10 L0 -14 L16 10 Z" fill="#2D6B4E" stroke="#0B2A1E" strokeWidth="1.5" />
              <path d="M0 -14 L-5 -6 L0 -8 L5 -6 Z" fill="#E7F5EC" />
            </g>
          ))}
          {TERRAIN.palms.map((p) => (
            <g key={`${p.x}-${p.y}`} transform={`translate(${p.x} ${p.y})`} stroke="#0B2A1E" strokeWidth="1.6" strokeLinecap="round" fill="none">
              <path d="M0 8 C0 3 1 -2 3 -6" />
              <path d="M3 -6 C-1 -9 -5 -8 -7 -5 M3 -6 C3 -10 6 -12 9 -11 M3 -6 C7 -8 10 -6 11 -3" />
            </g>
          ))}
          {TERRAIN.trails.map((d) => (
            <path key={d} d={d} fill="none" stroke="#FFD23F" strokeWidth="2.2" strokeDasharray="5 6" strokeLinecap="round" opacity=".9" />
          ))}

          {/* Roads */}
          {COAST.roads.map((d) => (
            <g key={d}>
              <path d={d} fill="none" stroke="#2A1E00" strokeWidth="8" strokeLinecap="round" />
              <path d={d} fill="none" stroke="#FFD23F" strokeWidth="4" strokeLinecap="round" filter="url(#cm-glow)" />
            </g>
          ))}

          {/* Mission routes */}
          {missions.map((t, i) => {
            const r = MISSION_ROUTES[t.slug];
            // Numbered badge (matches the list) at the marker spot or the route's end.
            const [bx, by] = r.marker ? [r.marker.x, r.marker.y] : routeEnd(r.d);
            return (
              <g key={t.slug}>
                <path d={r.d} fill="none" stroke={r.color} strokeWidth="7" strokeOpacity=".15" strokeLinecap="round" />
                <path className={`route route-${t.slug} route-flow transition-all`} d={r.d} fill="none" stroke={r.color} strokeWidth="3" strokeLinecap="round" opacity=".95" filter="url(#cm-glow)" />
                <a href={localePath(lang, `/tours/${t.slug}`)} aria-label={t.content[lang].title}>
                  <circle cx={bx} cy={by} r="13" fill="#0D0418" stroke={r.color} strokeWidth="2.5" filter="url(#cm-glow)" />
                  <text x={bx} y={by + 6} fontSize="17" textAnchor="middle" fill={r.color} fontFamily="var(--font-bebas), Impact, sans-serif">
                    {i + 1}
                  </text>
                </a>
              </g>
            );
          })}

          {/* Pins */}
          {PLACES.map((p) => {
            const color = p.hq ? "#FF007F" : "#00F3FF";
            const label = p.hq ? `${p.name} · ${dict.home.homeBase}` : p.name;
            const lx = p.labelSide === "left" ? p.x - 14 : p.x + 14;
            const anchor = p.labelSide === "left" ? "end" : "start";
            const pin = (
              <g className="transition-transform">
                <path d={`M${p.x} ${p.y} c-7 -10 -12 -15 -12 -22 a12 12 0 1 1 24 0 c0 7 -5 12 -12 22z`} fill={p.hq ? "#FF007F" : "#0D0418"} stroke={color} strokeWidth="2.5" filter="url(#cm-glow)" />
                <circle cx={p.x} cy={p.y - 22} r={p.hq ? 5 : 4} fill={p.hq ? "#fff" : color} />
                <text x={lx} y={p.y - 16} textAnchor={anchor} fontSize={p.hq ? 19 : 15} letterSpacing="1.5" fill="#fff" stroke="#0D0418" strokeWidth="4" paintOrder="stroke" fontFamily="var(--font-bebas), Impact, sans-serif">
                  {label.toUpperCase()}
                </text>
              </g>
            );
            return p.href ? (
              <a key={p.id} href={localePath(lang, p.href)} aria-label={p.name} className="cursor-pointer [&:hover_path]:fill-pink">
                {pin}
              </a>
            ) : (
              <g key={p.id}>{pin}</g>
            );
          })}

          {/* Compass */}
          <g transform="translate(728 70)" fill="none" stroke="#00F3FF" strokeWidth="2" filter="url(#cm-glow)">
            <circle r="30" strokeOpacity=".5" />
            <path d="M0 -26 L7 0 L0 26 L-7 0 Z" fill="#FF007F" stroke="#FF007F" />
            <text y="-36" textAnchor="middle" fill="#00F3FF" stroke="none" fontSize="14" fontFamily="var(--font-bebas), Impact, sans-serif">
              N
            </text>
          </g>
          <text x="16" y="588" fill="#C9E6D8" fillOpacity=".6" fontSize="11" fontFamily="var(--font-inter), sans-serif">
            {dict.home.mapNote}
          </text>
        </svg>
        </div>
        {/* Angled green banner breaking out of the frame's bottom-right corner */}
        <p className="absolute -bottom-5 -right-2 rotate-[-6deg] rounded-md border-2 border-black bg-gradient-to-b from-[#3BE07A] to-[#16A34A] px-5 py-1.5 font-anton text-2xl uppercase tracking-wider text-[#04140A] shadow-[0_0_18px_rgb(34_197_94/0.65),4px_4px_0_#000] sm:-right-6 sm:text-3xl">
          {dict.home.mapTitle}
        </p>
      </figure>

      <div>
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
                    <span className="block truncate font-display text-xl tracking-wide">{t.content[lang].title}</span>
                    <span className="text-xs text-muted">
                      {dict.categories[t.category].name} · {t.overnight ? dict.common.overnight : `${t.durationHours} ${dict.common.hours}`}
                    </span>
                  </span>
                  <span className="price-pink text-xl">{formatUSD(t.priceCents)}</span>
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
