-- Billing Mobile — seed data (roles)
-- Loaded first via config.toml [db.seed] sql_paths, then:
--   seeds/01_name_board.sql  (base-app Trucks_details.csv)
--   seeds/02_truck.sql
--   seeds/03_other_masters.sql

INSERT INTO public.app_role (role_code, display_name)
VALUES
  ('admin', 'Administrator'),
  ('user', 'User')
ON CONFLICT (role_code) DO NOTHING;
