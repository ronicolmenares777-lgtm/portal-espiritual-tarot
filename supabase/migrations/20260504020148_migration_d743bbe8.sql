-- Agregar "archive" a los valores permitidos del status
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('nuevo', 'enConversacion', 'caliente', 'cerrado', 'listo', 'perdido', 'archive'));