import { supabase } from '@/lib/supabase';
import type { UserFilterEntity } from '@/types/entity-query-filter';

export type UserFilterRow = {
  userFilterId: number;
  userId: string;
  entity: UserFilterEntity;
  filterQuery: string;
};

export async function fetchUserFilter(
  userId: string,
  entity: UserFilterEntity
): Promise<UserFilterRow | null> {
  const { data, error } = await supabase
    .from('user_filters')
    .select('user_filter_id, user_id, entity, filter_query')
    .eq('user_id', userId)
    .eq('entity', entity)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    userFilterId: data.user_filter_id,
    userId: data.user_id,
    entity: data.entity as UserFilterEntity,
    filterQuery: data.filter_query ?? '',
  };
}

export async function saveUserFilter(params: {
  userId: string;
  entity: UserFilterEntity;
  filterQuery: string;
}): Promise<UserFilterRow> {
  const { data, error } = await supabase
    .from('user_filters')
    .upsert(
      {
        user_id: params.userId,
        entity: params.entity,
        filter_query: params.filterQuery,
      },
      { onConflict: 'user_id,entity' }
    )
    .select('user_filter_id, user_id, entity, filter_query')
    .single();

  if (error) {
    throw error;
  }

  return {
    userFilterId: data.user_filter_id,
    userId: data.user_id,
    entity: data.entity as UserFilterEntity,
    filterQuery: data.filter_query ?? '',
  };
}
