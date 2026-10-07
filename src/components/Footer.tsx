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
      <div className="gradient-bar" />
      {/* Quick-links bar */}
      <div className="border-b border-cyan/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <nav aria-label="Help" className="flex items-center gap-4 font-display text-3xl tracking-widest text-cyan [text-shadow:0_0_10px_#00f3ff]">
            <Link href={p("/faq")} className="hover:text-pink-soft">
              FAQ
            </Link>
            <span aria-hidden className="text-pink">|</span>
            <Link href={p("/terms")} className="hover:text-pink-soft">
              {f.terms}
            </Link>
            <span aria-hidden className="text-pink">|</span>
            <Link href={p("/guides/driving-an-atv-in-costa-rica-rules")} className="hover:text-pink-soft">
              {f.safety}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-muted">{f.follow}</span>
            <SocialIcon href={SITE.instagram} label="Instagram">
              <rect x="4" y="4" width="16" height="16" rx="5" />
              <circle cx="12" cy="12" r="3.6" />
              <circle cx="17" cy="7" r="0.9" fill="currentColor" />
            </SocialIcon>
            <SocialIcon href={waLink()} label="WhatsApp">
              <path d="M5 19l1.2-3.6A7.5 7.5 0 1 1 9 18.4L5 19z" />
            </SocialIcon>
            <SocialIcon href={`mailto:${SITE.email}`} label="Email">
              <rect x="3.5" y="6" width="17" height="12" rx="2" />
              <path d="M4 7l8 6 8-6" />
            </SocialIcon>
          </div>
        </div>
      </div>
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

// Generic outline icons (not the platforms' trademarked logos).
function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      rel="noopener"
      target={href.startsWith("http") ? "_blank" : undefined}
      className="grid h-10 w-10 place-items-center rounded-lg border-2 border-pink text-pink-soft shadow-[0_0_10px_#ff007f80] transition hover:bg-pink hover:text-white"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </a>
  );
}
