import { useEffect, useState } from 'react';
import { Globe2 } from 'lucide-react';

declare global {
  interface Window {
    firstAirTranslateInit?: () => void;
    google?: { translate?: { TranslateElement: new (options: { pageLanguage: string; autoDisplay: boolean }, id: string) => unknown } };
  }
}

// The plugin provides its supported language list; English remains the source language.
export default function LanguageSelector() {
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const initialize = () => {
      if (!alive || !window.google?.translate) return;
      new window.google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'firstair-language');
    };
    window.firstAirTranslateInit = initialize;
    if (window.google?.translate) initialize();
    else {
      document.getElementById('firstair-translate-script')?.remove();
      const script = document.createElement('script');
      script.id = 'firstair-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=firstAirTranslateInit';
      script.async = true;
      script.onerror = () => { if (alive) setFailed(true); };
      document.head.appendChild(script);
    }
    const timeout = window.setTimeout(() => { if (alive && !document.querySelector('#firstair-language select')) setFailed(true); }, 15000);
    return () => { alive = false; window.clearTimeout(timeout); delete window.firstAirTranslateInit; };
  }, [enabled]);
  return <div className="notranslate relative text-xs" translate="no"><button type="button" onClick={() => { setFailed(false); setEnabled(value => !value); }} aria-label="Choose language" aria-expanded={enabled} className="inline-flex items-center gap-1 rounded px-2 py-2 hover:bg-white/30"><Globe2 className="h-4 w-4" /><span>EN</span></button>{enabled && <div className="absolute right-0 top-full z-50 min-w-56 rounded border bg-white p-4 text-slate-950 shadow-lg"><p className="mb-2 font-bold">Choose your language</p><div id="firstair-language" /><p className="mt-2 text-[11px]">{failed ? 'Translation is unavailable. Please retry or use your browser’s translation feature.' : 'Translation powered by Google. English is the default.'}</p></div>}</div>;
}
