import type { RootState } from '@/store/store';

export const selectDates = (state: RootState) => state.filters.datesFilters;

/**
 * Curried selector — returns a selector that resolves true when the
 * given date is after the active window's start. Used by sub-components
 * to render "new" badges relative to the picked range.
 */
export const selectIsAfterStart = (date: Date) => (state: RootState) => {
  const dates = selectDates(state);
  return dates.from && date.getTime() > dates.from;
};
