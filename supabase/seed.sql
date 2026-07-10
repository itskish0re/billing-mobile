-- Billing Mobile — seed data (roles + default financial year)
-- Runs on `supabase db reset` locally. For remote, apply once after migrations.

INSERT INTO public.app_role (role_code, display_name)
VALUES
  ('admin', 'Administrator'),
  ('user', 'User')
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO public.financial_year (code, name)
VALUES ('2025-26', '2025-26')
ON CONFLICT (code) DO NOTHING;
