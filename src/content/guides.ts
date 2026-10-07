import type { Localized } from "@/lib/types";

export interface Guide {
  slug: string;
  published: string; // YYYY-MM-DD
  content: Localized<{ title: string; description: string; intro: string; sections: { h: string; p: string[] }[] }>;
}

// Long-tail SEO articles answering what travellers actually search.
export const GUIDES: Guide[] = [
  {
    slug: "santa-teresa-to-montezuma-by-atv",
    published: "2026-10-06",
    content: {
      en: {
        title: "Santa Teresa to Montezuma by ATV: Route, Time & Tips",
        description: "How to ride from Santa Teresa to Montezuma waterfall on an ATV or dirt bike — the route via Cóbano, ride time, road conditions and what to bring.",
        intro: "Montezuma's waterfalls are the most popular day trip from Santa Teresa, and the ride there is half the fun. Here's everything you need to know before you go.",
        sections: [
          {
            h: "The route",
            p: [
              "From the Playa Carmen crossroads, take the paved road inland and uphill to Cóbano (about 20 minutes). In Cóbano, follow the signs downhill to Montezuma (another 15–20 minutes). The descent into Montezuma is steep and winding — take it slow and use your brakes gently.",
            ],
          },
          {
            h: "How long does it take?",
            p: ["Plan on 40–50 minutes each way at a relaxed pace on a quad. Leave early: the falls are quieter before 10am, and the afternoon rain in green season (May–November) can make the roads slippery."],
          },
          {
            h: "Reaching the waterfall",
            p: [
              "Park in Montezuma village near the waterfall trailhead (there are guarded parking spots — tip the attendant). The hike to the lower falls takes about 20 minutes and involves scrambling over rocks along the river; wear shoes with grip. Never jump from the upper cliffs — injuries happen every year.",
            ],
          },
          {
            h: "Prefer a guide?",
            p: ["Our Montezuma Waterfall ATV Tour includes hotel pickup, a local guide who knows the safest trail to the pools and a lunch stop in the village — no navigation needed."],
          },
        ],
      },
      es: {
        title: "De Santa Teresa a Montezuma en Cuadraciclo: Ruta, Tiempo y Consejos",
        description: "Cómo ir de Santa Teresa a la catarata de Montezuma en cuadraciclo o moto — la ruta vía Cóbano, tiempo de viaje, estado del camino y qué llevar.",
        intro: "Las cataratas de Montezuma son el paseo más popular desde Santa Teresa, y el viaje es la mitad de la diversión. Esto es lo que necesitas saber.",
        sections: [
          {
            h: "La ruta",
            p: ["Desde el cruce de Playa Carmen, toma la carretera pavimentada cuesta arriba hasta Cóbano (unos 20 minutos). En Cóbano sigue las señales cuesta abajo hacia Montezuma (otros 15–20 minutos). La bajada es empinada y con curvas — ve despacio."],
          },
          {
            h: "¿Cuánto se tarda?",
            p: ["Calcula 40–50 minutos por trayecto a ritmo tranquilo. Sal temprano: la catarata está más tranquila antes de las 10am y la lluvia de la tarde en época verde (mayo–noviembre) vuelve resbaloso el camino."],
          },
          {
            h: "Cómo llegar a la catarata",
            p: ["Estaciona en el pueblo cerca del sendero (hay parqueos con cuidador). La caminata a la catarata baja toma unos 20 minutos por rocas junto al río; usa zapatos con agarre. Nunca saltes desde los acantilados superiores."],
          },
          {
            h: "¿Prefieres un guía?",
            p: ["Nuestro Tour a la Catarata de Montezuma incluye recogida en el hotel, un guía local y parada para almorzar en el pueblo."],
          },
        ],
      },
    },
  },
  {
    slug: "driving-an-atv-in-costa-rica-rules",
    published: "2026-10-06",
    content: {
      en: {
        title: "Driving an ATV in Costa Rica: License, Rules & Safety",
        description: "Can tourists drive ATVs in Costa Rica? License requirements, helmet law, beach riding rules, insurance and safety tips for Santa Teresa.",
        intro: "Renting a quad is the easiest way to explore Santa Teresa — but there are a few rules every visitor should know before they ride.",
        sections: [
          {
            h: "Do I need a license?",
            p: ["Yes. Tourists can drive in Costa Rica with a valid license from their home country for as long as their tourist stay is valid. Carry your passport (or a copy with your entry stamp) along with your license. Motorcycles require a motorcycle license or endorsement."],
          },
          {
            h: "Helmets are mandatory",
            p: ["Costa Rican law requires helmets for drivers and passengers on ATVs and motorcycles. Police checkpoints on the road to Cóbano do issue fines."],
          },
          {
            h: "No riding on the beach",
            p: ["Driving on beaches is prohibited in Costa Rica (with very limited exceptions) to protect nesting turtles and beachgoers. Fines are significant — and yes, people get caught in Santa Teresa."],
          },
          {
            h: "Safety tips",
            p: [
              "Ride slowly: loose gravel and potholes are the main cause of accidents. Stay right on blind corners, watch for dogs, cyclists and surfers, and never ride after drinking. If it rains, brake earlier and avoid deep puddles that can hide holes.",
            ],
          },
        ],
      },
      es: {
        title: "Manejar Cuadraciclo en Costa Rica: Licencia, Reglas y Seguridad",
        description: "¿Pueden los turistas manejar cuadraciclo en Costa Rica? Licencia, ley de casco, reglas de playa, seguro y consejos de seguridad para Santa Teresa.",
        intro: "Alquilar un cuadraciclo es la forma más fácil de explorar Santa Teresa — pero hay algunas reglas que todo visitante debe conocer.",
        sections: [
          {
            h: "¿Necesito licencia?",
            p: ["Sí. Los turistas pueden manejar con una licencia vigente de su país durante su estadía como turista. Lleva tu pasaporte (o copia con el sello de entrada). Las motos requieren licencia de moto."],
          },
          {
            h: "El casco es obligatorio",
            p: ["La ley costarricense exige casco para conductores y pasajeros. Hay retenes en la carretera a Cóbano que ponen multas."],
          },
          {
            h: "Prohibido manejar en la playa",
            p: ["Manejar en las playas está prohibido en Costa Rica para proteger a las tortugas y a los bañistas. Las multas son altas."],
          },
          {
            h: "Consejos de seguridad",
            p: ["Maneja despacio: el lastre suelto y los huecos causan la mayoría de accidentes. Mantente a la derecha en curvas, cuidado con perros, ciclistas y surfistas, y nunca manejes después de tomar."],
          },
        ],
      },
    },
  },
  {
    slug: "best-sunset-spots-santa-teresa",
    published: "2026-10-06",
    content: {
      en: {
        title: "The Best Sunset Spots in Santa Teresa (and How to Get There)",
        description: "Where to watch the sunset in Santa Teresa and Mal País — beaches, lookouts and tide pools, with tips on getting there by ATV.",
        intro: "Sunset is a daily ritual in Santa Teresa. Here are our favourite spots — all easy to reach on a quad.",
        sections: [
          { h: "Playa Santa Teresa (Suck Rock)", p: ["The rocky point in the middle of town, where surfers and spectators gather every evening. Park on the main road and walk down."] },
          { h: "Playa Hermosa", p: ["A long, wide, uncrowded beach north of town with a perfect horizon. Ride north on the main road and take any beach access."] },
          { h: "Mal País tide pools", p: ["South of town, the rocky reefs of Mal País glow orange at low tide. Combine with dinner in the fishing village — or join our Cabo Blanco Sunset ATV Ride."] },
        ],
      },
      es: {
        title: "Los Mejores Lugares para Ver el Atardecer en Santa Teresa",
        description: "Dónde ver el atardecer en Santa Teresa y Mal País — playas, miradores y pozas, con consejos para llegar en cuadraciclo.",
        intro: "El atardecer es un ritual diario en Santa Teresa. Estos son nuestros lugares favoritos — todos fáciles de alcanzar en cuadraciclo.",
        sections: [
          { h: "Playa Santa Teresa (Suck Rock)", p: ["La punta rocosa en el centro del pueblo, donde surfistas y espectadores se reúnen cada tarde."] },
          { h: "Playa Hermosa", p: ["Una playa larga y tranquila al norte del pueblo con un horizonte perfecto."] },
          { h: "Pozas de Mal País", p: ["Al sur, los arrecifes de Mal País brillan naranja con la marea baja. Combínalo con cena en el pueblo pesquero — o únete a nuestro Atardecer en Cuadraciclo a Cabo Blanco."] },
        ],
      },
    },
  },
];
