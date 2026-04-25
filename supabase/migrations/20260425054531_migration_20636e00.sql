-- Crear políticas de storage para permitir subida de archivos
CREATE POLICY "Allow public uploads to chat-media" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "Allow public read from chat-media" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'chat-media');

CREATE POLICY "Allow public delete from chat-media" 
ON storage.objects FOR DELETE 
TO public 
USING (bucket_id = 'chat-media');