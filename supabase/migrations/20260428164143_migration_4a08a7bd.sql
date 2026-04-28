-- Crear trigger que establece is_from_maestro automáticamente
-- Evita el problema del caché de PostgREST completamente
CREATE OR REPLACE FUNCTION set_is_from_maestro()
RETURNS TRIGGER AS $$
BEGIN
  -- Si no tiene user_id, es del maestro
  NEW.is_from_maestro := (NEW.user_id IS NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_is_from_maestro ON messages;
CREATE TRIGGER trigger_set_is_from_maestro
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION set_is_from_maestro();