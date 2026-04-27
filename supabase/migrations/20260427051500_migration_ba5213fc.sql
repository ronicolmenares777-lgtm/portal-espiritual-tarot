-- Eliminar TODAS las políticas RLS que puedan existir
DROP POLICY IF EXISTS "Acceso público leer profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "allow_all_select" ON profiles;
DROP POLICY IF EXISTS "select_own" ON profiles;
DROP POLICY IF EXISTS "insert_own" ON profiles;
DROP POLICY IF EXISTS "update_own" ON profiles;
DROP POLICY IF EXISTS "delete_own" ON profiles;
DROP POLICY IF EXISTS "public_read" ON profiles;
DROP POLICY IF EXISTS "auth_insert" ON profiles;
DROP POLICY IF EXISTS "auth_update" ON profiles;
DROP POLICY IF EXISTS "auth_delete" ON profiles;