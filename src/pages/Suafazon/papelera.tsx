import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LeadService } from "@/services/leadService";
import type { Tables } from "@/integrations/supabase/types";
import { 
  Trash2, 
  Search,
  RefreshCw,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  Calendar,
  Phone,
  User
} from "lucide-react";

type Lead = Tables<"leads">;

export default function Papelera() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadDeletedLeads();
  }, []);

  const loadDeletedLeads = async () => {
    setLoading(true);
    try {
      const result = await LeadService.getAll();
      if (result.data) {
        // Filtrar solo leads con status "perdido" (papelera)
        const deletedLeads = result.data.filter(l => l.status === "perdido");
        setLeads(deletedLeads);
      }
    } catch (error) {
      console.error("Error cargando papelera:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.whatsapp.includes(searchTerm);
    return matchesSearch;
  });

  const handleRestore = async (leadId: string) => {
    const confirmed = confirm("¿Restaurar este lead a estado 'Nuevo'?");
    if (!confirmed) return;

    try {
      await LeadService.update(leadId, { status: "nuevo" });
      await loadDeletedLeads();
    } catch (error) {
      console.error("Error restaurando lead:", error);
      alert("Error al restaurar el lead");
    }
  };

  const handlePermanentDelete = async (leadId: string) => {
    const confirmed = confirm(
      "⚠️ ADVERTENCIA: Esto eliminará PERMANENTEMENTE el lead y todos sus mensajes.\n\n¿Estás seguro?"
    );
    if (!confirmed) return;

    const doubleConfirm = confirm("¿REALMENTE quieres eliminar permanentemente?");
    if (!doubleConfirm) return;

    try {
      // Aquí iría la lógica de eliminación permanente
      // Por ahora solo mostramos mensaje
      alert("Función de eliminación permanente no implementada por seguridad");
    } catch (error) {
      console.error("Error eliminando permanentemente:", error);
    }
  };

  const handleRestoreAll = async () => {
    const confirmed = confirm(`¿Restaurar TODOS los ${leads.length} leads a estado 'Nuevo'?`);
    if (!confirmed) return;

    try {
      for (const lead of leads) {
        await LeadService.update(lead.id, { status: "nuevo" });
      }
      await loadDeletedLeads();
    } catch (error) {
      console.error("Error restaurando todos:", error);
      alert("Error al restaurar los leads");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando papelera...</p>
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
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/Suafazon/dashboard")}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-red-500 flex items-center gap-2">
                  <Trash2 className="w-6 h-6" />
                  Papelera
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Leads eliminados - {leads.length} en total
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/Suafazon/monitoreo")}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-yellow-500"
              >
                Monitoreo
              </Button>
              <Button
                onClick={() => router.push("/Suafazon/perfil")}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-yellow-500"
              >
                Perfil
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Warning Card */}
        <Card className="bg-red-950/20 border-red-900/50 p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Zona de Papelera
              </h3>
              <p className="text-sm text-red-300/80">
                Los leads aquí están marcados como "perdidos". Puedes restaurarlos a "Nuevo" 
                o eliminarlos permanentemente. La eliminación permanente NO se puede deshacer.
              </p>
            </div>
          </div>
        </Card>

        {/* Search & Actions */}
        <Card className="bg-gray-900 border-gray-800 p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nombre o WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-950 border-gray-800 text-white placeholder:text-gray-500 focus:border-red-500"
                />
              </div>
              <Button
                onClick={loadDeletedLeads}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>

            {leads.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleRestoreAll}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restaurar Todos
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
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">NOMBRE</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">WHATSAPP</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">PROBLEMA</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">ELIMINADO</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-400 bg-gray-950">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-semibold text-red-500 border border-gray-700">
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
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRestore(lead.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restaurar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePermanentDelete(lead.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <Trash2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">La papelera está vacía</p>
                <p className="text-sm text-gray-600 mt-2">
                  Los leads eliminados aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}