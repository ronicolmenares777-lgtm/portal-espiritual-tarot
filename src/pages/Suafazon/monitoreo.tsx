import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Eye, 
  FileText, 
  CheckCircle2, 
  MessageCircle,
  Smartphone,
  Monitor,
  Globe,
  TrendingUp,
  Activity,
  Sparkles,
  Calendar as CalendarIcon,
  ArrowLeft
} from "lucide-react";
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

interface CountryStats {
  country: string;
  country_code: string;
  count: number;
}

export default function Monitoreo() {
  const router = useRouter();
  const [period, setPeriod] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
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
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [showCountryModal, setShowCountryModal] = useState(false);

  useEffect(() => {
    loadStats();
  }, [period, selectedDate]);

  const loadStats = async () => {
    const now = new Date();
    let startDate: Date;
    let periodLabel = "";

    if (selectedDate) {
      // Fecha específica seleccionada del calendario
      const colombiaDate = new Date(selectedDate.toLocaleString("en-US", { timeZone: "America/Bogota" }));
      const year = colombiaDate.getFullYear();
      const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
      const day = String(colombiaDate.getDate()).padStart(2, '0');
      startDate = new Date(`${year}-${month}-${day}T00:00:00-05:00`);
      periodLabel = `DÍA: ${day}/${month}/${year}`;
    } else if (period === 1) {
      // HOY en Colombia
      const colombiaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
      const year = colombiaDate.getFullYear();
      const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
      const day = String(colombiaDate.getDate()).padStart(2, '0');
      startDate = new Date(`${year}-${month}-${day}T00:00:00-05:00`);
      periodLabel = "HOY";
    } else {
      // Últimos N días
      const colombiaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
      colombiaDate.setDate(colombiaDate.getDate() - period);
      const year = colombiaDate.getFullYear();
      const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
      const day = String(colombiaDate.getDate()).padStart(2, '0');
      startDate = new Date(`${year}-${month}-${day}T00:00:00-05:00`);
      periodLabel = `ÚLTIMOS ${period} DÍAS`;
    }

    console.log(`📅 [${periodLabel}] Filtrando desde:`, startDate.toISOString());

    const { data: events } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    console.log("📊 Eventos cargados:", events?.length || 0);

    if (!events) return;

    const dailyMap = new Map<string, DailyStats>();
    const visitorSet = new Set<string>();
    let mobileCount = 0;
    let desktopCount = 0;

    events.forEach((event) => {
      const eventDate = new Date(event.created_at);
      const colombiaDateStr = eventDate.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
      
      if (!dailyMap.has(colombiaDateStr)) {
        dailyMap.set(colombiaDateStr, {
          date: colombiaDateStr,
          page_views: 0,
          form_starts: 0,
          form_completes: 0,
          card_selects: 0,
          chat_starts: 0,
        });
      }

      const dayStats = dailyMap.get(colombiaDateStr)!;

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

    console.log("✅ Stats actualizados:", {
      period: periodLabel,
      totalEvents: events.length,
      uniqueVisitors: visitorSet.size,
    });
  };

  const loadCountryStats = async () => {
    const now = new Date();
    let startDate: Date;

    if (selectedDate) {
      const colombiaDate = new Date(selectedDate.toLocaleString("en-US", { timeZone: "America/Bogota" }));
      const year = colombiaDate.getFullYear();
      const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
      const day = String(colombiaDate.getDate()).padStart(2, '0');
      startDate = new Date(`${year}-${month}-${day}T00:00:00-05:00`);
    } else if (period === 1) {
      const colombiaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
      const year = colombiaDate.getFullYear();
      const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
      const day = String(colombiaDate.getDate()).padStart(2, '0');
      startDate = new Date(`${year}-${month}-${day}T00:00:00-05:00`);
    } else {
      const colombiaDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
      colombiaDate.setDate(colombiaDate.getDate() - period);
      const year = colombiaDate.getFullYear();
      const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
      const day = String(colombiaDate.getDate()).padStart(2, '0');
      startDate = new Date(`${year}-${month}-${day}T00:00:00-05:00`);
    }

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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setShowCalendar(false);
    setPeriod(0);
  };

  const handlePeriodChange = (newPeriod: number) => {
    setPeriod(newPeriod);
    setSelectedDate(undefined);
  };

  const conversionRate = totalStats.formStarts > 0
    ? ((totalStats.formCompletes / totalStats.formStarts) * 100).toFixed(1)
    : "0.0";

  const mobilePercentage = totalStats.pageViews > 0
    ? ((totalStats.mobileUsers / totalStats.pageViews) * 100).toFixed(0)
    : "0";

  const desktopPercentage = totalStats.pageViews > 0
    ? ((totalStats.desktopUsers / totalStats.pageViews) * 100).toFixed(0)
    : "0";

  const chartData = stats.map(s => ({
    fecha: new Date(s.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
    conversión: s.form_completes,
    formularios: s.form_starts,
  }));

  const eventData = [
    { name: "Visitas", value: totalStats.pageViews, color: "#3b82f6" },
    { name: "Formularios", value: totalStats.formStarts, color: "#8b5cf6" },
    { name: "Conversiones", value: totalStats.formCompletes, color: "#10b981" },
    { name: "Chats", value: totalStats.chatStarts, color: "#f59e0b" },
  ];

  const deviceData = [
    { name: "Móvil", value: totalStats.mobileUsers, color: "#6366f1" },
    { name: "Escritorio", value: totalStats.desktopUsers, color: "#06b6d4" },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/Suafazon")}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-yellow-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
                  <Activity className="w-6 h-6" />
                  Analytics & Monitoreo
                </h1>
                <p className="text-sm text-gray-400 mt-1">Métricas en tiempo real</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Period Filters */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handlePeriodChange(1)}
              variant={period === 1 && !selectedDate ? "default" : "outline"}
              className={period === 1 && !selectedDate ? "bg-yellow-500 text-black hover:bg-yellow-600" : "border-gray-700 text-gray-300 hover:bg-gray-800"}
            >
              Hoy
            </Button>
            <Button
              onClick={() => handlePeriodChange(7)}
              variant={period === 7 && !selectedDate ? "default" : "outline"}
              className={period === 7 && !selectedDate ? "bg-yellow-500 text-black hover:bg-yellow-600" : "border-gray-700 text-gray-300 hover:bg-gray-800"}
            >
              7 días
            </Button>
            <Button
              onClick={() => handlePeriodChange(15)}
              variant={period === 15 && !selectedDate ? "default" : "outline"}
              className={period === 15 && !selectedDate ? "bg-yellow-500 text-black hover:bg-yellow-600" : "border-gray-700 text-gray-300 hover:bg-gray-800"}
            >
              15 días
            </Button>
            <Button
              onClick={() => handlePeriodChange(30)}
              variant={period === 30 && !selectedDate ? "default" : "outline"}
              className={period === 30 && !selectedDate ? "bg-yellow-500 text-black hover:bg-yellow-600" : "border-gray-700 text-gray-300 hover:bg-gray-800"}
            >
              30 días
            </Button>
            <Button
              onClick={() => setShowCalendar(!showCalendar)}
              variant={selectedDate ? "default" : "outline"}
              className={selectedDate ? "bg-blue-500 text-white hover:bg-blue-600" : "border-gray-700 text-gray-300 hover:bg-gray-800"}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              {selectedDate ? new Date(selectedDate).toLocaleDateString('es-CO') : "Seleccionar fecha"}
            </Button>
            <Button
              onClick={loadCountryStats}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Globe className="w-4 h-4 mr-2" />
              Ver países
            </Button>
          </div>

          {showCalendar && (
            <div className="mt-4 p-4 bg-gray-950 border border-gray-800 rounded-lg inline-block">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border-gray-800"
              />
            </div>
          )}
        </Card>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-yellow-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalStats.uniqueVisitors}</p>
            <p className="text-sm text-gray-400">Visitantes Únicos</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
              <Activity className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalStats.pageViews}</p>
            <p className="text-sm text-gray-400">Visitas Totales</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
              <Sparkles className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalStats.formStarts}</p>
            <p className="text-sm text-gray-400">Iniciaron Formulario</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-green-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalStats.formCompletes}</p>
            <p className="text-sm text-gray-400">Conversiones ({conversionRate}%)</p>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalStats.cardSelects}</p>
            <p className="text-sm text-gray-400">Cartas Seleccionadas</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-pink-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-pink-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalStats.chatStarts}</p>
            <p className="text-sm text-gray-400">Chats Iniciados</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalStats.mobileUsers}</p>
            <p className="text-sm text-gray-400">Móvil ({mobilePercentage}%)</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-cyan-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalStats.desktopUsers}</p>
            <p className="text-sm text-gray-400">Escritorio ({desktopPercentage}%)</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Chart */}
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              Conversión Diaria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="fecha" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="conversión" stroke="#10b981" strokeWidth={2} name="Conversiones" />
                <Line type="monotone" dataKey="formularios" stroke="#8b5cf6" strokeWidth={2} name="Formularios" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Events Chart */}
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-500" />
              Eventos por Tipo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
                <Bar dataKey="value" name="Cantidad">
                  {eventData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Device Chart */}
          <Card className="bg-gray-900 border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-yellow-500" />
              Dispositivos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Country Modal */}
        {showCountryModal && (
          <Card className="bg-gray-900 border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-yellow-500" />
                Top 10 Países
              </h3>
              <Button
                onClick={() => setShowCountryModal(false)}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                Cerrar
              </Button>
            </div>
            <div className="space-y-3">
              {countryStats.slice(0, 10).map((country, index) => (
                <div key={country.country_code} className="flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-500 w-6">{index + 1}</span>
                    <span className="text-2xl">{country.country_code === "XX" ? "🌍" : String.fromCodePoint(...country.country_code.split('').map(c => 127397 + c.charCodeAt(0)))}</span>
                    <span className="text-white font-medium">{country.country}</span>
                  </div>
                  <span className="text-yellow-500 font-bold">{country.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}