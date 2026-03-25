export interface Desk {
  id: string;
  name: string;
  image: string;
  images: string[];
  size: string;
  orientation: string;
  capacity: string;
  price: string;
  available: boolean;
}

export const desks: Desk[] = [
  {
    id: 'aube',
    name: "Bureau \"Le Module\"",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=1200"
    ],
    size: "12,6 m²",
    orientation: "Est",
    capacity: "1 à 3 pers.",
    price: "620€ / mois",
    available: true
  },
  {
    id: 'zenith',
    name: "Bureau \"L'Essor\"",
    image: "https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200"
    ],
    size: "13 m²",
    orientation: "Est",
    capacity: "1 à 3 pers.",
    price: "650€ / mois",
    available: true
  },
  {
    id: 'crepuscule',
    name: "Bureau \"Le Relief\"",
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=1200"
    ],
    size: "25 m²",
    orientation: "Nord-Est",
    capacity: "4 à 5 pers.",
    price: "1250€ / mois",
    available: true
  }
];
