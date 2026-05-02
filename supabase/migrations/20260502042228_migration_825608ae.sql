-- Agregar la columna media_type a la tabla messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'audio'));