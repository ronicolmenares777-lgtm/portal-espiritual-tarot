-- DESHABILITAR RLS DEFINITIVAMENTE
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas si existen
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON profiles';
  END LOOP;
END $$;