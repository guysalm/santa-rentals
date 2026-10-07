import Image from "next/image";
import { isIllustration } from "@/lib/images";

/**
 * Shows the whole photo (no cropping) inside any box shape: the image is
 * contained, with a blurred, zoomed copy of itself filling the leftover space.
 * Parent must be `relative` with a size.
 */
export function FitImage({ src, alt, sizes, className = "" }: { src: string; alt: string; sizes: string; className?: string }) {
  const unoptimized = isIllustration(src);
  return (
    <>
      <Image src={src} alt="" aria-hidden fill sizes={sizes} unoptimized={unoptimized} className="scale-125 object-cover opacity-60 blur-xl" />
      <Image src={src} alt={alt} fill sizes={sizes} unoptimized={unoptimized} className={`object-contain ${className}`} />
    </>
  );
}
