import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { leadService } from "@/services/leadService";
import type { Tables } from "@/integrations/supabase/types";
import { 
  Users, 
  CheckCircle2, 
  Archive, 
  Search,
  MessageCircle,
  Calendar,
  Phone,
  Eye,
  Trash2,
  Download,
  RefreshCw,
  Sparkles
} from "lucide-react";

type Lead = Tables<"leads">;

export default function Dashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await leadService.getAll();
      setLeads(data || []);
    } catch (error) {
      console.error("Error loading leads:", error);
    }
    setLoading(false);
  };

  const stats = useMemo(() => {
    const total = leads.length;
    const leadsCount = leads.filter(l => l.status === 'nuevo' || l.status === 'enConversacion' || l.status === 'caliente').length;
    const ready = leads.filter(l => l.status === 'listo').length;
    const archived = leads.filter(l => l.status === 'archive').length;

    return { total, leadsCount, ready, archived };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.whatsapp.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && ["nuevo", "enConversacion", "caliente"].includes(lead.status)) ||
        lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedLeads.size === 0) return;

    const confirmed = confirm(`¿Cambiar ${selectedLeads.size} lead(s) a estado "${newStatus}"?`);
    if (!confirmed) return;

    try {
      for (const leadId of selectedLeads) {
        await leadService.update(leadId, { status: newStatus });
      }
      await loadLeads();
      setSelectedLeads(new Set());
    } catch (error) {
      console.error("Error updating leads:", error);
      alert("Error al actualizar los leads");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return;

    const confirmed = confirm(`¿ELIMINAR PERMANENTEMENTE ${selectedLeads.size} lead(s)?`);
    if (!confirmed) return;

    try {
      for (const leadId of selectedLeads) {
        await leadService.delete(leadId);
      }
      await loadLeads();
      setSelectedLeads(new Set());
    } catch (error) {
      console.error("Error deleting leads:", error);
      alert("Error al eliminar los leads");
    }
  };

  const exportToCSV = () => {
    const selectedData = filteredLeads.filter(l => selectedLeads.has(l.id));
    const dataToExport = selectedData.length > 0 ? selectedData : filteredLeads;

    const csv = [
      ["Nombre", "WhatsApp", "País", "Problema", "Estado", "Fecha"],
      ...dataToExport.map(l => [
        l.name,
        l.whatsapp,
        l.country_code || "",
        l.problem || "",
        l.status,
        new Date(l.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      nuevo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      enConversacion: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      caliente: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      cerrado: "bg-red-500/20 text-red-400 border-red-500/30",
      listo: "bg-green-500/20 text-green-400 border-green-500/30",
      perdido: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      archive: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    };
    return colors[status] || colors.nuevo;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      nuevo: "Nuevo",
      enConversacion: "En Conversación",
      caliente: "Caliente",
      cerrado: "Cerrado",
      listo: "Listo",
      perdido: "Perdido",
      archive: "Archivado"
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Portal Maestro
              </h1>
              <p className="text-sm text-gray-400 mt-1">Gestión de almas y consultas espirituales</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/Suafazon/perfil")}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-yellow-500"
              >
                Perfil
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="border-red-700 text-red-400 hover:bg-red-950"
              >
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Consultas</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Leads Activos</p>
                <p className="text-3xl font-bold text-blue-400">{stats.leadsCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-green-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Listos</p>
                <p className="text-3xl font-bold text-green-400">{stats.ready}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6 hover:border-gray-600 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Archivados</p>
                <p className="text-3xl font-bold text-gray-400">{stats.archived}</p>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                <Archive className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="space-y-4">
            {/* Search & Refresh */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nombre o WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 focus:border-yellow-500"
                />
              </div>
              <Button
                onClick={loadLeads}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setStatusFilter("all")}
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                className={statusFilter === "all" ? "bg-yellow-500 text-black hover:bg-yellow-600" : "border-gray-700 text-gray-400 hover:bg-gray-800"}
              >
                Todos
              </Button>
              <Button
                onClick={() => setStatusFilter("active")}
                variant={statusFilter === "active" ? "default" : "outline"}
                size="sm"
                className={statusFilter === "active" ? "bg-blue-500 text-white hover:bg-blue-600" : "border-gray-700 text-gray-400 hover:bg-gray-800"}
              >
                Activos
              </Button>
              <Button
                onClick={() => setStatusFilter("listo")}
                variant={statusFilter === "listo" ? "default" : "outline"}
                size="sm"
                className={statusFilter === "listo" ? "bg-green-500 text-white hover:bg-green-600" : "border-gray-700 text-gray-400 hover:bg-gray-800"}
              >
                Listos
              </Button>
              <Button
                onClick={() => setStatusFilter("archive")}
                variant={statusFilter === "archive" ? "default" : "outline"}
                size="sm"
                className={statusFilter === "archive" ? "bg-gray-600 text-white hover:bg-gray-700" : "border-gray-700 text-gray-400 hover:bg-gray-800"}
              >
                Archivados
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedLeads.size > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-950 border border-gray-800 rounded-lg">
                <span className="text-sm text-gray-400 self-center">
                  {selectedLeads.size} seleccionado(s):
                </span>
                <Button size="sm" onClick={exportToCSV} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <Download className="w-4 h-4 mr-1" />
                  Exportar
                </Button>
                <Button size="sm" onClick={() => handleBulkStatusChange("listo")} variant="outline" className="border-green-700 text-green-400 hover:bg-green-950">
                  Marcar Listo
                </Button>
                <Button size="sm" onClick={() => handleBulkStatusChange("archive")} variant="outline" className="border-gray-700 text-gray-400 hover:bg-gray-800">
                  Archivar
                </Button>
                <Button size="sm" onClick={handleBulkDelete} variant="outline" className="border-red-700 text-red-400 hover:bg-red-950">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Leads Table */}
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 bg-gray-950">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-yellow-500 focus:ring-yellow-500"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">NOMBRE</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">WHATSAPP</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">PROBLEMA</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">FECHA</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">ESTADO</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-yellow-500 focus:ring-yellow-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-yellow-500 border border-gray-700">
                          {getInitials(lead.name)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{lead.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {lead.whatsapp}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-400 max-w-xs truncate">
                        {lead.problem || "—"}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(lead.status)} border px-3 py-1`}>
                        {getStatusLabel(lead.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                        size="sm"
                        className="bg-yellow-500 text-black hover:bg-yellow-600"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Chat
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No se encontraron consultas</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}