import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, LogOut, User, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [leads, setLeads] = useState<Tables<"leads">[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "nuevo" | "enConversacion" | "atendido" | "favoritos" | "papelera">("all");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadLeads();
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

  const handleMoveToTrash = async (leadIds: string[]) => {
    const { error } = await supabase
      .from("leads")
      .update({ is_deleted: true })
      .in("id", leadIds);

    if (!error) {
      setLeads((prev) =>
        prev.map((lead) =>
          leadIds.includes(lead.id) ? { ...lead, is_deleted: true } : lead
        )
      );
      setSelectedLeads([]);
    }
  };

  const handleRestoreFromTrash = async (leadId: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ is_deleted: false })
      .eq("id", leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, is_deleted: false } : lead
        )
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nuevo":
        return "bg-blue-500/90 hover:bg-blue-500 text-white";
      case "enConversacion":
        return "bg-yellow-500/90 hover:bg-yellow-500 text-white";
      case "atendido":
        return "bg-green-500/90 hover:bg-green-500 text-white";
      default:
        return "bg-gray-500/90 hover:bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "nuevo":
        return "Nuevo";
      case "enConversacion":
        return "En Chat";
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
    
    if (statusFilter === "favoritos") {
      return matchesSearch && lead.is_favorite;
    }
    if (statusFilter === "papelera") {
      return matchesSearch && lead.is_deleted;
    }
    if (statusFilter === "all") {
      return matchesSearch && !lead.is_deleted;
    }
    return matchesSearch && lead.status === statusFilter && !lead.is_deleted;
  });

  const handleSelectAll = () => {
    setSelectedLeads(filteredLeads.map(l => l.id));
  };

  const handleDeselectAll = () => {
    setSelectedLeads([]);
  };

  const handleToggleSelect = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const activeLeads = leads.filter(l => !l.is_deleted);
  const newLeads = activeLeads.filter(l => l.status === "nuevo");
  const inConversationLeads = activeLeads.filter(l => l.status === "enConversacion");
  const attendedLeads = activeLeads.filter(l => l.status === "atendido");
  const trashedLeads = leads.filter(l => l.is_deleted);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <span className="text-gold text-xl">✦</span>
          </div>
          <h1 className="font-serif text-lg text-gold">Portal Maestro</h1>
        </div>

        {/* Filtros principales */}
        <div className="space-y-2">
          <Button
            variant={statusFilter === "all" ? "default" : "ghost"}
            onClick={() => setStatusFilter("all")}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              📋 LEADS
            </span>
            <span className="text-xs">{activeLeads.length}</span>
          </Button>

          <Button
            variant={statusFilter === "atendido" ? "default" : "ghost"}
            onClick={() => setStatusFilter("atendido")}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              ✅ LISTO
            </span>
            <span className="text-xs">{attendedLeads.length}</span>
          </Button>

          <Button
            variant={statusFilter === "papelera" ? "default" : "ghost"}
            onClick={() => setStatusFilter("papelera")}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              🗑️ PAPELERA
            </span>
            <span className="text-xs">{trashedLeads.length}</span>
          </Button>
        </div>

        {/* Botones de selección */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="w-full text-xs"
          >
            ☑️ Seleccionar todo
          </Button>
          <Button
            variant="outline"
            onClick={handleDeselectAll}
            className="w-full text-xs"
          >
            ❌ Deseleccionar
          </Button>
        </div>

        {/* Estado del ritual */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <span>⚡</span> ESTADO DEL RITUAL
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="text-xs h-auto py-2"
              size="sm"
            >
              📊 Todos
              <span className="block text-[10px] mt-0.5">{activeLeads.length}</span>
            </Button>
            <Button
              variant={statusFilter === "nuevo" ? "default" : "outline"}
              onClick={() => setStatusFilter("nuevo")}
              className="text-xs h-auto py-2"
              size="sm"
            >
              🆕 Nuevo
              <span className="block text-[10px] mt-0.5">{newLeads.length}</span>
            </Button>
            <Button
              variant={statusFilter === "enConversacion" ? "default" : "outline"}
              onClick={() => setStatusFilter("enConversacion")}
              className="text-xs h-auto py-2"
              size="sm"
            >
              💬 En Chat
              <span className="block text-[10px] mt-0.5">{inConversationLeads.length}</span>
            </Button>
            <Button
              variant="outline"
              className="text-xs h-auto py-2"
              size="sm"
              disabled
            >
              ⭐ Calificó
              <span className="block text-[10px] mt-0.5">0</span>
            </Button>
            <Button
              variant="outline"
              className="text-xs h-auto py-2"
              size="sm"
              disabled
            >
              📝 Lista
              <span className="block text-[10px] mt-0.5">0</span>
            </Button>
            <Button
              variant="outline"
              className="text-xs h-auto py-2"
              size="sm"
              disabled
            >
              💰 Ganacia
              <span className="block text-[10px] mt-0.5">0</span>
            </Button>
            <Button
              variant="outline"
              className="text-xs h-auto py-2"
              size="sm"
              disabled
            >
              ❌ Perdida
              <span className="block text-[10px] mt-0.5">0</span>
            </Button>
            <Button
              variant={statusFilter === "favoritos" ? "default" : "outline"}
              onClick={() => setStatusFilter("favoritos")}
              className="text-xs h-auto py-2"
              size="sm"
            >
              ⭐ Favoritos
              <span className="block text-[10px] mt-0.5">{leads.filter(l => l.is_favorite).length}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-serif font-bold text-gold mb-2">Portal Maestro</h1>
              <p className="text-muted-foreground">Gestión de almas y consultas espirituales</p>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>📊 {leads.length} leads cargados</span>
                <span>🔍 {filteredLeads.length} Filtrados</span>
                <span>📈 Total: {leads.length} Leads</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/Suafazon/perfil")}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Perfil
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  localStorage.removeItem("adminSession");
                  router.push("/");
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </Button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-500/20 border-2 border-blue-500/40 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{activeLeads.length}</div>
              <div className="text-sm text-blue-300 mt-1">📋 LEADS</div>
            </div>
            <div className="bg-green-500/20 border-2 border-green-500/40 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{attendedLeads.length}</div>
              <div className="text-sm text-green-300 mt-1">✅ LISTO</div>
            </div>
            <div className="bg-red-500/20 border-2 border-red-500/40 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-400">{trashedLeads.length}</div>
              <div className="text-sm text-red-300 mt-1">🗑️ PAPELERA</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              ☑️ Seleccionar todo
            </Button>
            {selectedLeads.length > 0 && statusFilter !== "papelera" && (
              <Button
                variant="destructive"
                onClick={() => handleMoveToTrash(selectedLeads)}
                className="flex items-center gap-2"
              >
                ❌ Deseleccionar ({selectedLeads.length})
              </Button>
            )}
          </div>
        </div>

        {/* Leads list */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay leads en esta categoría
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/60 border-2 border-gold/20 rounded-xl p-6 hover:border-gold/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <Checkbox
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={() => handleToggleSelect(lead.id)}
                    className="mt-1"
                  />

                  {/* Avatar */}
                  <Avatar className="h-12 w-12 border-2 border-gold/30">
                    <AvatarFallback className="bg-gold/20 text-gold text-lg font-bold">
                      {lead.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-bold text-lg text-foreground">
                        {lead.name}
                      </h3>
                      <button
                        onClick={() => handleToggleFavorite(lead.id, lead.is_favorite || false)}
                      >
                        <Star className={`w-5 h-5 ${lead.is_favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      📱 {lead.country_code} {lead.whatsapp}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Registrado {new Date(lead.created_at).toLocaleDateString("es-MX", { 
                        day: "2-digit", 
                        month: "2-digit", 
                        year: "numeric" 
                      })} - {new Date(lead.created_at).toLocaleTimeString("es-MX", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </p>
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-1">CONSULTA:</div>
                      <p className="text-sm text-foreground/90">{lead.problem}</p>
                    </div>
                    
                    {statusFilter === "papelera" ? (
                      <Button
                        onClick={() => handleRestoreFromTrash(lead.id)}
                        className="w-full bg-green-500/90 hover:bg-green-500"
                      >
                        ♻️ Restaurar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                        className="w-full bg-gradient-to-r from-gold/80 to-accent/80 hover:from-gold hover:to-accent"
                      >
                        💬 Ver Chat Completo
                      </Button>
                    )}
                  </div>

                  {/* Status */}
                  {!lead.is_deleted && (
                    <Button
                      size="sm"
                      className={getStatusColor(lead.status)}
                    >
                      {getStatusText(lead.status)}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}