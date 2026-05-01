-- Crear políticas de storage para el bucket chat-media
CREATE POLICY "Permitir lectura pública chat-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-media');

CREATE POLICY "Permitir inserción chat-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "Permitir actualización chat-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chat-media');

CREATE POLICY "Permitir eliminación chat-media"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-media');