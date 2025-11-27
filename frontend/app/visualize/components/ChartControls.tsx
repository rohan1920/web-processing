'use client';

import { ChartType, ColumnInfo } from '../../types/data.types';

interface ChartControlsProps {
  columns: ColumnInfo[];
  chartType: ChartType;
  xAxis: string;
  yAxis: string;
  onChartTypeChange: (type: ChartType) => void;
  onXAxisChange: (column: string) => void;
  onYAxisChange: (column: string) => void;
}

const chartTypes: { value: ChartType; label: string; icon: string }[] = [
  { value: 'bar', label: 'Bar Chart', icon: '📊' },
  { value: 'line', label: 'Line Chart', icon: '📈' },
  { value: 'pie', label: 'Pie Chart', icon: '🥧' },
  { value: 'area', label: 'Area Chart', icon: '📉' },
];

export default function ChartControls({
  columns,
  chartType,
  xAxis,
  yAxis,
  onChartTypeChange,
  onXAxisChange,
  onYAxisChange,
}: ChartControlsProps) {
  const numericColumns = columns.filter((c) => c.type === 'number');
  const allColumns = columns;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Chart Settings
      </h3>

      {/* Chart Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Chart Type</label>
        <div className="grid grid-cols-2 gap-2">
          {chartTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onChartTypeChange(type.value)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200
                ${chartType === type.value
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-xl">{type.icon}</span>
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* X-Axis Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          X-Axis (Category)
        </label>
        <select
          value={xAxis}
          onChange={(e) => onXAxisChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
        >
          <option value="">Select column...</option>
          {allColumns.map((col) => (
            <option key={col.name} value={col.name}>
              {col.name} ({col.type})
            </option>
          ))}
        </select>
      </div>

      {/* Y-Axis Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Y-Axis (Value)
        </label>
        <select
          value={yAxis}
          onChange={(e) => onYAxisChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
        >
          <option value="">Select column...</option>
          {numericColumns.length > 0 ? (
            numericColumns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))
          ) : (
            allColumns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.type})
              </option>
            ))
          )}
        </select>
        {numericColumns.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ No numeric columns detected. Charts may not display correctly.
          </p>
        )}
      </div>

      {/* Data Info */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Available Columns</h4>
        <div className="flex flex-wrap gap-2">
          {columns.map((col) => (
            <span
              key={col.name}
              className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${col.type === 'number' ? 'bg-blue-100 text-blue-700' : ''}
                ${col.type === 'string' ? 'bg-gray-100 text-gray-700' : ''}
                ${col.type === 'date' ? 'bg-purple-100 text-purple-700' : ''}
              `}
            >
              {col.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

