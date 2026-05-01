-- Habilitar replica identity FULL para que Realtime funcione
ALTER TABLE messages REPLICA IDENTITY FULL;