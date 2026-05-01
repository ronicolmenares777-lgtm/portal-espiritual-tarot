-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Permitir lectura pública chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir inserción chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación chat-media" ON storage.objects;

-- Crear políticas nuevas y correctas
CREATE POLICY "chat_media_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-media');

CREATE POLICY "chat_media_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "chat_media_public_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chat-media');

CREATE POLICY "chat_media_public_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-media');