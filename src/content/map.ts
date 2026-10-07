// Stylized (not to scale) map of the southern Nicoya Peninsula in an 800×600
// viewBox: x → east, y → south. Hand-drawn original artwork — illustrative only.

export const COAST = {
  // Land mass: Pacific coast (west) down to Cabo Blanco, then the Gulf of Nicoya coast (east).
  land: "M120 0 C138 40 150 70 168 100 C188 134 214 176 236 214 C248 236 258 254 272 268 C292 296 306 326 326 356 C350 392 372 428 396 460 C410 478 424 494 446 498 C468 500 486 476 506 452 C528 424 548 394 566 364 C584 336 604 318 634 302 C678 280 734 254 800 226 L800 0 Z",
  // Reserve shading at the tip.
  reserve: "M360 418 C380 444 404 476 434 490 C462 494 486 470 500 452 C470 440 438 430 404 418 Z",
  roads: [
    // Coast road: Manzanillo → Playa Hermosa → Santa Teresa → Playa Carmen → Mal País
    "M168 82 C182 112 204 146 222 178 C238 206 252 234 266 254 C286 282 306 312 330 346",
    // Inland: Playa Carmen → Cóbano → Montezuma
    "M266 254 C318 250 392 238 452 250 C500 262 534 300 566 334",
    // Cóbano → Cabuya
    "M452 250 C462 320 474 384 498 432",
  ],
};

export interface MapPlace {
  id: string;
  name: string;
  x: number;
  y: number;
  /** Area page slug, or a site path, for clickable pins. */
  href?: string;
  hq?: boolean;
  labelSide?: "left" | "right";
}

export const PLACES: MapPlace[] = [
  { id: "manzanillo", name: "Manzanillo", x: 168, y: 82, labelSide: "right" },
  { id: "playa-hermosa", name: "Playa Hermosa", x: 214, y: 162, href: "/areas/playa-hermosa", labelSide: "right" },
  { id: "santa-teresa", name: "Santa Teresa", x: 248, y: 224, href: "/atv-rental-santa-teresa", hq: true, labelSide: "right" },
  { id: "playa-carmen", name: "Playa Carmen", x: 266, y: 256, href: "/areas/playa-carmen", labelSide: "left" },
  { id: "mal-pais", name: "Mal País", x: 324, y: 342, href: "/areas/mal-pais", labelSide: "right" },
  { id: "cabo-blanco", name: "Cabo Blanco", x: 432, y: 474, href: "/areas/cabo-blanco", labelSide: "left" },
  { id: "cabuya", name: "Cabuya", x: 498, y: 436, href: "/areas/cabo-blanco", labelSide: "right" },
  { id: "cobano", name: "Cóbano", x: 452, y: 250, labelSide: "right" },
  { id: "montezuma", name: "Montezuma", x: 566, y: 334, href: "/areas/montezuma", labelSide: "right" },
];

/** Neon route per tour slug (only routes whose tour exists are drawn). */
export const MISSION_ROUTES: Record<string, { color: string; d: string; marker?: { x: number; y: number; icon: string } }> = {
  "montezuma-waterfall-atv-tour": {
    color: "#FF007F",
    d: "M248 224 C256 238 262 248 266 256 C318 252 392 240 452 252 C500 264 536 302 566 334",
    marker: { x: 590, y: 318, icon: "💧" },
  },
  "cabo-blanco-sunset-atv-ride": {
    color: "#FF8A2A",
    d: "M248 224 C262 250 290 296 324 342 C346 374 372 416 404 448",
    marker: { x: 400, y: 462, icon: "🌅" },
  },
  "jungle-to-coast-full-day-atv": {
    color: "#00F3FF",
    d: "M254 230 C320 262 396 252 446 262 C492 274 528 306 560 342 C540 380 516 410 498 436 C470 400 462 340 452 262",
  },
  "ridge-runner-enduro-tour": {
    color: "#B26BFF",
    d: "M266 256 C300 230 330 200 368 196 C402 194 412 226 392 246 C370 266 320 268 288 262",
    marker: { x: 372, y: 186, icon: "⛰" },
  },
  "peninsula-enduro-full-day": {
    color: "#7A5CFF",
    d: "M248 224 C300 170 380 140 470 160 C540 176 600 230 620 300 C600 330 584 334 566 334",
  },
  "hidden-beaches-day-tour": {
    color: "#FFD23F",
    d: "M248 224 C238 204 226 186 214 162 C200 136 186 110 168 82",
    marker: { x: 150, y: 120, icon: "🏝" },
  },
  "bongo-river-manzanillo-day-tour": {
    color: "#3CF2A6",
    d: "M214 162 C198 132 184 104 168 82 C156 56 146 30 138 8",
    marker: { x: 176, y: 30, icon: "🐊" },
  },
  "beach-camp-overnight": {
    color: "#FF6FB5",
    d: "M248 224 C236 200 222 176 206 150",
    marker: { x: 186, y: 150, icon: "⛺" },
  },
};
