import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Camera, User, Save, ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PerfilMaestro() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/Suafazon");
      return;
    }

    setUserId(session.user.id);
    loadProfile(session.user.id);
  };

  const loadProfile = async (uid: string) => {
    console.log("📥 Cargando perfil del maestro:", uid);
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error cargando perfil:", error);
        return;
      }

      if (data) {
        console.log("✅ Perfil cargado:", data);
        setProfile({
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error en loadProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);
    console.log("📤 Subiendo imagen de perfil...");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Subir imagen a Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error subiendo imagen:", uploadError);
        alert("Error al subir la imagen. Intenta de nuevo.");
        setIsUploading(false);
        return;
      }

      console.log("✅ Imagen subida:", uploadData.path);

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("chat-media")
        .getPublicUrl(uploadData.path);

      console.log("🔗 URL pública:", publicUrl);

      // Actualizar estado local
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));

      // Guardar en base de datos
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) {
        console.error("Error actualizando avatar en BD:", updateError);
      } else {
        console.log("✅ Avatar actualizado en BD");
      }
    } catch (error) {
      console.error("Error en handleImageUpload:", error);
      alert("Error al procesar la imagen. Intenta de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    setIsSaving(true);
    console.log("💾 Guardando perfil...", profile);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
        })
        .eq("id", userId);

      if (error) {
        console.error("Error guardando perfil:", error);
        alert("Error al guardar los cambios. Intenta de nuevo.");
      } else {
        console.log("✅ Perfil guardado exitosamente");
        alert("✅ Perfil actualizado correctamente");
      }
    } catch (error) {
      console.error("Error en handleSaveProfile:", error);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/Suafazon/dashboard")}
                className="p-2 rounded-lg hover:bg-card transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground/60" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-primary">
                  Mi Perfil
                </h1>
                <p className="text-xs sm:text-sm text-foreground/60">
                  Configura tu información como maestro espiritual
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-primary">
              Información del Maestro
            </CardTitle>
            <CardDescription>
              Esta información se mostrará en los chats con los usuarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Imagen de perfil */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-4 border-primary/30">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-primary/60" />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-primary text-black rounded-full cursor-pointer hover:bg-accent transition-colors shadow-lg"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
              <p className="text-sm text-foreground/60 text-center">
                Click en el ícono de la cámara para cambiar tu foto
              </p>
            </div>

            {/* Nombre del maestro */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-base font-semibold">
                Nombre del Maestro
              </Label>
              <Input
                id="full_name"
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Ej: Maestro Espiritual"
                className="bg-background border-border text-lg"
              />
              <p className="text-sm text-foreground/60">
                Este nombre aparecerá en todos los chats con los usuarios
              </p>
            </div>

            {/* Botón guardar */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving || !profile.full_name.trim()}
                className="bg-primary text-black hover:bg-accent font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info adicional */}
        <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <p className="text-sm text-foreground/80">
            💡 <strong>Importante:</strong> Los cambios se reflejarán automáticamente en todos los chats activos. Los usuarios verán tu nombre y foto actualizada en sus conversaciones.
          </p>
        </div>
      </main>
    </div>
  );
}