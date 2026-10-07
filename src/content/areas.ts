import type { Localized } from "@/lib/types";

export interface Area {
  slug: string;
  name: string;
  delivery: "free" | "fee";
  geo: { lat: number; lng: number };
  content: Localized<{ seoTitle: string; seoDescription: string; h1: string; intro: string; body: string[]; highlights: string[] }>;
}

export const AREAS: Area[] = [
  {
    slug: "mal-pais",
    name: "Mal País",
    delivery: "free",
    geo: { lat: 9.6066, lng: -85.1446 },
    content: {
      en: {
        seoTitle: "ATV Rental Mal País, Costa Rica — Free Delivery | Santa Rentals",
        seoDescription: "Rent an ATV or dirt bike in Mal País, Costa Rica with free delivery to your hotel. Instant online booking, helmets included, from $70.",
        h1: "ATV Rental in Mal País",
        intro: "Mal País is Santa Teresa's quieter southern neighbour — a fishing village of rocky coves, tide pools and jungle-backed villas. The road is steep, rocky dirt in places, which is exactly why a quad beats a car here.",
        body: [
          "We deliver ATVs, dirt bikes and scooters free to any hotel or villa in Mal País, usually within an hour of your chosen pickup time. Your vehicle arrives fuelled, with helmets and a lock box.",
          "From Mal País it's a short ride to the fishing harbour, the tide pools at Playa Mal País and the entrance road toward the Cabo Blanco reserve. Check out our Cabo Blanco Sunset ATV Ride if you'd rather have a guide.",
        ],
        highlights: ["Free delivery to every Mal País hotel", "Fishing harbour & tide pools", "Gateway to Cabo Blanco", "Steep roads — we recommend the TRX520 4x4"],
      },
      es: {
        seoTitle: "Alquiler de Cuadraciclos en Mal País, Costa Rica — Entrega Gratis | Santa Rentals",
        seoDescription: "Alquila un cuadraciclo o moto en Mal País, Costa Rica con entrega gratis en tu hotel. Reserva en línea, cascos incluidos, desde $70.",
        h1: "Alquiler de Cuadraciclos en Mal País",
        intro: "Mal País es el vecino tranquilo al sur de Santa Teresa — un pueblo pesquero de calas rocosas, pozas y villas en la jungla. El camino tiene tramos empinados y pedregosos, por eso un cuadraciclo es mejor que un carro.",
        body: [
          "Entregamos cuadraciclos, motos y scooters gratis en cualquier hotel o villa de Mal País, normalmente dentro de una hora desde la hora elegida. El vehículo llega con combustible, cascos y caja con candado.",
          "Desde Mal País estás a poca distancia del puerto pesquero, las pozas de Playa Mal País y el camino hacia la reserva de Cabo Blanco.",
        ],
        highlights: ["Entrega gratis en todo Mal País", "Puerto pesquero y pozas", "Puerta a Cabo Blanco", "Caminos empinados — recomendamos la TRX520 4x4"],
      },
    },
  },
  {
    slug: "playa-carmen",
    name: "Playa Carmen",
    delivery: "free",
    geo: { lat: 9.6328, lng: -85.1583 },
    content: {
      en: {
        seoTitle: "ATV & Scooter Rental Playa Carmen, Santa Teresa | Santa Rentals",
        seoDescription: "ATV, dirt bike and scooter rental at Playa Carmen, Santa Teresa. Free delivery, instant booking, helmets included.",
        h1: "ATV Rental at Playa Carmen",
        intro: "Playa Carmen sits at the main crossroads where the road from Cóbano meets the beach — the busy heart of town with surf schools, cafés and the best beginner waves.",
        body: [
          "Staying near the crossroads? We'll drop your quad at your door for free. Playa Carmen is the ideal base: ride north into Santa Teresa, south to Mal País, or inland up the hill toward Cóbano and Montezuma.",
        ],
        highlights: ["Free delivery", "Central base for every ride", "Surf-rack friendly ATVs"],
      },
      es: {
        seoTitle: "Alquiler de Cuadraciclos y Scooters en Playa Carmen, Santa Teresa | Santa Rentals",
        seoDescription: "Alquiler de cuadraciclos, motos y scooters en Playa Carmen, Santa Teresa. Entrega gratis, reserva instantánea, cascos incluidos.",
        h1: "Alquiler de Cuadraciclos en Playa Carmen",
        intro: "Playa Carmen está en el cruce principal donde la carretera de Cóbano llega a la playa — el corazón del pueblo con escuelas de surf, cafés y las mejores olas para principiantes.",
        body: [
          "¿Te hospedas cerca del cruce? Te dejamos el cuadraciclo en la puerta gratis. Playa Carmen es la base ideal: al norte hacia Santa Teresa, al sur a Mal País o subiendo hacia Cóbano y Montezuma.",
        ],
        highlights: ["Entrega gratis", "Base central para cualquier ruta", "Cuadraciclos con portatablas"],
      },
    },
  },
  {
    slug: "playa-hermosa",
    name: "Playa Hermosa",
    delivery: "free",
    geo: { lat: 9.6694, lng: -85.1845 },
    content: {
      en: {
        seoTitle: "ATV Rental Playa Hermosa, Santa Teresa — Free Delivery | Santa Rentals",
        seoDescription: "Rent an ATV or dirt bike at Playa Hermosa near Santa Teresa, Costa Rica. Free delivery, instant online booking.",
        h1: "ATV Rental in Playa Hermosa",
        intro: "North of Santa Teresa, Playa Hermosa is a long, wide beach with consistent surf and some of the best sunsets on the peninsula — and a sandy road that's much easier on a quad.",
        body: [
          "We deliver free to Playa Hermosa. From here you're well placed for the coast road north toward Manzanillo and the Bongo River — or join our Bongo River & Manzanillo day tour.",
        ],
        highlights: ["Free delivery", "Huge sunset beach", "Close to Manzanillo & Bongo River"],
      },
      es: {
        seoTitle: "Alquiler de Cuadraciclos en Playa Hermosa, Santa Teresa — Entrega Gratis | Santa Rentals",
        seoDescription: "Alquila un cuadraciclo o moto en Playa Hermosa cerca de Santa Teresa, Costa Rica. Entrega gratis, reserva en línea.",
        h1: "Alquiler de Cuadraciclos en Playa Hermosa",
        intro: "Al norte de Santa Teresa, Playa Hermosa es una playa larga y ancha con surf constante y algunos de los mejores atardeceres de la península.",
        body: [
          "Entregamos gratis en Playa Hermosa. Desde aquí estás cerca del camino costero hacia Manzanillo y el Río Bongo — o únete a nuestro tour Río Bongo y Manzanillo.",
        ],
        highlights: ["Entrega gratis", "Playa enorme para atardeceres", "Cerca de Manzanillo y Río Bongo"],
      },
    },
  },
  {
    slug: "montezuma",
    name: "Montezuma",
    delivery: "fee",
    geo: { lat: 9.6551, lng: -85.0697 },
    content: {
      en: {
        seoTitle: "ATV Rental Montezuma, Costa Rica & Waterfall Tours | Santa Rentals",
        seoDescription: "ATV rental and guided ATV tours to Montezuma waterfall from Santa Teresa. Delivery to Montezuma available. Book online.",
        h1: "ATVs & Tours in Montezuma",
        intro: "Bohemian Montezuma, on the Gulf of Nicoya side of the peninsula, is famous for its waterfalls, yoga and laid-back village vibe. It's about 40 minutes from Santa Teresa over the hills via Cóbano.",
        body: [
          "Most visitors ride over on one of our ATVs for the day — or let a local guide lead the way on our Montezuma Waterfall ATV Tour, our most popular mission. Delivery to Montezuma hotels is available for a small fee.",
        ],
        highlights: ["Montezuma waterfall tour", "Delivery available (small fee)", "Scenic ride via Cóbano"],
      },
      es: {
        seoTitle: "Alquiler de Cuadraciclos en Montezuma y Tours a la Catarata | Santa Rentals",
        seoDescription: "Alquiler de cuadraciclos y tours guiados a la catarata de Montezuma desde Santa Teresa. Entrega en Montezuma disponible.",
        h1: "Cuadraciclos y Tours en Montezuma",
        intro: "Montezuma, del lado del Golfo de Nicoya, es famoso por sus cataratas, el yoga y su ambiente bohemio. Está a unos 40 minutos de Santa Teresa por la montaña vía Cóbano.",
        body: [
          "La mayoría viene en uno de nuestros cuadraciclos por el día — o con un guía local en nuestro Tour a la Catarata de Montezuma, la misión más popular. Entrega en hoteles de Montezuma con un pequeño cargo.",
        ],
        highlights: ["Tour a la catarata de Montezuma", "Entrega disponible (pequeño cargo)", "Ruta escénica vía Cóbano"],
      },
    },
  },
  {
    slug: "cabo-blanco",
    name: "Cabo Blanco",
    delivery: "fee",
    geo: { lat: 9.5786, lng: -85.1136 },
    content: {
      en: {
        seoTitle: "Cabo Blanco by ATV — Tours & Rentals from Santa Teresa | Santa Rentals",
        seoDescription: "Explore Cabo Blanco and Cabuya by ATV from Santa Teresa. Guided sunset rides and full-day tours. Book online.",
        h1: "Cabo Blanco & Cabuya by ATV",
        intro: "At the very tip of the Nicoya Peninsula, the Cabo Blanco reserve and the village of Cabuya are a short, scenic ride from Mal País — think wild coastline, monkeys and the island cemetery reachable at low tide.",
        body: [
          "Our Cabo Blanco Sunset ATV Ride and Jungle to Coast full-day expedition both explore this corner of the peninsula. Prefer to go solo? Rent a quad and we'll suggest a route.",
        ],
        highlights: ["Sunset ATV ride", "Cabuya village", "Wild coastline & wildlife"],
      },
      es: {
        seoTitle: "Cabo Blanco en Cuadraciclo — Tours y Alquiler desde Santa Teresa | Santa Rentals",
        seoDescription: "Explora Cabo Blanco y Cabuya en cuadraciclo desde Santa Teresa. Paseos al atardecer y tours de día completo.",
        h1: "Cabo Blanco y Cabuya en Cuadraciclo",
        intro: "En la punta de la Península de Nicoya, la reserva de Cabo Blanco y el pueblo de Cabuya están a un corto y escénico trayecto desde Mal País — costa salvaje, monos y el cementerio en la isla accesible con marea baja.",
        body: [
          "Nuestro Atardecer en Cuadraciclo a Cabo Blanco y la expedición De la Jungla a la Costa exploran esta zona. ¿Prefieres ir por tu cuenta? Alquila un cuadraciclo y te sugerimos una ruta.",
        ],
        highlights: ["Paseo al atardecer", "Pueblo de Cabuya", "Costa salvaje y fauna"],
      },
    },
  },
];
