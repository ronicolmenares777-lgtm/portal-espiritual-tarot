import type { Lead, QuickResponse, AdminStats } from "@/types/admin";

// Datos mock para el panel de administración
export const mockLeads: Lead[] = [
  {
    id: "1",
    name: "María González",
    whatsapp: "+34612345678",
    country_code: "+34",
    problem: "Necesito claridad sobre mi futuro profesional",
    status: "nuevo",
    cards_selected: ["La Estrella", "El Sol", "La Emperatriz"],
    is_favorite: true,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    whatsapp: "+34687654321",
    country_code: "+34",
    problem: "Dudas sobre mi relación sentimental",
    status: "enConversacion",
    cards_selected: ["Los Enamorados", "La Rueda de la Fortuna"],
    is_favorite: false,
    created_at: "2024-01-14T15:45:00Z",
  },
  {
    id: "3",
    name: "Ana Martínez",
    whatsapp: "+34623456789",
    country_code: "+34",
    problem: "Preocupada por cambios laborales",
    status: "clienteCaliente",
    cards_selected: ["El Carro", "La Fuerza"],
    is_favorite: true,
    created_at: "2024-01-13T09:20:00Z",
  },
  {
    id: "4",
    name: "Pedro Sánchez",
    whatsapp: "+34698765432",
    country_code: "+34",
    problem: "Busco orientación espiritual",
    status: "listo",
    cards_selected: ["El Ermitaño", "La Justicia"],
    is_favorite: false,
    created_at: "2024-01-12T14:10:00Z",
  },
  {
    id: "5",
    name: "Laura López",
    whatsapp: "+34634567890",
    country_code: "+34",
    problem: "Necesito ayuda con decisiones importantes",
    status: "nuevo",
    cards_selected: ["El Mago", "La Sacerdotisa"],
    is_favorite: false,
    created_at: "2024-01-11T11:30:00Z",
  },
  {
    id: "6",
    name: "Miguel Fernández",
    whatsapp: "+34609876543",
    country_code: "+34",
    problem: "Conflictos familiares que me afectan",
    status: "enConversacion",
    cards_selected: ["La Torre", "El Mundo"],
    is_favorite: true,
    created_at: "2024-01-10T16:25:00Z",
  },
  {
    id: "7",
    name: "Isabel Ruiz",
    whatsapp: "+34645678901",
    country_code: "+34",
    problem: "Quiero saber sobre mi salud",
    status: "cerrado",
    cards_selected: ["La Templanza", "El Sol"],
    is_favorite: false,
    created_at: "2024-01-09T08:15:00Z",
  },
  {
    id: "8",
    name: "Javier Díaz",
    whatsapp: "+34670987654",
    country_code: "+34",
    problem: "Dudas sobre inversiones financieras",
    status: "perdido",
    cards_selected: ["El Emperador", "La Rueda"],
    is_favorite: false,
    created_at: "2024-01-08T13:40:00Z",
  },
  {
    id: "9",
    name: "Carmen Torres",
    whatsapp: "+34656789012",
    country_code: "+34",
    problem: "Necesito guía en mi camino espiritual",
    status: "clienteCaliente",
    cards_selected: ["La Estrella", "La Luna"],
    is_favorite: true,
    created_at: "2024-01-07T10:50:00Z",
  },
  {
    id: "10",
    name: "Francisco Moreno",
    whatsapp: "+34681098765",
    country_code: "+34",
    problem: "Preguntas sobre mi destino",
    status: "nuevo",
    cards_selected: ["El Juicio", "El Carro"],
    is_favorite: false,
    created_at: "2024-01-06T15:20:00Z",
  },
  {
    id: "11",
    name: "Sofía Jiménez",
    whatsapp: "+34667890123",
    country_code: "+34",
    problem: "Busco respuestas sobre amor verdadero",
    status: "enConversacion",
    cards_selected: ["Los Enamorados", "La Emperatriz"],
    is_favorite: true,
    created_at: "2024-01-05T12:35:00Z",
  },
  {
    id: "12",
    name: "Antonio García",
    whatsapp: "+34692109876",
    country_code: "+34",
    problem: "Necesito claridad en mi vida",
    status: "listo",
    cards_selected: ["El Ermitaño", "La Estrella"],
    is_favorite: false,
    created_at: "2024-01-04T09:45:00Z",
  },
  {
    id: "13",
    name: "Elena Castro",
    whatsapp: "+34678901234",
    country_code: "+34",
    problem: "Quiero saber sobre nuevos comienzos",
    status: "cerrado",
    cards_selected: ["El Loco", "El Sol"],
    is_favorite: false,
    created_at: "2024-01-03T14:55:00Z",
  },
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