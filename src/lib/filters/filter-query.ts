import { parseIsoDate, toIsoDate } from '@/lib/bills/bill-form';
import { createQueryFilterClause } from '@/types/entity-query-filter';
import type { QueryFilterClause, QueryFilterField } from '@/types/entity-query-filter';

/** Inclusive lower bound on `v_bills.bill_date`. Omitted when start date is empty. */
export const BILL_DATE_FROM_PARAM = 'bill_date_gte';
/** Inclusive upper bound on `v_bills.bill_date`. Omitted when end date is empty. */
export const BILL_DATE_TO_PARAM = 'bill_date_lte';

export type FilterQueryDates = {
  startDate: Date | null;
  endDate: Date | null;
};

export type ParsedFilterQuery = {
  clauses: QueryFilterClause[];
  startDate: Date | null;
  endDate: Date | null;
};

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && parseIsoDate(value) != null;
}

export function serializeFilterQuery(
  clauses: QueryFilterClause[],
  dates: FilterQueryDates = { startDate: null, endDate: null }
): string {
  const params = new URLSearchParams();

  if (dates.startDate) {
    params.set(BILL_DATE_FROM_PARAM, toIsoDate(dates.startDate));
  }
  if (dates.endDate) {
    params.set(BILL_DATE_TO_PARAM, toIsoDate(dates.endDate));
  }

  for (const clause of clauses) {
    const key = clause.fieldKey?.trim();
    const value = clause.value.trim();
    if (!key || !value) {
      continue;
    }
    params.append(key, value);
  }

  return params.toString();
}

export function parseFilterQuery(
  query: string | null | undefined,
  fields: QueryFilterField[]
): ParsedFilterQuery {
  const allowed = new Map(fields.map((field) => [field.key, field]));
  const params = new URLSearchParams(query ?? '');
  const clauses: QueryFilterClause[] = [];
  const seen = new Set<string>();

  const fromRaw = params.get(BILL_DATE_FROM_PARAM)?.trim() ?? '';
  const toRaw = params.get(BILL_DATE_TO_PARAM)?.trim() ?? '';

  for (const [key, value] of params.entries()) {
    if (key === BILL_DATE_FROM_PARAM || key === BILL_DATE_TO_PARAM) {
      continue;
    }
    if (!allowed.has(key) || seen.has(key) || !value.trim()) {
      continue;
    }
    seen.add(key);
    clauses.push(
      createQueryFilterClause({
        fieldKey: key,
        value: value.trim(),
      })
    );
  }

  return {
    clauses,
    startDate: fromRaw && isIsoDate(fromRaw) ? parseIsoDate(fromRaw) : null,
    endDate: toRaw && isIsoDate(toRaw) ? parseIsoDate(toRaw) : null,
  };
}

export function clausesOrDefault(clauses: QueryFilterClause[]): QueryFilterClause[] {
  return clauses.length > 0 ? clauses : [createQueryFilterClause()];
}

export function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function applyFieldFilters<
  T extends {
    eq: (column: string, value: string) => T;
    ilike: (column: string, pattern: string) => T;
    gte: (column: string, value: string) => T;
    lte: (column: string, value: string) => T;
  },
>(query: T, filterQuery: string | null | undefined, fields: QueryFilterField[]): T {
  const allowed = new Map(fields.map((field) => [field.key, field]));
  const params = new URLSearchParams(filterQuery ?? '');
  let next = query;

  for (const [key, rawValue] of params.entries()) {
    const value = rawValue.trim();
    if (!value) {
      continue;
    }

    if (key === BILL_DATE_FROM_PARAM) {
      next = next.gte('bill_date', value);
      continue;
    }
    if (key === BILL_DATE_TO_PARAM) {
      next = next.lte('bill_date', value);
      continue;
    }

    const field = allowed.get(key);
    if (!field) {
      continue;
    }

    if (field.match === 'exact') {
      next = next.eq(key, value);
    } else {
      next = next.ilike(key, `%${escapeIlikePattern(value)}%`);
    }
  }

  return next;
}
