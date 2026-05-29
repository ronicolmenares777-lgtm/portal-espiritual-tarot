-- Eliminar TODAS las políticas RLS de profiles para empezar limpio
DROP POLICY IF EXISTS "Acceso público profiles" ON profiles;
DROP POLICY IF EXISTS "Acceso público crear profiles" ON profiles;
DROP POLICY IF EXISTS "Permitir crear profiles" ON profiles;
DROP POLICY IF EXISTS "Permitir leer profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "auth_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "auth_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "public_read_profiles" ON profiles;