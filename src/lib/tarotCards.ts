// Arcanos Mayores del Tarot - Enfocados en amor y relaciones
export interface TarotCard {
  id: number;
  name: string;
  nameEs: string;
  number: string;
  image: string;
  meaning: string;
  loveMessage: string;
}

export const tarotCards: TarotCard[] = [
  {
    id: 0,
    name: "The Lovers",
    nameEs: "LOS ENAMORADOS",
    number: "VI",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/TheLovers.jpg/400px-TheLovers.jpg",
    meaning: "Unión divina, amor verdadero, decisión del corazón",
    loveMessage: "El amor verdadero siempre encuentra su camino de regreso. Tu conexión es real y profunda."
  },
  {
    id: 1,
    name: "The Star",
    nameEs: "LA ESTRELLA",
    number: "XVII",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/RWS_Tarot_17_Star.jpg/400px-RWS_Tarot_17_Star.jpg",
    meaning: "Esperanza renovada, fe, optimismo, sueños que se cumplen",
    loveMessage: "La esperanza brilla intensamente. Los ángeles confirman que el amor regresa cuando menos lo esperas."
  },
  {
    id: 2,
    name: "The Sun",
    nameEs: "EL SOL",
    number: "XIX",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/RWS_Tarot_19_Sun.jpg/400px-RWS_Tarot_19_Sun.jpg",
    meaning: "Alegría radiante, éxito, claridad, energía positiva",
    loveMessage: "La luz del sol ilumina tu camino. Una relación llena de alegría y armonía te espera."
  },
  {
    id: 3,
    name: "The High Priestess",
    nameEs: "LA SACERDOTISA",
    number: "II",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/RWS_Tarot_02_High_Priestess.jpg/400px-RWS_Tarot_02_High_Priestess.jpg",
    meaning: "Intuición profunda, misterio, secretos revelados",
    loveMessage: "Tu intuición no te engaña. Los secretos del corazón se revelarán pronto a tu favor."
  },
  {
    id: 4,
    name: "The Empress",
    nameEs: "LA EMPERATRIZ",
    number: "III",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/RWS_Tarot_03_Empress.jpg/400px-RWS_Tarot_03_Empress.jpg",
    meaning: "Amor abundante, fertilidad emocional, sensualidad",
    loveMessage: "El amor florece como un jardín. La abundancia emocional llega a tu vida."
  },
  {
    id: 5,
    name: "Wheel of Fortune",
    nameEs: "LA RUEDA DE LA FORTUNA",
    number: "X",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg/400px-RWS_Tarot_10_Wheel_of_Fortune.jpg",
    meaning: "Cambios favorables, ciclos que se cierran, destino",
    loveMessage: "La rueda gira a tu favor. Un ciclo doloroso termina y uno de amor comienza."
  },
  {
    id: 6,
    name: "The World",
    nameEs: "EL MUNDO",
    number: "XXI",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/RWS_Tarot_21_World.jpg/400px-RWS_Tarot_21_World.jpg",
    meaning: "Culminación, logro total, plenitud",
    loveMessage: "El universo conspira para tu felicidad. La plenitud amorosa está cerca."
  },
  {
    id: 7,
    name: "The Magician",
    nameEs: "EL MAGO",
    number: "I",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/RWS_Tarot_01_Magician.jpg/400px-RWS_Tarot_01_Magician.jpg",
    meaning: "Manifestación, acción, poder personal",
    loveMessage: "Tienes el poder de manifestar el amor que deseas. La magia está en ti."
  }
];

// Función para obtener 3 cartas aleatorias diferentes
export function getRandomCards(count: number = 3): TarotCard[] {
  const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Función para obtener una carta específica por índice de la selección aleatoria
export function getSelectedCard(cards: TarotCard[], index: number): TarotCard {
  return cards[index] || cards[0];
}