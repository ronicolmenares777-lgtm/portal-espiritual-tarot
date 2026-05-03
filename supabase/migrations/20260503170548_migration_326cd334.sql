-- Agregar columna country a la tabla analytics_events
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country_code TEXT;

COMMENT ON COLUMN analytics_events.country IS 'País del visitante (nombre completo)';
COMMENT ON COLUMN analytics_events.country_code IS 'Código de país ISO (MX, US, ES, etc)';