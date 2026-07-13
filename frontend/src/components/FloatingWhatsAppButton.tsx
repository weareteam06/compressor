import type { SiteConfig } from '@/lib/data';

interface FloatingWhatsAppButtonProps {
  config: SiteConfig;
}

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

export default function FloatingWhatsAppButton({ config }: FloatingWhatsAppButtonProps) {
  const number = whatsappNumber(config.contact.salesPhone || config.contact.factoryPhone);
  if (!number) return null;

  const message = encodeURIComponent(`Hello ${config.company.name}, I would like to know more about your compressors.`);

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Contact through WhatsApp"
      title="Contact through WhatsApp"
      className="fixed bottom-5 left-5 z-[70] flex h-15 w-15 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-slate-950/25 ring-4 ring-white transition-transform hover:scale-105 focus:outline-none focus:ring-green-200"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 fill-current">
        <path d="M16.02 3.2c-7.02 0-12.73 5.62-12.73 12.54 0 2.2.59 4.35 1.7 6.24L3.2 28.8l7.03-1.79a12.9 12.9 0 0 0 5.79 1.38c7.02 0 12.73-5.62 12.73-12.54S23.04 3.2 16.02 3.2Zm0 22.96c-1.86 0-3.68-.49-5.27-1.43l-.38-.22-4.17 1.06 1.11-4.01-.25-.41a10.17 10.17 0 0 1-1.55-5.41c0-5.68 4.72-10.3 10.51-10.3s10.51 4.62 10.51 10.3-4.72 10.42-10.51 10.42Zm5.76-7.72c-.31-.15-1.87-.91-2.16-1.01-.29-.11-.5-.15-.71.15-.21.31-.82 1.01-1 1.22-.18.2-.37.23-.68.08-.31-.15-1.33-.48-2.54-1.53-.94-.82-1.57-1.84-1.75-2.15-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.2.05-.38-.03-.53-.08-.15-.71-1.68-.97-2.3-.25-.6-.51-.52-.71-.53h-.6c-.21 0-.53.08-.81.38-.29.31-1.07 1.03-1.07 2.51 0 1.48 1.1 2.91 1.26 3.11.16.2 2.16 3.25 5.24 4.55.73.31 1.3.5 1.75.64.73.23 1.4.2 1.92.12.59-.09 1.87-.75 2.13-1.48.26-.73.26-1.36.18-1.48-.08-.14-.29-.21-.6-.36Z" />
      </svg>
    </a>
  );
}
