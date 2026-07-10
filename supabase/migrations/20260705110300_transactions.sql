-- Billing Mobile — bills and loads (transactions)

CREATE TABLE public.bills (
  bill_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bill_number varchar(50) NOT NULL,
  bill_date date NOT NULL,
  from_id int NOT NULL REFERENCES public.location (location_id),
  truck_id int NOT NULL REFERENCES public.truck (truck_id),
  driver_name varchar(200) NOT NULL DEFAULT '',
  driver_mobile1 varchar(20),
  driver_mobile2 varchar(20),
  total_freight numeric(14, 2) NOT NULL DEFAULT 0,
  commission numeric(14, 2) NOT NULL DEFAULT 0,
  crossing numeric(14, 2) NOT NULL DEFAULT 0,
  hand_loan numeric(14, 2) NOT NULL DEFAULT 0,
  truck_loan boolean NOT NULL DEFAULT false,
  pay_by public.bill_pay_by,
  paid_name varchar(200),
  paid_mobile varchar(20),
  office_mamul numeric(14, 2) NOT NULL DEFAULT 0,
  tapal_mamul numeric(14, 2) NOT NULL DEFAULT 0,
  diesel numeric(14, 2) NOT NULL DEFAULT 0,
  others jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(14, 2) NOT NULL DEFAULT 0,
  is_cancelled boolean NOT NULL DEFAULT false,
  financial_year_id int NOT NULL REFERENCES public.financial_year (financial_year_id),
  is_enabled boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id),
  updated_by uuid REFERENCES auth.users (id),
  CONSTRAINT bills_financial_year_bill_number_key UNIQUE (financial_year_id, bill_number)
);

CREATE TABLE public.loads (
  load_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bill_id int NOT NULL REFERENCES public.bills (bill_id) ON DELETE CASCADE,
  load_number smallint NOT NULL,
  consignor_id int NOT NULL REFERENCES public.party (party_id),
  consignee_id int REFERENCES public.party (party_id),
  as_per_bill boolean NOT NULL DEFAULT false,
  to_id int NOT NULL REFERENCES public.location (location_id),
  goods_id int NOT NULL REFERENCES public.goods (goods_id),
  unit_id int NOT NULL REFERENCES public.unit (unit_id),
  weight_or_quantity numeric(14, 3) NOT NULL DEFAULT 0,
  rate_per_unit numeric(14, 2) NOT NULL DEFAULT 0,
  freight numeric(14, 2) NOT NULL DEFAULT 0,
  advance numeric(14, 2) NOT NULL DEFAULT 0,
  topay numeric(14, 2) NOT NULL DEFAULT 0,
  balance numeric(14, 2) NOT NULL DEFAULT 0,
  financial_year_id int NOT NULL REFERENCES public.financial_year (financial_year_id),
  is_active boolean NOT NULL DEFAULT true,
  is_enabled boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id),
  updated_by uuid REFERENCES auth.users (id),
  CONSTRAINT loads_bill_load_number_key UNIQUE (bill_id, load_number),
  CONSTRAINT loads_load_number_check CHECK (load_number BETWEEN 1 AND 3)
);

CREATE INDEX bills_financial_year_id_idx ON public.bills (financial_year_id);
CREATE INDEX bills_bill_date_idx ON public.bills (bill_date DESC);
CREATE INDEX bills_truck_id_idx ON public.bills (truck_id);
CREATE INDEX loads_bill_id_idx ON public.loads (bill_id);
CREATE INDEX loads_financial_year_id_idx ON public.loads (financial_year_id);
