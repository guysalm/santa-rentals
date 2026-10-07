import Link from "next/link";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export function Breadcrumbs({ lang, crumbs }: { lang: Locale; crumbs: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {crumbs.map((c, i) => (
            <li key={c.path} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden className="text-pink">/</span>}
              {i < crumbs.length - 1 ? (
                <Link href={localePath(lang, c.path)} className="hover:text-cyan">
                  {c.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(lang, crumbs)} />
    </>
  );
}
