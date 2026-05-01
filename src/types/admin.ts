// Tipos para el panel de administración

export type LeadStatus =
  | "nuevo"
  | "enConversacion"
  | "clienteCaliente"
  | "listo"
  | "cerrado"
  | "perdido";

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  country_code: string;
  problem: string;
  status: LeadStatus;
  cards_selected?: string[];
  user_answers?: any;
  is_favorite: boolean;
  created_at: string;
  updated_at?: string;
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
  created_at: string;
};