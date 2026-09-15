export type UserFilterEntity = 'bill';

export type QueryFilterMatch = 'exact' | 'contains';

export type QueryFilterField = {
  id: number;
  key: string;
  label: string;
  match: QueryFilterMatch;
};

export type QueryFilterClause = {
  id: string;
  fieldKey: string | null;
  value: string;
};

let clauseSeq = 0;

export function createQueryFilterClause(
  partial?: Partial<QueryFilterClause>
): QueryFilterClause {
  clauseSeq += 1;
  return {
    id: `filter-${clauseSeq}`,
    fieldKey: null,
    value: '',
    ...partial,
  };
}
