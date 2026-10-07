import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Yellowtail } from "next/font/google";
import "../globals.css";
import { getDictionary } from "@/dictionaries";
import { isLocale, LOCALES } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { businessJsonLd } from "@/lib/seo";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { AffiliateBanner } from "@/components/AffiliateBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });
const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--font-yellowtail", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#12061f" };

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  // Pages 404 on unknown locales (resolveLang); the layout just falls back so
  // dev-time shell validation with placeholder params can render.
  const raw = (await params).lang;
  const lang = isLocale(raw) ? raw : "en";
  const dict = getDictionary(lang);
  return (
    <html lang={lang === "es" ? "es-CR" : "en"} className={`${inter.variable} ${bebas.variable} ${yellowtail.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-pink focus:px-4 focus:py-2">
          Skip to content
        </a>
        <AffiliateBanner lang={lang} />
        <Header lang={lang} dict={dict} />
        <main id="main">{children}</main>
        <Footer lang={lang} dict={dict} />
        <WhatsAppFab label={dict.common.whatsapp} />
        <JsonLd data={businessJsonLd(lang)} />
      </body>
    </html>
  );
}
