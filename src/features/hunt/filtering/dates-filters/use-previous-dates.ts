import { useMemo } from 'react';

import { useAppSelector } from '@/store/store';

import { computeDates, selectDates } from './dates-filters';

export const usePreviousDates = () => {
  const dates = useAppSelector(selectDates);
  const absDates = computeDates(dates);
  const previousDates = useMemo(() => {
    const interval = absDates.end_date - absDates.start_date;
    return {
      start_date: absDates.start_date - interval,
      end_date: absDates.start_date,
    };
  }, [absDates.end_date, absDates.start_date]);

  return previousDates;
};
