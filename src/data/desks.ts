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
    name: "Le Module",
    image: "/desks/bureau-5-1.jpg",
    images: [
      "/desks/bureau-5-1.jpg",
      "/desks/bureau-5-2.jpg",
      "/gallery/cafet-6.jpg"
    ],
    size: "12,6 m²",
    orientation: "Est",
    capacity: "Idéal 1 à 2 personnes · jusqu’à 3 postes",
    price: "390 € HT/mois",
    available: true
  },
  {
    id: 'zenith',
    name: "L'Essor",
    image: "/desks/bureau-5-2.jpg",
    images: [
      "/desks/bureau-5-2.jpg",
      "/desks/bureau-5-1.jpg",
      "/gallery/salon-4.jpg"
    ],
    size: "13,2 m²",
    orientation: "Est",
    capacity: "Idéal 1 à 2 personnes · jusqu’à 3 postes",
    price: "420 € HT/mois",
    available: true
  },
  {
    id: 'crepuscule',
    name: "Le Relief",
    image: "/desks/bureau-6-1.jpg",
    images: [
      "/desks/bureau-6-1.jpg",
      "/desks/bureau-6-2.jpg",
      "/rooms/la-place-1.jpg"
    ],
    size: "25,2 m²",
    orientation: "Nord-Est",
    capacity: "Idéal pour une équipe de 3 à 4 personnes · jusqu’à 5 postes",
    price: "790 € HT/mois",
    available: true
  }
];
