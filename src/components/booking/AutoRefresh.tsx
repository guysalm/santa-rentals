"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-renders the server page every few seconds (e.g. while a webhook lands). */
export function AutoRefresh({ seconds = 3, maxTries = 20 }: { seconds?: number; maxTries?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      if (++n > maxTries) return clearInterval(id);
      router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds, maxTries]);
  return null;
}
