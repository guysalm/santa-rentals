"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Main nav with the active page underlined in neon pink. */
export function NavLinks({ links, vertical = false }: { links: { href: string; label: string }[]; vertical?: boolean }) {
  const pathname = usePathname() ?? "/";
  const isActive = (href: string) => (href === "/" || href === "/es" ? pathname === href : pathname.startsWith(href));
  return (
    <ul className={vertical ? "flex flex-col gap-3" : "flex items-center gap-6"}>
      {links.map((l) => {
        const active = isActive(l.href);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`relative font-display text-xl tracking-wider transition-colors ${
                active ? "text-pink-soft [text-shadow:0_0_10px_#ff007f]" : "text-cyan hover:text-ink"
              } after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-pink after:shadow-[0_0_8px_#ff007f] after:transition-all ${active ? "after:w-full" : "after:w-0 hover:after:w-full"}`}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
