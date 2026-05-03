import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

type Lead = Tables<"leads">;

export default function Dashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "ready" | "archive">("all");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación
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

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("adminSession");
    localStorage.removeItem("adminProfile");
    router.push("/Suafazon");
  };

  const toggleFavorite = async (leadId: string, currentFavorite: boolean) => {
    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: !currentFavorite })
      .eq("id", leadId);

    if (!error) loadLeads();
  };

  const toggleLeadSelection = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const selectAll = () => {
    const filtered = getFilteredLeads();
    setSelectedLeads(new Set(filtered.map(l => l.id)));
  };

  const deselectAll = () => {
    setSelectedLeads(new Set());
  };

  const getFilteredLeads = () => {
    if (selectedFilter === "ready") {
      return leads.filter(l => l.status === "ready");
    }
    if (selectedFilter === "archive") {
      return leads.filter(l => l.status === "archive");
    }
    return leads.filter(l => l.status !== "archive");
  };

  const filteredLeads = getFilteredLeads();
  const stats = {
    leads: leads.filter(l => l.status !== "ready" && l.status !== "archive").length,
    ready: leads.filter(l => l.status === "ready").length,
    archive: leads.filter(l => l.status === "archive").length,
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-black border-r border-gold/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-accent flex items-center justify-center">
              <span className="text-lg">🔮</span>
            </div>
            <div>
              <h1 className="text-gold font-serif text-xl font-bold">Portal Maestro</h1>
            </div>
          </div>
        </div>

        {/* Filtros principales */}
        <div className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setStatusFilter("leads")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              statusFilter === "leads"
                ? "bg-gold text-black font-semibold shadow-lg shadow-gold/20"
                : "text-foreground/70 hover:bg-gold/10 hover:text-gold"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>LEADS</span>
            <span className="ml-auto text-sm">{stats.leads}</span>
          </button>

          <button
            onClick={() => setStatusFilter("listo")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              statusFilter === "listo"
                ? "bg-green-500 text-white font-semibold shadow-lg shadow-green-500/20"
                : "text-foreground/70 hover:bg-green-500/10 hover:text-green-400"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>LISTO</span>
            <span className="ml-auto text-sm">{stats.listo}</span>
          </button>

          <button
            onClick={() => setStatusFilter("papelera")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              statusFilter === "papelera"
                ? "bg-red-500 text-white font-semibold shadow-lg shadow-red-500/20"
                : "text-foreground/70 hover:bg-red-500/10 hover:text-red-400"
            }`}
          >
            <Trash2 className="h-4 w-4" />
            <span>PAPELERA</span>
            <span className="ml-auto text-sm">{stats.papelera}</span>
          </button>

          <div className="my-4 h-px bg-gold/10" />

          {/* Botones de selección */}
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

          {/* Filtros adicionales */}
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

          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-foreground/70 hover:bg-muted hover:text-gold transition-all">
            <Star className="h-3.5 w-3.5" />
            <span>Favoritos</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif text-gold mb-2">Portal Maestro</h2>
            <p className="text-foreground/60 text-sm">Gestión de almas y consultas espirituales</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/Suafazon/perfil")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/20 text-gold hover:bg-gold/10 transition-all"
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Perfil</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Salir</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6">
            <div className="flex items-center justify-between mb-3">
              <Users className="h-8 w-8 text-blue-400" />
              <span className="text-xs uppercase tracking-wider text-blue-400/80 font-medium">LEADS</span>
            </div>
            <p className="text-4xl font-bold text-blue-400 mb-1">{stats.leads}</p>
            <p className="text-xs text-blue-400/60">🔵 {stats.leads} leads cargados</p>
            <div className="absolute -right-4 -bottom-4 text-blue-500/5 text-8xl">📊</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-6">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <span className="text-xs uppercase tracking-wider text-green-400/80 font-medium">LISTO</span>
            </div>
            <p className="text-4xl font-bold text-green-400 mb-1">{stats.listo}</p>
            <p className="text-xs text-green-400/60">🟢 Filtrados: {stats.listo}</p>
            <div className="absolute -right-4 -bottom-4 text-green-500/5 text-8xl">✓</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 p-6">
            <div className="flex items-center justify-between mb-3">
              <Trash2 className="h-8 w-8 text-red-400" />
              <span className="text-xs uppercase tracking-wider text-red-400/80 font-medium">PAPELERA</span>
            </div>
            <p className="text-4xl font-bold text-red-400 mb-1">{stats.papelera}</p>
            <p className="text-xs text-red-400/60">🔴 Total: {stats.papelera} leads</p>
            <div className="absolute -right-4 -bottom-4 text-red-500/5 text-8xl">🗑️</div>
          </div>
        </div>

        {/* Botón Actualizar + Monitoreo */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/Suafazon/monitoreo")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">Ver Monitoreo</span>
          </button>
          <button
            onClick={loadLeads}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/20 bg-gold/10 text-gold hover:bg-gold/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="text-sm font-medium">Actualizar</span>
          </button>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando leads...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay leads en esta sección
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="relative bg-gradient-to-br from-muted/50 to-background border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-all shadow-lg"
              >
                <div className="flex items-start gap-4">
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
                    className="mt-1 h-4 w-4 rounded border-gold/30 text-gold focus:ring-gold"
                  />

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-accent flex items-center justify-center text-black font-bold text-lg shrink-0">
                    {lead.name?.charAt(0).toUpperCase() || "?"}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{lead.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                          <Phone className="h-3 w-3" />
                          <a
                            href={`https://wa.me/${lead.whatsapp?.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:underline"
                          >
                            {lead.whatsapp}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-foreground/50 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Registrado{" "}
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
                        className="text-gold hover:text-gold/80 transition-colors"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            lead.is_favorite ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {/* Consulta */}
                    <div className="mb-4">
                      <p className="text-xs text-foreground/50 mb-1 uppercase tracking-wider font-medium">CONSULTA:</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {lead.problem}
                      </p>
                    </div>

                    {/* Botón Ver Chat + Badge */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold to-accent text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-gold/20 transition-all"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">Ver Chat Completo</span>
                      </button>

                      <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium rounded-full">
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
  );
}