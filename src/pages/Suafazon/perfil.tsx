import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Save, Upload, ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";

export default function PerfilMaestro() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    avatar_url: "",
  });

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AuthService.isAuthenticated();
      if (!isAuth) {
        router.replace("/Suafazon");
      }
    };
    checkAuth();
  }, [router]);

  // Cargar perfil actual
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          router.replace("/Suafazon");
          return;
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error al cargar perfil",
          });
          return;
        }

        if (profileData) {
          setProfile({
            full_name: profileData.full_name || "",
            email: profileData.email || session.user.email || "",
            avatar_url: profileData.avatar_url || "",
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("📸 [IMAGE] ========== PROCESANDO IMAGEN ==========");
    console.log("  - Nombre archivo:", file.name);
    console.log("  - Tipo:", file.type);
    console.log("  - Tamaño:", (file.size / 1024).toFixed(2), "KB");

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      console.error("❌ [IMAGE] Tipo de archivo inválido:", file.type);
      toast({
        title: "❌ Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.error("❌ [IMAGE] Archivo muy grande:", file.size);
      toast({
        title: "❌ Error",
        description: "La imagen debe ser menor a 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      console.log("✅ [IMAGE] Imagen convertida a base64");
      console.log("  - Base64 length:", base64String.length);
      console.log("  - Base64 preview (primeros 100 chars):", base64String.substring(0, 100));
      
      setProfile({ ...profile, avatar_url: base64String });
      setUploading(false);
      
      toast({
        title: "✅ Imagen cargada",
        description: "Ahora haz clic en 'Guardar Cambios' para confirmar",
      });
      
      console.log("📝 [IMAGE] Estado del perfil actualizado con nueva imagen");
    };
    reader.onerror = (error) => {
      console.error("❌ [IMAGE] Error leyendo archivo:", error);
      toast({
        title: "❌ Error",
        description: "Error al cargar la imagen",
        variant: "destructive",
      });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!profile.full_name.trim()) {
      toast({
        title: "❌ Error",
        description: "El nombre es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.error("❌ [SAVE] No hay sesión de usuario");
        toast({
          title: "❌ Error",
          description: "No hay sesión activa",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      console.log("💾 [SAVE] ========== GUARDANDO PERFIL ==========");
      console.log("  - User ID:", session.user.id);
      console.log("  - Nombre:", profile.full_name);
      console.log("  - Email:", profile.email);
      console.log("  - Avatar URL existe?:", !!profile.avatar_url);
      console.log("  - Avatar URL length:", profile.avatar_url?.length || 0);
      console.log("  - Avatar URL type:", typeof profile.avatar_url);
      console.log("  - Avatar URL preview (primeros 100 chars):", profile.avatar_url?.substring(0, 100));
      
      const updateData = {
        full_name: profile.full_name.trim(),
        avatar_url: profile.avatar_url || null,
      };
      
      console.log("📦 [SAVE] Datos a enviar a Supabase:", {
        full_name: updateData.full_name,
        avatar_url_length: updateData.avatar_url?.length || 0,
      });

      const { data, error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", session.user.id)
        .select();

      console.log("📊 [SAVE] Respuesta de Supabase:");
      console.log("  - Data:", data);
      console.log("  - Error:", error);

      if (error) {
        console.error("❌ [SAVE] Error de Supabase:", error);
        toast({
          title: "❌ Error al guardar",
          description: error.message,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      console.log("✅ [SAVE] Perfil guardado exitosamente en Supabase");
      console.log("  - Datos guardados:", data);

      toast({
        title: "✅ Perfil actualizado",
        description: "Tus cambios se han guardado correctamente",
      });

      setSaving(false);

      // Redirigir al dashboard después de 1.5 segundos
      setTimeout(() => {
        router.push("/Suafazon/dashboard");
      }, 1500);
    } catch (err) {
      console.error("❌ [SAVE] Error general capturado:", err);
      toast({
        title: "❌ Error",
        description: "Ocurrió un error al guardar los cambios",
        variant: "destructive",
      });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Mi Perfil - Portal Espiritual Admin"
        description="Configura tu perfil de maestro espiritual"
      />

      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/Suafazon/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Dashboard</span>
            </Link>
            
            <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-gold via-amber-400 to-gold bg-clip-text text-transparent mb-2">
              Mi Perfil
            </h1>
            <p className="text-muted-foreground">
              Personaliza tu información y foto de perfil
            </p>
          </div>

          {/* Mensaje de éxito/error */}
          {message && (
            <div className={`mb-6 p-4 rounded-xl border-2 flex items-center gap-3 ${
              message.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                : "bg-red-500/10 border-red-500/40 text-red-400"
            }`}>
              {message.type === "success" ? (
                <Check className="w-5 h-5 shrink-0" />
              ) : (
                <X className="w-5 h-5 shrink-0" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Card principal */}
          <div className="bg-card/50 border-2 border-gold/20 rounded-2xl p-8 shadow-2xl">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-xl">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "Maestro"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                      <User className="w-16 h-16 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || saving}
                variant="outline"
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Subiendo..." : "Cambiar Foto"}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-2">
                Máximo 2MB - JPG, PNG o GIF
              </p>
            </div>

            {/* Formulario */}
            <div className="space-y-6">
              {/* Nombre completo */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Nombre Completo
                </label>
                <Input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Ej: Maestro Espiritual"
                  className="bg-secondary/50 border-border text-foreground"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Este nombre aparecerá en los chats con tus consultantes
                </p>
              </div>

              {/* Email (solo lectura) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted/50 border-border text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  El email no se puede cambiar
                </p>
              </div>

              {/* Botón guardar */}
              <Button
                onClick={handleSave}
                disabled={saving || uploading}
                className="w-full gap-2 bg-gradient-to-r from-primary via-amber-500 to-primary hover:opacity-90 transition-opacity"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}