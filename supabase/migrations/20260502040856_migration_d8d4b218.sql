-- LIMPIAR TODAS las políticas relacionadas con chat-media
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads from chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida de archivos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación" ON storage.objects;
DROP POLICY IF EXISTS "public_upload_chat_media" ON storage.objects;
DROP POLICY IF EXISTS "public_read_chat_media" ON storage.objects;
DROP POLICY IF EXISTS "public_update_chat_media" ON storage.objects;
DROP POLICY IF EXISTS "public_delete_chat_media" ON storage.objects;