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
  ArrowLeft,
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
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (endDate) {
      query.lte("created_at", endDate.toISOString());
    }

    const { data: events } = await query;

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
      formCompletes: events.filter((e) => e.event_type === "form_complete").length,
      cardSelects: events.filter((e) => e.event_type === "card_select").length,
      chatStarts: events.filter((e) => e.event_type === "chat_start").length,
      uniqueVisitors: visitorSet.size,
      mobileUsers: mobileCount,
      desktopUsers: desktopCount,
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

  const conversionRate =
    totalStats.formStarts > 0
      ? ((totalStats.formCompletes / totalStats.formStarts) * 100).toFixed(1)
      : "0";

  const deviceData = [
    { name: "Móvil", value: totalStats.mobileUsers, color: "#D4AF37" },
    { name: "Escritorio", value: totalStats.desktopUsers, color: "#A78BFA" },
  ];

  const eventTypeData = [
    { name: "Visitas", value: totalStats.pageViews, fill: "#60A5FA" },
    { name: "Iniciaron", value: totalStats.formStarts, fill: "#A78BFA" },
    { name: "Completaron", value: totalStats.formCompletes, fill: "#34D399" },
    { name: "Cartas", value: totalStats.cardSelects, fill: "#D4AF37" },
    { name: "Chats", value: totalStats.chatStarts, fill: "#F472B6" },
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
    if (period === 1) return "Hoy (Colombia)";
    return `Últimos ${period} días`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-amber-400 flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Monitoreo Espiritual
            </h1>
            <p className="text-amber-100/70 mt-2 text-sm md:text-base">
              {getPeriodTitle()}
            </p>
          </div>
          <Button
            onClick={() => router.push("/Suafazon/dashboard")}
            variant="outline"
            className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
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
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-semibold shadow-lg"
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
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-semibold shadow-lg"
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
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-semibold shadow-lg"
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
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-semibold shadow-lg"
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
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-semibold shadow-lg"
                        : "border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                    }
                    size="sm"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Fecha específica"}
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

        {/* Métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-900/60 to-purple-800/60 border-amber-400/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-amber-400/20 transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-amber-400/20 rounded-xl">
                  <Users className="w-7 h-7 text-amber-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-amber-100/60 mb-1">Visitantes Únicos</p>
              <p className="text-4xl font-bold text-amber-400 mb-1">{totalStats.uniqueVisitors}</p>
              <p className="text-xs text-amber-100/40">Personas reales</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/60 to-blue-800/60 border-blue-400/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-400/20 transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-400/20 rounded-xl">
                  <Eye className="w-7 h-7 text-blue-400" />
                </div>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm text-blue-100/60 mb-1">Visitas Totales</p>
              <p className="text-4xl font-bold text-blue-400 mb-1">{totalStats.pageViews}</p>
              <p className="text-xs text-blue-100/40">Page views</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/60 to-purple-800/60 border-purple-400/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-400/20 transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-purple-400/20 rounded-xl">
                  <FileText className="w-7 h-7 text-purple-400" />
                </div>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-sm text-purple-100/60 mb-1">Iniciaron Formulario</p>
              <p className="text-4xl font-bold text-purple-400 mb-1">{totalStats.formStarts}</p>
              <p className="text-xs text-purple-100/40">Interesados</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/60 to-green-800/60 border-green-400/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-green-400/20 transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-green-400/20 rounded-xl">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </div>
                <span className="px-2 py-1 bg-green-400/20 rounded-lg text-green-400 font-bold text-sm">
                  {conversionRate}%
                </span>
              </div>
              <p className="text-sm text-green-100/60 mb-1">Completaron ✅</p>
              <p className="text-4xl font-bold text-green-400 mb-1">{totalStats.formCompletes}</p>
              <p className="text-xs text-green-100/40">CONVERSIONES (tu objetivo)</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/60 to-amber-800/60 border-amber-400/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-amber-400/20 transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-amber-400/20 rounded-xl">
                  <Sparkles className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <p className="text-sm text-amber-100/60 mb-1">Cartas Seleccionadas</p>
              <p className="text-4xl font-bold text-amber-400 mb-1">{totalStats.cardSelects}</p>
              <p className="text-xs text-amber-100/40">Interacciones</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-pink-900/60 to-pink-800/60 border-pink-400/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-pink-400/20 transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-pink-400/20 rounded-xl">
                  <MessageSquare className="w-7 h-7 text-pink-400" />
                </div>
              </div>
              <p className="text-sm text-pink-100/60 mb-1">Chats Iniciados</p>
              <p className="text-4xl font-bold text-pink-400 mb-1">{totalStats.chatStarts}</p>
              <p className="text-xs text-pink-100/40">Conversaciones</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/60 to-indigo-800/60 border-indigo-400/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-indigo-400/20 transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-indigo-400/20 rounded-xl">
                  <Smartphone className="w-7 h-7 text-indigo-400" />
                </div>
              </div>
              <p className="text-sm text-indigo-100/60 mb-1">Móvil</p>
              <p className="text-4xl font-bold text-indigo-400 mb-1">{totalStats.mobileUsers}</p>
              <p className="text-xs text-indigo-100/40">
                {totalStats.pageViews > 0 ? Math.round((totalStats.mobileUsers / totalStats.pageViews) * 100) : 0}% del total
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-900/60 to-cyan-800/60 border-cyan-400/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-cyan-400/20 transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-cyan-400/20 rounded-xl">
                  <Monitor className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <p className="text-sm text-cyan-100/60 mb-1">Escritorio</p>
              <p className="text-4xl font-bold text-cyan-400 mb-1">{totalStats.desktopUsers}</p>
              <p className="text-xs text-cyan-100/40">
                {totalStats.pageViews > 0 ? Math.round((totalStats.desktopUsers / totalStats.pageViews) * 100) : 0}% del total
              </p>
            </div>
          </Card>
        </div>

        {/* Gráficas */}
        {stats.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-purple-900/40 border-amber-400/30 backdrop-blur-sm">
              <div className="p-6">
                <h3 className="text-xl font-serif text-amber-400 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Conversión Diaria
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} />
                      <XAxis dataKey="date" stroke="#D4AF37" tick={{ fill: "#FEF3C7" }} fontSize={11} />
                      <YAxis stroke="#D4AF37" tick={{ fill: "#FEF3C7" }} fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#4C1D95",
                          border: "1px solid #D4AF37",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="form_starts" stroke="#A78BFA" strokeWidth={2} name="Iniciaron" />
                      <Line type="monotone" dataKey="form_completes" stroke="#34D399" strokeWidth={2} name="Completaron" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card className="bg-purple-900/40 border-amber-400/30 backdrop-blur-sm">
              <div className="p-6">
                <h3 className="text-xl font-serif text-amber-400 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Eventos por Tipo
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#D4AF37" tick={{ fill: "#FEF3C7" }} fontSize={11} />
                      <YAxis stroke="#D4AF37" tick={{ fill: "#FEF3C7" }} fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#4C1D95",
                          border: "1px solid #D4AF37",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card className="bg-purple-900/40 border-amber-400/30 backdrop-blur-sm lg:col-span-2">
              <div className="p-6">
                <h3 className="text-xl font-serif text-amber-400 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Dispositivos
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
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
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card className="bg-purple-900/40 border-amber-400/30 backdrop-blur-sm">
          <div className="p-6">
            <Button
              onClick={loadCountryStats}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-semibold py-6 text-lg shadow-lg"
            >
              <Globe className="w-5 h-5 mr-2" />
              Ver Top 5 Países
            </Button>
          </div>
        </Card>

        {showCountryModal && (
          <Card className="bg-purple-900/40 border-amber-400/30 backdrop-blur-sm">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countryStats.slice(0, 5).map((stat, index) => (
                  <div
                    key={stat.country_code}
                    className="p-5 bg-purple-800/40 rounded-xl border border-amber-400/20 hover:border-amber-400/40 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold text-amber-400">#{index + 1}</span>
                      <span className="text-2xl font-bold text-amber-400">{stat.count}</span>
                    </div>
                    <p className="text-lg font-semibold text-amber-100">{stat.country}</p>
                    <p className="text-sm text-amber-100/50">{stat.country_code}</p>
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