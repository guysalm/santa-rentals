import Link from "next/link";
import { Logo } from "../Logo";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "◉" },
  { href: "/admin/reservations", label: "Reservations", icon: "▤" },
  { href: "/admin/calendar", label: "Calendar", icon: "▦" },
  { href: "/admin/fleet", label: "Fleet", icon: "⛟" },
  { href: "/admin/tours", label: "Tours", icon: "⛰" },
  { href: "/admin/affiliates", label: "Agents", icon: "★" },
  { href: "/admin/payouts", label: "Payouts", icon: "$" },
  { href: "/admin/reports", label: "Reports", icon: "▲" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export function AdminNav() {
  return (
    <nav aria-label="Admin" className="border-b-2 border-pink/50 bg-night-2 lg:min-h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r-2">
      <div className="flex items-center justify-between px-4 py-3 lg:block lg:py-6">
        <Link href="/admin">
          <Logo />
        </Link>
        <span className="chip text-xs text-cyan lg:mt-3">HQ</span>
      </div>
      <ul className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:px-3">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-center gap-2 whitespace-nowrap px-3 py-2 font-display text-lg tracking-wider hover:bg-plum hover:text-pink">
              <span aria-hidden className="w-5 text-center text-cyan">
                {l.icon}
              </span>
              {l.label}
            </Link>
          </li>
        ))}
        <li className="lg:mt-6">
          <Link href="/" className="block px-3 py-2 text-sm text-muted hover:text-ink">
            ↗ View site
          </Link>
        </li>
        <li>
          <form action="/auth/signout" method="post">
            <button className="px-3 py-2 text-sm text-muted hover:text-pink">⏻ Sign out</button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
