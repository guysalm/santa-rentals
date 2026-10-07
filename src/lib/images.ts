import type { Tour, TourCategory, VehicleModel, VehicleType } from "./types";

// Per-model photos uploaded in /admin always win; otherwise each vehicle type
// uses the owner-supplied photo in public/images/vehicles/.
const TYPE_PHOTO: Record<VehicleType, string> = {
  atv: "/images/vehicles/atv.jpg",
  utv: "/images/vehicles/atv.jpg",
  dirtbike: "/images/vehicles/dirtbike.jpg",
  scooter: "/images/vehicles/scooter.jpg",
};

/** Tours reuse the matching vehicle photo; camping keeps its illustration. */
const TOUR_IMAGE: Record<TourCategory, string> = {
  "atv-tour": TYPE_PHOTO.atv,
  "day-tour": TYPE_PHOTO.atv,
  "dirt-bike-tour": TYPE_PHOTO.dirtbike,
  camping: "/images/tours/camping.svg",
};

export const vehicleImage = (m: Pick<VehicleModel, "images" | "type">) => m.images[0] ?? TYPE_PHOTO[m.type];
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
