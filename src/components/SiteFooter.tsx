import {Mail, MapPin, Phone} from 'lucide-react';
import {Link} from 'react-router-dom';
import {siteConfig} from '../data/site';

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 pb-8 pt-16 text-white md:pb-10 md:pt-20">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="mb-12 grid grid-cols-1 gap-10 text-center md:mb-16 md:grid-cols-4 md:gap-12 md:text-left">
          <div>
            <div className="mb-6">
              <span className="font-serif text-2xl font-black tracking-tight">{siteConfig.brand}</span>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Bureaux privés, salles de réunion et espaces partagés à Chartres-de-Bretagne.
              Les demandes sont transmises directement à l’équipe via email.
            </p>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-gray-200">Navigation</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="/#bureaux" className="transition-colors hover:text-white">Bureaux privés</a></li>
              <li><a href="/#salles-reunions" className="transition-colors hover:text-white">Salles de réunion</a></li>
              <li><a href="/#espaces-partages" className="transition-colors hover:text-white">Espaces partagés</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-gray-200">Informations légales</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/mentions-legales" className="transition-colors hover:text-white">Mentions légales</Link></li>
              <li><Link to="/politique-confidentialite" className="transition-colors hover:text-white">Politique de confidentialité</Link></li>
              <li><Link to="/cgv" className="transition-colors hover:text-white">CGV et réservations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-gray-200">Nous trouver</h4>
            <p className="mb-4 flex items-start justify-center gap-3 text-sm text-gray-400 md:justify-start">
              <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${siteConfig.address.street}, ${siteConfig.address.postalCode} ${siteConfig.address.city}, France`)}`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                {siteConfig.address.street}<br />
                {siteConfig.address.postalCode} {siteConfig.address.city}<br />
                France
              </a>
            </p>
            <p className="mb-4 flex items-center justify-center gap-3 text-sm text-gray-400 md:justify-start">
              <Mail size={18} className="shrink-0 text-primary" />
              <a href={`mailto:${siteConfig.email}`} className="break-all transition-colors hover:text-white sm:break-normal">{siteConfig.email}</a>
            </p>
            <p className="flex items-center justify-center gap-3 text-sm text-gray-400 md:justify-start">
              <Phone size={18} className="shrink-0 text-primary" />
              <a href={`tel:${siteConfig.phoneLink}`} className="transition-colors hover:text-white">{siteConfig.phoneDisplay}</a>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.brand}. Tous droits réservés.</p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-end md:gap-6">
            <Link to="/mentions-legales" className="transition-colors hover:text-white">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="transition-colors hover:text-white">Confidentialité</Link>
            <Link to="/cgv" className="transition-colors hover:text-white">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
