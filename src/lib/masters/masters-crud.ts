import { MASTER_ENTITY_CONFIG } from '@/components/masters/masters-config';
import type { MasterListRow, MastersTab } from '@/components/masters/masters-types';
import { supabase } from '@/lib/supabase';

/** Dynamic master tables are not fully typed in Database yet. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export async function fetchMasterRows(tab: MastersTab): Promise<MasterListRow[]> {
  const config = MASTER_ENTITY_CONFIG[tab];
  const listFrom = config.listFrom ?? config.table;
  const isView = Boolean(config.listFrom);

  let query = db.from(listFrom).select('*');

  // Views like v_truck already filter soft-deleted rows.
  if (!isView) {
    query = query.eq('is_deleted', false);
  }

  const { data, error } = await query.order(config.idColumn, { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => config.mapRow(row));
}

async function mapInsertedRow(
  tab: MastersTab,
  row: Record<string, unknown>
): Promise<MasterListRow> {
  const config = MASTER_ENTITY_CONFIG[tab];
  const listFrom = config.listFrom;
  if (!listFrom) {
    return config.mapRow(row);
  }

  const id = row[config.idColumn];
  if (id == null) {
    return config.mapRow(row);
  }

  const { data: viewRow, error: viewError } = await db
    .from(listFrom)
    .select('*')
    .eq(config.idColumn, id)
    .maybeSingle();

  if (viewError || !viewRow) {
    return config.mapRow(row);
  }

  return config.mapRow(viewRow as Record<string, unknown>);
}

export async function createMasterRow(
  tab: MastersTab,
  values: Record<string, string>
): Promise<MasterListRow> {
  const config = MASTER_ENTITY_CONFIG[tab];
  const payload = config.toPayload(values);
  const { data, error } = await db.from(config.table).insert(payload).select('*').single();

  if (!error && data) {
    return mapInsertedRow(tab, data as Record<string, unknown>);
  }

  // Soft-deleted rows still occupy UNIQUE(code). Revive instead of failing.
  const code = typeof payload.code === 'string' ? payload.code : null;
  const isUniqueViolation =
    error?.code === '23505' || /duplicate key|unique constraint/i.test(error?.message ?? '');

  if (code && isUniqueViolation) {
    const { data: existing, error: lookupError } = await db
      .from(config.table)
      .select(config.idColumn)
      .eq('code', code)
      .eq('is_deleted', true)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existing?.[config.idColumn] != null) {
      const { data: revived, error: reviveError } = await db
        .from(config.table)
        .update({
          ...payload,
          is_deleted: false,
          deleted_at: null,
          is_active: true,
          is_enabled: true,
        })
        .eq(config.idColumn, existing[config.idColumn])
        .select('*')
        .single();

      if (reviveError) {
        throw reviveError;
      }

      return mapInsertedRow(tab, revived as Record<string, unknown>);
    }
  }

  throw error;
}

export async function updateMasterRow(
  tab: MastersTab,
  id: number,
  values: Record<string, string>
): Promise<void> {
  const config = MASTER_ENTITY_CONFIG[tab];
  const payload = config.toPayload(values);
  const { error } = await db.from(config.table).update(payload).eq(config.idColumn, id);

  if (error) {
    throw error;
  }
}

export async function softDeleteMasterRow(tab: MastersTab, id: number): Promise<void> {
  const config = MASTER_ENTITY_CONFIG[tab];
  const { error } = await db
    .from(config.table)
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      is_active: false,
      is_enabled: false,
    })
    .eq(config.idColumn, id);

  if (error) {
    throw error;
  }
}
