-- Eliminar las columnas problemáticas
ALTER TABLE leads DROP COLUMN IF EXISTS selected_cards;
ALTER TABLE leads DROP COLUMN IF EXISTS precision_answers;

-- Crear columnas con nombres NUEVOS para burlar el caché de Supabase
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cards_selected TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_answers JSONB;

-- Forzar recarga
NOTIFY pgrst, 'reload schema';