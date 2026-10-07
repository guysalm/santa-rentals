import type { Tour, TourCategory, VehicleModel, VehicleType } from "./types";

// Per-model photos uploaded in /admin always win; otherwise each vehicle type
// uses the owner-supplied photo in public/images/vehicles/.
const TYPE_PHOTO: Record<VehicleType, string> = {
  atv: "/images/vehicles/atv.jpg",
  utv: "/images/vehicles/atv.jpg",
  dirtbike: "/images/vehicles/dirtbike.jpg",
  scooter: "/images/vehicles/scooter.jpg",
};

/** Model-specific photos (by slug) override the per-type photo. */
const MODEL_PHOTO: Record<string, string> = {
  "honda-trx520": "/images/vehicles/trx520.jpg",
  "kymco-mxu-300": "/images/vehicles/kymco-mxu300.jpg", // ⚠ supplied photo shows a different brand of quad — replace with a real Kymco photo
  "honda-crf300l": "/images/vehicles/crf300l.jpg",
  "honda-crf250f": "/images/vehicles/crf.jpg",
  "honda-xr190": "/images/vehicles/xr190.jpg",
};

/** Tours reuse the matching vehicle photo; camping keeps its illustration. */
const TOUR_IMAGE: Record<TourCategory, string> = {
  "atv-tour": TYPE_PHOTO.atv,
  "day-tour": TYPE_PHOTO.atv,
  "dirt-bike-tour": "/images/vehicles/crf.jpg", // tours ride CRF250Fs
  camping: "/images/tours/camping.svg",
};

export const vehicleImage = (m: Pick<VehicleModel, "images" | "type" | "slug">) => m.images[0] ?? MODEL_PHOTO[m.slug] ?? TYPE_PHOTO[m.type];
/** Card thumbnails use the same photo (square photos crop cleanly to the card column). */
export const vehicleThumb = vehicleImage;
export const tourImage = (t: Pick<Tour, "images" | "category">) => t.images[0] ?? TOUR_IMAGE[t.category];

/** Local SVG illustrations skip the image optimizer (it doesn't rasterize SVG). */
export const isIllustration = (src: string) => src.endsWith(".svg");

/** Hero background photo (owner-supplied). */
export const HERO_IMAGE = "/images/hero-beach.jpg";

/**
 * Glowing ATV + dirt bike silhouette shown in the hero's center, above the booking
 * widget. Set to e.g. "/images/hero-vehicles.png" (transparent PNG/WebP) once the
 * image is supplied; until then the hero reserves the space empty.
 */
export const HERO_VEHICLES: string | null = null;
