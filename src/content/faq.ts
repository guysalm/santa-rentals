import type { Localized } from "@/lib/types";

export type Faq = { q: string; a: string };

export const FAQ: Localized<Faq[]> = {
  en: [
    {
      q: "Do I need a driver's license to rent an ATV in Santa Teresa?",
      a: "Yes. You need a valid driver's license from your home country, and your passport with your Costa Rica entry stamp (foreign licenses are valid for the length of your tourist stay). Dirt bikes require a motorcycle license or endorsement.",
    },
    {
      q: "How old do I have to be?",
      a: "18+ for most ATVs, scooters and the smaller bikes; 21+ for the Honda TRX520 and CRF300L. Passengers of any age must wear a helmet.",
    },
    {
      q: "How much is the security deposit?",
      a: "Usually $500 for ATVs and big bikes ($300 for scooters and the XR190). We place a temporary hold on the card you booked with when we deliver — nothing is charged, and the hold is released when you return the vehicle undamaged.",
    },
    {
      q: "Is delivery really free?",
      a: "Yes — free delivery and pickup anywhere in Santa Teresa, Playa Carmen, Mal País and Playa Hermosa. Montezuma, Cabuya and Cóbano are available for a small fee.",
    },
    {
      q: "What about fuel?",
      a: "Vehicles are delivered with fuel. Please return them with the same level, or we'll refill at the local station price.",
    },
    {
      q: "What's your cancellation policy?",
      a: "Cancel more than 72 hours before your start time and you get a refund minus a 15% cancellation fee. Between 24 and 72 hours, 50% is refunded. Less than 24 hours or no-show is non-refundable. If we cancel a tour for weather or safety, you get a full refund.",
    },
    {
      q: "Is insurance included?",
      a: "Mandatory Costa Rican third-party liability (SOA) is included on every street-legal vehicle. Damage to the vehicle is covered by your security deposit up to its amount — ride carefully on rocky and muddy roads.",
    },
    {
      q: "Can two people ride on one ATV?",
      a: "Yes, our Honda and Kymco quads are rated for a driver and one passenger. A second helmet is included.",
    },
    {
      q: "How do I pay?",
      a: "Online by card at checkout, in US dollars. You'll get an instant confirmation email with your booking code and a link to manage or cancel your booking.",
    },
  ],
  es: [
    {
      q: "¿Necesito licencia para alquilar un cuadraciclo en Santa Teresa?",
      a: "Sí. Necesitas una licencia de conducir vigente de tu país y tu pasaporte con el sello de entrada a Costa Rica (las licencias extranjeras son válidas durante tu estadía como turista). Las motos requieren licencia de moto.",
    },
    {
      q: "¿Qué edad mínima se requiere?",
      a: "18 años para la mayoría de cuadraciclos, scooters y motos pequeñas; 21 años para la Honda TRX520 y la CRF300L. Los pasajeros de cualquier edad deben usar casco.",
    },
    {
      q: "¿De cuánto es el depósito de garantía?",
      a: "Normalmente $500 para cuadraciclos y motos grandes ($300 para scooters y la XR190). Hacemos una retención temporal en la tarjeta con la que reservaste al entregar el vehículo — no se cobra nada y se libera al devolverlo sin daños.",
    },
    {
      q: "¿La entrega es realmente gratis?",
      a: "Sí — entrega y recogida gratis en Santa Teresa, Playa Carmen, Mal País y Playa Hermosa. Montezuma, Cabuya y Cóbano tienen un pequeño cargo.",
    },
    {
      q: "¿Y el combustible?",
      a: "Los vehículos se entregan con combustible. Devuélvelos con el mismo nivel o lo recargamos al precio de la bomba local.",
    },
    {
      q: "¿Cuál es la política de cancelación?",
      a: "Si cancelas con más de 72 horas de anticipación, te devolvemos el pago menos un 15% de cargo por cancelación. Entre 24 y 72 horas se devuelve el 50%. Con menos de 24 horas o si no te presentas no hay reembolso. Si cancelamos un tour por clima o seguridad, el reembolso es total.",
    },
    {
      q: "¿Incluye seguro?",
      a: "Todos los vehículos legales para calle incluyen el seguro obligatorio (SOA) de responsabilidad civil. Los daños al vehículo se cubren con el depósito de garantía hasta su monto.",
    },
    {
      q: "¿Pueden ir dos personas en un cuadraciclo?",
      a: "Sí, nuestros cuadraciclos Honda y Kymco son para conductor y un pasajero. Incluimos un segundo casco.",
    },
    {
      q: "¿Cómo pago?",
      a: "En línea con tarjeta, en dólares. Recibirás un correo de confirmación inmediato con tu código de reserva y un enlace para gestionarla o cancelarla.",
    },
  ],
};
