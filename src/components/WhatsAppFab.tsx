import { waLink } from "@/lib/site";

export function WhatsAppFab({ label }: { label: string }) {
  return (
    <a
      href={waLink("Hi Santa Rentals!")}
      rel="noopener"
      target="_blank"
      aria-label={label}
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full border-[3px] border-black bg-[#25D366] shadow-[4px_4px_0_0_#000] transition-transform hover:-translate-y-1"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white" aria-hidden>
        <path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.200 1.200 0 0 0-.9.4 3.700 3.700 0 0 0-1.100 2.700 6.400 6.400 0 0 0 1.300 3.400 14.700 14.700 0 0 0 5.600 5c2.100.9 2.900 1 4 .8a3.400 3.400 0 0 0 2.200-1.600 2.800 2.800 0 0 0 .2-1.600c-.1-.2-.3-.3-.6-.4z" />
      </svg>
    </a>
  );
}
