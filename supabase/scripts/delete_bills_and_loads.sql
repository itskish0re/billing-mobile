-- Delete every bill and its loads so billing can be tested from a clean slate.
-- Run in Dashboard → SQL Editor (postgres role).
--
-- Masters (party, truck, location, goods, unit, financial year),
-- users, and profiles are left in place.
-- Loads reference bills with ON DELETE CASCADE; truncating bills
-- removes the loads as well. Identities restart at 1.

TRUNCATE TABLE public.bills RESTART IDENTITY CASCADE;
