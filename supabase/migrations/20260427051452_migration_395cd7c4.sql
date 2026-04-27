-- Si el SET ROLE falló, intentar directamente deshabilitar RLS de nuevo
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;