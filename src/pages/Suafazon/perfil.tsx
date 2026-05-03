import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Save, Upload, ArrowLeft, Check, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl sm:rounded-2xl shadow-xl border border-border p-6 sm:p-8 lg:p-10"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gold mb-2">
              Perfil del Maestro
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Personaliza tu información y avatar
            </p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="relative group">
              <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-gold/40 shadow-lg">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-gold/20 to-accent/20 text-gold text-3xl sm:text-4xl">
                    <Sparkles className="h-14 w-14 sm:h-16 sm:w-16" />
                  </AvatarFallback>
                )}
              </Avatar>
              
              {/* Botón de cambiar avatar */}
              <label className="absolute bottom-0 right-0 bg-gold hover:bg-accent text-background rounded-full p-2 sm:p-2.5 cursor-pointer shadow-lg transition-all">
                <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 text-center">
              Click en el icono para cambiar tu avatar
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                Nombre del Maestro
              </label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Ingresa tu nombre"
                className="w-full text-sm sm:text-base"
                disabled={saving}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || uploading}
              className="w-full bg-gradient-to-r from-gold to-accent hover:from-accent hover:to-gold text-background font-bold py-2.5 sm:py-3 text-sm sm:text-base"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>

          {/* Info adicional */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-muted/30 rounded-xl">
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Tu nombre y avatar se mostrarán en todas las conversaciones con los usuarios
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}