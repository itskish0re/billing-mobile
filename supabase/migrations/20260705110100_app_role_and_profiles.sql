-- Billing Mobile — roles, profiles, auth trigger

CREATE TABLE public.app_role (
  role_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_code public.app_role_code NOT NULL UNIQUE,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role_id int NOT NULL REFERENCES public.app_role (role_id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_role_id_idx ON public.profiles (role_id);

-- Create profile row when a user is added in Supabase Auth (Dashboard or API).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role_id int;
BEGIN
  SELECT role_id INTO default_role_id
  FROM public.app_role
  WHERE role_code = 'user';

  INSERT INTO public.profiles (id, full_name, role_id)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''),
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      (NULLIF(NEW.raw_app_meta_data ->> 'role_id', ''))::int,
      default_role_id
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
