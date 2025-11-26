import { SavedFilter } from '../types/filter.types';

const STORAGE_KEY = 'document_processor_saved_filters';
const MAX_SAVED_FILTERS = 20;

/**
 * Save filters to localStorage
 */
export function saveFiltersToStorage(filters: SavedFilter[]): void {
  try {
    const data = JSON.stringify(filters);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error('Failed to save filters to localStorage:', error);
  }
}

/**
 * Load filters from localStorage
 */
export function loadFiltersFromStorage(): SavedFilter[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const filters = JSON.parse(data) as SavedFilter[];
    // Validate and filter out invalid entries
    return filters
      .filter(f => f && f.id && f.name && Array.isArray(f.filters))
      .slice(0, MAX_SAVED_FILTERS);
  } catch (error) {
    console.error('Failed to load filters from localStorage:', error);
    return [];
  }
}

/**
 * Generate unique ID for saved filter
 */
export function generateFilterId(): string {
  return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

