-- Billing Mobile — business master tables

CREATE TABLE public.financial_year (
  financial_year_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(20) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id),
  updated_by uuid REFERENCES auth.users (id)
);

CREATE TABLE public.name_board (
  name_board_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(200) NOT NULL,
  code varchar(50) NOT NULL UNIQUE,
  owner_name varchar(200) NOT NULL,
  owner_phone varchar(20),
  is_enabled boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id),
  updated_by uuid REFERENCES auth.users (id)
);

CREATE TABLE public.truck (
  truck_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  truck_number varchar(20) NOT NULL UNIQUE,
  name_board_id int NOT NULL REFERENCES public.name_board (name_board_id),
  is_enabled boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id),
  updated_by uuid REFERENCES auth.users (id)
);

CREATE TABLE public.location (
  location_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(50) NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id),
  updated_by uuid REFERENCES auth.users (id)
);

CREATE TABLE public.party (
  party_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(50) NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id),
  updated_by uuid REFERENCES auth.users (id)
);

CREATE TABLE public.goods (
  goods_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(50) NOT NULL UNIQUE,
  name varchar(200) NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id),
  updated_by uuid REFERENCES auth.users (id)
);

CREATE TABLE public.unit (
  unit_id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code varchar(50) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  is_fixed boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users (id),
  updated_by uuid REFERENCES auth.users (id)
);

CREATE INDEX truck_name_board_id_idx ON public.truck (name_board_id);
CREATE INDEX name_board_name_trgm_idx ON public.name_board USING gin (name extensions.gin_trgm_ops);
CREATE INDEX party_name_trgm_idx ON public.party USING gin (name extensions.gin_trgm_ops);
CREATE INDEX location_name_trgm_idx ON public.location USING gin (name extensions.gin_trgm_ops);
