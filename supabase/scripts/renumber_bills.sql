-- Renumber existing bills for one financial year, keeping their current order.
-- Run in Dashboard → SQL Editor (postgres role).
--
-- Example: financial year 1 has bills 1, 2, 3, 4, 5 and v_start = 51.
-- Those bills become 51, 52, 53, 54, 55. Other years are left unchanged.
--
-- Loads are unchanged; they follow bill_id, not bill_number.
-- The next suggested number for that year is one past the new highest number.

DO $$
DECLARE
  -- === EDIT THIS ===
  v_financial_year_id int := 1;
  v_start bigint := 51;
  -- === END EDIT ===

  v_count int;
  v_year_code text;
BEGIN
  IF v_financial_year_id IS NULL OR v_financial_year_id < 1 THEN
    RAISE EXCEPTION 'Set v_financial_year_id to a financial year id.';
  END IF;

  IF v_start IS NULL OR v_start < 1 THEN
    RAISE EXCEPTION 'Set v_start to a positive bill number.';
  END IF;

  SELECT code INTO v_year_code
  FROM public.financial_year
  WHERE financial_year_id = v_financial_year_id;

  IF v_year_code IS NULL THEN
    RAISE EXCEPTION 'No financial year found for id %.', v_financial_year_id;
  END IF;

  CREATE TEMP TABLE bill_renumber ON COMMIT DROP AS
  SELECT
    bill_id,
    (
      v_start
      + row_number() OVER (
        ORDER BY
          CASE
            WHEN bill_number ~ '^[0-9]+$' THEN bill_number::bigint
          END,
          bill_id
      )
      - 1
    )::text AS new_number
  FROM public.bills
  WHERE financial_year_id = v_financial_year_id;

  SELECT count(*) INTO v_count FROM bill_renumber;

  IF v_count = 0 THEN
    RAISE EXCEPTION 'Financial year % (%) has no bills to renumber.', v_year_code, v_financial_year_id;
  END IF;

  -- Free the unique (financial_year_id, bill_number) values before assigning
  -- the new sequence. A direct update can collide, for example 1 → 2 while 2
  -- still exists.
  UPDATE public.bills AS bill
  SET
    bill_number = 'tmp-' || bill.bill_id::text,
    updated_at = now()
  FROM bill_renumber AS renumber
  WHERE bill.bill_id = renumber.bill_id;

  UPDATE public.bills AS bill
  SET
    bill_number = renumber.new_number,
    updated_at = now()
  FROM bill_renumber AS renumber
  WHERE bill.bill_id = renumber.bill_id;

  RAISE NOTICE
    'Renumbered % bill(s) in financial year % (%), starting at %.',
    v_count,
    v_year_code,
    v_financial_year_id,
    v_start;
END
$$;
