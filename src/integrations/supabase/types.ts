import type { Database } from "./database.types";

export type { Database };

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];

// Tipos específicos de las tablas
export type Lead = Tables<"leads">;
export type Profile = Tables<"profiles">;
export type Message = Tables<"messages">;
export type ChatMessage = Tables<"chat_messages">;
export type AnalyticsEvent = Tables<"analytics_events">;