export interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'date';
  sample: any;
}

export interface DataResponse {
  success: boolean;
  filename: string;
  originalName: string;
  rowCount: number;
  columns: ColumnInfo[];
  data: Record<string, any>[];
  error?: string;
}

export type ChartType = 'bar' | 'line' | 'pie' | 'area';

export interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxis: string;
  title?: string;
}

