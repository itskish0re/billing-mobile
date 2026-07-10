-- Billing Mobile — row level security

ALTER TABLE public.app_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_year ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.name_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truck ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._keep_alive_log ENABLE ROW LEVEL SECURITY;

-- app_role: read-only for authenticated users
CREATE POLICY app_role_select_authenticated
  ON public.app_role
  FOR SELECT
  TO authenticated
  USING (public.is_authenticated_active_user());

-- profiles: users read own row; all authenticated can read names for display
CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_authenticated_active_user());

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() AND public.is_authenticated_active_user())
  WITH CHECK (id = auth.uid() AND public.is_authenticated_active_user());

-- Generic authenticated CRUD for business tables (admin + user same access in v1)
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'financial_year',
    'name_board',
    'truck',
    'location',
    'party',
    'goods',
    'unit',
    'bills',
    'loads'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_authenticated_active_user())',
      tbl || '_select',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_authenticated_active_user())',
      tbl || '_insert',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_authenticated_active_user()) WITH CHECK (public.is_authenticated_active_user())',
      tbl || '_update',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_authenticated_active_user())',
      tbl || '_delete',
      tbl
    );
  END LOOP;
END;
$$;

-- Heartbeat log: no direct access; function is SECURITY DEFINER
CREATE POLICY keep_alive_no_access
  ON public._keep_alive_log
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);
