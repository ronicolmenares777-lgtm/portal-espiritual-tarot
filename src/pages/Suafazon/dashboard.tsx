import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [leads, setLeads] = useState<Tables<"leads">[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "nuevo" | "enConversacion" | "atendido">("all");
  const router = useRouter();

  // Funciones helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "nuevo":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "enConversacion":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "atendido":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "nuevo":
        return "Nuevo";
      case "enConversacion":
        return "En conversación";
      case "atendido":
        return "Atendido";
      default:
        return status;
    }
  };

  const handleToggleFavorite = async (leadId: string, currentFavorite: boolean) => {
    const { error } = await supabase
      .from("leads")
      .update({ is_favorite: !currentFavorite })
      .eq("id", leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, is_favorite: !currentFavorite } : lead
        )
      );
    }
  };

  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLeads(data);
      }
    };

    fetchLeads();

    const interval = setInterval(fetchLeads, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.whatsapp.includes(searchQuery);

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    router.push("/Suafazon");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gold">
              Dashboard de Leads
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gestiona tus consultas espirituales
            </p>
          </div>
          
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={() => router.push("/Suafazon/perfil")}
              variant="outline"
              className="flex-1 sm:flex-none text-sm sm:text-base"
            >
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex-1 sm:flex-none text-sm sm:text-base"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Leads</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{leads.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Nuevos</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">
              {leads.filter((l) => l.status === "nuevo").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">En conversación</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
              {leads.filter((l) => l.status === "enConversacion").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Atendidos</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-400">
              {leads.filter((l) => l.status === "atendido").length}
            </p>
          </div>
        </div>

        {/* Contenedor principal */}
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
          {/* Header con filtros */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre o WhatsApp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm sm:text-base"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                Todos ({leads.length})
              </Button>
              <Button
                variant={statusFilter === "nuevo" ? "default" : "outline"}
                onClick={() => setStatusFilter("nuevo")}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                Nuevos ({leads.filter(l => l.status === "nuevo").length})
              </Button>
              <Button
                variant={statusFilter === "enConversacion" ? "default" : "outline"}
                onClick={() => setStatusFilter("enConversacion")}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                En conversación ({leads.filter(l => l.status === "enConversacion").length})
              </Button>
              <Button
                variant={statusFilter === "atendido" ? "default" : "outline"}
                onClick={() => setStatusFilter("atendido")}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                Atendidos ({leads.filter(l => l.status === "atendido").length})
              </Button>
            </div>
          </div>

          {/* Lista de leads */}
          <div className="space-y-3 sm:space-y-4">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <p className="text-muted-foreground text-sm sm:text-base">
                  No hay leads que coincidan con tu búsqueda
                </p>
              </div>
            ) : (
              <>
                {filteredLeads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-base sm:text-lg">
                          {lead.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base sm:text-lg font-serif font-bold text-foreground truncate">
                              {lead.name}
                            </h3>
                            {lead.is_favorite && (
                              <span className="text-amber-400 text-lg sm:text-xl flex-shrink-0">⭐</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <span>📱</span>
                              <span className="truncate">{lead.country_code} {lead.whatsapp}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <span>🔮</span>
                              <span className="truncate">{lead.cards_selected && lead.cards_selected.length > 0 ? lead.cards_selected[0] : "Sin carta"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                              <span>📅</span>
                              <span>{new Date(lead.created_at).toLocaleDateString("es-MX", { 
                                day: "2-digit", 
                                month: "2-digit", 
                                year: "numeric" 
                              })}</span>
                              <span>•</span>
                              <span>{new Date(lead.created_at).toLocaleTimeString("es-MX", { 
                                hour: "2-digit", 
                                minute: "2-digit" 
                              })}</span>
                            </div>
                          </div>
                        </div>
                      
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          variant={lead.is_favorite ? "default" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(lead.id, lead.is_favorite);
                          }}
                          className="w-8 h-8 sm:w-9 sm:h-9 p-0"
                        >
                          <Star className={`h-4 w-4 ${lead.is_favorite ? "fill-current" : ""}`} />
                        </Button>
                        
                        <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${getStatusColor(lead.status)}`}>
                          {getStatusText(lead.status)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}