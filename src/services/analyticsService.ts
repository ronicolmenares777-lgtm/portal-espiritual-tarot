import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  event_type: 'page_view' | 'form_start' | 'form_complete' | 'card_select' | 'chat_start' | 'share_click' | 'exit';
  session_id: string;
  visitor_id: string;
  user_agent?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  page_path?: string;
  referrer?: string;
  country?: string;
  country_code?: string;
  event_data?: Record<string, any>;
}

export interface AnalyticsStats {
  totalVisits: number;
  uniqueSessions: number;
  formStarts: number;
  formCompletes: number;
  cardSelections: number;
  chatStarts: number;
  conversionRate: number;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  hourlyVisits: { hour: string; visits: number }[];
  dailyVisits: { date: string; visits: number }[];
  funnelSteps: {
    visits: number;
    formStarts: number;
    formCompletes: number;
    chatStarts: number;
  };
}

class AnalyticsService {
  private sessionId: string | null = null;
  private visitorId: string | null = null;
  private countryData: { country: string; country_code: string } | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.sessionId = this.getOrCreateSessionId();
      this.visitorId = this.getOrCreateVisitorId();
      this.detectCountry();
    }
  }

  private async detectCountry() {
    try {
      // Usar ipapi.co para detectar país (gratis, sin API key)
      const response = await fetch("https://ipapi.co/json/");
      if (response.ok) {
        const data = await response.json();
        this.countryData = {
          country: data.country_name || "Unknown",
          country_code: data.country_code || "XX"
        };
      }
    } catch (error) {
      console.log("No se pudo detectar país, usando default");
      this.countryData = { country: "Unknown", country_code: "XX" };
    }
  }

  // Generar o recuperar session ID (dura mientras está abierto el navegador)
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
  }

  // Generar o recuperar visitor ID (persistente entre sesiones)
  private getOrCreateVisitorId(): string {
    let visitorId = localStorage.getItem('analytics_visitor');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_visitor', visitorId);
    }
    return visitorId;
  }

  // Detectar tipo de dispositivo
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Detectar navegador
  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Other';
  }

  // Registrar evento genérico
  private async trackEvent(
    eventType: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    if (!this.sessionId || !this.visitorId) return;

    // Esperar a que se detecte el país (máximo 2 segundos)
    if (!this.countryData) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
      const { error } = await supabase.from("analytics_events").insert({
        event_type: eventType,
        session_id: this.sessionId,
        visitor_id: this.visitorId,
        device_type: this.getDeviceType(),
        country: this.countryData?.country || "Unknown",
        country_code: this.countryData?.country_code || "XX",
        event_data: Object.keys(metadata).length > 0 ? metadata : null,
      });

      if (error) {
        console.error("Error tracking event:", error);
      }
    } catch (error) {
      console.error("Error in trackEvent:", error);
    }
  }

  // Tracking específico por tipo de evento
  trackPageView() {
    this.trackEvent('page_view');
  }

  trackFormStart() {
    this.trackEvent('form_start');
  }

  trackFormComplete(leadId?: string) {
    this.trackEvent('form_complete', { lead_id: leadId });
  }

  trackCardSelect(cardName: string) {
    this.trackEvent('card_select', { card_name: cardName });
  }

  trackChatStart(leadId: string) {
    this.trackEvent('chat_start', { lead_id: leadId });
  }

  trackShareClick(platform: string) {
    this.trackEvent('share_click', { platform });
  }

  // Obtener estadísticas para admin (últimos 30 días por defecto)
  async getStats(daysBack: number = 30): Promise<AnalyticsStats | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching stats:', error);
        return null;
      }

      if (!events || events.length === 0) {
        return {
          totalVisits: 0,
          uniqueSessions: 0,
          formStarts: 0,
          formCompletes: 0,
          cardSelections: 0,
          chatStarts: 0,
          conversionRate: 0,
          deviceBreakdown: { mobile: 0, tablet: 0, desktop: 0 },
          hourlyVisits: [],
          dailyVisits: [],
          funnelSteps: { visits: 0, formStarts: 0, formCompletes: 0, chatStarts: 0 }
        };
      }

      // Calcular métricas
      const pageViews = events.filter(e => e.event_type === 'page_view');
      const uniqueSessions = new Set(events.map(e => e.session_id)).size;
      const formStarts = events.filter(e => e.event_type === 'form_start').length;
      const formCompletes = events.filter(e => e.event_type === 'form_complete').length;
      const cardSelections = events.filter(e => e.event_type === 'card_select').length;
      const chatStarts = events.filter(e => e.event_type === 'chat_start').length;

      // Device breakdown
      const deviceCounts = events.reduce((acc, e) => {
        const device = e.device_type || 'desktop';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Visitas por hora (últimas 24h)
      const hourlyMap = new Map<number, number>();
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      pageViews
        .filter(e => new Date(e.created_at) > last24h)
        .forEach(e => {
          const hour = new Date(e.created_at).getHours();
          hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
        });

      const hourlyVisits = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        visits: hourlyMap.get(i) || 0
      }));

      // Visitas por día (últimos N días)
      const dailyMap = new Map<string, number>();
      pageViews.forEach(e => {
        const date = new Date(e.created_at).toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });

      const dailyVisits = Array.from(dailyMap.entries())
        .map(([date, visits]) => ({ date, visits }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalVisits: pageViews.length,
        uniqueSessions,
        formStarts,
        formCompletes,
        cardSelections,
        chatStarts,
        conversionRate: pageViews.length > 0 ? (formCompletes / pageViews.length) * 100 : 0,
        deviceBreakdown: {
          mobile: deviceCounts.mobile || 0,
          tablet: deviceCounts.tablet || 0,
          desktop: deviceCounts.desktop || 0
        },
        hourlyVisits,
        dailyVisits,
        funnelSteps: {
          visits: pageViews.length,
          formStarts,
          formCompletes,
          chatStarts
        }
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();