-- Truck list view with name board name (security invoker so RLS applies)

CREATE OR REPLACE VIEW public.v_truck
WITH (security_invoker = true)
AS
SELECT
  t.truck_id,
  t.truck_number,
  t.name_board_id,
  nb.name AS name_board_name,
  nb.code AS name_board_code,
  nb.owner_name,
  nb.owner_phone,
  t.is_enabled,
  t.is_active,
  t.is_deleted,
  t.created_at,
  t.updated_at
FROM public.truck t
JOIN public.name_board nb ON nb.name_board_id = t.name_board_id
WHERE t.is_deleted = false
  AND nb.is_deleted = false;

GRANT SELECT ON public.v_truck TO authenticated;
