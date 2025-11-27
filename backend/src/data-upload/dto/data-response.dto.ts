export interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'date';
  sample: any;
}

export interface DataResponseDto {
  success: boolean;
  filename: string;
  originalName: string;
  rowCount: number;
  columns: ColumnInfo[];
  data: Record<string, any>[];
  error?: string;
}

