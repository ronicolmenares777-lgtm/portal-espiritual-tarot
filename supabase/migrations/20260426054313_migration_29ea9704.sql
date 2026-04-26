-- CREAR EXTENSIÓN UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLA LEADS
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  country_code TEXT DEFAULT '52',
  problem TEXT NOT NULL,
  status TEXT DEFAULT 'nuevo',
  ritual_state TEXT DEFAULT 'listo',
  selected_card TEXT,
  card_revealed BOOLEAN DEFAULT false,
  whatsapp_notified BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- TABLA MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA TAROT_CARDS
CREATE TABLE IF NOT EXISTS tarot_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image_path TEXT NOT NULL,
  meaning TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POLÍTICAS RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leer leads" ON leads;
DROP POLICY IF EXISTS "Permitir crear leads" ON leads;
DROP POLICY IF EXISTS "Permitir actualizar leads" ON leads;

CREATE POLICY "Permitir leer leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Permitir crear leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar leads" ON leads FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir leer mensajes" ON messages;
DROP POLICY IF EXISTS "Permitir crear mensajes" ON messages;
DROP POLICY IF EXISTS "Permitir actualizar mensajes" ON messages;

CREATE POLICY "Permitir leer mensajes" ON messages FOR SELECT USING (true);
CREATE POLICY "Permitir crear mensajes" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar mensajes" ON messages FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir leer profiles" ON profiles;
DROP POLICY IF EXISTS "Permitir crear profiles" ON profiles;

CREATE POLICY "Permitir leer profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Permitir crear profiles" ON profiles FOR INSERT WITH CHECK (true);