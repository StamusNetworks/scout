import { useAppSelector } from '@/store/store';

import { computeDates } from '../model/dates-state';
import { computePreviousRange } from '../model/previous-dates';
import { selectDates } from '../state/dates.selectors';

export const usePreviousDates = () => {
  const dates = useAppSelector(selectDates);
  return computePreviousRange(computeDates(dates));
};
