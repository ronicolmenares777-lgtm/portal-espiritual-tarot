-- Crear políticas simples y permisivas para chat-media
CREATE POLICY "Public upload chat-media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "Public read chat-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

CREATE POLICY "Public update chat-media"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'chat-media');

CREATE POLICY "Public delete chat-media"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'chat-media');