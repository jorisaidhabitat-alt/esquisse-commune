export interface Desk {
  id: string;
  name: string;
  image: string;
  images: string[];
  size: string;
  orientation: string;
  capacity: string;
  price: string;
  charges: string;
  available: boolean;
}

export const desks: Desk[] = [
  {
    id: 'aube',
    name: "Le Module",
    image: "/desks/bureau-5-1.webp",
    images: [
      "/desks/bureau-5-1.webp",
      "/desks/bureau-5-2.webp",
      "/gallery/cafet-6.webp"
    ],
    size: "12,6 m²",
    orientation: "Est",
    capacity: "1 à 3 pers.",
    price: "620€ / mois",
    charges: "120€",
    available: true
  },
  {
    id: 'zenith',
    name: "L'Essor",
    image: "/desks/bureau-5-2.webp",
    images: [
      "/desks/bureau-5-2.webp",
      "/desks/bureau-5-1.webp",
      "/gallery/salon-4.webp"
    ],
    size: "13 m²",
    orientation: "Est",
    capacity: "1 à 3 pers.",
    price: "650€ / mois",
    charges: "130€",
    available: true
  },
  {
    id: 'crepuscule',
    name: "Le Relief",
    image: "/desks/bureau-6-1.webp",
    images: [
      "/desks/bureau-6-1.webp",
      "/desks/bureau-6-2.webp",
      "/rooms/la-place-1.webp"
    ],
    size: "25 m²",
    orientation: "Nord-Est",
    capacity: "4 à 5 pers.",
    price: "1250€ / mois",
    charges: "250€",
    available: true
  }
];
