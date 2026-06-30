import {siteConfig} from '../data/site';

export const BUSINESS_PAGE_PATHS = {
  desks: '/bureaux-prives-chartres-de-bretagne',
  rooms: '/salle-reunion-chartres-de-bretagne',
} as const;

export type BusinessPageKey = keyof typeof BUSINESS_PAGE_PATHS;

export const BUSINESS_PAGE_SEO = {
  desks: {
    title: "Bureaux privés à Chartres-de-Bretagne | Location de bureaux près de Rennes",
    description:
      "Découvrez nos bureaux privés à Chartres-de-Bretagne, à 10 minutes de Rennes. Espaces lumineux, charges comprises, parking gratuit et visite sur rendez-vous.",
    canonicalPath: BUSINESS_PAGE_PATHS.desks,
    ogImage: new URL('/desks/bureau-6-1.jpg', siteConfig.siteUrl).toString(),
  },
  rooms: {
    title: 'Salle de réunion à Chartres-de-Bretagne | Réserver près de Rennes',
    description:
      "Réservez une salle de réunion à Chartres-de-Bretagne, près de Rennes. Formules à l'heure, demi-journée ou journée, équipements inclus et parking gratuit.",
    canonicalPath: BUSINESS_PAGE_PATHS.rooms,
    ogImage: new URL('/rooms/la-place-1.jpg', siteConfig.siteUrl).toString(),
  },
} as const;

function toAbsoluteUrl(pathname: string) {
  return new URL(pathname, siteConfig.siteUrl).toString();
}

function getPublisher() {
  return {
    '@type': 'Organization',
    name: siteConfig.brand,
    url: siteConfig.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: new URL('/favicon-logo.svg', siteConfig.siteUrl).toString(),
    },
  };
}

export function getBusinessPageJsonLd(key: BusinessPageKey) {
  const path = BUSINESS_PAGE_PATHS[key];
  const name =
    key === 'desks' ? 'Bureaux privés à Chartres-de-Bretagne' : 'Salle de réunion à Chartres-de-Bretagne';
  const description = BUSINESS_PAGE_SEO[key].description;
  const serviceType = key === 'desks' ? 'Location de bureaux privés' : 'Location de salle de réunion';

  return [
    {
      id: `${key}-breadcrumb`,
      data: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: toAbsoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name,
            item: toAbsoluteUrl(path),
          },
        ],
      },
    },
    {
      id: `${key}-service`,
      data: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        serviceType,
        description,
        url: toAbsoluteUrl(path),
        areaServed: ['Chartres-de-Bretagne', 'Rennes Sud', 'Rennes Métropole'],
        provider: getPublisher(),
      },
    },
  ] as const;
}
