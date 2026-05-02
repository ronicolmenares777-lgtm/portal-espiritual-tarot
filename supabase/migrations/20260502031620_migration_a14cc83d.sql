-- Crear política para permitir listar buckets públicos
DROP POLICY IF EXISTS "Allow public to list public buckets" ON storage.buckets;

CREATE POLICY "Allow public to list public buckets"
ON storage.buckets FOR SELECT
TO public
USING (public = true);