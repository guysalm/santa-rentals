import Link from "next/link";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { Logo } from "./Logo";
import { LangSwitch } from "./LangSwitch";

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const p = (path: string) => localePath(lang, path);
  const links = [
    { href: p("/atv-rental-santa-teresa"), label: dict.nav.atv },
    { href: p("/dirt-bike-rental-santa-teresa"), label: dict.nav.dirtbike },
    { href: p("/tours"), label: dict.nav.tours },
    { href: p("/become-an-affiliate"), label: dict.nav.affiliate },
    { href: p("/faq"), label: dict.nav.faq },
  ];
  return (
    <header className="sticky top-0 z-50 border-b-2 border-pink/60 bg-night/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
        <Link href={p("/")} aria-label="Santa Rentals — home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6 font-display text-xl tracking-wider">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-pink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">
            <LangSwitch lang={lang} label={dict.nav.language} />
          </span>
          <Link href={p("/book")} className="btn btn-primary !py-1.5 !text-lg">
            {dict.nav.book}
          </Link>
          {/* No-JS mobile menu */}
          <details className="relative lg:hidden">
            <summary className="cursor-pointer list-none font-display text-2xl text-cyan [&::-webkit-details-marker]:hidden">
              <span aria-hidden>☰</span>
              <span className="sr-only">{dict.nav.menu}</span>
            </summary>
            <div className="panel absolute right-0 mt-3 w-64 p-4">
              <ul className="flex flex-col gap-3 font-display text-2xl tracking-wider">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-pink">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li className="border-t border-white/20 pt-3">
                  <LangSwitch lang={lang} label={dict.nav.language} />
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
