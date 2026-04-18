// Tipos para el panel de administración

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  problem: string;
  card: string;
  status: "nuevo" | "enConversacion" | "clienteCaliente" | "cerrado" | "perdido";
  timestamp: string;
  isFavorite?: boolean;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isFromMaestro: boolean;
  timestamp: string;
}

export interface QuickResponse {
  id: string;
  label: string;
  message: string;
}

export interface AdminStats {
  totalAlmas: number;
  clickWA: number;
  atendidos: number;
  sinResponder: number;
  pipeline: {
    nuevo: number;
    enConversacion: number;
    clienteCaliente: number;
    cerrado: number;
    perdido: number;
  };
}