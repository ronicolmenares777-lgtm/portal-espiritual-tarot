-- Crear el bucket chat-files si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política: Permitir a cualquiera leer archivos (para ver las imágenes)
CREATE POLICY "public_read_chat_files" ON storage.objects
FOR SELECT
USING (bucket_id = 'chat-files');

-- Política: Permitir a usuarios autenticados subir archivos
CREATE POLICY "authenticated_upload_chat_files" ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

-- Política: Permitir a usuarios autenticados actualizar sus archivos
CREATE POLICY "authenticated_update_chat_files" ON storage.objects
FOR UPDATE
USING (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

-- Política: Permitir a usuarios autenticados eliminar sus archivos
CREATE POLICY "authenticated_delete_chat_files" ON storage.objects
FOR DELETE
USING (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);