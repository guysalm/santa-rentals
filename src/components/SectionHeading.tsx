export function SectionHeading({ kicker, title, lead, as: Tag = "h2" }: { kicker?: string; title: string; lead?: string; as?: "h1" | "h2" }) {
  return (
    <div className="mb-8 max-w-3xl">
      {kicker && <p className="font-display text-lg tracking-[0.25em] text-cyan mb-2">{kicker}</p>}
      <Tag className={`${Tag === "h1" ? "text-6xl md:text-8xl" : "text-5xl md:text-6xl"} sunset-text`}>{title}</Tag>
      {lead && <p className="mt-4 text-lg text-muted">{lead}</p>}
    </div>
  );
}
