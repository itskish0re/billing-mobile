export type MastersTab =
  | 'name-boards'
  | 'trucks'
  | 'locations'
  | 'parties'
  | 'goods'
  | 'units'
  | 'financial-years';

export type MasterFieldKey = string;

export type MasterFormField = {
  key: MasterFieldKey;
  label: string;
  required?: boolean;
  /** Hint shown under the field. */
  supportingText?: string;
  keyboardType?: 'default' | 'phone' | 'number';
  /**
   * When set, the form renders a master lookup dropdown.
   * Field value stores the selected row id as a string.
   */
  lookupTab?: MastersTab;
  /** Key in row.values used as the dropdown display label (edit mode). */
  lookupLabelKey?: string;
};

export type MasterListRow = {
  id: number;
  title: string;
  subtitle?: string;
  meta?: string;
  /** Raw record fields for edit forms. */
  values: Record<string, string>;
};

export type MasterEntityConfig = {
  tab: MastersTab;
  /** Table used for insert / update / soft-delete. */
  table: string;
  /**
   * Optional list source (view or table). Defaults to `table`.
   * Use a view when the card needs joined display fields.
   */
  listFrom?: string;
  idColumn: string;
  labelSingular: string;
  labelPlural: string;
  formFields: MasterFormField[];
  /** Map DB row → list card presentation. */
  mapRow: (row: Record<string, unknown>) => MasterListRow;
  /** Build insert/update payload from form values. */
  toPayload: (values: Record<string, string>) => Record<string, unknown>;
};
