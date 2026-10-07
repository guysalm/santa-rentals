import type { Metadata } from "next";
import Link from "next/link";
import { resolveLang } from "@/dictionaries";
import { localePath } from "@/lib/i18n";
import { waLink } from "@/lib/site";

export const metadata: Metadata = { title: "Application received | Santa Rentals", robots: { index: false } };

const COPY = {
  en: { h1: "Application received!", p: "Thanks for joining the crew. We'll review your application and message you on WhatsApp to hand over your NFC keychain. Check your email for a confirmation.", wa: "WhatsApp us", home: "Back to the site" },
  es: { h1: "¡Solicitud recibida!", p: "Gracias por unirte al equipo. Revisaremos tu solicitud y te escribiremos por WhatsApp para entregarte tu llavero NFC. Revisa tu correo para la confirmación.", wa: "Escríbenos", home: "Volver al sitio" },
};

export default async function ThanksPage({ params }: PageProps<"/[lang]/become-an-affiliate/thanks">) {
  const lang = await resolveLang(params);
  const c = COPY[lang];
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-script text-6xl normal-case neon-pink md:text-7xl">{c.h1}</h1>
      <p className="mt-6 text-lg text-muted">{c.p}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <a href={waLink("Hi! I just applied to be a Santa agent.")} rel="noopener" className="btn btn-primary">
          {c.wa}
        </a>
        <Link href={localePath(lang, "/")} className="btn btn-ghost">
          {c.home}
        </Link>
      </div>
    </div>
  );
}
