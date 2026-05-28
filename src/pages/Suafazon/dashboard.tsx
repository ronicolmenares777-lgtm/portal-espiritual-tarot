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
  LogOut,
  RefreshCw,
  Calendar,
  CheckSquare,
  XSquare,
  BarChart3,
  Download,
  Search,
  Filter,
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

  const stats = {
    leads: leads.filter(l => l.status === "nuevo").length,
    listo: leads.filter(l => l.status === "listo").length,
    papelera: leads.filter(l => l.status === "archive").length,
  };

  useEffect(() => {
    console.log("🚀 [MOUNT] Dashboard montado");
    loadLeads();

    const channel = supabase
      .channel("leads_dashboard_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        (payload) => {
          console.log("📡 [REALTIME] Cambio detectado:", payload.eventType);
          loadLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      router.push("/Suafazon");
      return;
    }

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
          const newMessage = payload.new as any;
          setNewMessageLeadId(newMessage.lead_id);
          loadLeads();
          setTimeout(() => setNewMessageLeadId(null), 5000);
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, []);

  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    if (statusFilter !== "todos") {
      if (statusFilter === "leads") {
        filtered = filtered.filter((lead) => lead.status === "nuevo");
      } else if (statusFilter === "listo") {
        filtered = filtered.filter((lead) => lead.status === "listo");
      } else if (statusFilter === "papelera") {
        filtered = filtered.filter((lead) => lead.status === "archive");
      }
    }

    if (searchTerm && searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.whatsapp.includes(searchTerm) ||
          (lead.problem && lead.problem.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (showOnlyFavorites) {
      filtered = filtered.filter((lead) => lead.is_favorite);
    }

    return filtered;
  }, [leads, statusFilter, searchTerm, showOnlyFavorites]);

  const loadLeads = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error:", error);
        setLeads([]);
        return;
      }

      setLeads(data || []);
    } catch (error) {
      console.error("❌ Excepción:", error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (!error) loadLeads();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleFavorite = async (leadId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ is_favorite: !currentFavorite })
        .eq("id", leadId);

      if (!error) loadLeads();
    } catch (error) {
      console.error("Error:", error);
    }
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
    const { error } = await supabase
      .from("leads")
      .update({ status: "archive" })
      .in("id", leadIds);

    if (!error) {
      loadLeads();
      setSelectedLeads([]);
    }
  };

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("adminSession");
    localStorage.removeItem("adminProfile");
    router.push("/Suafazon");
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
      {/* Notificación nuevo mensaje */}
      {newMessageLeadId && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 px-6 py-3 rounded-lg shadow-2xl border border-amber-300 flex items-center gap-3">
            <MessageCircle className="h-5 w-5 animate-pulse" />
            <div>
              <p className="font-bold text-sm">¡Nuevo mensaje!</p>
              <p className="text-xs">Un usuario acaba de escribir</p>
            </div>
            <button
              onClick={() => setNewMessageLeadId(null)}
              className="ml-4 hover:bg-purple-950/20 rounded p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-amber-400/20 bg-purple-900/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif text-amber-400 flex items-center gap-2">
                <span className="text-2xl">🔮</span>
                Portal Maestro
              </h1>
              <p className="text-sm text-amber-100/60">
                Gestión de consultas espirituales
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/Suafazon/perfil")}
                className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all text-sm font-semibold border border-amber-400/30"
              >
                👤 Perfil
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm font-semibold border border-red-400/30"
              >
                <LogOut className="h-4 w-4 inline mr-1" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-amber-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-400/10 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-100/60 mb-1">Total</p>
                  <p className="text-3xl font-bold text-amber-400">{leads.length}</p>
                </div>
                <div className="p-3 bg-amber-400/10 rounded-lg">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-400/10 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100/60 mb-1">Leads</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.leads}</p>
                </div>
                <div className="p-3 bg-blue-400/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-green-400/10 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100/60 mb-1">Listos</p>
                  <p className="text-3xl font-bold text-green-400">{stats.listo}</p>
                </div>
                <div className="p-3 bg-green-400/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-400/20 backdrop-blur-sm hover:shadow-xl hover:shadow-red-400/10 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-100/60 mb-1">Archivados</p>
                  <p className="text-3xl font-bold text-red-400">{stats.papelera}</p>
                </div>
                <div className="p-3 bg-red-400/10 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Filtros de estado */}
          <Card className="lg:col-span-2 bg-purple-900/30 border-amber-400/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-semibold text-amber-100">Filtrar por estado</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setStatusFilter("todos")}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    statusFilter === "todos"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-purple-950 shadow-lg"
                      : "bg-purple-800/50 text-amber-100/70 hover:bg-purple-800"
                  }`}
                >
                  Todos <span className="ml-1 text-xs">({leads.length})</span>
                </button>
                <button
                  onClick={() => setStatusFilter("leads")}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    statusFilter === "leads"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "bg-purple-800/50 text-amber-100/70 hover:bg-purple-800"
                  }`}
                >
                  Leads <span className="ml-1 text-xs">({stats.leads})</span>
                </button>
                <button
                  onClick={() => setStatusFilter("listo")}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    statusFilter === "listo"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                      : "bg-purple-800/50 text-amber-100/70 hover:bg-purple-800"
                  }`}
                >
                  Listos <span className="ml-1 text-xs">({stats.listo})</span>
                </button>
                <button
                  onClick={() => setStatusFilter("papelera")}
                  className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    statusFilter === "papelera"
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                      : "bg-purple-800/50 text-amber-100/70 hover:bg-purple-800"
                  }`}
                >
                  Papelera <span className="ml-1 text-xs">({stats.papelera})</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Búsqueda */}
          <Card className="bg-purple-900/30 border-amber-400/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-semibold text-amber-100">Buscar</p>
              </div>
              <input
                type="text"
                placeholder="Nombre, WhatsApp, problema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-purple-800/50 border border-amber-400/20 rounded-lg text-amber-100 placeholder-amber-100/40 focus:outline-none focus:border-amber-400/50 text-sm"
              />
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => router.push("/Suafazon/monitoreo")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-400/30 transition-all text-sm font-semibold"
          >
            <BarChart3 className="h-4 w-4" />
            Monitoreo
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-400/30 transition-all text-sm font-semibold"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold ${
              showOnlyFavorites
                ? "bg-amber-500/30 text-amber-300 border border-amber-400/50"
                : "bg-purple-800/30 text-amber-100/70 border border-amber-400/20 hover:bg-purple-800/50"
            }`}
          >
            <Star className={`h-4 w-4 ${showOnlyFavorites ? "fill-current" : ""}`} />
            Favoritos
          </button>
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-800/30 text-amber-100/70 hover:bg-purple-800/50 border border-amber-400/20 transition-all text-sm font-semibold"
          >
            <CheckSquare className="h-4 w-4" />
            {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0 ? "Deseleccionar" : "Seleccionar todo"}
          </button>
          {selectedLeads.length > 0 && (
            <button
              onClick={() => moveToArchive(selectedLeads)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/30 transition-all text-sm font-semibold animate-in slide-in-from-left-2"
            >
              <Trash2 className="h-4 w-4" />
              Archivar ({selectedLeads.length})
            </button>
          )}
          <button
            onClick={loadLeads}
            disabled={isLoading}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/30 transition-all text-sm font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {/* Tabla de leads */}
        <Card className="bg-purple-900/30 border-amber-400/20 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-purple-900/50 border-b border-amber-400/20">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      className="w-4 h-4 accent-amber-500"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-amber-400">NOMBRE</th>
                  <th className="text-left p-4 text-sm font-semibold text-amber-400">WHATSAPP</th>
                  <th className="text-left p-4 text-sm font-semibold text-amber-400">PROBLEMA</th>
                  <th className="text-left p-4 text-sm font-semibold text-amber-400">FECHA</th>
                  <th className="text-left p-4 text-sm font-semibold text-amber-400">ESTADO</th>
                  <th className="text-left p-4 text-sm font-semibold text-amber-400">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-amber-100/60">
                      <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-amber-400" />
                      Cargando leads...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-amber-100/60">
                      No hay leads que coincidan
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-amber-400/10 hover:bg-purple-900/30 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="w-4 h-4 accent-amber-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-purple-950 font-bold shadow-lg">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-amber-100">{lead.name}</p>
                            {newMessageLeadId === lead.id && (
                              <span className="text-xs text-amber-400 font-semibold">✨ Nuevo mensaje</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-amber-100/80">
                          <span className="text-xs text-amber-100/50">{lead.country_code}</span>
                          <span className="text-sm">{lead.whatsapp}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-amber-100/60 max-w-xs truncate">{lead.problem}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-amber-100/60 text-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(lead.created_at).toLocaleDateString("es-ES")}
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={lead.status || "nuevo"}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-purple-800/50 border border-amber-400/20 text-sm text-amber-100 focus:outline-none focus:border-amber-400/50"
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="enConversacion">En Conversación</option>
                          <option value="caliente">Caliente</option>
                          <option value="listo">Listo</option>
                          <option value="cerrado">Cerrado</option>
                          <option value="perdido">Perdido</option>
                          <option value="archive">Archive</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl"
                          >
                            💬 Chat
                          </button>
                          <button
                            onClick={() => toggleFavorite(lead.id, lead.is_favorite || false)}
                            className="p-2 rounded-lg hover:bg-purple-800/50 transition-colors"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                lead.is_favorite ? "fill-amber-400 text-amber-400" : "text-amber-100/40"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}