-- Limpiar TODAS las políticas duplicadas de chat-media
DROP POLICY IF EXISTS "Allow public delete from chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir inserción chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Public delete chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Public read chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Public update chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Public upload chat-media" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_public_update" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_public_delete" ON storage.objects;

-- Crear UNA SOLA política para cada operación
CREATE POLICY "chat_media_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

CREATE POLICY "chat_media_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "chat_media_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'chat-media');

CREATE POLICY "chat_media_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'chat-media');