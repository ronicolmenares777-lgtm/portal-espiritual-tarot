import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Save,
  Lock,
  Bell,
  Palette,
  LogOut,
  Sparkles,
  Moon,
  Sun,
  Shield,
  Edit2,
  Camera
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  notifications: {
    email: boolean;
    push: boolean;
    newLeads: boolean;
  };
  preferences: {
    theme: "light" | "dark";
    language: "es" | "en";
    autoResponse: boolean;
  };
}

export default function PerfilMaestro() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "preferences">("personal");
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "Maestro Espiritual",
    email: "admin@tarot.com",
    phone: "+52 1234567890",
    bio: "Guía espiritual dedicada a iluminar caminos a través del tarot místico",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maestro",
    notifications: {
      email: true,
      push: true,
      newLeads: true
    },
    preferences: {
      theme: "dark",
      language: "es",
      autoResponse: false
    }
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Cargar datos del perfil
  useEffect(() => {
    const savedProfile = localStorage.getItem("maestroProfile");
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, []);

  // Verificar autenticación
  useEffect(() => {
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth || adminAuth !== "true") {
      router.replace("/Suafazon");
    }
  }, []);

  const handleSaveProfile = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      localStorage.setItem("maestroProfile", JSON.stringify(profileData));
      setIsSaving(false);
      setIsEditing(false);
      alert("✅ Perfil actualizado correctamente");
    }, 1000);
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("❌ Las contraseñas no coinciden");
      return;
    }

    if (passwordData.new.length < 8) {
      alert("❌ La contraseña debe tener al menos 8 caracteres");
      return;
    }

    // En producción, validar current password y actualizar en backend
    alert("✅ Contraseña actualizada correctamente");
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  const handleLogout = () => {
    if (confirm("¿Cerrar sesión?")) {
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("adminSession");
      router.push("/Suafazon");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="Perfil - Portal Maestro" />
      <CustomCursor />
      <FloatingParticles />

      {/* Header */}
      <div className="border-b border-gold/10 bg-card/20 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/Suafazon/dashboard")}
              className="flex items-center gap-2 text-gold hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver al Portal</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Avatar y nombre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold/20 to-accent/20 border-2 border-gold/50 overflow-hidden">
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-gold text-background hover:bg-accent transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <h1 className="text-3xl font-serif text-gold mb-2">{profileData.name}</h1>
          <p className="text-sm text-muted-foreground">{profileData.email}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gold/10">
          <button
            onClick={() => setActiveTab("personal")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "personal"
                ? "text-gold border-b-2 border-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Datos Personales
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "security"
                ? "text-gold border-b-2 border-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Seguridad
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "preferences"
                ? "text-gold border-b-2 border-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Palette className="w-4 h-4 inline mr-2" />
            Preferencias
          </button>
        </div>

        {/* Contenido de tabs */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card/20 backdrop-blur-sm border border-gold/10 rounded-xl p-6"
        >
          {/* Tab: Datos Personales */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif text-gold">Información Personal</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-lg bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold to-accent text-background hover:shadow-lg hover:shadow-gold/50 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-muted/30 border border-gold/20 rounded-lg px-4 py-3 text-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gold flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-muted/30 border border-gold/20 rounded-lg px-4 py-3 text-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gold flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-muted/30 border border-gold/20 rounded-lg px-4 py-3 text-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-gold flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Biografía
                  </label>
                  <textarea
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-muted/30 border border-gold/20 rounded-lg px-4 py-3 text-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Seguridad */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif text-gold mb-6">Cambiar Contraseña</h2>

              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gold flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="w-full bg-muted/30 border border-gold/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gold flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="w-full bg-muted/30 border border-gold/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gold flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    className="w-full bg-muted/30 border border-gold/20 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-gold to-accent text-background font-medium hover:shadow-lg hover:shadow-gold/50 transition-all"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </div>
          )}

          {/* Tab: Preferencias */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif text-gold mb-6">Configuración</h2>

              {/* Notificaciones */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gold" />
                  Notificaciones
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-gold/10 cursor-pointer hover:bg-muted/30 transition-all">
                    <span className="text-foreground">Notificaciones por Email</span>
                    <input
                      type="checkbox"
                      checked={profileData.notifications.email}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: { ...profileData.notifications, email: e.target.checked }
                      })}
                      className="w-5 h-5 accent-gold"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-gold/10 cursor-pointer hover:bg-muted/30 transition-all">
                    <span className="text-foreground">Notificaciones Push</span>
                    <input
                      type="checkbox"
                      checked={profileData.notifications.push}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: { ...profileData.notifications, push: e.target.checked }
                      })}
                      className="w-5 h-5 accent-gold"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-gold/10 cursor-pointer hover:bg-muted/30 transition-all">
                    <span className="text-foreground">Alerta de Nuevos Leads</span>
                    <input
                      type="checkbox"
                      checked={profileData.notifications.newLeads}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: { ...profileData.notifications, newLeads: e.target.checked }
                      })}
                      className="w-5 h-5 accent-gold"
                    />
                  </label>
                </div>
              </div>

              {/* Preferencias generales */}
              <div className="space-y-4 pt-6 border-t border-gold/10">
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-gold" />
                  Apariencia y Comportamiento
                </h3>

                <div className="space-y-3">
                  <div className="p-4 bg-muted/20 rounded-lg border border-gold/10">
                    <label className="text-sm text-gold mb-2 block">Idioma</label>
                    <select
                      value={profileData.preferences.language}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: { ...profileData.preferences, language: e.target.value as "es" | "en" }
                      })}
                      className="w-full bg-muted/30 border border-gold/20 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-gold/10 cursor-pointer hover:bg-muted/30 transition-all">
                    <span className="text-foreground">Respuesta Automática</span>
                    <input
                      type="checkbox"
                      checked={profileData.preferences.autoResponse}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: { ...profileData.preferences, autoResponse: e.target.checked }
                      })}
                      className="w-5 h-5 accent-gold"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-gold to-accent text-background font-medium hover:shadow-lg hover:shadow-gold/50 transition-all"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Guardar Preferencias
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}