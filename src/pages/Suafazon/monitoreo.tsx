import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [period, setPeriod] = useState(1); // 1=HOY, 7=7días, 15=15días, 30=30días
  const [countryStats, setCountryStats] = useState<CountryStat[]>([]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Función para convertir fecha a zona horaria de Colombia (UTC-5)
  const getColombiaDate = (date: Date = new Date()) => {
    // Convertir a Colombia (UTC-5)
    const colombiaOffset = -5 * 60; // -5 horas en minutos
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    const colombiaTime = new Date(utcTime + (colombiaOffset * 60000));
    return colombiaTime;
  };

  const getColombiaDateString = (date: Date = new Date()) => {
    const colombiaDate = getColombiaDate(date);
    const year = colombiaDate.getFullYear();
    const month = String(colombiaDate.getMonth() + 1).padStart(2, '0');
    const day = String(colombiaDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadStats = async () => {
    let startDate: Date;
    let endDate: Date;
    const now = new Date();

    if (period === 1) {
      // HOY en Colombia - usar selectedDate si existe
      const targetDate = selectedDate || now;
      const colombiaDateStr = getColombiaDateString(targetDate);
      
      // Inicio del día en Colombia (00:00:00)
      startDate = new Date(`${colombiaDateStr}T00:00:00-05:00`);
      // Fin del día en Colombia (23:59:59)
      endDate = new Date(`${colombiaDateStr}T23:59:59-05:00`);
      
      console.log("📅 [HOY COLOMBIA] Filtrando:", {
        fecha: colombiaDateStr,
        desde: startDate.toISOString(),
        hasta: endDate.toISOString()
      });
    } else {
      // 7, 15, 30 días: Desde hace N días en Colombia hasta ahora
      const colombiaToday = getColombiaDateString(now);
      endDate = new Date(`${colombiaToday}T23:59:59-05:00`);
      
      const colombiaDaysAgo = getColombiaDate(now);
      colombiaDaysAgo.setDate(colombiaDaysAgo.getDate() - period);
      const daysAgoStr = getColombiaDateString(colombiaDaysAgo);
      startDate = new Date(`${daysAgoStr}T00:00:00-05:00`);
      
      console.log(`📅 [${period} DÍAS COLOMBIA] Filtrando:`, {
        desde: startDate.toISOString(),
        hasta: endDate.toISOString()
      });
    }

    const { data: events } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });

    console.log("📊 [STATS] Eventos cargados:", events?.length || 0);

    if (!events) {
      console.warn("⚠️ [STATS] No se cargaron eventos");
      return;
    }

    const dailyMap = new Map<string, DailyStats>();
    const visitorSet = new Set<string>();
    let mobileCount = 0;
    let desktopCount = 0;

    events.forEach((event) => {
      // Convertir la fecha del evento a Colombia para agrupar correctamente
      const eventDate = new Date(event.created_at);
      const colombiaEventDate = getColombiaDate(eventDate);
      const date = getColombiaDateString(colombiaEventDate);

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

    const statsArray = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
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

    console.log("✅ [STATS] Stats actualizados:", {
      period: period === 1 ? `HOY (${getColombiaDateString(selectedDate || now)})` : `${period} días`,
      totalEvents: events.length,
      pageViews: events.filter((e) => e.event_type === "page_view").length,
      uniqueVisitors: visitorSet.size,
      formCompletes: events.filter((e) => e.event_type === "form_complete").length,
    });
  };

  const loadCountryStats = async () => {
    let startDate: Date;
    let endDate: Date;
    const now = new Date();

    if (period === 1) {
      const targetDate = selectedDate || now;
      const colombiaDateStr = getColombiaDateString(targetDate);
      startDate = new Date(`${colombiaDateStr}T00:00:00-05:00`);
      endDate = new Date(`${colombiaDateStr}T23:59:59-05:00`);
    } else {
      const colombiaToday = getColombiaDateString(now);
      endDate = new Date(`${colombiaToday}T23:59:59-05:00`);
      
      const colombiaDaysAgo = getColombiaDate(now);
      colombiaDaysAgo.setDate(colombiaDaysAgo.getDate() - period);
      const daysAgoStr = getColombiaDateString(colombiaDaysAgo);
      startDate = new Date(`${daysAgoStr}T00:00:00-05:00`);
    }

    const { data: events } = await supabase
      .from("analytics_events")
      .select("country, country_code")
      .eq("event_type", "page_view")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

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

  useEffect(() => {
    loadStats();
  }, [period, selectedDate]);

  const conversionRate =
    totalStats.formStarts > 0
      ? ((totalStats.formCompletes / totalStats.formStarts) * 100).toFixed(1)
      : "0";

  const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  const deviceData = [
    { name: "Móvil", value: totalStats.mobileUsers },
    { name: "Desktop", value: totalStats.desktopUsers },
  ];

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setPeriod(1); // Cambiar a modo "HOY" cuando se selecciona una fecha
      setDatePickerOpen(false);
    }
  };

  const getPeriodLabel = () => {
    if (period === 1 && selectedDate) {
      const colombiaDateStr = getColombiaDateString(selectedDate);
      return format(new Date(colombiaDateStr), "d 'de' MMMM, yyyy", { locale: es });
    }
    switch (period) {
      case 1: return "Hoy";
      case 7: return "Últimos 7 días";
      case 15: return "Últimos 15 días";
      case 30: return "Últimos 30 días";
      default: return "Período seleccionado";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-400 mb-2">
              📊 Monitoreo & Analytics
            </h1>
            <p className="text-purple-200">
              Análisis en tiempo real - Zona horaria: Colombia (UTC-5)
            </p>
          </div>
          <Button
            onClick={() => router.push("/Suafazon/dashboard")}
            variant="outline"
            className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-purple-900"
          >
            ← Volver al Dashboard
          </Button>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedDate(new Date());
                setPeriod(1);
              }}
              variant={period === 1 && !selectedDate ? "default" : "outline"}
              className={
                period === 1 && !selectedDate
                  ? "bg-amber-400 text-purple-900"
                  : "border-purple-400 text-purple-200 hover:bg-purple-800"
              }
            >
              Hoy
            </Button>
            <Button
              onClick={() => setPeriod(7)}
              variant={period === 7 ? "default" : "outline"}
              className={
                period === 7
                  ? "bg-amber-400 text-purple-900"
                  : "border-purple-400 text-purple-200 hover:bg-purple-800"
              }
            >
              7 días
            </Button>
            <Button
              onClick={() => setPeriod(15)}
              variant={period === 15 ? "default" : "outline"}
              className={
                period === 15
                  ? "bg-amber-400 text-purple-900"
                  : "border-purple-400 text-purple-200 hover:bg-purple-800"
              }
            >
              15 días
            </Button>
            <Button
              onClick={() => setPeriod(30)}
              variant={period === 30 ? "default" : "outline"}
              className={
                period === 30
                  ? "bg-amber-400 text-purple-900"
                  : "border-purple-400 text-purple-200 hover:bg-purple-800"
              }
            >
              30 días
            </Button>
          </div>

          {/* Date Picker */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-purple-900"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Fecha específica
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-purple-900 border-amber-400">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={es}
                disabled={(date) => date > new Date()}
                className="rounded-md text-purple-100"
              />
            </PopoverContent>
          </Popover>

          <div className="ml-auto text-purple-200 font-semibold">
            {getPeriodLabel()}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-purple-900/50 border-purple-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Visitantes únicos</p>
                <h3 className="text-3xl font-bold text-amber-400">
                  {totalStats.uniqueVisitors}
                </h3>
              </div>
              <Users className="h-12 w-12 text-purple-400" />
            </div>
          </Card>

          <Card className="bg-purple-900/50 border-purple-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Vistas de página</p>
                <h3 className="text-3xl font-bold text-amber-400">
                  {totalStats.pageViews}
                </h3>
              </div>
              <BarChart3 className="h-12 w-12 text-purple-400" />
            </div>
          </Card>

          <Card className="bg-purple-900/50 border-purple-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Formularios completados</p>
                <h3 className="text-3xl font-bold text-amber-400">
                  {totalStats.formCompletes}
                </h3>
              </div>
              <MessageSquare className="h-12 w-12 text-purple-400" />
            </div>
          </Card>

          <Card className="bg-purple-900/50 border-purple-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Tasa de conversión</p>
                <h3 className="text-3xl font-bold text-amber-400">
                  {conversionRate}%
                </h3>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart */}
          <Card className="bg-purple-900/50 border-purple-700 p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">
              Actividad diaria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" />
                <XAxis dataKey="date" stroke="#c4b5fd" />
                <YAxis stroke="#c4b5fd" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#581c87",
                    border: "1px solid #a855f7",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="page_views"
                  stroke="#8b5cf6"
                  name="Vistas"
                />
                <Line
                  type="monotone"
                  dataKey="form_completes"
                  stroke="#f59e0b"
                  name="Conversiones"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Bar Chart */}
          <Card className="bg-purple-900/50 border-purple-700 p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">
              Embudo de conversión
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Visitantes",
                    value: totalStats.uniqueVisitors,
                  },
                  {
                    name: "Iniciaron form",
                    value: totalStats.formStarts,
                  },
                  {
                    name: "Completaron",
                    value: totalStats.formCompletes,
                  },
                  {
                    name: "Iniciaron chat",
                    value: totalStats.chatStarts,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#6b21a8" />
                <XAxis dataKey="name" stroke="#c4b5fd" />
                <YAxis stroke="#c4b5fd" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#581c87",
                    border: "1px solid #a855f7",
                  }}
                />
                <Bar dataKey="value" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Device Stats & Country Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Distribution */}
          <Card className="bg-purple-900/50 border-purple-700 p-6">
            <h3 className="text-xl font-bold text-amber-400 mb-4">
              Dispositivos
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-purple-400" />
                <span className="text-purple-200">
                  {totalStats.mobileUsers} móvil
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-purple-400" />
                <span className="text-purple-200">
                  {totalStats.desktopUsers} desktop
                </span>
              </div>
            </div>
          </Card>

          {/* Country Stats */}
          <Card className="bg-purple-900/50 border-purple-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-400">
                Países visitantes
              </h3>
              <Button
                onClick={loadCountryStats}
                size="sm"
                variant="outline"
                className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-purple-900"
              >
                <Globe className="h-4 w-4 mr-2" />
                Ver detalles
              </Button>
            </div>
            <p className="text-purple-300">
              Click en "Ver detalles" para análisis geográfico completo
            </p>
          </Card>
        </div>

        {/* Country Modal */}
        {showCountryModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="bg-purple-900 border-amber-400 p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-amber-400">
                  Visitantes por país
                </h2>
                <Button
                  onClick={() => setShowCountryModal(false)}
                  variant="outline"
                  className="border-purple-400 text-purple-200"
                >
                  Cerrar
                </Button>
              </div>
              <div className="space-y-3">
                {countryStats.map((stat, index) => (
                  <div
                    key={stat.country_code}
                    className="flex items-center justify-between bg-purple-800/50 p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-purple-400">
                        #{index + 1}
                      </span>
                      <span className="text-2xl">{stat.country_code}</span>
                      <span className="text-purple-200 font-medium">
                        {stat.country}
                      </span>
                    </div>
                    <span className="text-amber-400 font-bold text-xl">
                      {stat.count} visitas
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}