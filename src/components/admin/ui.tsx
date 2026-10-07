import Link from "next/link";
import { formatUSD } from "@/lib/money";

// Small presentational helpers shared by admin + agent pages.

const STATUS_STYLE: Record<string, string> = {
  pending_payment: "text-sun border-sun",
  paid: "text-mint border-mint",
  active: "text-cyan border-cyan",
  completed: "text-muted border-muted",
  cancelled: "text-pink border-pink",
  expired: "text-white/40 border-white/30",
  no_show: "text-pink border-pink",
  pending: "text-sun border-sun",
  approved: "text-mint border-mint",
  suspended: "text-pink border-pink",
  earned: "text-cyan border-cyan",
  void: "text-white/40 border-white/30",
  available: "text-mint border-mint",
  maintenance: "text-sun border-sun",
  retired: "text-white/40 border-white/30",
};

export function Badge({ value }: { value: string }) {
  return <span className={`inline-block border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${STATUS_STYLE[value] ?? "border-white/40"}`}>{value.replace("_", " ")}</span>;
}

export const Money = ({ cents, className = "" }: { cents: number; className?: string }) => <span className={`tabular-nums ${className}`}>{formatUSD(cents, { decimals: true })}</span>;

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <h1 className="text-5xl">
        <span className="sunset-text">{title}</span>
      </h1>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

export function Stat({ label, value, hint, href }: { label: string; value: React.ReactNode; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="hud-money mt-1 text-4xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="panel block p-5 transition-transform hover:-translate-y-0.5">
      {body}
    </Link>
  ) : (
    <div className="panel p-5">{body}</div>
  );
}

export function Table({ head, children, empty }: { head: React.ReactNode[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="font-display text-base tracking-wider text-cyan">
          <tr className="border-b-2 border-white/20">
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-white/10 [&_td]:px-3 [&_td]:py-2">{children}</tbody>
      </table>
      {empty && <p className="p-6 text-center text-muted">Nothing here yet.</p>}
    </div>
  );
}

export const Skeleton = ({ h = "h-64" }: { h?: string }) => <div className={`panel ${h} animate-pulse`} aria-busy="true" />;

/** Submit button for server-action forms. */
export function ActionButton({ children, variant = "primary", confirm, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "sun"; confirm?: string }) {
  return (
    <button {...rest} data-confirm={confirm} className={`btn !px-3 !py-1 !text-base ${variant === "primary" ? "btn-primary" : variant === "sun" ? "btn-sun" : "btn-ghost"} ${rest.className ?? ""}`}>
      {children}
    </button>
  );
}
