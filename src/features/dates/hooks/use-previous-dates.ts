import { useMemo } from 'react';

import { useAppSelector } from '@/store/store';

import { computeDates, selectDates } from '../state/dates.selectors';

/**
 * The window immediately preceding the active one, of the same length.
 * Used by trend indicators that compare "now" vs the previous period.
 */
export const usePreviousDates = () => {
  const dates = useAppSelector(selectDates);
  const absDates = computeDates(dates);
  return useMemo(() => {
    const interval = absDates.end_date - absDates.start_date;
    return {
      start_date: absDates.start_date - interval,
      end_date: absDates.start_date,
    };
  }, [absDates.end_date, absDates.start_date]);
};
