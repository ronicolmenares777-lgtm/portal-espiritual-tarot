import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  Users,
  CheckCircle,
  Trash2,
  Star,
  MessageCircle,
  User,
  LogOut,
  RefreshCw,
  Phone,
  Calendar,
  CheckSquare,
  XSquare,
  Sparkles,
  BarChart3,
  Download,
} from "lucide-react";

type Lead = Tables<"leads">;

export default function Dashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"todos" | "leads" | "listo" | "papelera">("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessageLeadId, setNewMessageLeadId] = useState<string | null>(null);

  // Stats - calcular basado en el status de los leads
  const stats = {
    leads: leads.filter(l => l.status === "nuevo").length,
    listo: leads.filter(l => l.status === "convertido").length,
    papelera: leads.filter(l => l.status === "archive").length,
  };

  useEffect(() => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 [MOUNT] COMPONENTE DASHBOARD MONTADO");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    loadLeads();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const adminSession = localStorage.getItem("adminSession");
    console.log("🔐 Verificando sesión admin:", adminSession);
    
    if (!adminSession) {
      console.log("❌ No hay sesión activa, redirigiendo a login...");
      router.push("/Suafazon");
      return;
    }

    console.log("✅ Sesión activa detectada, cargando leads...");
    loadLeads();

    // Configurar Realtime para escuchar nuevos mensajes
    const messagesSubscription = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: "is_from_maestro=eq.false",
        },
        (payload) => {
          console.log("🔔 Nuevo mensaje recibido:", payload);
          const newMessage = payload.new as any;
          
          // Mostrar notificación
          setNewMessageLeadId(newMessage.lead_id);
          
          // Recargar leads para actualizar contadores
          loadLeads();
          
          // Ocultar notificación después de 5 segundos
          setTimeout(() => {
            setNewMessageLeadId(null);
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔄 [STATE] LEADS CAMBIÓ");
    console.log("  - Nuevo total:", leads.length);
    console.log("  - IDs:", leads.map(l => l.id));
    console.log("  - Nombres:", leads.map(l => l.name));
    console.log("  - Status:", leads.map(l => l.status));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }, [leads]);

  // Filtrar leads por el filtro activo y favoritos
  useEffect(() => {
    let filtered = [...leads];
    
    // Filtro por estado
    if (statusFilter === "leads") {
      filtered = leads.filter(l => l.status === "nuevo");
    } else if (statusFilter === "listo") {
      filtered = leads.filter(l => l.status === "convertido");
    } else if (statusFilter === "papelera") {
      filtered = leads.filter(l => l.status === "archive");
    }
    
    // Filtro adicional por favoritos
    if (showOnlyFavorites) {
      filtered = filtered.filter(l => l.is_favorite === true);
    }
  }, [leads, statusFilter, showOnlyFavorites]);

  const filteredLeads = useMemo(() => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 [FILTER] INICIANDO FILTRADO");
    console.log("  - Total leads en estado:", leads.length);
    console.log("  - Filtro activo:", statusFilter);
    console.log("  - Búsqueda:", searchTerm || "(ninguna)");
    console.log("  - Solo favoritos:", showOnlyFavorites);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    let filtered = [...leads];
    console.log("📊 [FILTER] Leads antes de filtrar:", filtered.length);

    // Filtrar por estado (solo si NO es "todos")
    if (statusFilter !== "todos") {
      if (statusFilter === "leads") {
        filtered = filtered.filter((lead) => lead.status === "nuevo");
        console.log("🔹 [FILTER] Después de filtrar por status 'nuevo':", filtered.length);
      } else if (statusFilter === "listo") {
        filtered = filtered.filter((lead) => lead.status === "listo");
        console.log("🔹 [FILTER] Después de filtrar por status 'listo':", filtered.length);
      } else if (statusFilter === "papelera") {
        filtered = filtered.filter((lead) => lead.status === "archive");
        console.log("🔹 [FILTER] Después de filtrar por status 'archive':", filtered.length);
      }
    } else {
      console.log("🔹 [FILTER] Mostrando TODOS los leads (sin filtro de status)");
    }

    // Filtrar por búsqueda
    if (searchTerm && searchTerm.trim() !== "") {
      const before = filtered.length;
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.whatsapp.includes(searchTerm) ||
          (lead.problem && lead.problem.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      console.log(`🔹 [FILTER] Después de búsqueda "${searchTerm}": ${before} → ${filtered.length}`);
    }

    // Filtrar por favoritos
    if (showOnlyFavorites) {
      const before = filtered.length;
      filtered = filtered.filter((lead) => lead.is_favorite);
      console.log(`🔹 [FILTER] Después de filtrar favoritos: ${before} → ${filtered.length}`);
    }

    console.log("✅ [FILTER] RESULTADO FINAL:", filtered.length, "leads");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    return filtered;
  }, [leads, statusFilter, searchTerm, showOnlyFavorites]);

  const loadLeads = async () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔄 [LOAD] INICIANDO CARGA DE LEADS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("📊 [LOAD] Respuesta de Supabase:");
      console.log("  - Error:", error);
      console.log("  - Data:", data);
      console.log("  - Total registros:", data?.length || 0);

      if (error) {
        console.error("❌ [LOAD] ERROR EN SUPABASE:", error);
        setLeads([]);
        setIsLoading(false);
        return;
      }

      if (!data) {
        console.warn("⚠️ [LOAD] Data es NULL");
        setLeads([]);
        setIsLoading(false);
        return;
      }

      console.log("✅ [LOAD] LEADS CARGADOS EXITOSAMENTE");
      console.log("📋 [LOAD] Leads completos:", JSON.stringify(data, null, 2));
      
      setLeads(data);
      console.log("✅ [LOAD] Estado actualizado con", data.length, "leads");
      
    } catch (error) {
      console.error("❌ [LOAD] EXCEPCIÓN:", error);
      setLeads([]);
    } finally {
      setIsLoading(false);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
  };

  const toggleFavorite = async (leadId: string, currentFavorite: boolean) => {
    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: !currentFavorite })
      .eq("id", leadId);

    if (!error) loadLeads();
  };

  const exportToCSV = () => {
    const csvHeaders = "Nombre,WhatsApp,Problema,Estado,Fecha\n";
    const csvRows = filteredLeads.map(lead => {
      const date = lead.created_at 
        ? new Date(lead.created_at).toLocaleDateString("es-MX")
        : "N/A";
      return `"${lead.name}","${lead.whatsapp}","${lead.problem}","${lead.status}","${date}"`;
    }).join("\n");
    
    const csvContent = csvHeaders + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const moveToArchive = async (leadIds: string[]) => {
    console.log("🗑️ Moviendo a archivo:", leadIds);
    
    const { error } = await supabase
      .from("leads")
      .update({ status: "archive" })
      .in("id", leadIds);

    if (error) {
      console.error("❌ Error moviendo a archivo:", error);
    } else {
      console.log("✅ Leads archivados correctamente");
      loadLeads();
      setSelectedLeads([]);
    }
  };

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    
    console.log("🚪 Cerrando sesión...");
    localStorage.removeItem("adminSession");
    localStorage.removeItem("adminProfile");
    router.push("/Suafazon");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-primary">
                Portal Maestro
              </h1>
              <p className="text-xs sm:text-sm text-foreground/60">
                Gestión de almas y consultas espirituales
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/Suafazon")}
                className="px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-semibold"
              >
                🏠 Perfil
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors text-sm font-semibold"
              >
                🚪 Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal - Responsive */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Notificación de nuevo mensaje */}
        {newMessageLeadId && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-gradient-to-r from-gold to-accent text-black px-6 py-3 rounded-lg shadow-2xl shadow-gold/50 border border-gold/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center animate-pulse">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">¡Nuevo mensaje!</p>
                <p className="text-xs opacity-90">Un usuario acaba de escribir</p>
              </div>
              <button
                onClick={() => setNewMessageLeadId(null)}
                className="ml-4 hover:bg-black/20 rounded p-1 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-black via-black to-purple-950/20 border-r border-gold/20 flex flex-col shadow-2xl">
          {/* Logo */}
          <div className="p-6 border-b border-gold/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold via-accent to-gold/80 flex items-center justify-center shadow-lg shadow-gold/30 animate-pulse-glow">
                <span className="text-lg">🔮</span>
              </div>
              <div>
                <h1 className="text-gold font-serif text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-gold to-accent">Portal Maestro</h1>
              </div>
            </div>
          </div>

          {/* Filtros de estado - Mejorados */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setStatusFilter("todos")}
              className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                statusFilter === "todos"
                  ? "bg-gradient-to-r from-primary to-accent text-black shadow-lg shadow-primary/50 scale-105"
                  : "bg-card/50 text-foreground/70 hover:bg-card hover:scale-105 hover:shadow-md"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold">TODOS</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                statusFilter === "todos" ? "bg-black/30 text-white" : "bg-primary/20 text-primary"
              }`}>
                {leads.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("leads")}
              className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                statusFilter === "leads"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105"
                  : "bg-card/50 text-foreground/70 hover:bg-card hover:scale-105 hover:shadow-md"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold">LEADS</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                statusFilter === "leads" ? "bg-white/30 text-white" : "bg-blue-500/20 text-blue-500"
              }`}>
                {leads.filter((l) => l.status === "nuevo").length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("listo")}
              className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                statusFilter === "listo"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50 scale-105"
                  : "bg-card/50 text-foreground/70 hover:bg-card hover:scale-105 hover:shadow-md"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">LISTO</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                statusFilter === "listo" ? "bg-white/30 text-white" : "bg-green-500/20 text-green-500"
              }`}>
                {leads.filter((l) => l.status === "listo").length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("papelera")}
              className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                statusFilter === "papelera"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50 scale-105"
                  : "bg-card/50 text-foreground/70 hover:bg-card hover:scale-105 hover:shadow-md"
              }`}
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-semibold">PAPELERA</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                statusFilter === "papelera" ? "bg-white/30 text-white" : "bg-red-500/20 text-red-500"
              }`}>
                {leads.filter((l) => l.status === "archive").length}
              </span>
            </button>
          </div>

          <div className="my-4 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

          <button
            onClick={() => {
              const allIds = filteredLeads.map(l => l.id);
              setSelectedLeads(allIds);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-foreground/70 hover:bg-muted hover:text-gold transition-all"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Seleccionar todo</span>
          </button>

          <button
            onClick={() => setSelectedLeads([])}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-foreground/70 hover:bg-muted hover:text-red-400 transition-all"
          >
            <XSquare className="h-3.5 w-3.5" />
            <span>Deseleccionar</span>
          </button>

          <div className="my-4 h-px bg-gold/10" />

          {/* Estado del Ritual - Simplificado */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground/60 mb-3 tracking-wider">
              ESTADO DEL RITUAL
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  showOnlyFavorites
                    ? "bg-accent text-black font-semibold shadow-md"
                    : "bg-card/50 text-foreground/60 hover:bg-card hover:shadow-sm"
                }`}
              >
                <Star className={`w-4 h-4 ${showOnlyFavorites ? "fill-current" : ""}`} />
                Favoritos
              </button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 text-foreground/60 hover:bg-card hover:shadow-sm transition-all duration-300">
                <Calendar className="w-4 h-4" />
                Hoy
              </button>
            </div>
          </div>

          <div className="my-4 h-px bg-gold/10" />

          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-foreground/70 hover:bg-muted hover:text-gold transition-all">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>En Chat</span>
          </button>
        </div>

        {/* Botones Actualizar + Monitoreo + Exportar + Papelera */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/Suafazon/monitoreo")}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-400 hover:from-purple-500/20 hover:to-purple-600/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-200 text-sm hover:scale-105"
            >
              <BarChart3 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Monitoreo</span>
            </button>
            <button
              onClick={exportToCSV}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-400 hover:from-blue-500/20 hover:to-blue-600/20 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 text-sm hover:scale-105"
            >
              <Download className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Exportar</span>
            </button>
            {selectedLeads.length > 0 && (
              <button
                onClick={() => moveToArchive(selectedLeads)}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-600/10 text-red-400 hover:from-red-500/20 hover:to-red-600/20 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 text-sm animate-in slide-in-from-left-2 hover:scale-105"
              >
                <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Enviar a Papelera ({selectedLeads.length})</span>
              </button>
            )}
          </div>
          <button
            onClick={loadLeads}
            disabled={isLoading}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gold/30 bg-gradient-to-r from-gold/10 to-accent/10 text-gold hover:from-gold/20 hover:to-accent/20 hover:shadow-lg hover:shadow-gold/20 transition-all duration-200 disabled:opacity-50 text-sm hover:scale-105"
          >
            <RefreshCw className={`h-3.5 w-3.5 group-hover:scale-110 transition-transform ${isLoading ? "animate-spin" : ""}`} />
            <span className="font-medium">Actualizar</span>
          </button>
        </div>

        {/* Lista de leads - Responsive */}
        <div className="bg-card/30 rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="text-left p-4 text-sm font-semibold text-foreground/80">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground/80">
                    NOMBRE
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground/80">
                    WHATSAPP
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground/80">
                    PROBLEMA
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground/80">
                    FECHA
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground/80">
                    ESTADO
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-foreground/80">
                    ACCIONES
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}