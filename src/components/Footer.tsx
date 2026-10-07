import Link from "next/link";
import { cacheLife } from "next/cache";
import type { Dictionary } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { SITE, waLink } from "@/lib/site";
import type { Locale } from "@/lib/types";
import { AREAS } from "@/content/areas";
import { Logo } from "./Logo";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const p = (path: string) => localePath(lang, path);
  const f = dict.footer;
  const link = "hover:text-cyan";
  return (
    <footer className="mt-24 bg-night-2">
      <div className="stripe-divider" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 text-muted">{f.tagline}</p>
          <address className="mt-4 text-sm not-italic leading-6 text-muted">
            {SITE.address.street}, {SITE.address.locality}
            <br />
            {SITE.address.region}, Costa Rica
            <br />
            <a href={`mailto:${SITE.email}`} className={link}>{SITE.email}</a>
            <br />
            <a href={waLink()} className={link} rel="noopener">WhatsApp {SITE.phone}</a>
          </address>
        </div>
        <div>
          <h2 className="mb-3 font-display text-2xl text-sun">{f.explore}</h2>
          <ul className="space-y-2 text-muted">
            <li><Link className={link} href={p("/atv-rental-santa-teresa")}>{dict.rentalPage.atv.h1}</Link></li>
            <li><Link className={link} href={p("/dirt-bike-rental-santa-teresa")}>{dict.rentalPage.dirtbike.h1}</Link></li>
            <li><Link className={link} href={p("/fleet")}>{dict.nav.fleet}</Link></li>
            <li><Link className={link} href={p("/tours")}>{dict.nav.tours}</Link></li>
            <li><Link className={link} href={p("/guides")}>{dict.footer.guides}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-display text-2xl text-sun">{dict.home.areasTitle}</h2>
          <ul className="space-y-2 text-muted">
            {AREAS.map((a) => (
              <li key={a.slug}><Link className={link} href={p(`/areas/${a.slug}`)}>{a.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-display text-2xl text-sun">{f.company}</h2>
          <ul className="space-y-2 text-muted">
            <li><Link className={link} href={p("/about")}>{f.about}</Link></li>
            <li><Link className={link} href={p("/contact")}>{f.contact}</Link></li>
            <li><Link className={link} href={p("/become-an-affiliate")}>{dict.nav.affiliate}</Link></li>
            <li><Link className={link} href="/agent">{f.agent}</Link></li>
            <li><Link className={link} href={p("/rental-agreement")}>{f.agreement}</Link></li>
            <li><Link className={link} href={p("/terms")}>{f.terms}</Link></li>
            <li><Link className={link} href={p("/privacy")}>{f.privacy}</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-6 text-center text-xs text-muted">
        © <Year /> {SITE.legalName}. {f.rights}
      </p>
    </footer>
  );
}

async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
