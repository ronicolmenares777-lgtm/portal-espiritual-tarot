import { useState, useEffect } from "react";
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
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"leads" | "listo" | "papelera">("leads");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const stats = {
    leads: leads.filter(l => l.status === "nuevo").length,
    listo: leads.filter(l => l.status === "ready").length,
    papelera: leads.filter(l => l.status === "archive").length,
  };

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
  }, []);

  // Filtrar leads por el filtro activo y favoritos
  useEffect(() => {
    let filtered = [...leads];
    
    // Filtro por estado
    if (statusFilter === "leads") {
      filtered = leads.filter(l => l.status === "nuevo");
    } else if (statusFilter === "listo") {
      filtered = leads.filter(l => l.status === "ready");
    } else if (statusFilter === "papelera") {
      filtered = leads.filter(l => l.status === "archive");
    }
    
    // Filtro adicional por favoritos
    if (showOnlyFavorites) {
      filtered = filtered.filter(l => l.is_favorite === true);
    }
    
    setFilteredLeads(filtered);
  }, [leads, statusFilter, showOnlyFavorites]);

  const loadLeads = async () => {
    setIsLoading(true);
    console.log("📡 Iniciando carga de leads desde Supabase...");
    
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("📊 Resultado de Supabase:", { data, error });

      if (error) {
        console.error("❌ Error cargando leads:", error);
      } else {
        console.log(`✅ Leads cargados: ${data?.length || 0} registros`);
        setLeads(data || []);
      }
    } catch (error) {
      console.error("❌ Error en loadLeads:", error);
    } finally {
      setIsLoading(false);
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

  const sendToPapelera = async () => {
    if (selectedLeads.length === 0) return;
    
    const { error } = await supabase
      .from("leads")
      .update({ status: "archive" })
      .in("id", selectedLeads);

    if (!error) {
      setSelectedLeads([]);
      loadLeads();
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
    <div className="min-h-screen flex bg-background">
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

        {/* Filtros principales */}
        <div className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setStatusFilter("leads")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              statusFilter === "leads"
                ? "bg-gradient-to-r from-gold to-accent text-black font-semibold shadow-xl shadow-gold/30 scale-105"
                : "text-foreground/70 hover:bg-gradient-to-r hover:from-gold/10 hover:to-accent/10 hover:text-gold hover:scale-102"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>LEADS</span>
            <span className="ml-auto text-sm font-bold">{stats.leads}</span>
          </button>

          <button
            onClick={() => setStatusFilter("listo")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              statusFilter === "listo"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-xl shadow-green-500/30 scale-105"
                : "text-foreground/70 hover:bg-gradient-to-r hover:from-green-500/10 hover:to-green-600/10 hover:text-green-400 hover:scale-102"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>LISTO</span>
            <span className="ml-auto text-sm font-bold">{stats.listo}</span>
          </button>

          <button
            onClick={() => setStatusFilter("papelera")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              statusFilter === "papelera"
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-xl shadow-red-500/30 scale-105"
                : "text-foreground/70 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 hover:text-red-400 hover:scale-102"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            <span>PAPELERA</span>
            <span className="ml-auto text-sm font-bold">{stats.papelera}</span>
          </button>

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

          <div className="space-y-1">
            <p className="text-xs text-foreground/50 px-4 mb-2 font-medium uppercase tracking-wider">Estado del Ritual</p>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gold/10 text-gold">
              <Calendar className="h-3.5 w-3.5" />
              <span>Hoy</span>
            </button>
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-foreground/70 hover:bg-muted hover:text-gold transition-all">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Nuevo</span>
            </button>
          </div>

          <div className="my-4 h-px bg-gold/10" />

          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-foreground/70 hover:bg-muted hover:text-gold transition-all">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>En Chat</span>
          </button>

          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
              showOnlyFavorites 
                ? "bg-gold/20 text-gold font-medium" 
                : "text-foreground/70 hover:bg-muted hover:text-gold"
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${showOnlyFavorites ? "fill-current" : ""}`} />
            <span>Favoritos</span>
            {showOnlyFavorites && <span className="ml-auto text-xs">✓</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif text-gold mb-1">Portal Maestro</h2>
              <p className="text-foreground/60 text-xs">Gestión de almas y consultas espirituales</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/Suafazon/perfil")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gold/20 text-gold hover:bg-gold/10 transition-all text-sm"
              >
                <User className="h-3.5 w-3.5" />
                <span className="font-medium">Perfil</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="font-medium">Salir</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-blue-500/5 border border-blue-500/30 p-4 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-blue-400/80 font-bold">LEADS</span>
              </div>
              <p className="text-3xl font-bold text-blue-400 mb-0.5 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-500">{stats.leads}</p>
              <p className="text-[10px] text-blue-400/60 font-medium">🔵 {stats.leads} leads activos</p>
              <div className="absolute -right-3 -bottom-3 text-blue-500/5 text-6xl group-hover:scale-110 transition-transform">📊</div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 via-green-600/10 to-green-500/5 border border-green-500/30 p-4 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-green-400/80 font-bold">LISTO</span>
              </div>
              <p className="text-3xl font-bold text-green-400 mb-0.5 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-green-500">{stats.listo}</p>
              <p className="text-[10px] text-green-400/60 font-medium">🟢 {stats.listo} completados</p>
              <div className="absolute -right-3 -bottom-3 text-green-500/5 text-6xl group-hover:scale-110 transition-transform">✓</div>
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500/20 via-red-600/10 to-red-500/5 border border-red-500/30 p-4 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-red-400/80 font-bold">PAPELERA</span>
              </div>
              <p className="text-3xl font-bold text-red-400 mb-0.5 bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-red-500">{stats.papelera}</p>
              <p className="text-[10px] text-red-400/60 font-medium">🔴 {stats.papelera} archivados</p>
              <div className="absolute -right-3 -bottom-3 text-red-500/5 text-6xl group-hover:scale-110 transition-transform">🗑️</div>
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
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
                  onClick={sendToPapelera}
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

          {/* Lista de Leads */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-gold mx-auto mb-4" />
                <p className="text-foreground/60">Cargando leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/60">No hay leads en esta categoría</p>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="group relative bg-gradient-to-br from-muted/60 via-background to-muted/40 border border-gold/20 rounded-xl p-4 hover:border-gold/50 hover:shadow-2xl hover:shadow-gold/10 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  
                  <div className="relative flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads([...selectedLeads, lead.id]);
                        } else {
                          setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                        }
                      }}
                      className="mt-1 h-3.5 w-3.5 rounded border-gold/30 text-gold focus:ring-gold focus:ring-offset-0 cursor-pointer"
                    />

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold via-accent to-gold/80 flex items-center justify-center text-black font-bold text-base shrink-0 shadow-lg shadow-gold/20 group-hover:shadow-xl group-hover:shadow-gold/30 group-hover:scale-110 transition-all">
                      {lead.name?.charAt(0).toUpperCase() || "?"}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-base font-semibold text-foreground mb-0.5 group-hover:text-gold transition-colors">{lead.name}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-foreground/60">
                            <Phone className="h-3 w-3" />
                            <a
                              href={`https://wa.me/${lead.whatsapp?.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 hover:underline transition-colors"
                            >
                              {lead.whatsapp}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-foreground/50 mt-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            <span>
                              {lead.created_at
                                ? new Date(lead.created_at).toLocaleDateString("es-MX", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }) +
                                    " - " +
                                    new Date(lead.created_at).toLocaleTimeString("es-MX", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Estrella favorito */}
                        <button
                          onClick={() => toggleFavorite(lead.id, lead.is_favorite || false)}
                          className="text-gold hover:text-gold/80 transition-all hover:scale-125"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              lead.is_favorite ? "fill-current animate-pulse-glow" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Consulta */}
                      <div className="mb-3">
                        <p className="text-[10px] text-foreground/50 mb-0.5 uppercase tracking-wider font-medium">CONSULTA:</p>
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          {lead.problem}
                        </p>
                      </div>

                      {/* Botón Ver Chat + Badge */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                          className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-gold to-accent text-black font-semibold rounded-lg hover:shadow-xl hover:shadow-gold/30 transition-all duration-200 text-sm hover:scale-105"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>Ver Chat Completo</span>
                        </button>

                        <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-medium rounded-full">
                          Nuevo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}