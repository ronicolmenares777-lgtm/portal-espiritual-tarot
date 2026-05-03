-- Eliminar el campo is_deleted ya que no se usa consistentemente
ALTER TABLE leads DROP COLUMN IF EXISTS is_deleted;