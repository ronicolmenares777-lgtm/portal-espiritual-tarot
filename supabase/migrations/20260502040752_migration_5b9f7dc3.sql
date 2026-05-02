-- SOLUCIÓN DEFINITIVA: Crear políticas ULTRA PERMISIVAS
-- Estas políticas permiten TODO a TODOS (público y autenticado)

-- Política 1: INSERT - Subir archivos (sin restricciones)
CREATE POLICY "public_upload_chat_media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-media');

-- Política 2: SELECT - Leer archivos (sin restricciones)
CREATE POLICY "public_read_chat_media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

-- Política 3: UPDATE - Actualizar archivos (sin restricciones)
CREATE POLICY "public_update_chat_media"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'chat-media')
WITH CHECK (bucket_id = 'chat-media');

-- Política 4: DELETE - Eliminar archivos (sin restricciones)
CREATE POLICY "public_delete_chat_media"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'chat-media');