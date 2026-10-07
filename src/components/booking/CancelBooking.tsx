"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const COPY = {
  en: { cancel: "Cancel booking", confirm: "Yes, cancel my booking", sure: "Are you sure? This can't be undone.", working: "Cancelling…", failed: "Couldn't cancel online — please message us on WhatsApp." },
  es: { cancel: "Cancelar reserva", confirm: "Sí, cancelar mi reserva", sure: "¿Seguro? No se puede deshacer.", working: "Cancelando…", failed: "No se pudo cancelar en línea — escríbenos por WhatsApp." },
};

export function CancelBooking({ token, lang }: { token: string; lang: "en" | "es" }) {
  const c = COPY[lang];
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "working">("idle");
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setStep("working");
    const res = await fetch("/api/bookings/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    if (res.ok) return router.refresh();
    setError(c.failed);
    setStep("idle");
  }

  return (
    <div>
      {step === "idle" && (
        <button type="button" className="btn btn-primary" onClick={() => setStep("confirm")}>
          {c.cancel}
        </button>
      )}
      {step !== "idle" && (
        <div className="space-y-3">
          <p className="text-pink">{c.sure}</p>
          <button type="button" className="btn btn-primary" onClick={cancel} disabled={step === "working"}>
            {step === "working" ? c.working : c.confirm}
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-pink">
          {error}
        </p>
      )}
    </div>
  );
}
