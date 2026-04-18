// Arcanos Mayores del Tarot Rider-Waite - Enfocados en amor y relaciones
export interface TarotCard {
  id: string;
  name: string;
  number: string;
  image: string;
  loveMessage: string;
}

// Pool de 5 cartas de amor del Tarot Rider-Waite (imágenes locales)
const loveCards: TarotCard[] = [
  {
    id: "lovers",
    name: "LOS ENAMORADOS",
    number: "VI",
    image: "/tarot/los-enamorados.jpg",
    loveMessage: "La unión divina está destinada. El amor verdadero siempre encuentra su camino de regreso a ti."
  },
  {
    id: "star",
    name: "LA ESTRELLA",
    number: "XVII",
    image: "/tarot/la-estrella.jpg",
    loveMessage: "La esperanza renace. Los astros confirman que tu amor regresará con renovada fuerza."
  },
  {
    id: "sun",
    name: "EL SOL",
    number: "XIX",
    image: "/tarot/el-sol.jpg",
    loveMessage: "La alegría y el éxito iluminan tu relación. El amor florecerá con luz radiante."
  },
  {
    id: "priestess",
    name: "LA SACERDOTISA",
    number: "II",
    image: "/tarot/la-sacerdotisa.jpg",
    loveMessage: "La intuición profunda revela secretos del corazón. El amor oculto saldrá a la luz."
  },
  {
    id: "empress",
    name: "LA EMPERATRIZ",
    number: "III",
    image: "/tarot/la-emperatriz.jpg",
    loveMessage: "El amor abundante te rodea. La fertilidad emocional traerá de vuelta lo que amas."
  }
];

// Función para obtener 3 cartas aleatorias sin repetir
export function getRandomCards(): TarotCard[] {
  const shuffled = [...loveCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// Función para obtener una carta específica del spread
export function getSelectedCard(cards: TarotCard[], index: number): TarotCard {
  return cards[index] || cards[0];
}