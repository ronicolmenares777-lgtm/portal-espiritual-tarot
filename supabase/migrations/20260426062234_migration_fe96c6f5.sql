-- Si no existe, crearla ahora
ALTER TABLE leads ADD COLUMN IF NOT EXISTS precision_answers JSONB DEFAULT '{}'::jsonb;