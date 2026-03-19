import { roundToNearestMinutes } from 'date-fns';

import { RootState } from '@/store/store';

import { DatesState } from './dates.model';

export const selectDates = (state: RootState) => state.filters.datesFilters;

export const selectIsAfterStart = (date: Date) => (state: RootState) => {
  const dates = selectDates(state);
  return dates.start_date && date.getTime() > dates.start_date;
};

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
    return {
      start_date: dates.start_date,
      end_date: dates.end_date,
    };
  }
  if (dates.type === 'from' && dates.start_date && dates.end_date) {
    return {
      start_date: dates.start_date,
      end_date: dates.end_date,
    };
  }
  if (dates.type === 'auto' && dates.start_date && dates.end_date) {
    return {
      start_date: dates.start_date,
      end_date: dates.end_date,
    };
  }
  return {
    start_date: 0,
    end_date: roundToNearestMinutes(Date.now(), {
      roundingMethod: 'ceil',
    }).getTime(),
  };
};
