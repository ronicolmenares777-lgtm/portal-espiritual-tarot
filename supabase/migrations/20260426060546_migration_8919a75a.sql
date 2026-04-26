-- PASO 1: Eliminar foreign key incorrecta en profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- PASO 2: Agregar columna precision_answers a leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS precision_answers JSONB DEFAULT '{}'::jsonb;

-- PASO 3: Agregar otras columnas que pueden faltar
ALTER TABLE leads ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}'::jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS selected_card_id TEXT;