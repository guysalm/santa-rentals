"use client";
import { useEffect } from "react";

/** Global guard: buttons with data-confirm="…" ask before submitting their form. */
export function ConfirmSubmit() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-confirm]");
      if (btn && !window.confirm(btn.dataset.confirm)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
