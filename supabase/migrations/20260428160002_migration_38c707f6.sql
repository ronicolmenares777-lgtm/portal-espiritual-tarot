-- Solución: Recrear la columna para forzar actualización del caché de PostgREST
-- Paso 1: Renombrar temporalmente
ALTER TABLE messages RENAME COLUMN is_from_maestro TO is_from_maestro_temp;

-- Paso 2: Crear nueva columna con el nombre correcto
ALTER TABLE messages ADD COLUMN is_from_maestro boolean DEFAULT false;

-- Paso 3: Copiar datos
UPDATE messages SET is_from_maestro = is_from_maestro_temp;

-- Paso 4: Eliminar columna temporal
ALTER TABLE messages DROP COLUMN is_from_maestro_temp;

-- Verificar que funcionó
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'messages' AND column_name = 'is_from_maestro';