type AnalyticsParameters = Record<string, string | number | boolean | undefined>;

export const ANALYTICS_CONSENT_STORAGE_KEY = 'esquisse-analytics-consent';
export const ANALYTICS_CONSENT_CHANGE_EVENT = 'esquisse-analytics-consent-change';
type AnalyticsConsent = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// The prerender script imports the React tree in Node, where Vite's env object is absent.
const measurementId = import.meta.env?.VITE_GA_MEASUREMENT_ID?.trim();

export function isAnalyticsEnabled() {
  return Boolean(measurementId);
}

export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === 'undefined') return null;

  const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  return value === 'granted' || value === 'denied' ? value : null;
}

export function setAnalyticsConsent(consent: AnalyticsConsent) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  if (consent === 'denied' && window.gtag) {
    window.gtag('consent', 'update', {analytics_storage: 'denied'});
  }
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGE_EVENT));
}

export function initializeAnalytics() {
  if (!measurementId || typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? function gtag(..._args: unknown[]) {
    // gtag.js expects each queued command as the native arguments object.
    window.dataLayer?.push(arguments);
  };

  if (!document.querySelector(`script[data-ga-measurement-id="${measurementId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.gaMeasurementId = measurementId;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
  window.gtag('consent', 'default', {analytics_storage: 'granted'});
  window.gtag('config', measurementId, {anonymize_ip: true, send_page_view: false});
}

export function trackPageView(path: string) {
  if (!measurementId || typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', 'page_view', {
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
  });
}

export function trackEvent(name: string, parameters: AnalyticsParameters = {}) {
  if (!measurementId || typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', name, parameters);
}
