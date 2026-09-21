-- Reset the password for an existing Billing app user.
-- Run in Dashboard → SQL Editor (postgres role).
-- Also drops active sessions so the old password cannot keep a live session.

DO $$
DECLARE
  -- === EDIT THESE ===
  v_email    text := 'user@example.com';
  v_password text := 'change-me';
  -- === END EDIT ===

  v_user_id uuid;
BEGIN
  v_email := lower(trim(v_email));

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Set v_email to the existing user email.';
  END IF;

  IF v_password IS NULL OR length(v_password) < 6 THEN
    RAISE EXCEPTION 'Set v_password to at least 6 characters.';
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = v_email
    AND is_sso_user = false
    AND deleted_at IS NULL;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found for email: %', v_email;
  END IF;

  UPDATE auth.users
  SET
    encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf', 10)),
    recovery_token = '',
    recovery_sent_at = NULL,
    email_change = '',
    email_change_token_new = '',
    email_change_token_current = '',
    updated_at = now()
  WHERE id = v_user_id;

  DELETE FROM auth.sessions
  WHERE user_id = v_user_id;

  RAISE NOTICE 'Password updated for % (id %). Existing sessions revoked.', v_email, v_user_id;
END
$$;
