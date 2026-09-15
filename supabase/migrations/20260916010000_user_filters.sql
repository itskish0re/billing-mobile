-- Per-user saved list filters, keyed by entity (bill, later loads, etc.)

CREATE TABLE public.user_filters (
  user_filter_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  entity varchar(50) NOT NULL,
  filter_query text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_filters_user_entity_key UNIQUE (user_id, entity),
  CONSTRAINT user_filters_entity_not_blank CHECK (char_length(trim(entity)) > 0)
);

CREATE INDEX user_filters_user_id_idx ON public.user_filters (user_id);

CREATE TRIGGER set_user_filters_updated_at
  BEFORE UPDATE ON public.user_filters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_filters_select_own
  ON public.user_filters
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND public.is_authenticated_active_user());

CREATE POLICY user_filters_insert_own
  ON public.user_filters
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_authenticated_active_user());

CREATE POLICY user_filters_update_own
  ON public.user_filters
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND public.is_authenticated_active_user())
  WITH CHECK (user_id = auth.uid() AND public.is_authenticated_active_user());

CREATE POLICY user_filters_delete_own
  ON public.user_filters
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND public.is_authenticated_active_user());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_filters TO authenticated;

DO $$
DECLARE
  seq_name text;
BEGIN
  seq_name := pg_get_serial_sequence('public.user_filters', 'user_filter_id');
  IF seq_name IS NOT NULL THEN
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO authenticated', seq_name);
  END IF;
END $$;
