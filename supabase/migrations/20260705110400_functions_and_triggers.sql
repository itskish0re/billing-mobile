-- Billing Mobile — utility functions and triggers

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_app_role_updated_at
  BEFORE UPDATE ON public.app_role
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_financial_year_updated_at
  BEFORE UPDATE ON public.financial_year
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_name_board_updated_at
  BEFORE UPDATE ON public.name_board
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_truck_updated_at
  BEFORE UPDATE ON public.truck
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_location_updated_at
  BEFORE UPDATE ON public.location
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_party_updated_at
  BEFORE UPDATE ON public.party
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_goods_updated_at
  BEFORE UPDATE ON public.goods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_unit_updated_at
  BEFORE UPDATE ON public.unit
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_loads_updated_at
  BEFORE UPDATE ON public.loads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Free-tier heartbeat (ADR-010)
CREATE TABLE public._keep_alive_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pinged_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.heartbeat()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO _keep_alive_log DEFAULT VALUES;
  DELETE FROM _keep_alive_log WHERE pinged_at < now() - interval '30 days';
END;
$$;

GRANT EXECUTE ON FUNCTION public.heartbeat() TO anon, authenticated;

-- Suggest next bill number for a financial year (Home dashboard stat)
CREATE OR REPLACE FUNCTION public.suggest_next_bill_number(p_financial_year_id int)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  last_number text;
  numeric_part text;
  prefix text;
BEGIN
  SELECT bill_number INTO last_number
  FROM public.bills
  WHERE financial_year_id = p_financial_year_id
    AND is_deleted = false
  ORDER BY bill_id DESC
  LIMIT 1;

  IF last_number IS NULL THEN
    RETURN '1';
  END IF;

  IF last_number ~ '^[0-9]+$' THEN
    RETURN (last_number::bigint + 1)::text;
  END IF;

  numeric_part := substring(last_number from '[0-9]+$');
  IF numeric_part IS NOT NULL AND numeric_part <> '' THEN
    prefix := left(last_number, length(last_number) - length(numeric_part));
    RETURN prefix || (numeric_part::bigint + 1)::text;
  END IF;

  RETURN last_number || '1';
END;
$$;

GRANT EXECUTE ON FUNCTION public.suggest_next_bill_number(int) TO authenticated;

-- Auth helper for RLS
CREATE OR REPLACE FUNCTION public.is_authenticated_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_role_code()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.role_code::text
  FROM public.profiles p
  JOIN public.app_role r ON r.role_id = p.role_id
  WHERE p.id = auth.uid();
$$;
