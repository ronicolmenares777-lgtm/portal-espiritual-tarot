import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Eye,
  FileText,
  CheckCircle,
  Sparkles,
  MessageSquare,
  Smartphone,
  Monitor,
  CalendarIcon,
  TrendingUp,
  Globe,
  Activity,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DailyStats {
  date: string;
  page_views: number;
  form_starts: number;
  form_completes: number;
  card_selects: number;
  chat_starts: number;
}

interface TotalStats {
  pageViews: number;
  formStarts: number;
  formCompletes: number;
  cardSelects: number;
  chatStarts: number;
  uniqueVisitors: number;
  mobileUsers: number;
  desktopUsers: number;
}

interface CountryStat {
  country: string;
  country_code: string;
  count: number;
}

export default function Monitoreo() {
  const router = useRouter();
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [totalStats, setTotalStats] = useState<TotalStats>({
    pageViews: 0,
    formStarts: 0,
    formCompletes: 0,
    cardSelects: 0,
    chatStarts: 0,
    uniqueVisitors: 0,
    mobileUsers: 0,
    desktopUsers: 0,
  });
  const [countryStats, setCountryStats] = useState<CountryStat[]>([]);
  const [period, setPeriod] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (period || selectedDate) {
      loadStats();
    }
  }, [period, selectedDate]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/Suafazon");
    } else {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    const now = new Date();
    let startDate: Date;

    if (selectedDate) {
      const colombiaDateStr = selectedDate.toISOString().split("T")[0];
      startDate = new Date(colombiaDateStr + "T00:00:00-05:00");
      console.log(
        `📅 [FECHA ESPECÍFICA] Filtrando día ${colombiaDateStr} (Colombia):`,
        startDate.toISOString()
      );
    } else if (period === 1) {
      const todayStr = now.toISOString().split("T")[0];
      startDate = new Date(todayStr + "T00:00:00-05:00");
      console.log("📅 [HOY] Filtrando HOY (Colombia):", startDate.toISOString());
    } else {
      const daysAgoStr = now.toISOString().split("T")[0];
      const daysAgo = new Date(daysAgoStr + "T00:00:00-05:00");
      daysAgo.setDate(daysAgo.getDate() - period);
      startDate = daysAgo;
      console.log(
        `📅 [${period} DÍAS] Filtrando desde (Colombia):`,
        startDate.toISOString()
      );
    }

    let endDate: Date | undefined;
    if (selectedDate) {
      const colombiaDateStr = selectedDate.toISOString().split("T")[0];
      endDate = new Date(colombiaDateStr + "T23:59:59-05:00");
      console.log("📅 [FECHA ESPECÍFICA] Hasta:", endDate.toISOString());
    }

    const query = supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (endDate) {
      query.lte("created_at", endDate.toISOString());
    }

    const { data: events } = await query;

    console.log("📊 [STATS] Eventos cargados:", events?.length || 0);

    if (!events) {
      setLoading(false);
      return;
    }

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
      formCompletes: events.filter((e) => e.event_type === "form_complete")
        .length,
      cardSelects: events.filter((e) => e.event_type === "card_select").length,
      chatStarts: events.filter((e) => e.event_type === "chat_start").length,
      uniqueVisitors: visitorSet.size,
      mobileUsers: mobileCount,
      desktopUsers: desktopCount,
    });

    console.log("✅ [STATS] Stats actualizados:", {
      period: selectedDate
        ? format(selectedDate, "dd/MM/yyyy", { locale: es })
        : period === 1
        ? "HOY (Colombia)"
        : `${period} días`,
      totalEvents: events.length,
      pageViews: events.filter((e) => e.event_type === "page_view").length,
      uniqueVisitors: visitorSet.size,
    });

    setLoading(false);
  };

  const loadCountryStats = async () => {
    const now = new Date();
    let startDate: Date;

    if (selectedDate) {
      const colombiaDateStr = selectedDate.toISOString().split("T")[0];
      startDate = new Date(colombiaDateStr + "T00:00:00-05:00");
    } else if (period === 1) {
      const todayStr = now.toISOString().split("T")[0];
      startDate = new Date(todayStr + "T00:00:00-05:00");
    } else {
      const daysAgoStr = now.toISOString().split("T")[0];
      const daysAgo = new Date(daysAgoStr + "T00:00:00-05:00");
      daysAgo.setDate(daysAgo.getDate() - period);
      startDate = daysAgo;
    }

    let endDate: Date | undefined;
    if (selectedDate) {
      const colombiaDateStr = selectedDate.toISOString().split("T")[0];
      endDate = new Date(colombiaDateStr + "T23:59:59-05:00");
    }

    const query = supabase
      .from("analytics_events")
      .select("country, country_code")
      .eq("event_type", "page_view")
      .gte("created_at", startDate.toISOString());

    if (endDate) {
      query.lte("created_at", endDate.toISOString());
    }

    const { data: events } = await query;

    if (!events) return;

    const countryMap = new Map<
      string,
      { country: string; country_code: string; count: number }
    >();

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

    const sorted = Array.from(countryMap.values()).sort(
      (a, b) => b.count - a.count
    );
    setCountryStats(sorted);
    setShowCountryModal(true);
  };

  const conversionRate =
    totalStats.formStarts > 0
      ? ((totalStats.formCompletes / totalStats.formStarts) * 100).toFixed(1)
      : "0";

  const deviceData = [
    { name: "Móvil", value: totalStats.mobileUsers, color: "#D4AF37" },
    { name: "Escritorio", value: totalStats.desktopUsers, color: "#8B7355" },
  ];

  const eventTypeData = [
    { name: "Visitas", value: totalStats.pageViews },
    { name: "Iniciaron", value: totalStats.formStarts },
    { name: "Completaron", value: totalStats.formCompletes },
    { name: "Seleccionaron", value: totalStats.cardSelects },
    { name: "Chatearon", value: totalStats.chatStarts },
  ];

  const handlePeriodChange = (newPeriod: number) => {
    setPeriod(newPeriod);
    setSelectedDate(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setPeriod(0);
    }
  };

  const getPeriodTitle = () => {
    if (selectedDate) {
      return format(selectedDate, "dd 'de' MMMM yyyy", { locale: es });
    }
    if (period === 1) return "Hoy";
    return `Últimos ${period} días`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-center space-y-4">
          <Activity className="w-16 h-16 mx-auto text-amber-400 animate-pulse" />
          <p className="text-xl text-amber-100 font-serif">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-amber-400 flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Monitoreo Espiritual
              </h1>
              <p className="text-amber-100/70 mt-2 text-sm md:text-base">
                Análisis de tu portal místico - {getPeriodTitle()}
              </p>
            </div>
            <Button
              onClick={() => router.push("/Suafazon/dashboard")}
              variant="outline"
              className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10"
            >
              Volver al Dashboard
            </Button>
          </div>

          {/* Filtros de período */}
          <Card className="bg-purple-900/30 border-amber-400/20 backdrop-blur-sm">
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handlePeriodChange(1)}
                  variant={period === 1 && !selectedDate ? "default" : "outline"}
                  className={
                    period === 1 && !selectedDate
                      ? "bg-amber-500 hover:bg-amber-600 text-purple-950"
                      : "border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                  }
                  size="sm"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Hoy
                </Button>
                <Button
                  onClick={() => handlePeriodChange(7)}
                  variant={period === 7 && !selectedDate ? "default" : "outline"}
                  className={
                    period === 7 && !selectedDate
                      ? "bg-amber-500 hover:bg-amber-600 text-purple-950"
                      : "border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                  }
                  size="sm"
                >
                  7 días
                </Button>
                <Button
                  onClick={() => handlePeriodChange(15)}
                  variant={period === 15 && !selectedDate ? "default" : "outline"}
                  className={
                    period === 15 && !selectedDate
                      ? "bg-amber-500 hover:bg-amber-600 text-purple-950"
                      : "border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                  }
                  size="sm"
                >
                  15 días
                </Button>
                <Button
                  onClick={() => handlePeriodChange(30)}
                  variant={period === 30 && !selectedDate ? "default" : "outline"}
                  className={
                    period === 30 && !selectedDate
                      ? "bg-amber-500 hover:bg-amber-600 text-purple-950"
                      : "border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                  }
                  size="sm"
                >
                  30 días
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={selectedDate ? "default" : "outline"}
                      className={
                        selectedDate
                          ? "bg-amber-500 hover:bg-amber-600 text-purple-950"
                          : "border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                      }
                      size="sm"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {selectedDate
                        ? format(selectedDate, "dd/MM/yyyy")
                        : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-purple-900 border-amber-400/20">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => date > new Date()}
                      className="text-amber-100"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </Card>
        </div>

        {/* Métricas principales - Grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Visitantes únicos */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-amber-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-400/20 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-400/10 rounded-lg">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-amber-100/70">Visitantes Únicos</p>
                <p className="text-3xl font-bold text-amber-400">
                  {totalStats.uniqueVisitors}
                </p>
              </div>
            </div>
          </Card>

          {/* Visitas totales */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-amber-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-400/20 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-400/10 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-amber-100/70">Visitas Totales</p>
                <p className="text-3xl font-bold text-blue-400">
                  {totalStats.pageViews}
                </p>
              </div>
            </div>
          </Card>

          {/* Formularios iniciados */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-amber-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-400/20 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-400/10 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-amber-100/70">Iniciaron Formulario</p>
                <p className="text-3xl font-bold text-purple-400">
                  {totalStats.formStarts}
                </p>
              </div>
            </div>
          </Card>

          {/* Conversiones */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-amber-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-400/20 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-400/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-sm font-semibold text-green-400">
                  {conversionRate}%
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-amber-100/70">Completaron</p>
                <p className="text-3xl font-bold text-green-400">
                  {totalStats.formCompletes}
                </p>
              </div>
            </div>
          </Card>

          {/* Cartas seleccionadas */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-amber-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-400/20 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-400/10 rounded-lg">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-amber-100/70">Cartas Seleccionadas</p>
                <p className="text-3xl font-bold text-amber-400">
                  {totalStats.cardSelects}
                </p>
              </div>
            </div>
          </Card>

          {/* Chats iniciados */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-amber-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-400/20 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-400/10 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-pink-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-amber-100/70">Chats Iniciados</p>
                <p className="text-3xl font-bold text-pink-400">
                  {totalStats.chatStarts}
                </p>
              </div>
            </div>
          </Card>

          {/* Móvil */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-amber-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-400/20 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-400/10 rounded-lg">
                  <Smartphone className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-amber-100/70">Móvil</p>
                <p className="text-3xl font-bold text-indigo-400">
                  {totalStats.mobileUsers}
                </p>
              </div>
            </div>
          </Card>

          {/* Escritorio */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-amber-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-400/20 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-cyan-400/10 rounded-lg">
                  <Monitor className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-amber-100/70">Escritorio</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {totalStats.desktopUsers}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficas */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfica de línea - Conversión */}
            <Card className="bg-purple-900/30 border-amber-400/20 backdrop-blur-sm">
              <div className="p-6">
                <h3 className="text-xl font-serif text-amber-400 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Evolución de Conversión
                </h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} />
                      <XAxis
                        dataKey="date"
                        stroke="#D4AF37"
                        tick={{ fill: "#FEF3C7" }}
                        fontSize={12}
                      />
                      <YAxis stroke="#D4AF37" tick={{ fill: "#FEF3C7" }} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#4C1D95",
                          border: "1px solid #D4AF37",
                          borderRadius: "8px",
                          color: "#FEF3C7",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#FEF3C7" }} />
                      <Line
                        type="monotone"
                        dataKey="form_starts"
                        stroke="#A78BFA"
                        strokeWidth={2}
                        name="Iniciaron"
                        dot={{ fill: "#A78BFA", r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="form_completes"
                        stroke="#34D399"
                        strokeWidth={2}
                        name="Completaron"
                        dot={{ fill: "#34D399", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Gráfica de barras - Eventos */}
            <Card className="bg-purple-900/30 border-amber-400/20 backdrop-blur-sm">
              <div className="p-6">
                <h3 className="text-xl font-serif text-amber-400 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Eventos por Tipo
                </h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} />
                      <XAxis
                        dataKey="name"
                        stroke="#D4AF37"
                        tick={{ fill: "#FEF3C7" }}
                        fontSize={12}
                      />
                      <YAxis stroke="#D4AF37" tick={{ fill: "#FEF3C7" }} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#4C1D95",
                          border: "1px solid #D4AF37",
                          borderRadius: "8px",
                          color: "#FEF3C7",
                        }}
                      />
                      <Bar dataKey="value" fill="#D4AF37" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* Gráfica de pastel - Dispositivos */}
            <Card className="bg-purple-900/30 border-amber-400/20 backdrop-blur-sm lg:col-span-2">
              <div className="p-6">
                <h3 className="text-xl font-serif text-amber-400 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Distribución por Dispositivo
                </h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#4C1D95",
                          border: "1px solid #D4AF37",
                          borderRadius: "8px",
                          color: "#FEF3C7",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#FEF3C7" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Botón de países */}
        <Card className="bg-purple-900/30 border-amber-400/20 backdrop-blur-sm">
          <div className="p-6">
            <Button
              onClick={loadCountryStats}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-semibold py-6"
            >
              <Globe className="w-5 h-5 mr-2" />
              Ver Top 5 Países
            </Button>
          </div>
        </Card>

        {/* Modal de países */}
        {showCountryModal && (
          <Card className="bg-purple-900/30 border-amber-400/20 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-serif text-amber-400 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Top 5 Países
                </h3>
                <Button
                  onClick={() => setShowCountryModal(false)}
                  variant="outline"
                  size="sm"
                  className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                >
                  Cerrar
                </Button>
              </div>
              <div className="space-y-3">
                {countryStats.slice(0, 5).map((stat, index) => (
                  <div
                    key={stat.country_code}
                    className="flex items-center justify-between p-4 bg-purple-800/30 rounded-lg border border-amber-400/10 hover:border-amber-400/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-amber-400">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-amber-100">
                          {stat.country}
                        </p>
                        <p className="text-sm text-amber-100/60">
                          {stat.country_code}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-400">
                        {stat.count}
                      </p>
                      <p className="text-sm text-amber-100/60">visitantes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}