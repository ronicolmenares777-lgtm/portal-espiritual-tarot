-- HABILITAR RLS y crear política SUPER PERMISIVA temporal
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar cualquier política existente
DROP POLICY IF EXISTS "allow_all_access" ON profiles;

-- Crear política que permite TODO (temporal para diagnóstico)
CREATE POLICY "allow_all_access" ON profiles
FOR ALL
USING (true)
WITH CHECK (true);