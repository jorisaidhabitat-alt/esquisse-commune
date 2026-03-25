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
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
    ],
    priceHour: "25€",
    priceDay: "160€",
    description: "Un espace ouvert et lumineux pour vos formations, ateliers et présentation publique.",
    features: ["Jusqu'à 8 personnes", "Télévision 65 pouces, 4K, Airplay", "Espace pause café disponible"],
    surface: "15 m²",
    rates: [
      {label: "À l'heure", price: "25€"},
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
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=1200"
    ],
    priceHour: "35€",
    priceDay: "210€",
    description: "Un espace fermé et confidentiel pour vos formations, présentations clients et réunions d’équipe.",
    features: ["Jusqu'à 8 personnes", "Système de vidéo-projecteur", "Espace pause café disponible"],
    surface: "16 m²",
    rates: [
      {label: "À l'heure", price: "35€"},
      {label: 'Demi-journée', price: '110€', details: 'Avec espace pause café'},
      {label: 'Journée', price: '210€', details: 'Avec espace pause café et cafétéria'},
    ],
    options: ['Petit déjeuner : 5€ HT par personne', 'Déjeuner : 25€ HT par personne'],
    tag: '#intimiste',
    available: true
  }
];
