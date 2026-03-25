import {Mail, Menu, Phone, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {siteConfig} from '../data/site';

const navLinks = [
  {href: '/#bureaux', label: 'Bureaux'},
  {href: '/#salles-reunions', label: 'Réunions'},
  {href: '/#espaces-partages', label: 'Espaces partagés'},
  {href: '/#reservation', label: 'Nous contacter'},
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previousOverflow;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

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

      <div
        id="mobile-navigation"
        className={`fixed inset-x-0 bottom-0 top-[84px] z-40 bg-white transition-opacity duration-300 md:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <nav className="flex h-full flex-col px-6 py-8">
          <div className="flex flex-1 flex-col justify-center gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-4 text-center text-base font-semibold text-gray-900 transition-colors hover:bg-gray-50 hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-4 text-center text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <Mail size={16} />
              {siteConfig.email}
            </a>
            <a
              href={`tel:${siteConfig.phoneLink}`}
              className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-4 text-center text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <Phone size={16} />
              {siteConfig.phoneDisplay}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
