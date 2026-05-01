-- Hacer el campo text nullable para permitir mensajes multimedia sin texto
ALTER TABLE messages ALTER COLUMN text DROP NOT NULL;