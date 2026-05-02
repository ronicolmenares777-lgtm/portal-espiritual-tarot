-- Crear SOLO 4 políticas limpias para chat-media

CREATE POLICY "chat_media_public_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "chat_media_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

CREATE POLICY "chat_media_public_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'chat-media')
WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "chat_media_public_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'chat-media');