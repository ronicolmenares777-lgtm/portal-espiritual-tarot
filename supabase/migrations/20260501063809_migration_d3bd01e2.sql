-- Crear índice para mejorar rendimiento de filtros
CREATE INDEX IF NOT EXISTS idx_leads_is_favorite ON leads(is_favorite);
CREATE INDEX IF NOT EXISTS idx_leads_classification ON leads(classification);