-- Eliminar todas las políticas existentes de profiles
DROP POLICY IF EXISTS "public_read" ON profiles;
DROP POLICY IF EXISTS "user_update_own" ON profiles;
DROP POLICY IF EXISTS "user_insert_own" ON profiles;
DROP POLICY IF EXISTS "select_own" ON profiles;
DROP POLICY IF EXISTS "insert_own" ON profiles;
DROP POLICY IF EXISTS "update_own" ON profiles;
DROP POLICY IF EXISTS "delete_own" ON profiles;

-- Crear política que permita a TODOS leer profiles (necesario para login)
CREATE POLICY "public_read_profiles" ON profiles 
  FOR SELECT 
  USING (true);

-- Crear política para que usuarios autenticados puedan actualizar su propio perfil
CREATE POLICY "auth_update_own_profile" ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Crear política para insertar perfiles (trigger lo maneja, pero por si acaso)
CREATE POLICY "auth_insert_own_profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);