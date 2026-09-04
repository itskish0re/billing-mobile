-- One-round-trip bill + load write. Client saves were 2–6 sequential REST calls.

CREATE OR REPLACE FUNCTION public.save_bill(p_bill jsonb, p_loads jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_bill_id integer;
  v_user uuid := auth.uid();
  v_load jsonb;
  v_ord integer;
  v_fy integer;
BEGIN
  IF p_bill IS NULL OR p_loads IS NULL OR jsonb_typeof(p_loads) <> 'array' THEN
    RAISE EXCEPTION 'Invalid bill payload' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_loads) < 1 OR jsonb_array_length(p_loads) > 3 THEN
    RAISE EXCEPTION 'A bill must have between 1 and 3 loads' USING ERRCODE = '22023';
  END IF;

  v_fy := (p_bill->>'financial_year_id')::integer;

  IF (p_bill->>'bill_id') IS NOT NULL THEN
    v_bill_id := (p_bill->>'bill_id')::integer;

    UPDATE public.bills
    SET
      bill_number = p_bill->>'bill_number',
      bill_date = (p_bill->>'bill_date')::date,
      from_id = (p_bill->>'from_id')::integer,
      truck_id = (p_bill->>'truck_id')::integer,
      driver_name = COALESCE(p_bill->>'driver_name', ''),
      driver_mobile1 = NULLIF(p_bill->>'driver_mobile1', ''),
      driver_mobile2 = NULLIF(p_bill->>'driver_mobile2', ''),
      total_freight = COALESCE((p_bill->>'total_freight')::numeric, 0),
      commission = COALESCE((p_bill->>'commission')::numeric, 0),
      crossing = COALESCE((p_bill->>'crossing')::numeric, 0),
      hand_loan = COALESCE((p_bill->>'hand_loan')::numeric, 0),
      truck_loan = COALESCE((p_bill->>'truck_loan')::boolean, false),
      pay_by = NULLIF(p_bill->>'pay_by', '')::public.bill_pay_by,
      paid_name = NULLIF(p_bill->>'paid_name', ''),
      paid_mobile = NULLIF(p_bill->>'paid_mobile', ''),
      office_mamul = COALESCE((p_bill->>'office_mamul')::numeric, 0),
      tapal_mamul = COALESCE((p_bill->>'tapal_mamul')::numeric, 0),
      diesel = COALESCE((p_bill->>'diesel')::numeric, 0),
      others = COALESCE(p_bill->'others', '[]'::jsonb),
      total = COALESCE((p_bill->>'total')::numeric, 0),
      is_cancelled = COALESCE((p_bill->>'is_cancelled')::boolean, false),
      financial_year_id = v_fy,
      updated_by = v_user
    WHERE bill_id = v_bill_id
      AND is_deleted = false;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Bill not found' USING ERRCODE = 'P0002';
    END IF;

    DELETE FROM public.loads WHERE bill_id = v_bill_id;
  ELSE
    INSERT INTO public.bills (
      bill_number,
      bill_date,
      from_id,
      truck_id,
      driver_name,
      driver_mobile1,
      driver_mobile2,
      total_freight,
      commission,
      crossing,
      hand_loan,
      truck_loan,
      pay_by,
      paid_name,
      paid_mobile,
      office_mamul,
      tapal_mamul,
      diesel,
      others,
      total,
      is_cancelled,
      financial_year_id,
      created_by,
      updated_by
    )
    VALUES (
      p_bill->>'bill_number',
      (p_bill->>'bill_date')::date,
      (p_bill->>'from_id')::integer,
      (p_bill->>'truck_id')::integer,
      COALESCE(p_bill->>'driver_name', ''),
      NULLIF(p_bill->>'driver_mobile1', ''),
      NULLIF(p_bill->>'driver_mobile2', ''),
      COALESCE((p_bill->>'total_freight')::numeric, 0),
      COALESCE((p_bill->>'commission')::numeric, 0),
      COALESCE((p_bill->>'crossing')::numeric, 0),
      COALESCE((p_bill->>'hand_loan')::numeric, 0),
      COALESCE((p_bill->>'truck_loan')::boolean, false),
      NULLIF(p_bill->>'pay_by', '')::public.bill_pay_by,
      NULLIF(p_bill->>'paid_name', ''),
      NULLIF(p_bill->>'paid_mobile', ''),
      COALESCE((p_bill->>'office_mamul')::numeric, 0),
      COALESCE((p_bill->>'tapal_mamul')::numeric, 0),
      COALESCE((p_bill->>'diesel')::numeric, 0),
      COALESCE(p_bill->'others', '[]'::jsonb),
      COALESCE((p_bill->>'total')::numeric, 0),
      COALESCE((p_bill->>'is_cancelled')::boolean, false),
      v_fy,
      v_user,
      v_user
    )
    RETURNING bill_id INTO v_bill_id;
  END IF;

  FOR v_load, v_ord IN
    SELECT value, ordinality::integer
    FROM jsonb_array_elements(p_loads) WITH ORDINALITY
  LOOP
    INSERT INTO public.loads (
      bill_id,
      load_number,
      consignor_id,
      consignee_id,
      as_per_bill,
      to_id,
      goods_id,
      unit_id,
      weight_or_quantity,
      rate_per_unit,
      freight,
      advance,
      topay,
      balance,
      financial_year_id,
      created_by,
      updated_by
    )
    VALUES (
      v_bill_id,
      v_ord,
      (v_load->>'consignor_id')::integer,
      NULLIF(v_load->>'consignee_id', '')::integer,
      COALESCE((v_load->>'as_per_bill')::boolean, false),
      (v_load->>'to_id')::integer,
      (v_load->>'goods_id')::integer,
      (v_load->>'unit_id')::integer,
      COALESCE((v_load->>'weight_or_quantity')::numeric, 0),
      COALESCE((v_load->>'rate_per_unit')::numeric, 0),
      COALESCE((v_load->>'freight')::numeric, 0),
      COALESCE((v_load->>'advance')::numeric, 0),
      COALESCE((v_load->>'topay')::numeric, 0),
      COALESCE((v_load->>'balance')::numeric, 0),
      v_fy,
      v_user,
      v_user
    );
  END LOOP;

  RETURN v_bill_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_bill(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_bill(jsonb, jsonb) TO authenticated;
