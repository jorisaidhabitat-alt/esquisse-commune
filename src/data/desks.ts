export interface Desk {
  id: string;
  name: string;
  image: string;
  size: string;
  orientation: string;
  capacity: string;
  price: string;
  available: boolean;
}

export const desks: Desk[] = [
  {
    id: 'aube',
    name: "Bureau \"L'Aube\"",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800",
    size: "15 m²",
    orientation: "Plein Sud",
    capacity: "2 à 3 pers.",
    price: "450€ / mois",
    available: true
  },
  {
    id: 'zenith',
    name: "Bureau \"Le Zénith\"",
    image: "https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&q=80&w=800",
    size: "25 m²",
    orientation: "Traversant",
    capacity: "4 à 6 pers.",
    price: "750€ / mois",
    available: true
  },
  {
    id: 'crepuscule',
    name: "Bureau \"Le Crépuscule\"",
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80&w=800",
    size: "40 m²",
    orientation: "Ouest",
    capacity: "8 à 10 pers.",
    price: "1200€ / mois",
    available: true
  }
];
