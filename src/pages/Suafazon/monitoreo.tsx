import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, FileText, MessageSquare, TrendingUp, Smartphone, Monitor, Tablet } from "lucide-react";
import { analyticsService, type AnalyticsStats } from "@/services/analyticsService";
import { checkAdminAuth } from "@/middleware/auth";

export default function MonitoreoPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // días

  useEffect(() => {
    const init = async () => {
      const auth = await checkAdminAuth();
      if (!auth.isAdmin) {
        router.push("/Suafazon");
        return;
      }
      loadStats();
    };
    init();
  }, [timeRange, router]);

  const loadStats = async () => {
    setLoading(true);
    const data = await analyticsService.getStats(timeRange);
    setStats(data);
    setLoading(false);
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  const totalDevices = stats.deviceBreakdown.mobile + stats.deviceBreakdown.tablet + stats.deviceBreakdown.desktop;
  const devicePercentages = {
    mobile: totalDevices > 0 ? (stats.deviceBreakdown.mobile / totalDevices) * 100 : 0,
    tablet: totalDevices > 0 ? (stats.deviceBreakdown.tablet / totalDevices) * 100 : 0,
    desktop: totalDevices > 0 ? (stats.deviceBreakdown.desktop / totalDevices) * 100 : 0
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/Suafazon/dashboard")}
              className="text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-serif text-primary">Monitoreo & Analytics</h1>
              <p className="text-muted-foreground">Métricas de tráfico y conversión</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {[7, 15, 30].map(days => (
              <Button
                key={days}
                variant={timeRange === days ? "default" : "outline"}
                onClick={() => setTimeRange(days)}
                className={timeRange === days ? "bg-primary" : ""}
              >
                {days} días
              </Button>
            ))}
          </div>
        </div>

        {/* KPIs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Visitas Totales</CardDescription>
                <CardTitle className="text-3xl text-primary flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  {stats.totalVisits}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {stats.uniqueSessions} sesiones únicas
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Formularios Iniciados</CardDescription>
                <CardTitle className="text-3xl text-primary flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  {stats.formStarts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {stats.formCompletes} completados ({stats.formStarts > 0 ? ((stats.formCompletes / stats.formStarts) * 100).toFixed(1) : 0}%)
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Chats Iniciados</CardDescription>
                <CardTitle className="text-3xl text-primary flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  {stats.chatStarts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {stats.cardSelections} cartas seleccionadas
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Tasa de Conversión</CardDescription>
                <CardTitle className="text-3xl text-primary flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  {stats.conversionRate.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Visitas → Formulario completado
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Funnel de Conversión */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary">Embudo de Conversión</CardTitle>
            <CardDescription>Flujo del usuario desde visita hasta chat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FunnelStep
                label="Visitas a la página"
                value={stats.funnelSteps.visits}
                percentage={100}
                color="bg-blue-500"
              />
              <FunnelStep
                label="Formularios iniciados"
                value={stats.funnelSteps.formStarts}
                percentage={stats.funnelSteps.visits > 0 ? (stats.funnelSteps.formStarts / stats.funnelSteps.visits) * 100 : 0}
                color="bg-purple-500"
              />
              <FunnelStep
                label="Formularios completados"
                value={stats.funnelSteps.formCompletes}
                percentage={stats.funnelSteps.visits > 0 ? (stats.funnelSteps.formCompletes / stats.funnelSteps.visits) * 100 : 0}
                color="bg-accent"
              />
              <FunnelStep
                label="Chats iniciados"
                value={stats.funnelSteps.chatStarts}
                percentage={stats.funnelSteps.visits > 0 ? (stats.funnelSteps.chatStarts / stats.funnelSteps.visits) * 100 : 0}
                color="bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribución de Dispositivos */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">Dispositivos</CardTitle>
              <CardDescription>Distribución de accesos por tipo de dispositivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DeviceBar
                icon={<Smartphone className="w-5 h-5" />}
                label="Móvil"
                count={stats.deviceBreakdown.mobile}
                percentage={devicePercentages.mobile}
                color="bg-primary"
              />
              <DeviceBar
                icon={<Tablet className="w-5 h-5" />}
                label="Tablet"
                count={stats.deviceBreakdown.tablet}
                percentage={devicePercentages.tablet}
                color="bg-purple-500"
              />
              <DeviceBar
                icon={<Monitor className="w-5 h-5" />}
                label="Desktop"
                count={stats.deviceBreakdown.desktop}
                percentage={devicePercentages.desktop}
                color="bg-blue-500"
              />
            </CardContent>
          </Card>

          {/* Visitas por Día */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">Visitas Diarias</CardTitle>
              <CardDescription>Últimos {timeRange} días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.dailyVisits.slice(-7).map((day, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20">
                      {new Date(day.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((day.visits / Math.max(...stats.dailyVisits.map(d => d.visits))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{day.visits}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente para paso del embudo
function FunnelStep({ label, value, percentage, color }: { label: string; value: number; percentage: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Componente para barra de dispositivos
function DeviceBar({ icon, label, count, percentage, color }: { icon: React.ReactNode; label: string; count: number; percentage: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}