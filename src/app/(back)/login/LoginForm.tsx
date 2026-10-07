"use client";
import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, null);
  if (state?.ok) return <p className="border-2 border-mint bg-mint/10 p-4 text-sm">{state.message}</p>;
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="label">Email</span>
        <input type="email" name="email" required autoComplete="email" className="field" />
      </label>
      {state && !state.ok && <p className="text-sm text-pink">{state.message}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Sending…" : "Send magic link ▸"}
      </button>
    </form>
  );
}
