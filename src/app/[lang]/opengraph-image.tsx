import { ImageResponse } from "next/og";

export const alt = "Santa Rentals — ATV & dirt bike rentals in Santa Teresa, Costa Rica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "es" }];
}

// Default social card for every page (pages with photos override via metadata).
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const tagline = lang === "es" ? "Cuadraciclos · Motos · Tours" : "ATVs · Dirt Bikes · Tours";
  const stripes = [0, 1, 2, 3, 4];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #12061f 0%, #2b1149 55%, #5a1a5e 100%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 120,
            width: 420,
            height: 420,
            borderRadius: 9999,
            background: "linear-gradient(180deg, #ffd23f 0%, #ff8a3d 45%, #ff2e88 100%)",
            display: "flex",
          }}
        />
        {stripes.map((i) => (
          <div key={i} style={{ position: "absolute", top: 360 + i * 28, left: 0, right: 0, height: 8 + i * 2, background: "#2b1149", display: "flex" }} />
        ))}
        <div style={{ display: "flex", fontSize: 150, fontStyle: "italic", fontWeight: 800, color: "#fff", textShadow: "0 0 30px #ff2e88, 6px 6px 0 #ff2e88" }}>Santa</div>
        <div style={{ display: "flex", fontSize: 48, letterSpacing: 18, color: "#22e4ff", fontWeight: 700 }}>RENTALS</div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 40, color: "#fff", background: "#000", padding: "10px 28px", border: "4px solid #fff" }}>
          {tagline} — Santa Teresa, Costa Rica
        </div>
      </div>
    ),
    size,
  );
}
