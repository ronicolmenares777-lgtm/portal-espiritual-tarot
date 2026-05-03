/**
 * Servicio de Notificaciones en Tiempo Real
 * Usa Browser Notifications API + Supabase Realtime
 */

import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export class NotificationService {
  private leadsChannel: RealtimeChannel | null = null;
  private messagesChannel: RealtimeChannel | null = null;
  private isEnabled: boolean = false;
  private onLeadClick?: (leadId: string) => void;
  private onMessageClick?: (leadId: string) => void;

  /**
   * Verificar si las notificaciones están soportadas
   */
  isSupported(): boolean {
    return "Notification" in window;
  }

  /**
   * Verificar el estado del permiso de notificaciones
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return "denied";
    return Notification.permission;
  }

  /**
   * Solicitar permiso para notificaciones
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.error("Las notificaciones no están soportadas en este navegador");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  /**
   * Mostrar notificación nativa del navegador
   */
  private showNotification(
    title: string,
    options: NotificationOptions & { data?: any }
  ) {
    if (!this.isSupported() || Notification.permission !== "granted") {
      return;
    }

    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });

    // Manejar click en la notificación
    notification.onclick = () => {
      window.focus();
      notification.close();

      // Ejecutar callback según el tipo de notificación
      if (options.data?.type === "lead" && this.onLeadClick) {
        this.onLeadClick(options.data.leadId);
      } else if (options.data?.type === "message" && this.onMessageClick) {
        this.onMessageClick(options.data.leadId);
      }
    };

    // Reproducir sonido de notificación
    this.playNotificationSound();
  }

  /**
   * Reproducir sonido de notificación
   */
  private playNotificationSound() {
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLZijcIGWi77eaTRwwRU6jj8LljHAY4kdfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpba8sZzKQUrg87y2Yo3CBlou+3mk0cMEVOo4/C5YxwGOJHX8sx5LAUkd8fw3ZBAC");
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignorar errores de reproducción (usuario puede haber bloqueado audio)
      });
    } catch (error) {
      // Ignorar errores de audio
    }
  }

  /**
   * Iniciar escucha de nuevos leads
   */
  private startLeadsListener() {
    console.log("🔔 Iniciando listener de nuevos leads...");

    // CRÍTICO: Limpiar canal existente antes de crear uno nuevo
    if (this.leadsChannel) {
      console.log("🧹 Limpiando canal de leads existente...");
      supabase.removeChannel(this.leadsChannel);
      this.leadsChannel = null;
    }

    this.leadsChannel = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "leads",
        },
        (payload) => {
          console.log("🆕 Nuevo lead detectado:", payload);

          const lead = payload.new as any;

          this.showNotification("🆕 Nuevo Lead", {
            body: `${lead.name}\n📱 ${lead.country_code} ${lead.whatsapp}\n\n${lead.problem.substring(0, 100)}...`,
            tag: `lead-${lead.id}`,
            requireInteraction: true,
            data: {
              type: "lead",
              leadId: lead.id,
            },
          });
        }
      )
      .subscribe((status) => {
        console.log("📡 Estado del canal de leads:", status);
      });
  }

  /**
   * Iniciar escucha de nuevos mensajes
   */
  private startMessagesListener() {
    console.log("🔔 Iniciando listener de nuevos mensajes...");

    // CRÍTICO: Limpiar canal existente antes de crear uno nuevo
    if (this.messagesChannel) {
      console.log("🧹 Limpiando canal de mensajes existente...");
      supabase.removeChannel(this.messagesChannel);
      this.messagesChannel = null;
    }

    this.messagesChannel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          console.log("💬 Nuevo mensaje detectado:", payload);

          const message = payload.new as any;

          // Solo notificar mensajes de usuarios (no del admin)
          if (message.sender_type === "user") {
            // Obtener información del lead
            const { data: lead } = await supabase
              .from("leads")
              .select("name")
              .eq("id", message.lead_id)
              .single();

            this.showNotification("💬 Nuevo Mensaje", {
              body: `${lead?.name || "Usuario"}\n\n${message.content.substring(0, 100)}${message.content.length > 100 ? "..." : ""}`,
              tag: `message-${message.id}`,
              requireInteraction: true,
              data: {
                type: "message",
                leadId: message.lead_id,
              },
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Estado del canal de mensajes:", status);
      });
  }

  /**
   * Activar notificaciones
   */
  async enable(callbacks?: {
    onLeadClick?: (leadId: string) => void;
    onMessageClick?: (leadId: string) => void;
  }): Promise<boolean> {
    // Si ya está activado, no hacer nada
    if (this.isEnabled) {
      console.log("⚠️ Notificaciones ya están activadas");
      return true;
    }

    // Solicitar permiso
    const granted = await this.requestPermission();
    if (!granted) {
      console.error("Permiso de notificaciones denegado");
      return false;
    }

    // Guardar callbacks
    if (callbacks?.onLeadClick) this.onLeadClick = callbacks.onLeadClick;
    if (callbacks?.onMessageClick) this.onMessageClick = callbacks.onMessageClick;

    // Iniciar listeners
    this.startLeadsListener();
    this.startMessagesListener();

    this.isEnabled = true;
    console.log("✅ Notificaciones activadas");

    // Guardar preferencia en localStorage
    localStorage.setItem("notifications_enabled", "true");

    // Notificación de confirmación
    this.showNotification("✅ Notificaciones Activadas", {
      body: "Recibirás alertas de nuevos leads y mensajes en tiempo real",
      tag: "notification-enabled",
    });

    return true;
  }

  /**
   * Desactivar notificaciones
   */
  disable() {
    console.log("🔕 Desactivando notificaciones...");

    // Desuscribirse de canales
    if (this.leadsChannel) {
      supabase.removeChannel(this.leadsChannel);
      this.leadsChannel = null;
    }

    if (this.messagesChannel) {
      supabase.removeChannel(this.messagesChannel);
      this.messagesChannel = null;
    }

    this.isEnabled = false;
    localStorage.setItem("notifications_enabled", "false");

    console.log("✅ Notificaciones desactivadas");
  }

  /**
   * Verificar si las notificaciones están activadas
   */
  isActive(): boolean {
    return this.isEnabled;
  }

  /**
   * Auto-activar si el usuario ya dio permiso anteriormente
   */
  async autoEnable(callbacks?: {
    onLeadClick?: (leadId: string) => void;
    onMessageClick?: (leadId: string) => void;
  }): Promise<boolean> {
    const wasEnabled = localStorage.getItem("notifications_enabled") === "true";
    const hasPermission = this.getPermissionStatus() === "granted";

    if (wasEnabled && hasPermission) {
      return await this.enable(callbacks);
    }

    return false;
  }
}

// Exportar instancia singleton
export const notificationService = new NotificationService();