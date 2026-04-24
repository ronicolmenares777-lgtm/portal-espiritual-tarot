-- Agregar columna deleted_at a la tabla leads para soft delete
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;