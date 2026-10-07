"use client";
import { useSyncExternalStore } from "react";

// Reads the display cookie set by /a/[slug]. The httpOnly `sr_aff` cookie is
// what the server trusts for the discount. Client-side so pages stay static.
const readCookie = () => document.cookie.split("; ").find((c) => c.startsWith("sr_aff_info="))?.split("=")[1] ?? "";
const subscribe = () => () => {};

export function AffiliateBanner({ lang }: { lang: "en" | "es" }) {
  const raw = useSyncExternalStore(subscribe, readCookie, () => "");
  if (!raw) return null;
  const [name, pct] = decodeURIComponent(raw).split("|");
  if (!name || !pct) return null;
  return (
    <div className="bg-gradient-to-r from-pink via-orange to-sun py-1.5 text-center font-display text-lg tracking-wider text-night">
      🌴{" "}
      {lang === "es"
        ? `Equipo de ${name}: ${pct}% de descuento aplicado al pagar`
        : `Agent ${name}'s crew: ${pct}% off applied at checkout`}
    </div>
  );
}
