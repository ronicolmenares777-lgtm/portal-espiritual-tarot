-- Eliminar las columnas si existen (para recrearlas limpiamente)
ALTER TABLE leads
DROP COLUMN IF EXISTS selected_cards,
DROP COLUMN IF EXISTS precision_answers;

-- Agregar las columnas con los tipos correctos
ALTER TABLE leads
ADD COLUMN selected_cards TEXT[],
ADD COLUMN precision_answers JSONB;

-- Verificar que se crearon
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leads' 
  AND column_name IN ('selected_cards', 'precision_answers');