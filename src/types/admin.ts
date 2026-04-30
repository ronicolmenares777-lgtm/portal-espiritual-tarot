// Tipos para el panel de administración

export type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  country_code: string;
  problem: string;
  cards_selected: string[];
  answers: any;
  status: "nuevo" | "enConversacion" | "clienteCaliente" | "cerrado" | "perdido" | "listo";
  stage?: string;
  last_interaction_at: string;
  notes: string;
  is_favorite: boolean;
  created_at: string;
  deleted_at: string | null;
  assigned_to?: string | null;
  priority?: string | null;
  conversion_date?: string | null;
  tags: string[];
};

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
  created_at: string;
  read_at?: string | null;
};