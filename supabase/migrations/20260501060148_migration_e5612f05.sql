-- Agregar columnas media_type y media_url si no existen
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS media_type TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT;