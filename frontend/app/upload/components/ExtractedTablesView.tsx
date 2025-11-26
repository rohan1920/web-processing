'use client';

import { useState, useMemo } from 'react';
import { TableData } from '../../types/table.types';
import { Filter } from '../../types/filter.types';
import FilterPanel from './FilterPanel';
import { applyFiltersToRow } from '../../utils/filter.utils';
import { convertTableToCSV, downloadCSV, generateCSVFilename } from '../../utils/csv.utils';

interface ExtractedTablesViewProps {
  tables: TableData[];
}

interface SortConfig {
  columnIndex: number;
  direction: 'asc' | 'desc' | null;
}

export default function ExtractedTablesView({
  tables,
}: ExtractedTablesViewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    columnIndex: -1,
    direction: null,
  });
  const tablesPerPage = 1; // Show one table per page

  // Filter tables based on search term
  const filteredTables = useMemo(() => {
    if (!searchTerm.trim()) return tables;

    return tables.filter((table) =>
      table.data.some((row) =>
        row.some((cell) =>
          cell.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      ),
    );
  }, [tables, searchTerm]);

  // Get current table
  const currentTable = filteredTables[currentPage];

  // Apply filters and get filtered rows
  const getFilteredTableData = (table: TableData | undefined): string[][] => {
    if (!table) return [];

    if (filters.length === 0 || !filters.some(f => f.enabled)) {
      return table.data;
    }

    const headerRow = table.data[0] ? [table.data[0]] : [];
    const dataRows = table.data.slice(1);

    const filteredRows = dataRows.filter(row => applyFiltersToRow(row, filters));
    
    return [...headerRow, ...filteredRows];
  };

  // Sort table data
  const getSortedTableData = (table: TableData | undefined): string[][] => {
    const filteredData = getFilteredTableData(table);
    
    if (sortConfig.columnIndex === -1 || sortConfig.direction === null) {
      return filteredData;
    }

    const sorted = [...filteredData];
    const headerRow = sorted[0] ? [sorted[0]] : [];
    const dataRows = sorted.slice(1);

    dataRows.sort((a, b) => {
      const aVal = (a[sortConfig.columnIndex] || '').toString().toLowerCase();
      const bVal = (b[sortConfig.columnIndex] || '').toString().toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });

    return [...headerRow, ...dataRows];
  };

  // Handle column header click for sorting
  const handleSort = (columnIndex: number) => {
    setSortConfig((prev) => {
      if (prev.columnIndex === columnIndex) {
        // Toggle direction: null -> asc -> desc -> null
        if (prev.direction === null) return { columnIndex, direction: 'asc' };
        if (prev.direction === 'asc') return { columnIndex, direction: 'desc' };
        return { columnIndex: -1, direction: null };
      }
      return { columnIndex, direction: 'asc' };
    });
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTables.length / tablesPerPage));

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPages = 7;

    if (totalPages <= maxPages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage < 3) {
        for (let i = 0; i < 5; i++) {
          pages.push(i);
        }
        pages.push('...', totalPages - 1);
      } else if (currentPage > totalPages - 4) {
        pages.push(0, '...');
        for (let i = totalPages - 5; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(0, '...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...', totalPages - 1);
      }
    }

    return pages;
  };

  // CSV download with filters applied
  const downloadTableAsCSV = (table: TableData | undefined, index: number) => {
    if (!table) return;
    
    const sortedData = getSortedTableData(table);
    const csvContent = convertTableToCSV(sortedData);
    const filename = generateCSVFilename(`table-${table.page || index + 1}`);
    downloadCSV(csvContent, filename);
  };

  // Get active filters count
  const activeFiltersCount = filters.filter(f => f.enabled).length;
  const sortedData = getSortedTableData(currentTable);
  const rowCount = sortedData.length > 1 ? sortedData.length - 1 : 0; // Exclude header

  if (tables.length === 0) {
    return (
      <div className="w-full p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium text-gray-600">No tables found in this document</p>
        <p className="text-sm text-gray-500 mt-1">The PDF might not contain any structured tables</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Filters Panel */}
      <FilterPanel
        tableHeaders={currentTable?.data[0] || []}
        sampleRows={currentTable?.data.slice(1, 11) || []}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Search and Stats Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="flex-1 w-full sm:max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search in tables..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(0);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-4 w-4 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {filteredTables.length}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Table{filteredTables.length !== 1 ? 's' : ''} Found
              </div>
            </div>
            {(searchTerm || activeFiltersCount > 0) && (
              <>
                <div className="h-12 w-px bg-gray-300" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {rowCount}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Row{rowCount !== 1 ? 's' : ''} Shown
                  </div>
                </div>
              </>
            )}
            {activeFiltersCount > 0 && (
              <>
                <div className="h-12 w-px bg-gray-300" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {activeFiltersCount}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Active Filter{activeFiltersCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </>
            )}
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters([]);
                  setCurrentPage(0);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tables Display */}
      {currentTable && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Table {currentPage + 1}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      {currentTable.page && (
                        <span className="text-sm text-gray-600">
                          Page {currentTable.page}
                        </span>
                      )}
                      {currentTable.table_index && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">
                            Index {currentTable.table_index}
                          </span>
                        </>
                      )}
                      <span className="text-gray-300">•</span>
                      <span className="text-sm font-medium text-gray-700">
                        {rowCount} rows × {currentTable.columns} columns
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => downloadTableAsCSV(currentTable, currentPage)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {sortedData.length > 0 && (
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    {sortedData[0].map((cell, colIndex) => (
                      <th
                        key={colIndex}
                        onClick={() => handleSort(colIndex)}
                        className={`
                          px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider
                          cursor-pointer select-none transition-all duration-200
                          hover:bg-gray-100
                          ${sortConfig.columnIndex === colIndex ? 'bg-blue-50 text-blue-700' : ''}
                        `}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{cell || `Column ${colIndex + 1}`}</span>
                          <div className="flex flex-col items-center">
                            {sortConfig.columnIndex === colIndex ? (
                              sortConfig.direction === 'asc' ? (
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )
                            ) : null}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedData.slice(1).map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="transition-colors duration-150 hover:bg-blue-50/50"
                  >
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                      >
                        <div className="max-w-xs truncate" title={cell}>
                          {cell || <span className="text-gray-300">—</span>}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedData.length === 1 && (
              <div className="p-8 text-center text-gray-500">
                No rows match the current filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
              Showing table <span className="font-semibold text-gray-900">{currentPage + 1}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
                title="First page"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, idx) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  const pageNum = page as number;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`
                        min-w-[2.5rem] px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                        }
                      `}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow"
              >
                Next
              </button>

              <button
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
                title="Last page"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 111.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 11H3a1 1 0 110-2h5.586L4.293 4.707a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
