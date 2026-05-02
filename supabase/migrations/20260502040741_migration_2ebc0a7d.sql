-- ELIMINAR TODAS LAS POLÍTICAS EXISTENTES del bucket chat-media
DROP POLICY IF EXISTS "Allow public uploads to chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads from chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to chat-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from chat-media" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_insert" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_select" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_update" ON storage.objects;
DROP POLICY IF EXISTS "chat_media_delete" ON storage.objects;