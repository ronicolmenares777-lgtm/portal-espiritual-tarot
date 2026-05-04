-- Crear política RLS para permitir uploads en chat-media
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-media');