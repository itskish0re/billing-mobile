import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export async function updateProfileName(userId: string, fullName: string): Promise<void> {
  const trimmedName = fullName.trim();

  if (!trimmedName) {
    throw new Error('Name cannot be empty.');
  }

  const updatePayload: Database['public']['Tables']['profiles']['Update'] = {
    full_name: trimmedName,
  };

  const { error } = await supabase.from('profiles').update(updatePayload).eq('id', userId);

  if (error) {
    throw error;
  }
}
