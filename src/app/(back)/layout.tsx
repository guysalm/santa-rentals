import type { Metadata } from "next";
import { Bebas_Neue, Inter, Yellowtail } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });
const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--font-yellowtail", display: "swap" });

// Root layout for the back office (admin, agent dashboard, login). Never indexed.
export const metadata: Metadata = {
  title: { default: "Santa HQ", template: "%s · Santa HQ" },
  robots: { index: false, follow: false },
};

export default function BackLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable} ${yellowtail.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
