import Form from "next/form";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const COPY = {
  en: { title: "Quick booking", date: "Dates", type: "Type", atv: "ATV / Quad", dirtbike: "Dirt bike", scooter: "Scooter", tour: "Guided tour", go: "Search now ⚡" },
  es: { title: "Reserva rápida", date: "Fecha", type: "Tipo", atv: "Cuadraciclo", dirtbike: "Moto", scooter: "Scooter", tour: "Tour guiado", go: "Buscar ⚡" },
};

// Hero search box → /book?date=…&type=… (works without JS).
export function QuickBook({ lang }: { lang: Locale }) {
  const c = COPY[lang];
  return (
    <Form action={localePath(lang, "/book")} className="panel w-full p-4 text-left backdrop-blur-sm">
      <p className="mb-3 text-center font-display text-3xl tracking-widest neon-cyan">{c.title}</p>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className="label !text-sm">{c.date}</span>
          <input type="date" name="date" className="field" required />
        </label>
        <label className="block">
          <span className="label !text-sm">{c.type}</span>
          <select name="type" className="field" defaultValue="atv">
            <option value="atv">{c.atv}</option>
            <option value="dirtbike">{c.dirtbike}</option>
            <option value="scooter">{c.scooter}</option>
            <option value="tour">{c.tour}</option>
          </select>
        </label>
        <button type="submit" className="btn btn-primary !text-lg">
          {c.go}
        </button>
      </div>
    </Form>
  );
}
