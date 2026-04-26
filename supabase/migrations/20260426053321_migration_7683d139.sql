-- Agregar columna role a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Crear el perfil para el usuario admin existente
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '6482fba7-d42e-437a-ab68-ebba3d66aca4',
  'tubrujo@gmail.com',
  'Admin Tarot',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';