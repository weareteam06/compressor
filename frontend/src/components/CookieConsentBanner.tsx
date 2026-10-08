import { SiteText } from '@/lib/SiteText';
import { useEffect, useState } from 'react';
import { Cookie, Settings, X } from 'lucide-react';
import { getCookieConsent, OPEN_COOKIE_PREFERENCES_EVENT, saveCookieConsent } from '@/lib/cookieConsent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(() => getCookieConsent() === null);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(() => getCookieConsent()?.analytics ?? false);
  const [marketing, setMarketing] = useState(() => getCookieConsent()?.marketing ?? false);

  useEffect(() => {
    const handleOpenPreferences = () => openSettings();
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
  }, []);

  const save = (nextAnalytics: boolean, nextMarketing: boolean) => {
    saveCookieConsent({ analytics: nextAnalytics, marketing: nextMarketing });
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setCustomizing(false);
    setVisible(false);
  };

  const openSettings = () => {
    const current = getCookieConsent();
    setAnalytics(current?.analytics ?? false);
    setMarketing(current?.marketing ?? false);
    setCustomizing(true);
    setVisible(true);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-5 print:hidden" role="dialog" aria-label="Cookie preferences" aria-modal="false">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/25 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 sm:flex">
            <Cookie className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900"><SiteText section="CookieConsentBanner" name="your_privacy_choices" /></h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{" "}<SiteText section="CookieConsentBanner" name="we_use_essential_storage_to_make_this_site_work_with_your_permission_w" />{" "}</p>
              </div>
              {getCookieConsent() && (
                <button type="button" onClick={() => setVisible(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close cookie preferences">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {customizing && (
              <div className="mt-4 grid gap-3 border-y border-slate-100 py-4 sm:grid-cols-3">
                <Preference label="Essential" description="Required for security and saved choices." checked disabled onChange={() => undefined} />
                <Preference label="Analytics" description="Helps us understand site usage." checked={analytics} onChange={setAnalytics} />
                <Preference label="Marketing" description="Measures campaigns and relevant advertising." checked={marketing} onChange={setMarketing} />
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              {!customizing && (
                <button type="button" onClick={() => setCustomizing(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Settings className="h-4 w-4" />{" "}<SiteText section="CookieConsentBanner" name="manage_preferences" />{" "}</button>
              )}
              <button type="button" onClick={() => save(false, false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{" "}<SiteText section="CookieConsentBanner" name="reject_non_essential" />{" "}</button>
              {customizing ? (
                <button type="button" onClick={() => save(analytics, marketing)} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700">{" "}<SiteText section="CookieConsentBanner" name="save_preferences" />{" "}</button>
              ) : (
                <button type="button" onClick={() => save(true, true)} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700">{" "}<SiteText section="CookieConsentBanner" name="accept_all" />{" "}</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Preference({ label, description, checked, disabled = false, onChange }: { label: string; description: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 ${disabled ? 'cursor-not-allowed bg-slate-50' : 'border-slate-200 hover:border-red-200'}`}>
      <span>
        <span className="block text-sm font-bold text-slate-800">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-red-600" />
    </label>
  );
}
