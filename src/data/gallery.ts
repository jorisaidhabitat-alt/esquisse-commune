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
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1556910110-a5a63dfd393c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?auto=format&fit=crop&q=80&w=800',
    ],
  },
  pause: {
    title: 'Pause café',
    summary: 'Un espace détente pensé pour le partage.',
    services: ['Canapés modulables', 'Baby-foot', 'Bibliothèque partagée', 'Plantes purifiantes', 'Lumière tamisée'],
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800',
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
