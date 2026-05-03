import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Search, Eye, Trash2, RefreshCw } from "lucide-react";

type Lead = Tables<"leads">;

export default function Dashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "nuevo" | "contactado" | "convertido">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const stats = {
    total: leads.length,
    nuevos: leads.filter(l => l.status === "nuevo").length,
    contactados: leads.filter(l => l.status === "contactado").length,
    convertidos: leads.filter(l => l.status === "convertido").length,
  };

  // Cargar leads al inicio
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      router.push("/Suafazon");
      return;
    }

    loadLeads();
  }, []);

  // Filtrar leads cuando cambie el search o el filtro
  useEffect(() => {
    let result = [...leads];

    // Filtro por estado
    if (statusFilter !== "all") {
      result = result.filter(l => l.status === statusFilter);
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        l =>
          l.name?.toLowerCase().includes(query) ||
          l.whatsapp?.includes(query) ||
          l.problem?.toLowerCase().includes(query)
      );
    }

    setFilteredLeads(result);
  }, [leads, searchQuery, statusFilter]);

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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Nuevo</span>,
      contacted: <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">Contactado</span>,
      converted: <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Convertido</span>,
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-950/20 to-background">
      {/* Header */}
      <div className="border-b border-gold/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-gold">Portal Administrativo</h1>
            <p className="text-sm text-muted-foreground">Gestión de consultas espirituales</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadLeads}
              className="text-gold hover:text-gold/80"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              Perfil
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/50 border-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nuevos</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.nuevos}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contactados</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.contactados}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-gold/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Convertidos</p>
                  <p className="text-3xl font-bold text-green-400">{stats.convertidos}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o problema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-gold/20"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-gold hover:bg-gold/80" : ""}
            >
              Todos
            </Button>
            <Button
              variant={statusFilter === "nuevo" ? "default" : "outline"}
              onClick={() => setStatusFilter("nuevo")}
              className={statusFilter === "nuevo" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              Nuevo
            </Button>
            <Button
              variant={statusFilter === "contactado" ? "default" : "outline"}
              onClick={() => setStatusFilter("contactado")}
              className={statusFilter === "contactado" ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              Contactado
            </Button>
            <Button
              variant={statusFilter === "convertido" ? "default" : "outline"}
              onClick={() => setStatusFilter("convertido")}
              className={statusFilter === "convertido" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              Convertido
            </Button>
          </div>
        </div>

        {/* Tabla de leads */}
        <Card className="bg-card/50 border-gold/20">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Cargando leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No se encontraron leads</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gold/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Nombre</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">WhatsApp</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Problema</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Carta</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">{lead.name}</td>
                        <td className="px-6 py-4 text-sm text-green-400">
                          <a
                            href={`https://wa.me/${lead.whatsapp?.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {lead.whatsapp}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate">{lead.problem}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 rounded bg-gold/10 text-gold text-xs">
                            {lead.card_selected || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString("es-MX") : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                              className="text-gold hover:text-gold/80"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if (confirm("¿Eliminar este lead?")) {
                                  const { error } = await supabase.from("leads").delete().eq("id", lead.id);
                                  if (!error) loadLeads();
                                }
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}