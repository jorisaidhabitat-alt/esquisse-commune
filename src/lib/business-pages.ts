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

export const BUSINESS_PAGE_FAQS = {
  desks: [
    {
      question: 'Les bureaux sont-ils vraiment proches de Rennes ?',
      answer:
        'Oui. Le site est situé à Chartres-de-Bretagne, avec un accès rapide à la rocade Sud. C’est un bon compromis pour rester proche de Rennes tout en gagnant en simplicité d’accès et de stationnement.',
    },
    {
      question: 'Les charges sont-elles comprises ?',
      answer:
        'Oui. Les prix affichés incluent les charges annoncées sur le site, ainsi que les services communs utiles au quotidien, comme l’accès aux espaces partagés et à la connexion internet.',
    },
    {
      question: 'Peut-on visiter avant de s’engager ?',
      answer:
        'Oui. La visite est même recommandée pour choisir la bonne surface, vérifier la luminosité, l’orientation et la circulation selon votre activité.',
    },
    {
      question: 'À qui s’adressent ces bureaux ?',
      answer:
        'Ils conviennent à des indépendants, petites équipes, cabinets et entreprises qui ont besoin d’un espace fermé, calme et professionnel, sans isolement total grâce aux espaces communs.',
    },
  ],
  rooms: [
    {
      question: 'Peut-on réserver à l’heure ?',
      answer:
        'Oui. Les deux salles sont proposées avec une formule horaire, pratique pour un rendez-vous client, une présentation ou un point d’équipe.',
    },
    {
      question: 'La localisation est-elle adaptée si l’on vient de Rennes ?',
      answer:
        'Oui. La salle se situe à Chartres-de-Bretagne, à proximité de Rennes Sud, avec un accès plus simple en voiture et un parking gratuit sur place.',
    },
    {
      question: 'Quelle salle choisir entre La Place et L’Annexe ?',
      answer:
        'La Place convient bien aux formats ouverts, lumineux et collaboratifs. L’Annexe est plus adaptée à des échanges confidentiels, structurés ou nécessitant davantage d’intimité.',
    },
    {
      question: 'Peut-on prévoir un petit déjeuner ou un déjeuner ?',
      answer:
        'Oui. Des options de restauration sont prévues selon la formule retenue, ce qui permet de prolonger une réunion ou de structurer une demi-journée de travail.',
    },
  ],
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
  const faqs = BUSINESS_PAGE_FAQS[key];

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
    {
      id: `${key}-faq`,
      data: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    },
  ] as const;
}
