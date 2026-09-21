-- Create a confirmed email/password user for the Billing app.
-- Run in Dashboard → SQL Editor (postgres role).
-- Public sign-up is disabled; this is the admin provisioning path.
--
-- The `handle_new_user` trigger inserts `public.profiles` from:
--   raw_user_meta_data.full_name  → profiles.full_name
--   raw_app_meta_data.role_id     → profiles.role_id  (admin=1, user=2 after seed)

DO $$
DECLARE
  -- === EDIT THESE ===
  v_email     text := 'user@example.com';
  v_password  text := 'change-me';
  v_full_name text := 'Display Name';
  v_role_code public.app_role_code := 'user'; -- 'admin' or 'user'
  -- === END EDIT ===

  v_user_id uuid := gen_random_uuid();
  v_now     timestamptz := now();
  v_role_id int;
BEGIN
  v_email := lower(trim(v_email));

  IF v_email IS NULL OR v_email = '' OR position('@' IN v_email) = 0 THEN
    RAISE EXCEPTION 'Set v_email to a valid email address.';
  END IF;

  IF v_password IS NULL OR length(v_password) < 6 THEN
    RAISE EXCEPTION 'Set v_password to at least 6 characters.';
  END IF;

  IF exists (SELECT 1 FROM auth.users WHERE lower(email) = v_email AND is_sso_user = false) THEN
    RAISE EXCEPTION 'User already exists: %', v_email;
  END IF;

  SELECT role_id INTO STRICT v_role_id
  FROM public.app_role
  WHERE role_code = v_role_code;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_sso_user,
    is_anonymous
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_email,
    extensions.crypt(v_password, extensions.gen_salt('bf', 10)),
    v_now,
    '',
    '',
    '',
    '',
    '',
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'role_id', v_role_id
    ),
    jsonb_build_object(
      'full_name', v_full_name,
      'email_verified', true
    ),
    v_now,
    v_now,
    false,
    false
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    v_user_id,
    v_user_id::text,
    'email',
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false
    ),
    v_now,
    v_now,
    v_now
  );

  RAISE NOTICE 'Created user % (id %, role % / role_id %).', v_email, v_user_id, v_role_code, v_role_id;
END
$$;
