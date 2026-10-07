import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

const ERRORS: Record<string, string> = {
  "no-agent": "This account isn't linked to an agent profile yet.",
  link: "That login link is invalid or has expired. Request a new one.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_bottom,_#ff2e8844,_transparent_60%)] px-4">
      <div className="panel w-full max-w-md p-8">
        <Logo className="mb-6" />
        <h1 className="text-5xl">
          <span className="sunset-text">Santa HQ</span>
        </h1>
        <p className="mb-6 mt-2 text-muted">Staff &amp; agent login — we&apos;ll email you a magic link.</p>
        <Suspense>
          <LoginInner searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginInner({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "";
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;
  return (
    <>
      {error && <p className="mb-4 border-2 border-pink bg-pink/10 p-3 text-sm">{error}</p>}
      <LoginForm next={next} />
    </>
  );
}
