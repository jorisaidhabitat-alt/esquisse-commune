type AnalyticsParameters = Record<string, string | number | boolean | undefined>;

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

export function initializeAnalytics() {
  if (!measurementId || typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = window.gtag ?? ((...args: unknown[]) => window.dataLayer?.push(args));

  if (!document.querySelector(`script[data-ga-measurement-id="${measurementId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.gaMeasurementId = measurementId;
    document.head.appendChild(script);
  }

  window.gtag('js', new Date());
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
