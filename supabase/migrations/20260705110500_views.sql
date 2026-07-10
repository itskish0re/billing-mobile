-- Billing Mobile — list views (security invoker so RLS applies)

CREATE OR REPLACE VIEW public.v_bills
WITH (security_invoker = true)
AS
SELECT
  b.bill_id,
  b.bill_number,
  b.bill_date,
  b.from_id,
  fl.name AS from_location_name,
  b.truck_id,
  t.truck_number,
  nb.name AS name_board_name,
  nb.owner_name,
  nb.owner_phone AS owner_mobile,
  b.driver_name,
  b.driver_mobile1,
  b.driver_mobile2,
  b.total_freight,
  b.commission,
  b.crossing,
  b.hand_loan,
  b.truck_loan,
  b.pay_by,
  b.paid_name,
  b.paid_mobile,
  b.office_mamul,
  b.tapal_mamul,
  b.diesel,
  COALESCE(
    (
      SELECT sum((elem ->> 'value')::numeric)
      FROM jsonb_array_elements(b.others) AS elem
      WHERE (elem ->> 'value') ~ '^-?[0-9]+(\.[0-9]+)?$'
    ),
    0
  ) AS others,
  b.total,
  b.is_cancelled,
  b.financial_year_id,
  b.created_at,
  b.updated_at
FROM public.bills b
JOIN public.location fl ON fl.location_id = b.from_id
JOIN public.truck t ON t.truck_id = b.truck_id
JOIN public.name_board nb ON nb.name_board_id = t.name_board_id
WHERE b.is_deleted = false;

CREATE OR REPLACE VIEW public.v_loads
WITH (security_invoker = true)
AS
SELECT
  l.load_id,
  l.bill_id,
  b.bill_number,
  l.load_number,
  l.consignor_id,
  pc.name AS consignor_name,
  l.consignee_id,
  pe.name AS consignee_name,
  l.as_per_bill,
  l.to_id,
  tl.name AS to_location_name,
  l.goods_id,
  g.name AS goods_name,
  l.unit_id,
  u.name AS unit_name,
  l.weight_or_quantity,
  l.rate_per_unit,
  l.freight,
  l.advance,
  l.topay,
  l.balance,
  l.is_active,
  l.financial_year_id,
  l.created_at,
  l.updated_at
FROM public.loads l
JOIN public.bills b ON b.bill_id = l.bill_id
JOIN public.party pc ON pc.party_id = l.consignor_id
LEFT JOIN public.party pe ON pe.party_id = l.consignee_id
JOIN public.location tl ON tl.location_id = l.to_id
JOIN public.goods g ON g.goods_id = l.goods_id
JOIN public.unit u ON u.unit_id = l.unit_id
WHERE l.is_deleted = false
  AND b.is_deleted = false;

GRANT SELECT ON public.v_bills TO authenticated;
GRANT SELECT ON public.v_loads TO authenticated;
