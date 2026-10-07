"use client";
import Link from "next/link";
import { useActionState } from "react";
import { localePath } from "@/lib/i18n";
import { applyAsAgent, type ApplyState } from "./actions";

const COPY = {
  en: {
    name: "Full name",
    email: "Email",
    phone: "WhatsApp number",
    id: "Cédula / passport number",
    area: "Where do you work? (hotel, surf school, restaurant, area…)",
    sinpe: "SINPE Móvil number for payouts",
    about: "Tell us a bit about you (optional)",
    keychain: (fee: string) => `NFC keychain (${fee})`,
    online: "Pay online now",
    cash: "Pay cash when I pick it up",
    terms: "I agree to the agent terms: finder's fees are paid only on completed, paid bookings, weekly on Mondays by SINPE Móvil.",
    submit: "Send application ▸",
    sending: "Sending…",
    privacy: "Privacy policy",
  },
  es: {
    name: "Nombre completo",
    email: "Correo",
    phone: "Número de WhatsApp",
    id: "Número de cédula / pasaporte",
    area: "¿Dónde trabajas? (hotel, escuela de surf, restaurante, zona…)",
    sinpe: "Número SINPE Móvil para pagos",
    about: "Cuéntanos de ti (opcional)",
    keychain: (fee: string) => `Llavero NFC (${fee})`,
    online: "Pagar en línea ahora",
    cash: "Pagar en efectivo al recogerlo",
    terms: "Acepto los términos de agente: las comisiones se pagan solo por reservas pagadas y completadas, cada lunes por SINPE Móvil.",
    submit: "Enviar solicitud ▸",
    sending: "Enviando…",
    privacy: "Política de privacidad",
  },
};

export function ApplyForm({ lang, fee }: { lang: "en" | "es"; fee: string }) {
  const c = COPY[lang];
  const [state, action, pending] = useActionState<ApplyState, FormData>(applyAsAgent, null);
  const v = (k: string) => state?.fields?.[k] ?? "";
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className="label">{label}</span>
      <input name={name} defaultValue={v(name)} className="field" {...props} />
    </label>
  );
  return (
    <form action={action} className="panel grid gap-4 p-6 sm:grid-cols-2">
      <input type="hidden" name="locale" value={lang} />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {field("fullName", c.name, { required: true, autoComplete: "name" })}
      {field("email", c.email, { required: true, type: "email", autoComplete: "email" })}
      {field("phone", c.phone, { required: true, type: "tel", autoComplete: "tel", placeholder: "+506 8888 8888" })}
      {field("sinpe", c.sinpe, { required: true, type: "tel", placeholder: "8888 8888" })}
      {field("idNumber", c.id)}
      {field("area", c.area)}
      <label className="block sm:col-span-2">
        <span className="label">{c.about}</span>
        <textarea name="about" defaultValue={v("about")} className="field min-h-20" maxLength={1000} />
      </label>
      <fieldset className="sm:col-span-2">
        <legend className="label">{c.keychain(fee)}</legend>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" name="payNow" value="online" defaultChecked className="accent-pink" /> {c.online}
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="payNow" value="cash" className="accent-pink" /> {c.cash}
          </label>
        </div>
      </fieldset>
      <label className="flex items-start gap-3 text-sm sm:col-span-2">
        <input type="checkbox" name="terms" required className="mt-1 h-5 w-5 accent-pink" />
        <span>
          {c.terms}{" "}
          <Link href={localePath(lang, "/privacy")} className="text-cyan underline">
            {c.privacy}
          </Link>
        </span>
      </label>
      {state?.error && (
        <p role="alert" className="border-2 border-pink bg-pink/10 p-3 text-sm sm:col-span-2">
          {state.error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button className="btn btn-sun" disabled={pending}>
          {pending ? c.sending : c.submit}
        </button>
      </div>
    </form>
  );
}
