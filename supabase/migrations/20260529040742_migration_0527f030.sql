-- Crear políticas RLS simples y funcionales SIN recursión
-- LECTURA: Todos pueden leer todos los perfiles
CREATE POLICY "allow_read_all" ON profiles
  FOR SELECT
  USING (true);

-- INSERCIÓN: Solo usuarios autenticados pueden crear su propio perfil
CREATE POLICY "allow_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ACTUALIZACIÓN: Solo el dueño puede actualizar su perfil
CREATE POLICY "allow_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ELIMINACIÓN: Solo el dueño puede eliminar su perfil  
CREATE POLICY "allow_delete_own" ON profiles
  FOR DELETE
  USING (auth.uid() = id);