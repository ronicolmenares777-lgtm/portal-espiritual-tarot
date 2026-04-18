import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { mockLeads, mockStats } from "@/lib/mockData";
import type { Lead } from "@/types/admin";
import {
  Users,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Search,
  LogOut,
  Sparkles,
  BarChart3,
  TrendingUp,
  Circle,
  HelpCircle
} from "lucide-react";

type Tab = "chats" | "leads";

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [stats, setStats] = useState(mockStats);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuth");
    if (!isAuthenticated) {
      router.push("/Suafazon");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    router.push("/Suafazon");
  };

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nuevo":
        return "bg-blue-500";
      case "enConversacion":
        return "bg-yellow-500";
      case "clienteCaliente":
        return "bg-orange-500";
      case "cerrado":
        return "bg-green-500";
      case "perdido":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "nuevo":
        return "NUEVO";
      case "enConversacion":
        return "CLIENTE";
      case "clienteCaliente":
        return "CLIENTE";
      case "cerrado":
        return "CERRADO";
      case "perdido":
        return "PERDIDO";
      default:
        return status;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const hours = parseInt(timestamp.replace(/\D/g, "")) || 1;
    return `alrededor de ${hours} hora${hours > 1 ? "s" : ""}`;
  };

  const pipelineData = [
    { label: "NUEVO", count: stats.pipeline.nuevo, color: "bg-blue-500", max: 35 },
    { label: "EN CONVERSACIÓN", count: stats.pipeline.enConversacion, color: "bg-yellow-500", max: 35 },
    { label: "CLIENTE CALIENTE", count: stats.pipeline.clienteCaliente, color: "bg-orange-500", max: 35 },
    { label: "CERRADO", count: stats.pipeline.cerrado, color: "bg-green-500", max: 35 },
    { label: "PERDIDO", count: stats.pipeline.perdido, color: "bg-red-500", max: 35 },
  ];

  return (
    <>
      <SEO 
        title="Portal Maestro - Dashboard"
        description="Panel de administración del Portal Espiritual"
      />
      <CustomCursor />
      <FloatingParticles />
      
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gradient-to-b from-[#0a0a0f] to-[#13131a] border-r border-gold/20 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gold/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-gold" />
              <span className="text-lg font-serif text-gold tracking-wider">Portal Maestro</span>
            </div>
          </div>

          {/* Resumen Estadístico Button */}
          <div className="p-4">
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-gold/20 to-accent/20 border border-gold/30 hover:border-gold/50 transition-all group"
            >
              <BarChart3 className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
              <span className="text-sm tracking-wider text-gold">RESUMEN ESTADÍSTICO</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="px-4 flex gap-2 border-b border-gold/10 pb-3">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "chats"
                  ? "bg-blue-500 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              CHATS
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "leads"
                  ? "bg-blue-500 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              LEADS
            </button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar almas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/30 border border-gold/20 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
              />
            </div>
          </div>

          {/* Leads List */}
          <div className="flex-1 overflow-y-auto px-4 space-y-2">
            {filteredLeads.map((lead) => (
              <motion.button
                key={lead.id}
                onClick={() => router.push(`/Suafazon/chat/${lead.id}`)}
                className="w-full p-3 rounded-lg bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-gold/30 transition-all text-left group"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-gold transition-colors">
                      {lead.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getTimeAgo(lead.timestamp)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-black border-b border-gold/20 px-8 py-4">
            <div className="flex items-center justify-between">
              <button className="p-2 hover:bg-muted/20 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-sm tracking-[0.3em] text-gold">CANAL SAGRADO</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-foreground">Maestro Espiritual</span>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/30">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces"
                    alt="Maestro"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 text-muted-foreground hover:text-red-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto space-y-12">
              {/* Title */}
              <div className="text-center space-y-3">
                <h1 className="text-5xl font-serif text-gold tracking-wider">
                  VISIÓN DEL DESTINO
                </h1>
                <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
                  Resumen Estadístico de Almas y Conexiones
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                <motion.div 
                  className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl p-6 text-center hover:border-blue-500/50 transition-all"
                  whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)" }}
                >
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-blue-500 mb-1">{stats.totalAlmas}</div>
                  <div className="text-xs tracking-wider text-blue-400 uppercase">Total Almas</div>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-6 text-center hover:border-green-500/50 transition-all"
                  whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(34, 197, 94, 0.3)" }}
                >
                  <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-green-500 mb-1">{stats.clickWA}</div>
                  <div className="text-xs tracking-wider text-green-400 uppercase">Click WA</div>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-xl p-6 text-center hover:border-gold/50 transition-all"
                  whileHover={{ y: -4, boxShadow: "0 10px 40px hsl(var(--gold) / 0.3)" }}
                >
                  <CheckCircle className="w-8 h-8 text-gold mx-auto mb-3" />
                  <div className="text-4xl font-bold text-gold mb-1">{stats.atendidos}</div>
                  <div className="text-xs tracking-wider text-gold uppercase">Atendidos</div>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl p-6 text-center hover:border-red-500/50 transition-all"
                  whileHover={{ y: -4, boxShadow: "0 10px 40px rgba(239, 68, 68, 0.3)" }}
                >
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-red-500 mb-1">{stats.sinResponder}</div>
                  <div className="text-xs tracking-wider text-red-400 uppercase">Sin Responder</div>
                </motion.div>
              </div>

              {/* Pipeline */}
              <div className="bg-card border border-gold/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-accent flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-background" />
                  </div>
                  <h2 className="text-xl font-serif text-gold tracking-wider">ESTADO DEL PIPELINE</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gold/50 to-transparent" />
                  <span className="text-sm text-muted-foreground">24 horas</span>
                </div>

                <div className="space-y-6">
                  {pipelineData.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Circle className={`w-3 h-3 ${item.color.replace("bg-", "text-")}`} fill="currentColor" />
                          <span className="text-muted-foreground tracking-wider">{item.label}</span>
                        </div>
                        <span className="font-medium text-foreground">{item.count}</span>
                      </div>
                      <div className="h-3 bg-muted/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / item.max) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                          className={`h-full ${item.color} rounded-full relative`}
                          style={{
                            boxShadow: `0 0 20px ${item.color.includes("blue") ? "rgba(59, 130, 246, 0.5)" : 
                                                     item.color.includes("yellow") ? "rgba(234, 179, 8, 0.5)" :
                                                     item.color.includes("orange") ? "rgba(249, 115, 22, 0.5)" :
                                                     item.color.includes("green") ? "rgba(34, 197, 94, 0.5)" :
                                                     "rgba(239, 68, 68, 0.5)"}`
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}