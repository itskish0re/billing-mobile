import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/auth';

type ProfileRow = {
  id: string;
  full_name: string;
  role_id: number;
  is_active: boolean;
  app_role: {
    role_code: 'admin' | 'user';
    display_name: string;
  } | null;
};

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role_id, is_active, app_role(role_code, display_name)')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as ProfileRow;

  if (!row.app_role) {
    return null;
  }

  return {
    id: row.id,
    full_name: row.full_name,
    role_id: row.role_id,
    is_active: row.is_active,
    role_code: row.app_role.role_code,
    role_display_name: row.app_role.display_name,
  };
}
