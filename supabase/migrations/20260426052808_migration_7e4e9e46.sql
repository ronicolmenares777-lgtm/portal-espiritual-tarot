-- CREAR EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLA LEADS (FORMULARIOS DE USUARIOS)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  country_code TEXT DEFAULT '+52',
  problem TEXT NOT NULL,
  status TEXT DEFAULT 'nuevo',
  ritual_state TEXT DEFAULT 'listo',
  selected_cards TEXT[],
  precision_answers JSONB,
  whatsapp_notified BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA MESSAGES (CHAT)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA PROFILES (USUARIOS ADMIN)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PARA LEADS (ACCESO PÚBLICO)
DROP POLICY IF EXISTS "Acceso público leer leads" ON leads;
DROP POLICY IF EXISTS "Acceso público crear leads" ON leads;
DROP POLICY IF EXISTS "Acceso público actualizar leads" ON leads;

CREATE POLICY "Acceso público leer leads" ON leads 
  FOR SELECT 
  USING (true);

CREATE POLICY "Acceso público crear leads" ON leads 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Acceso público actualizar leads" ON leads 
  FOR UPDATE 
  USING (true);

-- POLÍTICAS RLS PARA MESSAGES (ACCESO PÚBLICO)
DROP POLICY IF EXISTS "Acceso público leer mensajes" ON messages;
DROP POLICY IF EXISTS "Acceso público crear mensajes" ON messages;
DROP POLICY IF EXISTS "Acceso público actualizar mensajes" ON messages;

CREATE POLICY "Acceso público leer mensajes" ON messages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Acceso público crear mensajes" ON messages 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Acceso público actualizar mensajes" ON messages 
  FOR UPDATE 
  USING (true);

-- POLÍTICAS RLS PARA PROFILES (ACCESO PÚBLICO)
DROP POLICY IF EXISTS "Acceso público leer profiles" ON profiles;
DROP POLICY IF EXISTS "Acceso público crear profiles" ON profiles;

CREATE POLICY "Acceso público leer profiles" ON profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Acceso público crear profiles" ON profiles 
  FOR INSERT 
  WITH CHECK (true);