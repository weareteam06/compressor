export type CookieConsent = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export const COOKIE_CONSENT_KEY = 'compressor_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'cookie-consent-changed';
export const OPEN_COOKIE_PREFERENCES_EVENT = 'open-cookie-preferences';

export function getCookieConsent(): CookieConsent | null {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<CookieConsent>;
    if (typeof parsed.analytics !== 'boolean' || typeof parsed.marketing !== 'boolean') return null;

    return {
      essential: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(preferences: Pick<CookieConsent, 'analytics' | 'marketing'>) {
  const consent: CookieConsent = {
    essential: true,
    ...preferences,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent<CookieConsent>(COOKIE_CONSENT_EVENT, { detail: consent }));
  return consent;
}

export function hasCookieConsent(category: 'analytics' | 'marketing') {
  return getCookieConsent()?.[category] === true;
}
