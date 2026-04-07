export const galleryData = {
  cuisine: {
    title: 'La cafet’',
    summary: 'Entièrement équipée pour vos pauses déjeuner.',
    services: [
      'Assiettes et couverts à disposition',
      'Four',
      'Espace repas 12 pers',
      'Frigo',
      'Plaques de cuisson',
      'Micro-ondes',
      'Lave-vaisselle',
    ],
    images: [
      '/gallery/cafet-6.jpg',
      '/gallery/cafet-4.jpg',
      '/gallery/cafet-2.jpg',
    ],
  },
  pause: {
    title: 'Pause café',
    summary: 'Un espace détente pensé pour le partage.',
    services: [
      'Machine à grain de café',
      'Thé',
      'Tables d’appoint',
      'Bouilloire',
      'Vaisselles',
      'Lieu partagé',
      'Banquette assise',
    ],
    images: [
      '/gallery/salon-4.jpg',
      '/gallery/salon-3.jpg',
      '/gallery/salon-1.jpg',
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
      'Écran fixe',
      'Support pour ordinateur portable',
    ],
    images: [
      '/gallery/phonebox-3.jpg',
      '/gallery/phonebox-1.jpg',
      '/gallery/phonebox-5.jpg',
      '/gallery/phonebox-4.jpg',
      '/gallery/phonebox-2.jpg',
    ],
  },
} as const;

export type GalleryKey = keyof typeof galleryData;
