import type { Lead, QuickResponse, AdminStats } from "@/types/admin";

// Datos mock para el panel de administración
export const mockLeads: Lead[] = [
  {
    id: "1",
    name: "mmarla",
    whatsapp: "+13153153152",
    countryCode: "+1",
    problem: "Dudas",
    card: "El Sol",
    answers: {
      question1: "Sí",
      question2: "Que vuelva"
    },
    status: "nuevo",
    createdAt: "hace 1 hora",
    lastMessage: "Última actualización hace 1 hora",
    messages: [],
    notes: ""
  },
  {
    id: "2",
    name: "Ruben Delgado",
    whatsapp: "+15125125125",
    countryCode: "+1",
    problem: "Amor",
    card: "Los Enamorados",
    answers: {
      question1: "Mucho",
      question2: "Que regrese a mí"
    },
    status: "nuevo",
    createdAt: "hace 2 horas",
    messages: [],
  },
  {
    id: "3",
    name: "Sonia castro",
    whatsapp: "+14124124124",
    countryCode: "+1",
    problem: "Relación complicada",
    card: "La Estrella",
    answers: {
      question1: "No",
      question2: "Que sea feliz conmigo"
    },
    status: "nuevo",
    createdAt: "hace 10 horas",
    messages: [],
  },
  {
    id: "4",
    name: "María Sánchez",
    whatsapp: "+13163163163",
    countryCode: "+1",
    problem: "Confusión sentimental",
    card: "La Sacerdotisa",
    answers: {
      question1: "Sí",
      question2: "Claridad en la relación"
    },
    status: "nuevo",
    createdAt: "hace 11 horas",
    messages: [],
  },
  {
    id: "5",
    name: "Carlos",
    whatsapp: "+17177177177",
    countryCode: "+1",
    problem: "Distanciamiento",
    card: "El Sol",
    answers: {
      question1: "Mucho",
      question2: "Reconciliación"
    },
    status: "nuevo",
    createdAt: "1 día",
    messages: [],
  },
  {
    id: "6",
    name: "Dayana",
    whatsapp: "+18188188188",
    countryCode: "+1",
    problem: "Ex pareja",
    card: "Los Enamorados",
    answers: {
      question1: "Sí",
      question2: "Que vuelva"
    },
    status: "nuevo",
    createdAt: "1 día",
    messages: [],
  },
  {
    id: "7",
    name: "Marta",
    whatsapp: "+19199199199",
    countryCode: "+1",
    problem: "Amor no correspondido",
    card: "La Emperatriz",
    answers: {
      question1: "No",
      question2: "Que me note"
    },
    status: "nuevo",
    createdAt: "1 día",
    messages: [],
  },
  {
    id: "8",
    name: "Ricardo",
    whatsapp: "+11011011011",
    countryCode: "+1",
    problem: "Ruptura reciente",
    card: "La Estrella",
    answers: {
      question1: "Mucho",
      question2: "Sanación y paz"
    },
    status: "nuevo",
    createdAt: "1 día",
    messages: [],
  },
  {
    id: "9",
    name: "Juan",
    whatsapp: "+11111111111",
    countryCode: "+1",
    problem: "Indecisión amorosa",
    card: "Los Enamorados",
    answers: {
      question1: "Sí",
      question2: "Tomar la decisión correcta"
    },
    status: "nuevo",
    createdAt: "2 días",
    messages: [],
  },
  {
    id: "10",
    name: "Milk",
    whatsapp: "+12121212121",
    countryCode: "+1",
    problem: "Celos y desconfianza",
    card: "La Sacerdotisa",
    answers: {
      question1: "No",
      question2: "Confianza mutua"
    },
    status: "nuevo",
    createdAt: "2 días",
    messages: [],
  },
  {
    id: "11",
    name: "Carlot",
    whatsapp: "+13131313131",
    countryCode: "+1",
    problem: "Amor a distancia",
    card: "El Sol",
    answers: {
      question1: "Mucho",
      question2: "Estar juntos pronto"
    },
    status: "nuevo",
    createdAt: "2 días",
    messages: [],
  },
  {
    id: "12",
    name: "Invitado",
    whatsapp: "+14141414141",
    countryCode: "+1",
    problem: "Situación complicada",
    card: "La Estrella",
    answers: {
      question1: "Sí",
      question2: "Guía espiritual"
    },
    status: "nuevo",
    createdAt: "2 días",
    messages: [],
  },
  {
    id: "13",
    name: "mario perez",
    whatsapp: "+15151515151",
    countryCode: "+1",
    problem: "Reconquista",
    card: "Los Enamorados",
    answers: {
      question1: "Mucho",
      question2: "Segunda oportunidad"
    },
    status: "cerrado",
    createdAt: "2 días",
    messages: [],
  }
];

export const mockQuickResponses: QuickResponse[] = [
  {
    id: "1",
    label: "BIENVENIDA",
    message: "Bienvenido/a al Oráculo. Estoy aquí para guiarte en tu camino espiritual. ¿En qué puedo ayudarte hoy?"
  },
  {
    id: "2",
    label: "CONSULTA TAROT",
    message: "Para realizar la lectura de tarot, necesito saber, ¿cuál es la situación o pregunta principal que deseas explorar?"
  },
  {
    id: "3",
    label: "PRECIO PLAN",
    message: "Ofrecemos consultas personalizadas. El plan básico incluye lectura de tarot + guía espiritual por $49. ¿Te interesa conocer más detalles?"
  },
  {
    id: "4",
    label: "AGENDAR SESIÓN",
    message: "Perfecto, podemos agendar tu sesión espiritual. ¿Qué día y hora te vendría mejor?"
  },
  {
    id: "5",
    label: "CIERRE DE VENTA",
    message: "Las energías están alineadas para tu consulta. Para confirmar tu sesión, necesito que realices el pago. ¿Procedo a enviarte los detalles?"
  },
  {
    id: "6",
    label: "SEGUIMIENTO",
    message: "¿Cómo te has sentido desde nuestra última consulta? ¿Has notado cambios en tu situación?"
  },
  {
    id: "7",
    label: "OFERTA ESPECIAL",
    message: "Esta semana tengo una promoción especial: sesión completa + ritual personalizado con 30% de descuento. ¿Te gustaría aprovecharla?"
  },
  {
    id: "8",
    label: "LIMPIEZA ENERGÉTICA",
    message: "Percibo que necesitas una limpieza energética profunda. Te puedo guiar en un ritual especial. ¿Te interesa?"
  }
];

export const mockStats: AdminStats = {
  totalAlmas: 13,
  clickWA: 2,
  atendidos: 1,
  sinResponder: 12,
  pipeline: {
    nuevo: 32,
    enConversacion: 0,
    clienteCaliente: 0,
    cerrado: 1,
    perdido: 0
  }
};