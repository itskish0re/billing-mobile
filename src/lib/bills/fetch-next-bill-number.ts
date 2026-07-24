import { supabase } from '@/lib/supabase';

export async function fetchNextBillNumber(financialYearId: number): Promise<string> {
  const { data, error } = await supabase.rpc('suggest_next_bill_number', {
    p_financial_year_id: financialYearId,
  });

  if (error) {
    throw error;
  }

  return data ?? '1';
}
