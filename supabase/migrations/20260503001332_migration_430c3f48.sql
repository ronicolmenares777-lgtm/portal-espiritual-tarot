-- Cambiar el tipo de dato de avatar_url a TEXT para soportar imágenes base64 grandes
ALTER TABLE profiles 
ALTER COLUMN avatar_url TYPE TEXT;