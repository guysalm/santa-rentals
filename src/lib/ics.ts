// Minimal RFC 5545 calendar file for confirmation emails.
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escText = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

export function buildIcs(opts: { uid: string; start: Date; end: Date; summary: string; description: string; location: string; url: string }) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Santa Rentals//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@santa.rentals`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(opts.start)}`,
    `DTEND:${stamp(opts.end)}`,
    `SUMMARY:${escText(opts.summary)}`,
    `DESCRIPTION:${escText(opts.description)}`,
    `LOCATION:${escText(opts.location)}`,
    `URL:${opts.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
