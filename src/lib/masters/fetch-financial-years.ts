import { supabase } from '@/lib/supabase';
import type { FinancialYear } from '@/types/financial-year';

export async function fetchFinancialYears(): Promise<FinancialYear[]> {
  const { data, error } = await supabase
    .from('financial_year')
    .select('financial_year_id, code, name')
    .eq('is_enabled', true)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('code', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as FinancialYear[];
}
