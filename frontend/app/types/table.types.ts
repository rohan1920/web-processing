export interface TableData {
  rows: number;
  columns: number;
  data: string[][];
  page?: number;
  table_index?: number;
}

export interface TableExtractResponse {
  success: boolean;
  file_path: string;
  tables: TableData[];
}

