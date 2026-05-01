-- Crear políticas para el bucket chat-media
DROP POLICY IF EXISTS "Anyone can upload to chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat-media" ON storage.objects;

CREATE POLICY "Anyone can upload to chat-media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "Anyone can view chat-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');