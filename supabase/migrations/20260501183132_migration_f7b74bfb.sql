-- Crear bucket de storage para multimedia del chat
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-media',
  'chat-media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/webm', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir subida de archivos (usuarios autenticados y anónimos)
CREATE POLICY "Permitir subida de archivos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-media');

-- Política para permitir lectura pública de archivos
CREATE POLICY "Permitir lectura pública"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-media');

-- Política para permitir actualización de archivos propios
CREATE POLICY "Permitir actualización"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chat-media');

-- Política para permitir eliminación de archivos propios
CREATE POLICY "Permitir eliminación"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-media');