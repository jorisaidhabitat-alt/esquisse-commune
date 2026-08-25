import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  getAnalyticsConsent,
  initializeAnalytics,
  isAnalyticsEnabled,
  trackEvent,
  trackPageView,
} from '../lib/analytics';

export function AnalyticsTracker() {
  const location = useLocation();
  const [hasConsent, setHasConsent] = useState(() => getAnalyticsConsent() === 'granted');

  useEffect(() => {
    const syncConsent = () => setHasConsent(getAnalyticsConsent() === 'granted');
    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, syncConsent);
    return () => window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, syncConsent);
  }, []);

  useEffect(() => {
    if (!hasConsent || !isAnalyticsEnabled()) return;

    initializeAnalytics();

    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    trackPageView(pagePath);

    if (location.pathname === '/bureaux-prives-chartres-de-bretagne') {
      trackEvent('view_business_page', {offer_type: 'bureau'});
    } else if (location.pathname === '/salle-reunion-chartres-de-bretagne') {
      trackEvent('view_business_page', {offer_type: 'salle'});
    } else if (location.pathname.startsWith('/blog/')) {
      trackEvent('view_blog_post', {article_slug: location.pathname.replace('/blog/', '')});
    }
  }, [hasConsent, location.hash, location.pathname, location.search]);

  useEffect(() => {
    if (!hasConsent || !isAnalyticsEnabled()) return;

    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;

      const interactiveElement = event.target.closest('a, button');
      if (!interactiveElement) return;

      const href = interactiveElement.getAttribute('href') ?? '';
      if (href.startsWith('tel:')) {
        trackEvent('click_phone', {link_url: href});
      } else if (href.startsWith('mailto:')) {
        trackEvent('click_email');
      } else if (href === '/#reservation' || href === '#reservation') {
        trackEvent('click_reservation_cta', {page_path: window.location.pathname});
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [hasConsent]);

  return null;
}
