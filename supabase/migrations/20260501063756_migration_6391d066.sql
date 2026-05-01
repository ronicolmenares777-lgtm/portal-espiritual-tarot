-- Agregar columna is_favorite a la tabla leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;