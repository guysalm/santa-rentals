import Form from "next/form";
import { localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const COPY = {
  en: { title: "Quick booking", date: "Dates", type: "Type", atv: "ATV / Quad", dirtbike: "Dirt bike", scooter: "Scooter", tour: "Guided tour", go: "Search now ⚡" },
  es: { title: "Reserva rápida", date: "Fechas", type: "Tipo", atv: "Cuadraciclo", dirtbike: "Moto", scooter: "Scooter", tour: "Tour guiado", go: "Buscar ⚡" },
};

// Hero search box → /book?date=…&type=… (works without JS). The title sits on the
// box's top border; the date is one wide field (duration is chosen on /book).
export function QuickBook({ lang }: { lang: Locale }) {
  const c = COPY[lang];
  return (
    <Form action={localePath(lang, "/book")} className="panel relative mt-6 w-full !overflow-visible px-5 pb-5 pt-9 text-left backdrop-blur-sm">
      <h2 className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-night px-4 font-anton text-3xl uppercase tracking-wider neon-cyan">
        {c.title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr] sm:items-end">
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
      </div>
      <button type="submit" className="btn btn-primary mt-4 w-full !text-lg">
        {c.go}
      </button>
    </Form>
  );
}
