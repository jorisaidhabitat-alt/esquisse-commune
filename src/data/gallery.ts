export const galleryData = {
  cuisine: {
    title: 'La cafet’',
    summary: 'Entièrement équipée pour vos pauses déjeuner.',
    services: [
      'Assiettes et couverts à disposition',
      'Four',
      '12 chaises blanches',
      'Frigo',
      'Plaques de cuisson',
      'Micro-ondes',
      'Lave-vaisselle',
    ],
    images: [
      '/gallery/cafet-6.webp',
      '/gallery/cafet-4.webp',
      '/gallery/cafet-2.webp',
    ],
  },
  pause: {
    title: 'Pause café',
    summary: 'Un espace détente pensé pour le partage.',
    services: [
      'Machine à grain de café',
      'Thé',
      'Petites tables rondes',
      'Bouilloire',
      'Tasses à disposition',
      'Places assises',
      'Machine à café moulu',
    ],
    images: [
      '/gallery/salon-4.webp',
      '/gallery/salon-3.webp',
      '/gallery/salon-1.webp',
    ],
  },
  call: {
    title: 'Phone box',
    summary: 'Box privés équipés pour vos visios et vos appels confidentiels.',
    services: [
      'Insonorisation acoustique',
      'Clavier et souris',
      'Branchement HDMI (adaptateur Mac)',
      'Prises électriques',
      'Écran fixé',
      'Support pour ordinateur portable',
    ],
    images: [
      '/gallery/phonebox-3.webp',
      '/gallery/phonebox-1.webp',
      '/gallery/phonebox-5.webp',
      '/gallery/phonebox-4.webp',
      '/gallery/phonebox-2.webp',
    ],
  },
} as const;

export type GalleryKey = keyof typeof galleryData;
