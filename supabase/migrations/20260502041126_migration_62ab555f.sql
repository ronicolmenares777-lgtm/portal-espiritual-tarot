-- Recrear la política INSERT explícitamente
DROP POLICY IF EXISTS "chat_media_public_insert" ON storage.objects;

CREATE POLICY "chat_media_public_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-media');