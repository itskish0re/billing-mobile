-- Other business masters for mobile development
-- Base-app only ships CSV seeds for name_board + truck (see 01/02).
-- Goods and units are created in-app (no base-app seed data).

INSERT INTO public.financial_year (code, name)
VALUES
  ('2026-27', '2026-27'),
  ('2025-26', '2025-26'),
  ('2024-25', '2024-25')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  is_enabled = true,
  is_active = true,
  is_deleted = false,
  updated_at = now();

INSERT INTO public.location (code, name)
VALUES
  ('chennai', 'Chennai'),
  ('coimbatore', 'Coimbatore'),
  ('madurai', 'Madurai'),
  ('salem', 'Salem'),
  ('tirupur', 'Tirupur'),
  ('erode', 'Erode'),
  ('trichy', 'Trichy'),
  ('hosur', 'Hosur'),
  ('pondicherry', 'Pondicherry'),
  ('bangalore', 'Bangalore')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  is_enabled = true,
  is_active = true,
  is_deleted = false,
  updated_at = now();

INSERT INTO public.party (code, name)
VALUES
  ('acme_traders', 'Acme Traders'),
  ('southern_mills', 'Southern Mills Pvt Ltd'),
  ('green_fields', 'Green Fields Agro'),
  ('city_cement', 'City Cement Agencies'),
  ('omega_steels', 'Omega Steels'),
  ('pearl_exports', 'Pearl Exports'),
  ('river_side', 'River Side Warehouse'),
  ('north_star', 'North Star Logistics'),
  ('anbu_stores', 'Anbu Stores'),
  ('sakthi_agencies', 'Sakthi Agencies')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  is_enabled = true,
  is_active = true,
  is_deleted = false,
  updated_at = now();
