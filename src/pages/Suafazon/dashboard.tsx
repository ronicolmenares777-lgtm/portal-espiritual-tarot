import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { MessageCircle, Star, RefreshCw, LogOut, User, BarChart3 } from "lucide-react";

type Lead = Tables<"leads">;

export default function Dashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "ready" | "archive">("all");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      router.push("/Suafazon");
      return;
    }

    loadLeads();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando leads:", error);
      } else {
        setLeads(data || []);
      }
    } catch (error) {
      console.error("Error cargando leads:", error);
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
      .update({ favorite: !currentFavorite })
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
      <div className="w-64 bg-black/40 backdrop-blur-sm border-r border-gold/20 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-serif text-gold">Portal Maestro</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              selectedFilter === "all"
                ? "bg-gold text-black font-medium"
                : "text-foreground/80 hover:bg-gold/10"
            }`}
          >
            LEADS ({stats.leads})
          </button>
          <button
            onClick={() => setSelectedFilter("ready")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              selectedFilter === "ready"
                ? "bg-gold text-black font-medium"
                : "text-foreground/80 hover:bg-gold/10"
            }`}
          >
            LISTO ({stats.ready})
          </button>
          <button
            onClick={() => setSelectedFilter("archive")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              selectedFilter === "archive"
                ? "bg-gold text-black font-medium"
                : "text-foreground/80 hover:bg-gold/10"
            }`}
          >
            PAPELERA ({stats.archive})
          </button>

          <div className="pt-4 border-t border-gold/20 mt-4">
            <button
              onClick={selectAll}
              className="w-full text-left px-4 py-2 text-sm text-gold/80 hover:text-gold"
            >
              Seleccionar todo
            </button>
            <button
              onClick={deselectAll}
              className="w-full text-left px-4 py-2 text-sm text-gold/80 hover:text-gold"
            >
              Deseleccionar todo
            </button>
          </div>

          <div className="pt-4 space-y-2">
            <div className="px-4 py-2 text-sm text-foreground/60">
              <div>Estado del Ritual</div>
              <div className="text-gold">Hoy/Nuevo</div>
            </div>
            <div className="px-4 py-2 text-sm text-foreground/60">
              En Chat / Favoritos
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-gold/20 p-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadLeads}
                className="text-gold hover:text-gold/80"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/Suafazon/monitoreo")}
                className="text-foreground/80 hover:text-gold"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Monitoreo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/Suafazon/perfil")}
                className="text-foreground/80 hover:text-gold"
              >
                <User className="h-4 w-4 mr-2" />
                Perfil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-blue-400">{stats.leads}</div>
                <div className="text-blue-300 mt-2">LEADS</div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-green-400">{stats.ready}</div>
                <div className="text-green-300 mt-2">LISTO</div>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-red-400">{stats.archive}</div>
                <div className="text-red-300 mt-2">PAPELERA</div>
              </CardContent>
            </Card>
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
                <Card
                  key={lead.id}
                  className="bg-black/40 border-gold/20 hover:border-gold/40 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        className="mt-1"
                      />

                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(
                          lead.name || ""
                        )}`}
                      >
                        {getInitial(lead.name || "")}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-foreground">
                            {lead.name}
                          </h3>
                          <button
                            onClick={() => toggleFavorite(lead.id, lead.favorite || false)}
                            className="text-gold hover:text-gold/80"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                lead.favorite ? "fill-current" : ""
                              }`}
                            />
                          </button>
                          <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                            {lead.status === "ready" ? "Listo" : "Nuevo"}
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-4">
                            <span>📱 {lead.whatsapp}</span>
                            <span>
                              📅{" "}
                              {lead.created_at
                                ? new Date(lead.created_at).toLocaleDateString("es-MX")
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-foreground/80 mb-4">
                          <strong>Consulta:</strong> {lead.problem}
                        </div>

                        <Button
                          onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                          className="bg-gold text-black hover:bg-gold/80 font-medium"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Ver Chat Completo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}