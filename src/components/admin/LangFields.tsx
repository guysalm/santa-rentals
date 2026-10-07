// Side-by-side EN / ES editors for localized catalog content.
export type FieldDef = { key: string; label: string; type?: "text" | "textarea" | "lines"; hint?: string };

export function LangFields({ fields, content }: { fields: FieldDef[]; content: Record<string, Record<string, unknown>> }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {(["en", "es"] as const).map((lang) => (
        <fieldset key={lang} className="space-y-3">
          <legend className="mb-2 font-display text-2xl text-cyan">{lang === "en" ? "English" : "Español"}</legend>
          {fields.map((f) => {
            const raw = content?.[lang]?.[f.key];
            const value = Array.isArray(raw) ? raw.join("\n") : String(raw ?? "");
            const name = `${lang}.${f.key}`;
            return (
              <label key={f.key} className="block">
                <span className="label !text-sm">
                  {f.label}
                  {f.type === "lines" && <span className="ml-1 normal-case text-muted">(one per line)</span>}
                </span>
                {f.type === "textarea" || f.type === "lines" ? (
                  <textarea name={name} defaultValue={value} className="field min-h-24 text-sm" />
                ) : (
                  <input name={name} defaultValue={value} className="field text-sm" />
                )}
                {f.hint && <span className="text-xs text-muted">{f.hint}</span>}
              </label>
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}
