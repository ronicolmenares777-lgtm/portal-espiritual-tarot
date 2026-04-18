// Arcanos Mayores del Tarot Rider-Waite - Enfocados en amor y relaciones
export interface TarotCard {
  id: string;
  name: string;
  number: string;
  image: string;
  loveMessage: string;
}

// Pool de 6 cartas de amor del Tarot Rider-Waite
const loveCards: TarotCard[] = [
  {
    id: "lovers",
    name: "LOS ENAMORADOS",
    number: "VI",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/TheLovers.jpg/400px-TheLovers.jpg",
    loveMessage: "La unión divina está destinada. El amor verdadero siempre encuentra su camino de regreso a ti."
  },
  {
    id: "star",
    name: "LA ESTRELLA",
    number: "XVII",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/RWS_Tarot_17_Star.jpg/400px-RWS_Tarot_17_Star.jpg",
    loveMessage: "La esperanza renace. Los astros confirman que tu amor regresará con renovada fuerza."
  },
  {
    id: "sun",
    name: "EL SOL",
    number: "XIX",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/RWS_Tarot_19_Sun.jpg/400px-RWS_Tarot_19_Sun.jpg",
    loveMessage: "La alegría y el éxito iluminan tu relación. El amor florecerá con luz radiante."
  },
  {
    id: "priestess",
    name: "LA SACERDOTISA",
    number: "II",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/RWS_Tarot_02_High_Priestess.jpg/400px-RWS_Tarot_02_High_Priestess.jpg",
    loveMessage: "La intuición profunda revela secretos del corazón. El amor oculto saldrá a la luz."
  },
  {
    id: "empress",
    name: "LA EMPERATRIZ",
    number: "III",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/RWS_Tarot_03_Empress.jpg/400px-RWS_Tarot_03_Empress.jpg",
    loveMessage: "El amor abundante te rodea. La fertilidad emocional traerá de vuelta lo que amas."
  },
  {
    id: "wheel",
    name: "LA RUEDA DE LA FORTUNA",
    number: "X",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg/400px-RWS_Tarot_10_Wheel_of_Fortune.jpg",
    loveMessage: "Los ciclos favorables giran a tu favor. El destino conspira para reunirte con tu amor."
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