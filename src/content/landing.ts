import type { Localized } from "@/lib/types";

type Section = { h: string; p: string[] };

// Long-form copy for the money pages. Written for people first, keywords second.
export const LANDING: Record<"atv" | "dirtbike", Localized<Section[]>> = {
  atv: {
    en: [
      {
        h: "Why rent an ATV in Santa Teresa?",
        p: [
          "Santa Teresa's main road is a dusty (or muddy) dirt track that runs for kilometres along the coast, with steep side roads climbing to villas in the hills. Cars are slow, taxis are scarce and walking in the heat is brutal — which is why quads are how everyone gets around.",
          "An ATV gets you from Playa Hermosa in the north to Mal País in the south in minutes, carries two people and a surfboard, and handles potholes and river crossings without drama.",
        ],
      },
      {
        h: "Which quad should I choose?",
        p: [
          "First time on a quad? The fully automatic Kymco MXU 300 or Honda TRX420 are easy to ride and perfect for beach hopping. Staying up a steep hill, riding two-up a lot or visiting in the rainy season (May–November)? Go for the Honda TRX520 4x4 — the extra power and traction make a real difference on the climbs.",
        ],
      },
      {
        h: "What's included",
        p: [
          "Every rental includes free delivery and pickup in Santa Teresa, Playa Carmen, Mal País and Playa Hermosa, helmets for driver and passenger, a lock box, mandatory third-party insurance and roadside help on WhatsApp. Surf racks are free on request.",
        ],
      },
      {
        h: "Rules of the road",
        p: [
          "You need a valid driver's license and your passport. Helmets are required by law. Please don't ride on the beach — it's illegal in Costa Rica and fines are steep. Keep it slow through town: the dust affects everyone who lives here.",
        ],
      },
    ],
    es: [
      {
        h: "¿Por qué alquilar un cuadraciclo en Santa Teresa?",
        p: [
          "La calle principal de Santa Teresa es un camino de lastre polvoriento (o lodoso) que recorre kilómetros junto a la costa, con calles empinadas que suben a las villas. Los carros son lentos, los taxis escasos y caminar con el calor es agotador — por eso todos se mueven en cuadraciclo.",
          "Un cuadraciclo te lleva de Playa Hermosa a Mal País en minutos, carga a dos personas y una tabla, y no le teme a los huecos ni a los ríos.",
        ],
      },
      {
        h: "¿Qué cuadraciclo elegir?",
        p: [
          "¿Primera vez? El Kymco MXU 300 o la Honda TRX420 automáticos son fáciles y perfectos para recorrer playas. ¿Te hospedas en una cuesta, vas en pareja o vienes en época lluviosa (mayo–noviembre)? Elige la Honda TRX520 4x4 — la potencia y tracción extra marcan la diferencia.",
        ],
      },
      {
        h: "Qué incluye",
        p: [
          "Todos los alquileres incluyen entrega y recogida gratis en Santa Teresa, Playa Carmen, Mal País y Playa Hermosa, cascos para conductor y pasajero, caja con candado, seguro obligatorio y asistencia por WhatsApp. Portatablas gratis a solicitud.",
        ],
      },
      {
        h: "Reglas del camino",
        p: [
          "Necesitas licencia de conducir vigente y pasaporte. El casco es obligatorio por ley. No manejes en la playa — es ilegal en Costa Rica y las multas son altas. Maneja despacio en el pueblo: el polvo afecta a todos los que viven aquí.",
        ],
      },
    ],
  },
  dirtbike: {
    en: [
      {
        h: "Explore the Nicoya Peninsula on two wheels",
        p: [
          "A dirt bike is the most fun — and most efficient — way to explore beyond Santa Teresa. Ride the ridge roads with ocean views, cross rivers on the back way to Montezuma, or follow the coast to Cabuya and Cabo Blanco.",
        ],
      },
      {
        h: "Which bike is right for me?",
        p: [
          "The Honda CRF300L is street legal, fuel injected and comfortable for longer days — our pick for exploring. The CRF250F is a pure trail bike for the jungle tracks and our guided enduro tours. The XR190L is the frugal local favourite and a great long-term rental.",
        ],
      },
      {
        h: "License & experience",
        p: [
          "You'll need a motorcycle license (or a motorcycle endorsement on your home license) and your passport. Roads here are loose gravel, mud and steep hills — if you're new to off-road riding, start with a guided tour.",
        ],
      },
    ],
    es: [
      {
        h: "Explora la Península de Nicoya en dos ruedas",
        p: [
          "Una moto de montaña es la forma más divertida — y eficiente — de explorar más allá de Santa Teresa. Recorre las crestas con vista al mar, cruza ríos por el camino de atrás a Montezuma o sigue la costa hasta Cabuya y Cabo Blanco.",
        ],
      },
      {
        h: "¿Qué moto es para mí?",
        p: [
          "La Honda CRF300L es legal para calle, con inyección y cómoda para días largos — nuestra favorita para explorar. La CRF250F es una moto de trail pura para la jungla y nuestros tours de enduro. La XR190L es la económica favorita de los locales.",
        ],
      },
      {
        h: "Licencia y experiencia",
        p: [
          "Necesitas licencia de moto y pasaporte. Los caminos aquí son de lastre suelto, barro y cuestas empinadas — si eres nuevo en off-road, empieza con un tour guiado.",
        ],
      },
    ],
  },
};
