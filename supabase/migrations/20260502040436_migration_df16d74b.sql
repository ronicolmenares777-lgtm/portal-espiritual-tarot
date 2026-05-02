-- Crear políticas CORRECTAS que realmente funcionen
-- POLICY 1: INSERT - Permitir subir cualquier archivo al bucket chat-media
CREATE POLICY "Allow public uploads to chat-media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-media');

-- POLICY 2: SELECT - Permitir ver cualquier archivo del bucket chat-media
CREATE POLICY "Allow public downloads from chat-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

-- POLICY 3: UPDATE - Permitir actualizar archivos del bucket chat-media
CREATE POLICY "Allow public updates to chat-media"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'chat-media')
WITH CHECK (bucket_id = 'chat-media');

-- POLICY 4: DELETE - Permitir eliminar archivos del bucket chat-media
CREATE POLICY "Allow public deletes from chat-media"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'chat-media');