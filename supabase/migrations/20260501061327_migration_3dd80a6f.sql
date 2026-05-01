-- Agregar columna classification a la tabla leads si no existe
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS classification TEXT CHECK (classification IN ('hot', 'warm', 'cold'));