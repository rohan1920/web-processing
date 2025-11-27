'use client';

import { useState } from 'react';
import Link from 'next/link';
import DataDropzone from './components/DataDropzone';
import ChartDisplay from './components/ChartDisplay';
import ChartControls from './components/ChartControls';
import DataTable from './components/DataTable';
import { dataUploadService } from '../services/api.service';
import { DataResponse, ChartType, ColumnInfo } from '../types/data.types';

export default function VisualizePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataResponse, setDataResponse] = useState<DataResponse | null>(null);
  
  // Chart configuration
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [showTable, setShowTable] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await dataUploadService.uploadData(file);
      setDataResponse(response);

      // Auto-select axes if possible
      if (response.columns.length > 0) {
        setXAxis(response.columns[0].name);
        
        const numericCol = response.columns.find((c) => c.type === 'number');
        if (numericCol) {
          setYAxis(numericCol.name);
        } else if (response.columns.length > 1) {
          setYAxis(response.columns[1].name);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload file');
      setDataResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const canShowChart = dataResponse && xAxis && yAxis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Data Visualization
                </h1>
                <p className="text-sm text-gray-500">Upload CSV/Excel and create beautiful charts</p>
              </div>
            </div>
            <Link
              href="/upload"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              PDF Processing →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {!dataResponse && (
          <div className="max-w-2xl mx-auto">
            <DataDropzone onFileSelect={handleFileSelect} isLoading={isLoading} />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Visualization Section */}
        {dataResponse && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{dataResponse.originalName}</h2>
                    <p className="text-sm text-gray-500">
                      {dataResponse.rowCount} rows × {dataResponse.columns.length} columns
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTable(!showTable)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      showTable 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showTable ? 'Hide Table' : 'Show Table'}
                  </button>
                  <button
                    onClick={() => {
                      setDataResponse(null);
                      setXAxis('');
                      setYAxis('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Upload New File
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Controls Sidebar */}
              <div className="lg:col-span-1">
                <ChartControls
                  columns={dataResponse.columns}
                  chartType={chartType}
                  xAxis={xAxis}
                  yAxis={yAxis}
                  onChartTypeChange={setChartType}
                  onXAxisChange={setXAxis}
                  onYAxisChange={setYAxis}
                />
              </div>

              {/* Chart Area */}
              <div className="lg:col-span-3">
                {canShowChart ? (
                  <ChartDisplay
                    data={dataResponse.data}
                    chartType={chartType}
                    xAxis={xAxis}
                    yAxis={yAxis}
                    title={`${yAxis} by ${xAxis}`}
                  />
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure Your Chart</h3>
                    <p className="text-gray-500">Select X-Axis and Y-Axis columns to generate a chart</p>
                  </div>
                )}
              </div>
            </div>

            {/* Data Table */}
            {showTable && (
              <DataTable data={dataResponse.data} columns={dataResponse.columns} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

