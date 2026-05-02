-- Crear las 4 políticas necesarias para el bucket chat-media

-- POLÍTICA 1: Permitir subir archivos (INSERT)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'chat-media');

-- POLÍTICA 2: Permitir ver archivos (SELECT)
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-media');

-- POLÍTICA 3: Permitir actualizar archivos (UPDATE)
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'chat-media');

-- POLÍTICA 4: Permitir eliminar archivos (DELETE)
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'chat-media');