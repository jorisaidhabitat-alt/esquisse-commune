export const galleryData = {
  cuisine: {
    title: 'La cafet’',
    summary: 'Entièrement équipée pour vos pauses déjeuner.',
    services: [
      'Four à chaleur tournante',
      'Micro-ondes',
      '12 chaises confortables',
      'Frigo connecté',
      'Machine à café à grains',
      'Lave-vaisselle',
    ],
    images: [
      '/gallery/cafet-6.webp',
      '/gallery/cafet-5.webp',
      '/gallery/cafet-2.webp',
    ],
  },
  pause: {
    title: 'Pause café',
    summary: 'Un espace détente pensé pour le partage.',
    services: ['Canapés modulables', 'Baby-foot', 'Bibliothèque partagée', 'Plantes purifiantes', 'Lumière tamisée'],
    images: [
      '/gallery/salon-4.webp',
      '/gallery/salon-2.webp',
      '/gallery/salon-1.webp',
    ],
  },
  call: {
    title: 'Phone box',
    summary: 'Box privés équipés pour vos visios et vos appels confidentiels.',
    services: ['Insonorisation acoustique', 'Éclairage ring-light', 'Prises RJ45', 'Tablette écritoire', 'Ventilation silencieuse'],
    images: [
      'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=800',
    ],
  },
} as const;

export type GalleryKey = keyof typeof galleryData;
