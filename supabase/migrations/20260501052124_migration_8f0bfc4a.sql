-- Agregar columna de estado de lectura si no existe
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;