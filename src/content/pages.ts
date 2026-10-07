import type { Localized } from "@/lib/types";

// Static & legal pages. ⚠ The legal texts are a starting template — have them
// reviewed by a Costa Rican attorney before launch. Bump WAIVER_VERSION whenever
// the rental agreement changes; each reservation stores the version it signed.
export const WAIVER_VERSION = "2026-10-v1";

export type StaticPageKey = "about" | "contact" | "terms" | "privacy" | "rental-agreement";
type Page = { seoTitle: string; seoDescription: string; h1: string; sections: { h?: string; p: string[] }[] };

export const PAGES: Record<StaticPageKey, Localized<Page>> = {
  about: {
    en: {
      seoTitle: "About Santa Rentals — Local ATV Rental Crew in Santa Teresa",
      seoDescription: "Santa Rentals is a locally run ATV, dirt bike and tour company in Santa Teresa, Costa Rica. Meet the crew.",
      h1: "About the crew",
      sections: [
        {
          p: [
            "Santa Rentals is a small, locally run rental and tour company based in Santa Teresa on Costa Rica's Nicoya Peninsula. We ride these roads every day — to surf, to shop, to chase the sunset — and we built Santa to make getting around as easy as it should be.",
            "That means honest prices published online, instant booking and payment, free delivery to your door, and machines that are serviced before every rental.",
          ],
        },
        {
          h: "Ride respectfully",
          p: [
            "Santa Teresa is a small community. Slow down through town (the dust is real), never ride on the beach, and always wear a helmet. We'll happily suggest routes that keep you off the busiest stretches.",
          ],
        },
      ],
    },
    es: {
      seoTitle: "Sobre Santa Rentals — Alquiler Local de Cuadraciclos en Santa Teresa",
      seoDescription: "Santa Rentals es una empresa local de alquiler de cuadraciclos, motos y tours en Santa Teresa, Costa Rica.",
      h1: "Sobre nosotros",
      sections: [
        {
          p: [
            "Santa Rentals es una pequeña empresa local de alquiler y tours en Santa Teresa, en la Península de Nicoya. Recorremos estos caminos todos los días — para surfear, hacer compras o ver el atardecer — y creamos Santa para que moverse sea tan fácil como debe ser.",
            "Eso significa precios honestos publicados en línea, reserva y pago instantáneos, entrega gratis en tu puerta y máquinas revisadas antes de cada alquiler.",
          ],
        },
        {
          h: "Maneja con respeto",
          p: [
            "Santa Teresa es una comunidad pequeña. Baja la velocidad en el pueblo (el polvo es real), nunca manejes en la playa y usa siempre casco.",
          ],
        },
      ],
    },
  },
  contact: {
    en: {
      seoTitle: "Contact Santa Rentals — ATV Rental Santa Teresa",
      seoDescription: "Contact Santa Rentals in Santa Teresa, Costa Rica by WhatsApp or email. Open daily 7:30–18:00.",
      h1: "Contact",
      sections: [{ p: ["The fastest way to reach us is WhatsApp — we usually reply within minutes during opening hours (daily 7:30–18:00). For booking changes, use the link in your confirmation email."] }],
    },
    es: {
      seoTitle: "Contacto Santa Rentals — Alquiler de Cuadraciclos Santa Teresa",
      seoDescription: "Contacta a Santa Rentals en Santa Teresa, Costa Rica por WhatsApp o correo. Abierto todos los días 7:30–18:00.",
      h1: "Contacto",
      sections: [{ p: ["La forma más rápida de contactarnos es WhatsApp — normalmente respondemos en minutos durante el horario de atención (todos los días 7:30–18:00). Para cambios en tu reserva usa el enlace de tu correo de confirmación."] }],
    },
  },
  terms: {
    en: {
      seoTitle: "Terms & Conditions | Santa Rentals",
      seoDescription: "Booking, payment and cancellation terms for Santa Rentals in Santa Teresa, Costa Rica.",
      h1: "Terms & conditions",
      sections: [
        { h: "Bookings & payment", p: ["Reservations are confirmed once payment is received. Prices are in US dollars; 13% IVA is added at checkout. Rates may vary by season and are fixed at the time you book."] },
        {
          h: "Cancellations",
          p: [
            "Cancel more than 72 hours before the start time: refunded minus a 15% cancellation fee. 24–72 hours before: 50% refunded. Less than 24 hours or no-show: no refund.",
            "If we cancel a tour for weather, safety or operational reasons you receive a full refund or a free reschedule.",
          ],
        },
        { h: "Security deposit", p: ["A temporary card authorization (hold) for the deposit amount is placed at delivery and released at return, minus any damage, missing equipment, fuel or fines, as described in the rental agreement."] },
        { h: "Agent discounts", p: ["Discounts from Santa agent links or NFC keychains apply once per booking and cannot be combined with other promotions."] },
        { h: "Liability", p: ["Riding ATVs and motorcycles involves inherent risks. All renters and tour participants must accept the rental agreement and liability waiver before their booking is confirmed."] },
      ],
    },
    es: {
      seoTitle: "Términos y Condiciones | Santa Rentals",
      seoDescription: "Términos de reserva, pago y cancelación de Santa Rentals en Santa Teresa, Costa Rica.",
      h1: "Términos y condiciones",
      sections: [
        { h: "Reservas y pago", p: ["Las reservas se confirman al recibir el pago. Los precios están en dólares; se suma 13% de IVA al pagar. Las tarifas pueden variar por temporada y quedan fijas al reservar."] },
        {
          h: "Cancelaciones",
          p: [
            "Cancelación con más de 72 horas: reembolso menos un 15% de cargo. Entre 24 y 72 horas: reembolso del 50%. Menos de 24 horas o no presentarse: sin reembolso.",
            "Si cancelamos un tour por clima, seguridad u operación, recibes reembolso total o un cambio de fecha gratis.",
          ],
        },
        { h: "Depósito de garantía", p: ["Al entregar el vehículo se hace una retención temporal en tu tarjeta por el monto del depósito, que se libera al devolverlo, menos daños, equipo faltante, combustible o multas, según el contrato de alquiler."] },
        { h: "Descuentos de agentes", p: ["Los descuentos de enlaces o llaveros NFC de agentes Santa se aplican una vez por reserva y no se combinan con otras promociones."] },
        { h: "Responsabilidad", p: ["Manejar cuadraciclos y motos implica riesgos. Todos los clientes deben aceptar el contrato de alquiler y la exoneración de responsabilidad antes de confirmar su reserva."] },
      ],
    },
  },
  privacy: {
    en: {
      seoTitle: "Privacy Policy | Santa Rentals",
      seoDescription: "How Santa Rentals collects and protects your personal data.",
      h1: "Privacy policy",
      sections: [
        { h: "What we collect", p: ["Name, email, phone, country, delivery location, a copy of your driver's license and booking details. Payments are processed by our payment provider — we never see or store your full card number."] },
        { h: "Why", p: ["To deliver your rental, verify you can legally ride, contact you about your booking, comply with Costa Rican law and, if you came through an agent, credit that agent's finder's fee (agents only see your first name and booking dates)."] },
        { h: "Your rights", p: ["You can ask us to access, correct or delete your data at any time by emailing us. License copies are deleted 12 months after your rental unless needed for an open claim."] },
      ],
    },
    es: {
      seoTitle: "Política de Privacidad | Santa Rentals",
      seoDescription: "Cómo Santa Rentals recopila y protege tus datos personales.",
      h1: "Política de privacidad",
      sections: [
        { h: "Qué recopilamos", p: ["Nombre, correo, teléfono, país, lugar de entrega, copia de tu licencia y datos de la reserva. Los pagos los procesa nuestro proveedor — nunca vemos ni guardamos el número completo de tu tarjeta."] },
        { h: "Para qué", p: ["Para entregar tu vehículo, verificar que puedes manejar legalmente, contactarte sobre tu reserva, cumplir la ley costarricense y, si llegaste por un agente, acreditar su comisión (los agentes solo ven tu nombre y las fechas)."] },
        { h: "Tus derechos", p: ["Puedes pedirnos acceder, corregir o borrar tus datos en cualquier momento por correo. Las copias de licencia se borran 12 meses después del alquiler salvo que exista un reclamo abierto."] },
      ],
    },
  },
  "rental-agreement": {
    en: {
      seoTitle: "Rental Agreement & Liability Waiver | Santa Rentals",
      seoDescription: "The rental agreement and liability waiver every Santa Rentals customer accepts at checkout.",
      h1: "Rental agreement & waiver",
      sections: [
        { h: "1. The renter", p: ["The renter confirms they hold a valid driver's license (motorcycle license for motorcycles), meet the minimum age for the vehicle, and will not allow anyone else to drive."] },
        { h: "2. Use of the vehicle", p: ["The renter will wear a helmet at all times, obey Costa Rican traffic law, not ride on beaches, under the influence of alcohol or drugs, or outside the Nicoya Peninsula without written permission, and not carry more passengers than the vehicle is rated for."] },
        { h: "3. Damage, loss & fines", p: ["The renter is responsible for damage, theft (if the vehicle was not locked), lost keys or equipment and traffic fines during the rental, up to the cost of repair or replacement. The security deposit hold may be captured to cover these costs."] },
        { h: "4. Fuel & return", p: ["The vehicle must be returned at the agreed time with the same fuel level. Late returns are charged per started hour at the hourly-equivalent rate."] },
        { h: "5. Assumption of risk & waiver", p: ["The renter understands that riding ATVs and motorcycles on unpaved roads involves risks including serious injury. The renter voluntarily assumes these risks and releases Santa Rentals, its staff and guides from liability, except in cases of gross negligence."] },
        { h: "6. Electronic signature", p: ["By typing their full name and ticking the box at checkout, the renter signs this agreement electronically. The signature, time and agreement version are recorded with the booking."] },
      ],
    },
    es: {
      seoTitle: "Contrato de Alquiler y Exoneración | Santa Rentals",
      seoDescription: "El contrato de alquiler y exoneración de responsabilidad que todo cliente acepta al pagar.",
      h1: "Contrato de alquiler y exoneración",
      sections: [
        { h: "1. El arrendatario", p: ["El arrendatario confirma que tiene licencia vigente (licencia de moto para motocicletas), cumple la edad mínima del vehículo y no permitirá que otra persona maneje."] },
        { h: "2. Uso del vehículo", p: ["El arrendatario usará casco en todo momento, respetará la ley de tránsito, no manejará en playas, bajo efectos de alcohol o drogas ni fuera de la Península de Nicoya sin permiso escrito, y no llevará más pasajeros de los permitidos."] },
        { h: "3. Daños, pérdidas y multas", p: ["El arrendatario es responsable por daños, robo (si el vehículo no estaba asegurado), llaves o equipo perdidos y multas durante el alquiler, hasta el costo de reparación o reposición. La retención del depósito puede cobrarse para cubrir estos costos."] },
        { h: "4. Combustible y devolución", p: ["El vehículo debe devolverse a la hora acordada con el mismo nivel de combustible. Las devoluciones tardías se cobran por hora iniciada."] },
        { h: "5. Asunción de riesgo y exoneración", p: ["El arrendatario entiende que manejar cuadraciclos y motos en caminos de lastre implica riesgos, incluidas lesiones graves. Asume voluntariamente estos riesgos y libera de responsabilidad a Santa Rentals, su personal y guías, salvo negligencia grave."] },
        { h: "6. Firma electrónica", p: ["Al escribir su nombre completo y marcar la casilla al pagar, el arrendatario firma este contrato electrónicamente. Se registran la firma, la hora y la versión del contrato."] },
      ],
    },
  },
};
