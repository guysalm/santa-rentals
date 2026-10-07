import Link from "next/link";
import { Suspense } from "react";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/types";
import { Logo } from "./Logo";
import { LangSwitch } from "./LangSwitch";
import { NavLinks } from "./NavLinks";

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const p = (path: string) => localePath(lang, path);
  const links = [
    { href: p("/"), label: dict.nav.home },
    { href: p("/fleet"), label: dict.nav.fleet },
    { href: p("/tours"), label: dict.nav.mapRoutes },
    { href: p("/book"), label: dict.nav.booking },
    { href: p("/gallery"), label: dict.nav.gallery },
    { href: p("/contact"), label: dict.nav.contact },
  ];
  const call = (
    <a href={`tel:${SITE.phone.replace(/[\s-]/g, "")}`} className="btn btn-call !text-lg !uppercase">
      {dict.nav.call}: {SITE.phone}
    </a>
  );
  return (
    <header className="sticky top-0 z-50 bg-night/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
        <Link href={p("/")} aria-label="Santa Rentals — home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden xl:block">
          {/* Fallback (pre-hydration / prerender): same links without the active marker */}
          <Suspense fallback={<PlainLinks links={links} />}>
            <NavLinks links={links} />
          </Suspense>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">
            <Lang lang={lang} label={dict.nav.language} />
          </span>
          <span className="hidden lg:inline">{call}</span>
          <Link href={p("/book")} className="btn btn-primary !px-4 !py-1.5 !text-lg xl:hidden">
            {dict.nav.book}
          </Link>
          {/* No-JS mobile menu */}
          <details className="relative xl:hidden">
            <summary className="cursor-pointer list-none font-display text-3xl text-cyan [&::-webkit-details-marker]:hidden">
              <span aria-hidden>☰</span>
              <span className="sr-only">{dict.nav.menu}</span>
            </summary>
            <div className="panel absolute right-0 mt-3 w-72 p-5">
              <Suspense fallback={<PlainLinks links={links} vertical />}>
                <NavLinks links={links} vertical />
              </Suspense>
              <div className="mt-4 flex flex-col gap-3 border-t border-white/15 pt-4">
                {call}
                <Lang lang={lang} label={dict.nav.language} />
              </div>
            </div>
          </details>
        </div>
      </div>
      <div className="neon-line" />
    </header>
  );
}

function PlainLinks({ links, vertical = false }: { links: { href: string; label: string }[]; vertical?: boolean }) {
  return (
    <ul className={vertical ? "flex flex-col gap-3" : "flex items-center gap-6"}>
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="font-display text-xl tracking-wider text-cyan">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// The switch reads the current URL, so it streams in; the fallback links to the other locale's home.
function Lang({ lang, label }: { lang: Locale; label: string }) {
  return (
    <Suspense
      fallback={
        <Link href={lang === "en" ? "/es" : "/"} className="font-display tracking-widest text-cyan">
          {label}
        </Link>
      }
    >
      <LangSwitch lang={lang} label={label} />
    </Suspense>
  );
}
