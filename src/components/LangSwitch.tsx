"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/types";

export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname() ?? "/";
  const bare = pathname.replace(/^\/(en|es)(?=\/|$)/, "") || "/";
  const target = lang === "en" ? (bare === "/" ? "/es" : `/es${bare}`) : bare;
  return (
    <Link href={target} hrefLang={lang === "en" ? "es" : "en"} className="font-display tracking-widest text-cyan hover:text-ink">
      {label}
    </Link>
  );
}
