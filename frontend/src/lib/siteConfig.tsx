import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getSiteConfig, type SiteConfig } from './data';

const SiteConfigContext = createContext<{ config: SiteConfig; refreshConfig: () => Promise<void> } | null>(null);

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const request = useRef<AbortController | null>(null);
  const refreshConfig = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(false);
    try {
      const next = await getSiteConfig(controller.signal);
      if (!controller.signal.aborted) setConfig(next);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refreshConfig();
    return () => request.current?.abort();
  }, [refreshConfig]);

  if (!config) return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
    {loading ? <p role="status">Loading website content…</p> : <div role="alert">
      <h1 className="text-2xl font-bold">We could not load the website.</h1>
      <p className="mt-3">The content service is unavailable or returned incomplete information. Please try again.</p>
      <button onClick={() => void refreshConfig()} className="mt-6 rounded-md bg-red-600 px-6 py-3 font-bold text-white">Try again</button>
    </div>}
  </main>;

  return <SiteConfigContext.Provider value={{ config, refreshConfig }}>
    {error && <div role="alert" className="bg-amber-100 p-3 text-center">Content could not be refreshed. Your current page is still available. <button disabled={loading} onClick={() => void refreshConfig()} className="font-bold underline">Try again</button></div>}
    {children}
  </SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) throw new Error('SiteConfigProvider is required');
  return context;
}
