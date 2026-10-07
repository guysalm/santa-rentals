import { NextResponse, type NextRequest } from "next/server";
import { AFF_COOKIE } from "@/lib/affiliate";
import { BookingError, bookingSchema, createBooking } from "@/lib/booking";
import { hasSupabaseAdmin } from "@/lib/env";
import { hasPayments } from "@/lib/payments";

// POST multipart/form-data: `payload` (JSON) + optional `license` (image file).
export async function POST(request: NextRequest) {
  if (!hasSupabaseAdmin() || !hasPayments()) {
    return NextResponse.json({ error: "UNAVAILABLE", message: "Online booking is not configured yet." }, { status: 503 });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "INVALID", message: "Bad request" }, { status: 400 });
  }
  // Honeypot: real users never fill this hidden field.
  if (form.get("website")) return NextResponse.json({ error: "INVALID", message: "Bad request" }, { status: 400 });

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("payload") ?? ""));
  } catch {
    return NextResponse.json({ error: "INVALID", message: "Bad payload" }, { status: 400 });
  }
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID", message: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 422 });
  }

  const license = form.get("license");
  try {
    const result = await createBooking(parsed.data, {
      affiliateId: request.cookies.get(AFF_COOKIE)?.value,
      license: license instanceof File && license.size > 0 ? license : null,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.code, message: err.message }, { status: err.code === "SOLD_OUT" || err.code === "TOUR_FULL" ? 409 : 422 });
    }
    console.error("[booking] failed", err);
    return NextResponse.json({ error: "SERVER", message: "Something went wrong. Please try again or message us on WhatsApp." }, { status: 500 });
  }
}
