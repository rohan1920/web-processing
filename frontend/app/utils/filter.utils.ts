import { Filter, TextFilter, DateFilter, AmountFilter } from '../types/filter.types';

/**
 * Apply filters to a table row
 */
export function applyFiltersToRow(row: string[], filters: Filter[]): boolean {
  const activeFilters = filters.filter(f => f.enabled);
  
  if (activeFilters.length === 0) return true;

  // All filters must pass (AND logic)
  return activeFilters.every(filter => {
    const cellValue = row[filter.columnIndex] || '';
    
    switch (filter.type) {
      case 'text':
        return applyTextFilter(cellValue, filter);
      case 'date':
        return applyDateFilter(cellValue, filter);
      case 'amount':
        return applyAmountFilter(cellValue, filter);
      default:
        return true;
    }
  });
}

/**
 * Apply text filter to a cell value
 */
function applyTextFilter(cellValue: string, filter: TextFilter): boolean {
  const value = cellValue.toLowerCase().trim();
  const filterValue = filter.value.toLowerCase().trim();

  switch (filter.operator) {
    case 'contains':
      return value.includes(filterValue);
    case 'equals':
      return value === filterValue;
    case 'startsWith':
      return value.startsWith(filterValue);
    case 'endsWith':
      return value.endsWith(filterValue);
    case 'notContains':
      return !value.includes(filterValue);
    default:
      return true;
  }
}

/**
 * Apply date filter to a cell value
 */
function applyDateFilter(cellValue: string, filter: DateFilter): boolean {
  const cellDate = parseDate(cellValue);
  if (!cellDate) return false;

  const filterDate = new Date(filter.value);
  if (isNaN(filterDate.getTime())) return false;

  switch (filter.operator) {
    case 'equals':
      return isSameDay(cellDate, filterDate);
    case 'before':
      return cellDate < filterDate;
    case 'after':
      return cellDate > filterDate;
    case 'between':
      if (!filter.value2) return false;
      const filterDate2 = new Date(filter.value2);
      if (isNaN(filterDate2.getTime())) return false;
      const minDate = filterDate < filterDate2 ? filterDate : filterDate2;
      const maxDate = filterDate > filterDate2 ? filterDate : filterDate2;
      return cellDate >= minDate && cellDate <= maxDate;
    default:
      return true;
  }
}

/**
 * Apply amount filter to a cell value
 */
function applyAmountFilter(cellValue: string, filter: AmountFilter): boolean {
  const amount = parseAmount(cellValue);
  if (amount === null) return false;

  switch (filter.operator) {
    case 'equals':
      return Math.abs(amount - filter.value) < 0.01; // Allow small floating point differences
    case 'greaterThan':
      return amount > filter.value;
    case 'lessThan':
      return amount < filter.value;
    case 'between':
      if (filter.value2 === undefined) return false;
      const min = Math.min(filter.value, filter.value2);
      const max = Math.max(filter.value, filter.value2);
      return amount >= min && amount <= max;
    default:
      return true;
  }
}

/**
 * Parse date from various formats
 */
function parseDate(value: string): Date | null {
  if (!value || !value.trim()) return null;
  
  // Try parsing as-is
  const date = new Date(value);
  if (!isNaN(date.getTime())) return date;
  
  // Try common date formats
  const formats = [
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
    /(\d{2})\/(\d{2})\/(\d{2})/, // MM/DD/YY
    /(\d{2})-(\d{2})-(\d{4})/, // MM-DD-YYYY
  ];

  for (const format of formats) {
    const match = value.match(format);
    if (match) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  return null;
}

/**
 * Parse amount from various formats
 */
function parseAmount(value: string): number | null {
  if (!value || !value.trim()) return null;
  
  // Remove currency symbols, commas, and whitespace
  const cleaned = value
    .replace(/[$,€£¥₹\s]/g, '')
    .replace(/[()]/g, '-'); // Handle negative amounts in parentheses
  
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? null : amount;
}

/**
 * Check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Detect column type (text, date, amount)
 */
export function detectColumnType(columnIndex: number, sampleRows: string[][]): 'text' | 'date' | 'amount' {
  if (sampleRows.length === 0) return 'text';
  
  let dateCount = 0;
  let amountCount = 0;
  let totalChecked = 0;

  for (const row of sampleRows.slice(0, Math.min(10, sampleRows.length))) {
    const cellValue = (row[columnIndex] || '').trim();
    if (!cellValue) continue;
    
    totalChecked++;
    
    if (parseDate(cellValue)) {
      dateCount++;
    } else if (parseAmount(cellValue) !== null) {
      amountCount++;
    }
  }

  if (totalChecked === 0) return 'text';
  
  const dateRatio = dateCount / totalChecked;
  const amountRatio = amountCount / totalChecked;

  if (dateRatio > 0.7) return 'date';
  if (amountRatio > 0.7) return 'amount';
  return 'text';
}

