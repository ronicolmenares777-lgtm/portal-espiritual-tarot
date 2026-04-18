import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { mockLeads, mockStats } from "@/lib/mockData";
import type { Lead } from "@/types/admin";
import { motion } from "framer-motion";
import { Users, MessageCircle, UserCheck, AlertCircle, Search, Menu, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<"chats" | "leads">("chats");
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(mockLeads);

  // Verificar autenticación
  useEffect(() => {
    const isAuth = localStorage.getItem("admin_authenticated");
    if (!isAuth) {
      router.push("/Suafazon");
    }
  }, [router]);

  // Filtrar leads por búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = mockLeads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.whatsapp.includes(searchTerm)
      );
      setFilteredLeads(filtered);
    } else {
      setFilteredLeads(mockLeads);
    }
  }, [searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    router.push("/Suafazon");
  };

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "nuevo": return "bg-blue-500";
      case "en_conversacion": return "bg-yellow-500";
      case "cliente_caliente": return "bg-orange-500";
      case "cerrado": return "bg-green-500";
      case "perdido": return "bg-gray-500";
      default: return "bg-blue-500";
    }
  };

  const getStatusLabel = (status: Lead["status"]) => {
    switch (status) {
      case "nuevo": return "NUEVO";
      case "en_conversacion": return "CONVERSACIÓN";
      case "cliente_caliente": return "CALIENTE";
      case "cerrado": return "CERRADO";
      case "perdido": return "PERDIDO";
      default: return "NUEVO";
    }
  };

  return (
    <>
      <SEO 
        title="Dashboard - Portal Maestro"
        description="Panel de administración de consultas espirituales"
      />

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <div className="w-64 bg-black/95 border-r border-gold/20 p-6 flex flex-col">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-gold">
              <div className="w-8 h-8 rounded-full border-2 border-gold/50 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
              <h1 className="font-serif text-lg tracking-wider">Portal Maestro</h1>
            </div>
          </div>

          {/* Usuario */}
          <div className="mb-8 p-4 bg-card/50 rounded-xl border border-gold/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-purple-500/30 flex items-center justify-center">
                <span className="text-sm">ME</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Maestro Espiritual</p>
                <p className="text-xs text-muted-foreground">Canal Sagrado</p>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 space-y-2">
            <button
              onClick={() => setSelectedTab("chats")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                selectedTab === "chats"
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-muted-foreground hover:bg-card/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Chats</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedTab("leads")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                selectedTab === "leads"
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-muted-foreground hover:bg-card/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Leads</span>
              </div>
            </button>
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-auto px-4 py-3 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-3"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Salir</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-black/95 border-b border-gold/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gold/60 tracking-[0.3em] uppercase mb-1">Canal Sagrado</p>
                <h2 className="text-2xl font-serif text-gold">Resumen Estadístico</h2>
              </div>
              <button className="p-2 hover:bg-card/50 rounded-lg transition-colors">
                <Menu className="w-6 h-6 text-gold" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-b from-black/50 to-transparent p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-serif text-gold mb-2">VISIÓN DEL DESTINO</h3>
              <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase">
                Resumen estadístico de almas y conexiones
              </p>
            </div>

            <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto">
              {/* Total Almas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="mb-3">
                  <Users className="w-8 h-8 text-blue-400 mx-auto" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{mockStats.totalAlmas}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Almas</div>
              </motion.div>

              {/* Click WA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="mb-3">
                  <MessageCircle className="w-8 h-8 text-green-400 mx-auto" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{mockStats.clickWA}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Click WA</div>
              </motion.div>

              {/* Atendidos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="mb-3">
                  <UserCheck className="w-8 h-8 text-yellow-400 mx-auto" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{mockStats.atendidos}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Atendidos</div>
              </motion.div>

              {/* Sin Responder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="mb-3">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{mockStats.sinResponder}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Sin Responder</div>
              </motion.div>
            </div>

            {/* Pipeline */}
            <div className="mt-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gold/60 tracking-[0.2em] uppercase">★ Estado del Pipeline</span>
                <div className="flex-1 h-px bg-gold/10"></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-xs text-muted-foreground uppercase tracking-wider">Nuevo</div>
                  <div className="flex-1 h-8 bg-card/50 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-end pr-3"
                      style={{ width: `${(mockStats.pipeline.nuevo / 32) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{mockStats.pipeline.nuevo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 text-xs text-muted-foreground uppercase tracking-wider">En Conversación</div>
                  <div className="flex-1 h-8 bg-card/50 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-end pr-3"
                      style={{ width: `${(mockStats.pipeline.enConversacion / 32) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{mockStats.pipeline.enConversacion}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 text-xs text-muted-foreground uppercase tracking-wider">Cliente Caliente</div>
                  <div className="flex-1 h-8 bg-card/50 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 flex items-center justify-end pr-3"
                      style={{ width: `${(mockStats.pipeline.clienteCaliente / 32) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{mockStats.pipeline.clienteCaliente}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 text-xs text-muted-foreground uppercase tracking-wider">Cerrado</div>
                  <div className="flex-1 h-8 bg-card/50 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-end pr-3"
                      style={{ width: `${(mockStats.pipeline.cerrado / 32) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{mockStats.pipeline.cerrado}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-32 text-xs text-muted-foreground uppercase tracking-wider">Perdido</div>
                  <div className="flex-1 h-8 bg-card/50 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gray-500 to-gray-400 flex items-center justify-end pr-3"
                      style={{ width: `${(mockStats.pipeline.perdido / 32) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{mockStats.pipeline.perdido}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leads List */}
          <div className="flex-1 p-8">
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar alma..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-card/50 border border-gold/20 rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>
            </div>

            {/* Leads */}
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/Suafazon/chat/${lead.id}`}
                  className="block"
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-card/30 border border-gold/10 rounded-xl p-4 hover:bg-card/50 hover:border-gold/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-serif text-gold">
                          {lead.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground truncate">{lead.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(lead.status)} text-white`}>
                            {getStatusLabel(lead.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {lead.problem}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {lead.createdAt}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{lead.card}</div>
                        <div className="text-gold/60">{lead.whatsapp}</div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}