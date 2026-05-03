import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User,
  LogOut,
  MessageSquare,
  Search,
  TrendingUp,
  Users,
  Clock,
  Phone,
  Eye,
  Trash2,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

type Lead = Tables<"leads">;

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cargar leads SOLO al inicio - UNA SOLA VEZ
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      router.push("/Suafazon");
      return;
    }

    loadLeads();
  }, []); // Array vacío = solo se ejecuta UNA VEZ al montar

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando leads:", error);
        return;
      }

      if (data) {
        setLeads(data);
      }
    } catch (err) {
      console.error("Error en loadLeads:", err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLeads();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    router.push("/Suafazon");
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este lead?")) return;

    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      alert("Error al eliminar lead");
      return;
    }

    loadLeads();
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" }
    > = {
      nuevo: { label: "Nuevo", variant: "default" },
      contactado: { label: "Contactado", variant: "secondary" },
      convertido: { label: "Convertido", variant: "secondary" },
    };

    const statusInfo = statusMap[status || "nuevo"];
    return (
      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
    );
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.whatsapp?.includes(searchTerm) ||
      lead.problem?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "todos" || lead.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: leads.length,
    nuevos: leads.filter((l) => l.status === "nuevo").length,
    contactados: leads.filter((l) => l.status === "contactado").length,
    convertidos: leads.filter((l) => l.status === "convertido").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl border-b border-gold/20 shadow-lg shadow-gold/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif font-bold text-gold tracking-wide">
                Portal Administrativo
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestión de consultas espirituales
              </p>
            </div>

            <div className="flex gap-2 sm:gap-3 items-center">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="icon"
                disabled={isRefreshing}
                title="Actualizar leads"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  size="icon"
                  className="sm:w-auto sm:px-4"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline sm:ml-2">Perfil</span>
                </Button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50">
                    <Link
                      href="/Suafazon/perfil"
                      className="block px-4 py-2 hover:bg-accent/10 text-sm"
                    >
                      <User className="inline h-4 w-4 mr-2" />
                      Mi Perfil
                    </Link>
                    <Link
                      href="/Suafazon/monitoreo"
                      className="block px-4 py-2 hover:bg-accent/10 text-sm"
                    >
                      <BarChart3 className="inline h-4 w-4 mr-2" />
                      Monitoreo
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-500 text-sm border-t border-border"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/50 border-gold/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-gold/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Nuevos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.nuevos}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-gold/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Contactados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{stats.contactados}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-gold/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Convertidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{stats.convertidos}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o problema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-gold/20"
            />
          </div>

          <div className="flex gap-2">
            {["todos", "nuevo", "contactado", "convertido"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
                size="sm"
                className={
                  filterStatus === status
                    ? "bg-gold hover:bg-gold/90 text-background"
                    : ""
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        <Card className="bg-card/50 border-gold/20">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-card/80 border-b border-gold/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      WhatsApp
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Problema
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Carta
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-accent/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm">{lead.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <a
                          href={`https://wa.me/${lead.country_code?.replace("+", "")}${lead.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {lead.country_code} {lead.whatsapp}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">
                        {lead.problem}
                      </td>
                      <td className="px-4 py-3 text-sm">{lead.selected_card_id}</td>
                      <td className="px-4 py-3">{getStatusBadge(lead.status)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(lead.created_at).toLocaleDateString("es-MX")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/Suafazon/chat/${lead.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-red-500 hover:bg-red-500/10"
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
          </CardContent>
        </Card>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron leads con los filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
}