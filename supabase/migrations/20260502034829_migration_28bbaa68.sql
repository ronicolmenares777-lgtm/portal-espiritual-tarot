-- Recrear las políticas RLS para storage.objects
DROP POLICY IF EXISTS "chat_media_insert" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_select" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_update" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_delete" ON storage.objects;

CREATE POLICY "chat_media_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "chat_media_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

CREATE POLICY "chat_media_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'chat-media');

CREATE POLICY "chat_media_delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'chat-media');