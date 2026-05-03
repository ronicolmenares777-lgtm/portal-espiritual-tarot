-- Agregar columna visitor_id para rastrear visitantes únicos
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS visitor_id TEXT;

COMMENT ON COLUMN analytics_events.visitor_id IS 'ID único del visitante (persistente entre sesiones)';