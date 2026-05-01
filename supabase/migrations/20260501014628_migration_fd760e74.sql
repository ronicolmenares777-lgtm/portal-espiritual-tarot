-- PASO 1: ELIMINAR TODO LO RELACIONADO CON MESSAGES
DROP TABLE IF EXISTS messages CASCADE;

-- PASO 2: CREAR TABLA DESDE CERO CON ESTRUCTURA SIMPLE
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_from_maestro BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PASO 3: INDICES PARA PERFORMANCE
CREATE INDEX idx_messages_lead_id ON messages(lead_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- PASO 4: RLS POLICIES SIMPLES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Permitir lectura a todos
CREATE POLICY "public_read" ON messages FOR SELECT USING (true);

-- Permitir insert a usuarios anónimos (para el chat del usuario)
CREATE POLICY "anon_insert" ON messages FOR INSERT WITH CHECK (true);

-- Permitir update/delete solo a usuarios autenticados
CREATE POLICY "auth_update" ON messages FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_delete" ON messages FOR DELETE USING (auth.uid() IS NOT NULL);