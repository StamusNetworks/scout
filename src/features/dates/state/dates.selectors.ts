import { roundToNearestMinutes } from 'date-fns';

import type { RootState } from '@/store/store';

import type { DatesState } from '../model/dates-state';

export const selectDates = (state: RootState) => state.filters.datesFilters;

/**
 * Curried selector — returns a selector that resolves true when the
 * given date is after the active window's start. Used by sub-components
 * to render "new" badges relative to the picked range.
 */
export const selectIsAfterStart = (date: Date) => (state: RootState) => {
  const dates = selectDates(state);
  return dates.start_date && date.getTime() > dates.start_date;
};

/**
 * Pure: collapse a `DatesState` into an absolute `[start_date, end_date]`
 * window. `all` widens to "since epoch → now"; `range`/`from`/`auto`
 * pass through their stored values. Used by query builders that always
 * need concrete bounds.
 */
export const computeDates = (
  dates: DatesState,
): { start_date: number; end_date: number } => {
  if (dates.type === 'all') {
    return {
      start_date: 0,
      end_date: roundToNearestMinutes(Date.now(), {
        roundingMethod: 'ceil',
      }).getTime(),
    };
  }
  if (dates.type === 'range' && dates.start_date && dates.end_date) {
    return { start_date: dates.start_date, end_date: dates.end_date };
  }
  if (dates.type === 'from' && dates.start_date && dates.end_date) {
    return { start_date: dates.start_date, end_date: dates.end_date };
  }
  if (dates.type === 'auto' && dates.start_date && dates.end_date) {
    return { start_date: dates.start_date, end_date: dates.end_date };
  }
  return {
    start_date: 0,
    end_date: roundToNearestMinutes(Date.now(), {
      roundingMethod: 'ceil',
    }).getTime(),
  };
};
