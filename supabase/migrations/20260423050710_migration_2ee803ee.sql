-- ELIMINAR trigger de auto-confirmación actual
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- CREAR función SIN auto-confirmación (para producción)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Solo crear perfil, NO auto-confirmar email
  INSERT INTO public.profiles (id, email) 
  VALUES (NEW.id, NEW.email) 
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- RECREAR trigger sin auto-confirmación
CREATE TRIGGER on_auth_user_created 
AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();