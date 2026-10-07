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

/** Terrain detail for the adventure-map look (decorative, approximate). */
export const TERRAIN = {
  // Forest zones (drawn clipped to the land)
  forests: [
    "M290 0 H800 V226 C740 252 680 278 634 302 C600 262 524 206 446 188 C384 176 330 120 290 0 Z",
    "M356 262 C398 240 446 288 436 330 C426 372 384 384 360 352 C338 322 330 282 356 262 Z",
    "M470 300 C500 290 528 318 520 350 C512 380 486 392 470 372 C456 352 452 314 470 300 Z",
  ],
  // Town blocks [x, y, w, h]
  towns: [
    [252, 236, 16, 10], [270, 242, 12, 12], [262, 250, 10, 8], [244, 246, 8, 8],
    [318, 324, 12, 10], [334, 332, 10, 8],
    [444, 236, 14, 10], [460, 244, 10, 10],
    [556, 314, 14, 10], [572, 322, 10, 10],
    [488, 424, 12, 8],
    [176, 70, 10, 8],
  ] as [number, number, number, number][],
  rivers: [
    // Bongo River, north of Manzanillo
    "M262 20 C240 34 214 30 196 44 C182 54 166 56 150 54",
    // Montezuma river to the gulf
    "M512 286 C526 302 540 306 552 322 C558 332 566 336 574 342",
    // Small creek reaching Playa Carmen
    "M352 268 C330 274 312 268 294 272 C286 274 280 270 272 268",
  ],
  peaks: [
    { x: 340, y: 120, s: 1 },
    { x: 386, y: 104, s: 1.25 },
    { x: 430, y: 124, s: 0.9 },
    { x: 560, y: 150, s: 1.15 },
    { x: 612, y: 196, s: 0.85 },
    { x: 400, y: 330, s: 0.9 },
    { x: 436, y: 370, s: 1.05 },
  ],
  palms: [
    { x: 196, y: 120 },
    { x: 232, y: 196 },
    { x: 292, y: 296 },
    { x: 350, y: 396 },
    { x: 470, y: 474 },
    { x: 540, y: 410 },
    { x: 610, y: 318 },
  ],
  // Dirt trails (dashed yellow)
  trails: [
    "M330 346 C350 380 372 420 404 452",
    "M266 256 C296 236 330 210 370 198",
    "M452 250 C500 214 548 196 600 210",
    "M196 140 C230 120 268 112 300 116",
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
export const MISSION_ROUTES: Record<string, { color: string; d: string; marker?: { x: number; y: number } }> = {
  "montezuma-waterfall-atv-tour": {
    color: "#FF007F",
    d: "M248 224 C256 238 262 248 266 256 C318 252 392 240 452 252 C500 264 536 302 566 334",
    marker: { x: 590, y: 318 },
  },
  "cabo-blanco-sunset-atv-ride": {
    color: "#FF8A2A",
    d: "M248 224 C262 250 290 296 324 342 C346 374 372 416 404 448",
    marker: { x: 372, y: 436 },
  },
  "jungle-to-coast-full-day-atv": {
    color: "#00F3FF",
    d: "M254 230 C320 262 396 252 446 262 C492 274 528 306 560 342 C540 380 516 410 498 436 C470 400 462 340 452 262",
    marker: { x: 532, y: 388 },
  },
  "ridge-runner-enduro-tour": {
    color: "#B26BFF",
    d: "M266 256 C300 226 340 168 392 158 C420 160 424 220 396 244 C372 266 320 268 288 262",
    marker: { x: 398, y: 150 },
  },
  "peninsula-enduro-full-day": {
    color: "#7A5CFF",
    d: "M248 224 C300 170 380 140 470 160 C540 176 600 230 620 300 C600 330 584 334 566 334",
    marker: { x: 618, y: 272 },
  },
  "hidden-beaches-day-tour": {
    color: "#FFD23F",
    d: "M248 224 C238 204 226 186 214 162 C200 136 186 110 168 82",
    marker: { x: 150, y: 120 },
  },
  "bongo-river-manzanillo-day-tour": {
    color: "#3CF2A6",
    d: "M214 162 C198 132 184 104 168 82 C156 56 146 30 138 8",
    marker: { x: 176, y: 30 },
  },
  "beach-camp-overnight": {
    color: "#FF6FB5",
    d: "M248 224 C236 200 222 176 206 150",
    marker: { x: 186, y: 150 },
  },
};
