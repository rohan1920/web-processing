'use client';

import { useState, useEffect } from 'react';
import { Filter, SavedFilter, TextFilter, DateFilter, AmountFilter } from '../../types/filter.types';
import { detectColumnType } from '../../utils/filter.utils';
import { saveFiltersToStorage, loadFiltersFromStorage, generateFilterId } from '../../utils/storage.utils';

interface FilterPanelProps {
  tableHeaders: string[];
  sampleRows: string[][];
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
}

export default function FilterPanel({
  tableHeaders,
  sampleRows,
  filters,
  onFiltersChange,
}: FilterPanelProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [newFilterColumn, setNewFilterColumn] = useState<number>(0);

  useEffect(() => {
    setSavedFilters(loadFiltersFromStorage());
  }, []);

  const addFilter = (columnIndex: number) => {
    const columnType = detectColumnType(columnIndex, sampleRows);
    let newFilter: Filter;

    switch (columnType) {
      case 'date':
        newFilter = {
          type: 'date',
          columnIndex,
          operator: 'equals',
          value: new Date().toISOString().split('T')[0],
          enabled: true,
        } as DateFilter;
        break;
      case 'amount':
        newFilter = {
          type: 'amount',
          columnIndex,
          operator: 'greaterThan',
          value: 0,
          enabled: true,
        } as AmountFilter;
        break;
      default:
        newFilter = {
          type: 'text',
          columnIndex,
          operator: 'contains',
          value: '',
          enabled: true,
        } as TextFilter;
    }

    onFiltersChange([...filters, newFilter]);
    setShowAddFilter(false);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<Filter>) => {
    const updated = filters.map((f, i) => 
      i === index ? { ...f, ...updates } as Filter : f
    );
    onFiltersChange(updated);
  };

  const toggleFilter = (index: number) => {
    updateFilter(index, { enabled: !filters[index].enabled });
  };

  const saveCurrentFilters = () => {
    const name = prompt('Enter a name for this filter set:');
    if (!name || name.trim() === '') return;

    const savedFilter: SavedFilter = {
      id: generateFilterId(),
      name: name.trim(),
      filters: [...filters],
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, savedFilter].slice(0, 20);
    setSavedFilters(updated);
    saveFiltersToStorage(updated);
  };

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    onFiltersChange([...savedFilter.filters]);
  };

  const deleteSavedFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    saveFiltersToStorage(updated);
  };

  const clearAllFilters = () => {
    if (confirm('Clear all filters?')) {
      onFiltersChange([]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <div className="flex gap-2">
          {filters.length > 0 && (
            <>
              <button
                onClick={saveCurrentFilters}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Save Filters
              </button>
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-2">Saved Filters:</p>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((saved) => (
              <div
                key={saved.id}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-sm"
              >
                <button
                  onClick={() => loadSavedFilter(saved)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {saved.name}
                </button>
                <button
                  onClick={() => deleteSavedFilter(saved.id)}
                  className="text-red-500 hover:text-red-600"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      <div className="space-y-3">
        {filters.map((filter, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg ${
              filter.enabled
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filter.enabled}
                  onChange={() => toggleFilter(index)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-medium text-gray-900">
                  {tableHeaders[filter.columnIndex] || `Column ${filter.columnIndex + 1}`}
                </span>
                <span className="text-xs text-gray-500">
                  ({filter.type})
                </span>
              </div>
              <button
                onClick={() => removeFilter(index)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>

            {/* Text Filter */}
            {filter.type === 'text' && (
              <div className="flex gap-2">
                <select
                  value={(filter as TextFilter).operator}
                  onChange={(e) =>
                    updateFilter(index, { operator: e.target.value as any })
                  }
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm"
                >
                  <option value="contains">Contains</option>
                  <option value="equals">Equals</option>
                  <option value="startsWith">Starts with</option>
                  <option value="endsWith">Ends with</option>
                  <option value="notContains">Does not contain</option>
                </select>
                <input
                  type="text"
                  value={(filter as TextFilter).value}
                  onChange={(e) =>
                    updateFilter(index, { value: e.target.value })
                  }
                  placeholder="Filter value..."
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
            )}

            {/* Date Filter */}
            {filter.type === 'date' && (
              <div className="space-y-2">
                <select
                  value={(filter as DateFilter).operator}
                  onChange={(e) =>
                    updateFilter(index, { operator: e.target.value as any })
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                >
                  <option value="equals">Equals</option>
                  <option value="before">Before</option>
                  <option value="after">After</option>
                  <option value="between">Between</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={(filter as DateFilter).value}
                    onChange={(e) =>
                      updateFilter(index, { value: e.target.value })
                    }
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                  />
                  {(filter as DateFilter).operator === 'between' && (
                    <input
                      type="date"
                      value={(filter as DateFilter).value2 || ''}
                      onChange={(e) =>
                        updateFilter(index, { value2: e.target.value })
                      }
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="End date"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Amount Filter */}
            {filter.type === 'amount' && (
              <div className="space-y-2">
                <select
                  value={(filter as AmountFilter).operator}
                  onChange={(e) =>
                    updateFilter(index, { operator: e.target.value as any })
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                >
                  <option value="equals">Equals</option>
                  <option value="greaterThan">Greater than</option>
                  <option value="lessThan">Less than</option>
                  <option value="between">Between</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={(filter as AmountFilter).value}
                    onChange={(e) =>
                      updateFilter(index, { value: parseFloat(e.target.value) || 0 })
                    }
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="Amount"
                  />
                  {(filter as AmountFilter).operator === 'between' && (
                    <input
                      type="number"
                      step="0.01"
                      value={(filter as AmountFilter).value2 || ''}
                      onChange={(e) =>
                        updateFilter(index, { value2: parseFloat(e.target.value) || undefined })
                      }
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                      placeholder="Max amount"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Filter Button */}
        <div>
          {!showAddFilter ? (
            <button
              onClick={() => setShowAddFilter(true)}
              className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              + Add Filter
            </button>
          ) : (
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <select
                value={newFilterColumn}
                onChange={(e) => setNewFilterColumn(parseInt(e.target.value))}
                className="w-full mb-2 px-3 py-1.5 border border-gray-300 rounded text-sm"
              >
                {tableHeaders.map((header, idx) => (
                  <option key={idx} value={idx}>
                    {header || `Column ${idx + 1}`}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => addFilter(newFilterColumn)}
                  className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddFilter(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

