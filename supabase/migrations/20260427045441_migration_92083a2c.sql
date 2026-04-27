-- Crear política que permita leer TODOS los perfiles (necesario para login)
CREATE POLICY "allow_all_select" ON profiles FOR SELECT USING (true);