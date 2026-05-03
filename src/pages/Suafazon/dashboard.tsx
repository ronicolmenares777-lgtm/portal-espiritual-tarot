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

  useEffect(() => {
    loadLeads();
    const interval = setInterval(loadLeads, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    router.push("/");
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

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.whatsapp.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gold mb-2">
              Dashboard de Leads
            </h1>
            <p className="text-muted-foreground">Gestiona tus consultas espirituales</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/Suafazon/perfil")}
              className="bg-gold/90 hover:bg-gold text-background"
            >
              Perfil
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <p className="text-muted-foreground text-sm mb-2">Total Leads</p>
            <p className="text-3xl font-bold text-foreground">{leads.length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <p className="text-muted-foreground text-sm mb-2">Nuevos</p>
            <p className="text-3xl font-bold text-blue-400">
              {leads.filter((l) => l.status === "nuevo").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <p className="text-muted-foreground text-sm mb-2">En conversación</p>
            <p className="text-3xl font-bold text-yellow-400">
              {leads.filter((l) => l.status === "enConversacion").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
            <p className="text-muted-foreground text-sm mb-2">Atendidos</p>
            <p className="text-3xl font-bold text-green-400">
              {leads.filter((l) => l.status === "atendido").length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Buscar por nombre o WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === "nuevo" ? "default" : "outline"}
            onClick={() => setStatusFilter("nuevo")}
          >
            Nuevos
          </Button>
          <Button
            variant={statusFilter === "enConversacion" ? "default" : "outline"}
            onClick={() => setStatusFilter("enConversacion")}
          >
            En conversación
          </Button>
          <Button
            variant={statusFilter === "atendido" ? "default" : "outline"}
            onClick={() => setStatusFilter("atendido")}
          >
            Atendidos
          </Button>
        </div>

        {/* Lista de leads */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay leads que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <>
              {filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/20 text-primary text-xl">
                        {lead.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-serif font-bold text-foreground truncate">
                          {lead.name}
                        </h3>
                        {lead.is_favorite && (
                          <span className="text-amber-400 text-xl">⭐</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>📱</span>
                          <span>{lead.country_code} {lead.whatsapp}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>🔮</span>
                          <span>{lead.cards_selected && lead.cards_selected.length > 0 ? lead.cards_selected[0] : "Sin carta"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={lead.is_favorite ? "default" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(lead.id, lead.is_favorite);
                        }}
                      >
                        <Star className={`h-4 w-4 ${lead.is_favorite ? "fill-current" : ""}`} />
                      </Button>
                      
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
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
  );
}