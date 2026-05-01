import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingParticles } from "@/components/FloatingParticles";
import { ProfileService } from "@/services/profileService";
import { AuthService } from "@/services/authService";
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
  Shield,
  Edit2,
  Camera,
  Loader2
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
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "preferences">("personal");
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    bio: "",
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

  // Verificar autenticación y cargar perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: profile, error } = await ProfileService.get();
        
        if (error) {
          console.error("Error cargando perfil:", error);
          return;
        }

        if (profile) {
          setProfileData({
            name: profile.full_name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            bio: profile.bio || "",
            avatar: profile.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=maestro",
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
        }
      } catch (error) {
        console.error("Error en loadProfile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      const { data, error } = await ProfileService.update({
        full_name: profileData.name,
        phone: profileData.phone,
        bio: profileData.bio,
        avatar_url: profileData.avatar
      });

      if (error) {
        console.error("Error guardando perfil:", error);
        alert("❌ Error al guardar el perfil");
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
      setIsEditing(false);
      alert("✅ Perfil actualizado correctamente");
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Error al guardar el perfil");
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("❌ Las contraseñas no coinciden");
      return;
    }

    if (passwordData.new.length < 8) {
      alert("❌ La contraseña debe tener al menos 8 caracteres");
      return;
    }

    try {
      const { error } = await AuthService.updatePassword(passwordData.new);
      
      if (error) {
        alert("❌ Error al actualizar contraseña");
        return;
      }

      alert("✅ Contraseña actualizada correctamente");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (err) {
      alert("❌ Error al actualizar contraseña");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);

    try {
      const { data, error } = await ProfileService.uploadAvatar(file);

      if (error) {
        alert(`❌ Error: ${error.message}`);
        setIsUploadingAvatar(false);
        return;
      }

      if (data?.url) {
        setProfileData({ ...profileData, avatar: data.url });
        alert("✅ Foto de perfil actualizada correctamente");
      }

      setIsUploadingAvatar(false);
    } catch (err) {
      console.error("Error subiendo avatar:", err);
      alert("❌ Error al subir la foto");
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("¿Cerrar sesión?")) {
      await AuthService.signOut();
      router.push("/Suafazon");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <CustomCursor />
        <FloatingParticles />
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-gold">Cargando perfil...</p>
        </div>
      </div>
    );
  }

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
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gold/30 bg-muted">
                {isUploadingAvatar ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                  </div>
                ) : (
                  <img 
                    src={profileData.avatar} 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=maestro";
                    }}
                  />
                )}
              </div>
              {isEditing && !isUploadingAvatar && (
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  <label
                    className="bg-gold text-background p-2 rounded-full hover:bg-gold/80 transition-colors cursor-pointer"
                    title="Subir foto"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => {
                      const seed = prompt("Ingresa una palabra para generar avatar:", "maestro");
                      if (seed) {
                        setProfileData({
                          ...profileData,
                          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
                        });
                      }
                    }}
                    className="bg-gold/70 text-background p-2 rounded-full hover:bg-gold/60 transition-colors"
                    title="Generar avatar"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-serif text-gold mb-1">{profileData.name || "Maestro Espiritual"}</h2>
              <p className="text-foreground/60">{profileData.email}</p>
              {isEditing && (
                <div className="mt-3">
                  <p className="text-xs text-foreground/60">
                    <Camera className="w-3 h-3 inline mr-1" />
                    Click en cámara para subir foto (JPG, PNG, max 2MB)
                  </p>
                  <p className="text-xs text-foreground/60">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    O genera un avatar único con tu palabra
                  </p>
                </div>
              )}
            </div>
          </div>
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