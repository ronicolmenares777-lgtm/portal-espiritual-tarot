-- Agregar columna is_read con valor por defecto
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;