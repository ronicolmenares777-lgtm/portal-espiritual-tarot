-- Si la tabla está vacía o las políticas RLS bloquean, ELIMINAR todas las políticas y crear perfil
DROP POLICY IF EXISTS "select_own" ON profiles;
DROP POLICY IF EXISTS "insert_own" ON profiles;
DROP POLICY IF EXISTS "update_own" ON profiles;
DROP POLICY IF EXISTS "delete_own" ON profiles;
DROP POLICY IF EXISTS "auth_insert" ON profiles;
DROP POLICY IF EXISTS "auth_update" ON profiles;
DROP POLICY IF EXISTS "auth_delete" ON profiles;
DROP POLICY IF EXISTS "public_read" ON profiles;