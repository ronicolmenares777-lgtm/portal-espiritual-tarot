// Tipos para el panel de administración

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  countryCode?: string;
  problem: string;
  card: string;
  status: "nuevo" | "enConversacion" | "clienteCaliente" | "cerrado" | "perdido" | "listo";
  timestamp: string;
  createdAt?: string;
  isFavorite?: boolean;
  notes?: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  isFromMaestro: boolean;
  isUser: boolean;
  type?: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
  mediaDuration?: number; // Para audios/videos en segundos
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

export type Message = {
  id: string;
  lead_id: string;
  text: string;
  is_from_maestro: boolean;
  is_user: boolean;
  media_url?: string | null;
  created_at: string;
  read_at?: string | null;
};