import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {getAnalyticsConsent, setAnalyticsConsent} from '../lib/analytics';

const COOKIE_PREFERENCES_EVENT = 'esquisse-open-cookie-preferences';

export function openCookiePreferences() {
  window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT));
}

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(() => getAnalyticsConsent() === null);

  useEffect(() => {
    const openBanner = () => setIsOpen(true);
    window.addEventListener(COOKIE_PREFERENCES_EVENT, openBanner);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, openBanner);
  }, []);

  if (!isOpen) return null;

  const choose = (consent: 'granted' | 'denied') => {
    setAnalyticsConsent(consent);
    setIsOpen(false);
  };

  return (
    <aside className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:bottom-6 sm:p-6" aria-label="Préférences de confidentialité">
      <p className="font-serif text-xl font-black text-gray-900">Vos préférences de mesure</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Avec votre accord, nous utilisons Google Analytics pour comprendre la fréquentation du site et améliorer le parcours de réservation.
        Vous pouvez modifier votre choix à tout moment depuis le pied de page.
      </p>
      <Link to="/politique-confidentialite" className="mt-3 inline-flex text-sm font-semibold text-primary underline underline-offset-4">
        Consulter la politique de confidentialité
      </Link>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => choose('denied')} className="rounded-full border border-gray-300 px-5 py-3 text-sm font-bold text-gray-900 transition-colors hover:border-primary hover:text-primary">
          Refuser
        </button>
        <button type="button" onClick={() => choose('granted')} className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">
          Accepter
        </button>
      </div>
    </aside>
  );
}
