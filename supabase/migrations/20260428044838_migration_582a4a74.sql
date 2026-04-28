-- Agregar columnas faltantes a la tabla leads
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS selected_cards TEXT[],
ADD COLUMN IF NOT EXISTS precision_answers JSONB;