-- ============================================
-- ESQUEMA COMPLETO - PORTAL ESPIRITUAL TAROT
-- ============================================

-- 1. TABLA PROFILES (Maestros/Admins)
-- Usuarios autenticados que administran el portal
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  language TEXT DEFAULT 'es',
  notifications_enabled BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT true,
  notifications_new_leads BOOLEAN DEFAULT true,
  auto_response_enabled BOOLEAN DEFAULT false,
  auto_response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA LEADS (Almas/Usuarios que solicitan lectura)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  country_code TEXT DEFAULT '+52',
  problem TEXT NOT NULL,
  status TEXT DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'enConversacion', 'caliente', 'cerrado', 'listo', 'perdido')),
  tarot_card_name TEXT,
  tarot_card_image TEXT,
  tarot_interpretation TEXT,
  selected_cards JSONB,
  precision_answers JSONB,
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  tags TEXT[],
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA MESSAGES (Mensajes del chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  text TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')),
  is_from_maestro BOOLEAN DEFAULT false,
  is_user BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA TAROT_CARDS (Catálogo de cartas del tarot)
CREATE TABLE IF NOT EXISTS tarot_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  meaning_love TEXT,
  meaning_work TEXT,
  meaning_health TEXT,
  meaning_money TEXT,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ÍNDICES para optimizar queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_favorite ON leads(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- 6. FUNCIÓN para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGERS para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. TRIGGER para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. RLS (Row Level Security) - POLÍTICAS DE SEGURIDAD

-- PROFILES - Solo el usuario puede ver/editar su propio perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- LEADS - Solo usuarios autenticados pueden gestionar leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view leads" ON leads;
CREATE POLICY "Authenticated users can view leads" ON leads
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public can insert leads" ON leads;
CREATE POLICY "Public can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads;
CREATE POLICY "Authenticated users can update leads" ON leads
  FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete leads" ON leads;
CREATE POLICY "Authenticated users can delete leads" ON leads
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- MESSAGES - Solo usuarios autenticados pueden gestionar mensajes
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view messages" ON messages;
CREATE POLICY "Authenticated users can view messages" ON messages
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public can insert messages" ON messages;
CREATE POLICY "Public can insert messages" ON messages
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update messages" ON messages;
CREATE POLICY "Authenticated users can update messages" ON messages
  FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete messages" ON messages;
CREATE POLICY "Authenticated users can delete messages" ON messages
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- TAROT_CARDS - Público puede leer, solo autenticados pueden editar
ALTER TABLE tarot_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tarot cards" ON tarot_cards;
CREATE POLICY "Anyone can view tarot cards" ON tarot_cards
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage tarot cards" ON tarot_cards;
CREATE POLICY "Authenticated users can manage tarot cards" ON tarot_cards
  FOR ALL USING (auth.uid() IS NOT NULL);