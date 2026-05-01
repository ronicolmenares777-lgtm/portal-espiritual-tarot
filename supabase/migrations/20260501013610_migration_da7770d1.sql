DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_from_maestro BOOLEAN DEFAULT false NOT NULL,
  is_user BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_messages" ON messages FOR SELECT USING (true);
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "auth_update_messages" ON messages FOR UPDATE USING (true);
CREATE POLICY "auth_delete_messages" ON messages FOR DELETE USING (true);

CREATE INDEX idx_messages_lead_id ON messages(lead_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);