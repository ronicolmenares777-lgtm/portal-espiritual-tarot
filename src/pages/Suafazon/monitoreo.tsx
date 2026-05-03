import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Users, MousePointerClick, MessageCircle, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyStats {
  date: string;
  page_views: number;
  form_starts: number;
  form_completes: number;
  card_selects: number;
  chat_starts: number;
}

interface CountryStats {
  country: string;
  country_code: string;
  count: number;
}

export default function Monitoreo() {
  const router = useRouter();
  const [period, setPeriod] = useState<1 | 7 | 15 | 30>(7);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    pageViews: 0,
    formStarts: 0,
    formCompletes: 0,
    cardSelects: 0,
    chatStarts: 0,
    uniqueVisitors: 0,
    mobileUsers: 0,
    desktopUsers: 0,
  });
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [period]);

  const loadStats = async () => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - period);

    const { data: events } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (!events) return;

    const dailyMap = new Map<string, DailyStats>();
    const visitorSet = new Set<string>();
    let mobileCount = 0;
    let desktopCount = 0;

    events.forEach((event) => {
      const date = new Date(event.created_at).toISOString().split("T")[0];
      
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          page_views: 0,
          form_starts: 0,
          form_completes: 0,
          card_selects: 0,
          chat_starts: 0,
        });
      }

      const dayStats = dailyMap.get(date)!;

      switch (event.event_type) {
        case "page_view":
          dayStats.page_views++;
          visitorSet.add(event.visitor_id);
          if (event.device_type === "mobile") mobileCount++;
          if (event.device_type === "desktop") desktopCount++;
          break;
        case "form_start":
          dayStats.form_starts++;
          break;
        case "form_complete":
          dayStats.form_completes++;
          break;
        case "card_select":
          dayStats.card_selects++;
          break;
        case "chat_start":
          dayStats.chat_starts++;
          break;
      }
    });

    const statsArray = Array.from(dailyMap.values());
    setStats(statsArray);

    setTotalStats({
      pageViews: events.filter((e) => e.event_type === "page_view").length,
      formStarts: events.filter((e) => e.event_type === "form_start").length,
      formCompletes: events.filter((e) => e.event_type === "form_complete").length,
      cardSelects: events.filter((e) => e.event_type === "card_select").length,
      chatStarts: events.filter((e) => e.event_type === "chat_start").length,
      uniqueVisitors: visitorSet.size,
      mobileUsers: mobileCount,
      desktopUsers: desktopCount,
    });
  };

  const loadCountryStats = async () => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - period);

    const { data: events } = await supabase
      .from("analytics_events")
      .select("country, country_code")
      .eq("event_type", "page_view")
      .gte("created_at", startDate.toISOString());

    if (!events) return;

    const countryMap = new Map<string, { country: string; country_code: string; count: number }>();

    events.forEach((event) => {
      const key = event.country_code || "XX";
      if (countryMap.has(key)) {
        countryMap.get(key)!.count++;
      } else {
        countryMap.set(key, {
          country: event.country || "Unknown",
          country_code: event.country_code || "XX",
          count: 1,
        });
      }
    });

    const sorted = Array.from(countryMap.values()).sort((a, b) => b.count - a.count);
    setCountryStats(sorted);
    setShowCountryModal(true);
  };

  const maxViews = Math.max(...stats.map((s) => s.page_views), 1);

  const conversionRate = totalStats.pageViews > 0 
    ? ((totalStats.chatStarts / totalStats.pageViews) * 100).toFixed(1)
    : "0.0";

  const getCountryFlag = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      MX: "🇲🇽", US: "🇺🇸", ES: "🇪🇸", CO: "🇨🇴", AR: "🇦🇷",
      CL: "🇨🇱", PE: "🇵🇪", VE: "🇻🇪", EC: "🇪🇨", GT: "🇬🇹",
      CU: "🇨🇺", BO: "🇧🇴", DO: "🇩🇴", HN: "🇭🇳", PY: "🇵🇾",
      SV: "🇸🇻", NI: "🇳🇮", CR: "🇨🇷", PA: "🇵🇦", UY: "🇺🇾",
    };
    return flags[countryCode] || "🌍";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/Suafazon/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-4xl font-serif font-bold text-gold">Monitoreo y Analytics</h1>
              <p className="text-muted-foreground mt-1">Métricas en tiempo real de tu portal espiritual</p>
            </div>
          </div>

          {/* Selector de período */}
          <div className="flex gap-2">
            <Button
              variant={period === 1 ? "default" : "outline"}
              onClick={() => setPeriod(1)}
              size="sm"
            >
              DIARIO
            </Button>
            <Button
              variant={period === 7 ? "default" : "outline"}
              onClick={() => setPeriod(7)}
              size="sm"
            >
              7 días
            </Button>
            <Button
              variant={period === 15 ? "default" : "outline"}
              onClick={() => setPeriod(15)}
              size="sm"
            >
              15 días
            </Button>
            <Button
              variant={period === 30 ? "default" : "outline"}
              onClick={() => setPeriod(30)}
              size="sm"
            >
              30 días
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card 
            className="p-4 hover:border-gold/40 transition-all cursor-pointer"
            onClick={loadCountryStats}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalStats.pageViews}</div>
                <div className="text-xs text-muted-foreground">Visitas Totales</div>
                <div className="text-xs text-gold mt-1">👆 Click para ver países</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalStats.uniqueVisitors}</div>
                <div className="text-xs text-muted-foreground">Visitantes Únicos</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <MousePointerClick className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalStats.formStarts}</div>
                <div className="text-xs text-muted-foreground">Formularios Iniciados</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalStats.formCompletes}</div>
                <div className="text-xs text-muted-foreground">Formularios Completados</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                <span className="text-lg">🎴</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalStats.cardSelects}</div>
                <div className="text-xs text-muted-foreground">Cartas Seleccionadas</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-gold" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalStats.chatStarts}</div>
                <div className="text-xs text-muted-foreground">Chats Iniciados</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráfico de Visitas */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-serif font-bold mb-4 text-foreground">
            📈 Visitas por Día
          </h3>
          <div className="space-y-3">
            {stats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos para el período seleccionado
              </div>
            ) : (
              stats.map((stat) => (
                <div key={stat.date} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-muted-foreground">
                    {new Date(stat.date).toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                  <div className="flex-1 bg-muted/30 rounded-full h-8 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.page_views / maxViews) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-gold to-accent flex items-center justify-end pr-3"
                    >
                      <span className="text-xs font-bold text-background">
                        {stat.page_views}
                      </span>
                    </motion.div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Distribución de Dispositivos */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-serif font-bold mb-4 text-foreground">
            📱 Distribución de Dispositivos
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">📱 Móvil</span>
                <span className="text-lg font-bold text-foreground">{totalStats.mobileUsers}</span>
              </div>
              <ProgressBar
                value={totalStats.mobileUsers}
                max={totalStats.mobileUsers + totalStats.desktopUsers}
                color="bg-blue-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">💻 Desktop</span>
                <span className="text-lg font-bold text-foreground">{totalStats.desktopUsers}</span>
              </div>
              <ProgressBar
                value={totalStats.desktopUsers}
                max={totalStats.mobileUsers + totalStats.desktopUsers}
                color="bg-green-500"
              />
            </div>
          </div>
        </Card>

        {/* Embudo de Conversión */}
        <Card className="p-6">
          <h3 className="text-lg font-serif font-bold mb-4 text-foreground">
            🔄 Embudo de Conversión
          </h3>
          <div className="space-y-4">
            <FunnelStep
              label="👁️ Visitas"
              value={totalStats.pageViews}
              percentage={100}
              color="bg-blue-500"
            />
            <FunnelStep
              label="📝 Formulario Iniciado"
              value={totalStats.formStarts}
              percentage={(totalStats.formStarts / totalStats.pageViews) * 100}
              color="bg-yellow-500"
            />
            <FunnelStep
              label="✅ Formulario Completado"
              value={totalStats.formCompletes}
              percentage={(totalStats.formCompletes / totalStats.pageViews) * 100}
              color="bg-green-500"
            />
            <FunnelStep
              label="🎴 Carta Seleccionada"
              value={totalStats.cardSelects}
              percentage={(totalStats.cardSelects / totalStats.pageViews) * 100}
              color="bg-pink-500"
            />
            <FunnelStep
              label="💬 Chat Iniciado"
              value={totalStats.chatStarts}
              percentage={(totalStats.chatStarts / totalStats.pageViews) * 100}
              color="bg-gold"
            />
          </div>
          <div className="mt-6 p-4 bg-gold/10 border border-gold/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gold">Tasa de Conversión Total</span>
              <span className="text-2xl font-bold text-gold">{conversionRate}%</span>
            </div>
            <p className="text-xs text-gold/70 mt-1">
              De cada 100 visitantes, {conversionRate} inician chat
            </p>
          </div>
        </Card>
      </div>

      {/* Modal de Países */}
      <AnimatePresence>
        {showCountryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setShowCountryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border-2 border-gold/30 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl shadow-gold/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-gold">🌍 Visitas por País</h2>
                <button
                  onClick={() => setShowCountryModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {countryStats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay datos de países disponibles
                  </div>
                ) : (
                  countryStats.map((stat) => (
                    <div
                      key={stat.country_code}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCountryFlag(stat.country_code)}</span>
                        <div>
                          <div className="font-medium text-foreground">{stat.country}</div>
                          <div className="text-xs text-muted-foreground">{stat.country_code}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gold">{stat.count}</div>
                        <div className="text-xs text-muted-foreground">visitas</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gold/10">
                <div className="text-center text-sm text-muted-foreground">
                  Total de países: <span className="text-gold font-bold">{countryStats.length}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: number;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="text-right">
          <span className="text-lg font-bold text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground ml-2">
            ({percentage.toFixed(1)}%)
          </span>
        </div>
      </div>
      <ProgressBar value={value} max={value} percentage={percentage} color={color} />
    </div>
  );
}

function ProgressBar({
  value,
  max,
  percentage,
  color,
}: {
  value: number;
  max: number;
  percentage?: number;
  color: string;
}) {
  const finalPercentage = percentage ?? (max > 0 ? (value / max) * 100 : 0);

  return (
    <div className="w-full bg-muted/30 rounded-full h-6 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${finalPercentage}%` }}
        transition={{ duration: 0.5 }}
        className={`h-full ${color} flex items-center justify-center`}
      >
        {value > 0 && (
          <span className="text-xs font-bold text-white">
            {finalPercentage.toFixed(0)}%
          </span>
        )}
      </motion.div>
    </div>
  );
}