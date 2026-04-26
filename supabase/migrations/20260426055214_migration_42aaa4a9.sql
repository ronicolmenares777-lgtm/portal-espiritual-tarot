-- CREAR EXTENSIÓN UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLA LEADS (formularios de usuarios)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  country_code TEXT DEFAULT '+52',
  problem TEXT NOT NULL,
  card_selected TEXT,
  status TEXT DEFAULT 'nuevo',
  ritual_state TEXT DEFAULT 'listo',
  whatsapp_notified BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- TABLA MESSAGES (chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- TABLA PROFILES (usuarios admin)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA TAROT_CARDS
CREATE TABLE IF NOT EXISTS tarot_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  keywords TEXT[],
  meaning_upright TEXT,
  meaning_reversed TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_cards ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PÚBLICAS (acceso completo para todos)
DROP POLICY IF EXISTS "Acceso público leads" ON leads;
CREATE POLICY "Acceso público leads" ON leads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso público messages" ON messages;
CREATE POLICY "Acceso público messages" ON messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso público profiles" ON profiles;
CREATE POLICY "Acceso público profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso público tarot_cards" ON tarot_cards;
CREATE POLICY "Acceso público tarot_cards" ON tarot_cards FOR ALL USING (true) WITH CHECK (true);