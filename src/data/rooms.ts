export interface Room {
  id: string;
  name: string;
  image: string;
  priceHour: string;
  priceDay: string;
  description: string;
  features: string[];
  available: boolean;
}

export const rooms: Room[] = [
  {
    id: 'atelier',
    name: "La Place",
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=1200",
    priceHour: "35€",
    priceDay: "250€",
    description: "Idéale pour les sessions de brainstorming et les ateliers créatifs. Un espace modulable qui s'adapte à vos méthodes de travail agiles.",
    features: ["Jusqu'à 12 personnes", "Écran interactif 75\"", "Murs inscriptibles"],
    available: true
  },
  {
    id: 'board',
    name: "L'Annexe",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200",
    priceHour: "45€",
    priceDay: "320€",
    description: "Un cadre formel et élégant pour vos conseils d'administration, présentations clients et réunions stratégiques.",
    features: ["Jusqu'à 8 personnes", "Système de visioconférence 4K", "Insonorisation premium"],
    available: true
  }
];
