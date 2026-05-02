-- Crear políticas RLS para chat_messages (acceso público total)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_chat_messages"
ON chat_messages FOR SELECT
TO public
USING (true);

CREATE POLICY "public_insert_chat_messages"
ON chat_messages FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "public_update_chat_messages"
ON chat_messages FOR UPDATE
TO public
USING (true);

CREATE POLICY "public_delete_chat_messages"
ON chat_messages FOR DELETE
TO public
USING (true);