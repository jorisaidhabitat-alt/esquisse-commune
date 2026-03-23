import {Mail, Menu, Phone, X} from 'lucide-react';
import {useState} from 'react';
import {siteConfig} from '../data/site';

const navLinks = [
  {href: '/#bureaux', label: 'Bureaux'},
  {href: '/#salles-reunions', label: 'Réunions'},
  {href: '/#espaces-partages', label: 'Espaces partagés'},
  {href: '/#reservation', label: 'Nous contacter'},
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-12">
        <div className="hidden items-center gap-8 text-sm font-bold md:flex">
          {navLinks.slice(0, 2).map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-primary">
              {link.label}
            </a>
          ))}
        </div>

        <a href="/#hero" className="font-serif text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
          {siteConfig.brand}
        </a>

        <div className="hidden items-center gap-8 text-sm font-bold md:flex">
          {navLinks.slice(2).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={link.label === 'Nous contacter'
                ? 'rounded-full bg-primary px-6 py-2.5 text-white transition-colors hover:bg-primary/90'
                : 'transition-colors hover:text-primary'}
            >
              {link.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-900 md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isOpen && (
        <div id="mobile-navigation" className="border-t border-gray-100 bg-white md:hidden">
          <nav className="mx-auto flex max-w-[1400px] flex-col gap-2 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a href={`mailto:${siteConfig.email}`} className="mt-2 flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
              <Mail size={16} />
              {siteConfig.email}
            </a>
            <a href={`tel:${siteConfig.phoneLink}`} className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
              <Phone size={16} />
              {siteConfig.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
