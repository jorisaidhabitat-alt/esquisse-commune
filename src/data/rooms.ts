interface RoomRate {
  label: string;
  price: string;
  details?: string;
}

export interface Room {
  id: string;
  name: string;
  image: string;
  images: string[];
  priceHour: string;
  priceDay: string;
  description: string;
  features: string[];
  surface?: string;
  rates?: RoomRate[];
  options?: string[];
  tag?: string;
  available: boolean;
}

export const rooms: Room[] = [
  {
    id: 'atelier',
    name: "La Place",
    image: "/rooms/la-place-1.webp",
    images: [
      "/rooms/la-place-1.webp",
      "/rooms/la-place-2.webp",
      "/rooms/la-place-3.webp"
    ],
    priceHour: "25€",
    priceDay: "160€",
    description: "Un espace ouvert et lumineux.",
    features: ["Jusqu'à 8 personnes", "Télévision 65 pouces, 4K, Airplay", "Espace pause café disponible"],
    surface: "15 m²",
    rates: [
      {label: "À l'heure", price: "25€", details: 'Avec espace café'},
      {label: 'Demi-journée', price: '90€', details: 'Avec espace café'},
      {label: 'Journée', price: '160€', details: 'Avec espace café et cafétéria'},
    ],
    options: ['Petit déjeuner : 5€ HT par personne', 'Déjeuner : 25€ HT par personne'],
    tag: '#creative',
    available: true
  },
  {
    id: 'board',
    name: "L'Annexe",
    image: "/rooms/annexe-9.webp",
    images: [
      "/rooms/annexe-9.webp",
      "/rooms/annexe-2.webp",
      "/rooms/annexe-3.webp"
    ],
    priceHour: "35€",
    priceDay: "210€",
    description: "Un espace fermé et confidentiel.",
    features: ["Jusqu'à 10 personnes", "Système de vidéo-projecteur", "Espace pause café disponible"],
    surface: "16 m²",
    rates: [
      {label: "À l'heure", price: "35€", details: 'Avec espace café'},
      {label: 'Demi-journée', price: '110€', details: 'Avec espace pause café'},
      {label: 'Journée', price: '210€', details: 'Avec espace pause café et cafétéria'},
    ],
    options: ['Petit déjeuner : 5€ HT par personne', 'Déjeuner : 25€ HT par personne'],
    tag: '#intimiste',
    available: true
  }
];
