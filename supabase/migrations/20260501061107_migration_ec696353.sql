-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "Anyone can upload to chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload access" ON storage.objects;