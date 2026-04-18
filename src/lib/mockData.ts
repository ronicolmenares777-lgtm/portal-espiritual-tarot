import type { Lead, QuickResponse, AdminStats } from "@/types/admin";

// Datos mock para el panel de administración
export const mockLeads: Lead[] = [
  {
    id: "1",
    name: "mmaria",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Dudas",
    card: "Los Enamorados",
    status: "nuevo",
    timestamp: "alrededor de 1 hora",
    isFavorite: false,
    notes: "",
  },
  {
    id: "2",
    name: "Ruben Delgado",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Amor perdido",
    card: "La Estrella",
    status: "nuevo",
    timestamp: "alrededor de 2 horas",
    isFavorite: false,
    notes: "",
  },
  {
    id: "3",
    name: "Sonia castro",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Reconciliación",
    card: "El Sol",
    status: "nuevo",
    timestamp: "alrededor de 10 horas",
    isFavorite: false,
    notes: "",
  },
  {
    id: "4",
    name: "María Sánchez",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Crisis sentimental",
    card: "Los Enamorados",
    status: "nuevo",
    timestamp: "alrededor de 13 horas",
    isFavorite: false,
    notes: "",
  },
  {
    id: "5",
    name: "Carlos",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Relación tóxica",
    card: "La Sacerdotisa",
    status: "nuevo",
    timestamp: "1 día",
    isFavorite: false,
    notes: "",
  },
  {
    id: "6",
    name: "Dayana",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Indecisión amorosa",
    card: "La Emperatriz",
    status: "nuevo",
    timestamp: "1 día",
    isFavorite: false,
    notes: "",
  },
  {
    id: "7",
    name: "Marta",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Ruptura reciente",
    card: "El Sol",
    status: "nuevo",
    timestamp: "1 día",
    isFavorite: false,
    notes: "",
  },
  {
    id: "8",
    name: "Ricardo",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Distanciamiento",
    card: "La Rueda de la Fortuna",
    status: "nuevo",
    timestamp: "1 día",
    isFavorite: false,
    notes: "",
  },
  {
    id: "9",
    name: "Juan",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Falta de comunicación",
    card: "Los Enamorados",
    status: "nuevo",
    timestamp: "2 días",
    isFavorite: false,
    notes: "",
  },
  {
    id: "10",
    name: "Milk",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Celos y desconfianza",
    card: "La Estrella",
    status: "nuevo",
    timestamp: "2 días",
    isFavorite: false,
    notes: "",
  },
  {
    id: "11",
    name: "Carlot",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Amor no correspondido",
    card: "La Sacerdotisa",
    status: "nuevo",
    timestamp: "2 días",
    isFavorite: false,
    notes: "",
  },
  {
    id: "12",
    name: "Invitado",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Decisión importante",
    card: "La Emperatriz",
    status: "nuevo",
    timestamp: "2 días",
    isFavorite: false,
    notes: "",
  },
  {
    id: "13",
    name: "mario perez",
    whatsapp: "+13151351152",
    countryCode: "+1",
    problem: "Renovación espiritual",
    card: "El Sol",
    status: "clienteCaliente",
    timestamp: "2 días",
    isFavorite: true,
    notes: "Cliente muy interesado en sesiones regulares",
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