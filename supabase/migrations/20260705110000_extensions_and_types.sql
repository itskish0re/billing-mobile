-- Billing Mobile — extensions and enum types

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE TYPE public.bill_pay_by AS ENUM ('upi', 'cash', 'owner');

CREATE TYPE public.app_role_code AS ENUM ('admin', 'user');
