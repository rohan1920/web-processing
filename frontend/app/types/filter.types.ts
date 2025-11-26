export interface TextFilter {
  type: 'text';
  columnIndex: number;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'notContains';
  value: string;
  enabled: boolean;
}

export interface DateFilter {
  type: 'date';
  columnIndex: number;
  operator: 'equals' | 'before' | 'after' | 'between';
  value: string; // ISO date string
  value2?: string; // For 'between' operator
  enabled: boolean;
}

export interface AmountFilter {
  type: 'amount';
  columnIndex: number;
  operator: 'equals' | 'greaterThan' | 'lessThan' | 'between';
  value: number;
  value2?: number; // For 'between' operator
  enabled: boolean;
}

export type Filter = TextFilter | DateFilter | AmountFilter;

export interface SavedFilter {
  id: string;
  name: string;
  filters: Filter[];
  createdAt: string;
}

export interface FilterConfig {
  filters: Filter[];
  savedFilters: SavedFilter[];
}

