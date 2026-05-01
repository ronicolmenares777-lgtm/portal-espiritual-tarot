-- Agregar columnas para multimedia en la tabla messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS media_type TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT;