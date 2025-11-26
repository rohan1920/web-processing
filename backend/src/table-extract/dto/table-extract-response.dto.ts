export interface TableCell {
  row: number;
  column: number;
  value: string;
}

export interface TableData {
  rows: number;
  columns: number;
  data: string[][];
  page?: number;
  table_index?: number;
}

export class TableExtractResponseDto {
  success: boolean;
  file_path: string;
  tables: TableData[];
}

