import { useAppSelector } from '@/store/store';

import { selectDates } from '../state/dates.selectors';

/**
 * Returns the current `DatesState` (mode + bounds). For consumers that
 * only need an absolute window, prefer `useComputedDates()`.
 */
export const useDates = () => useAppSelector(selectDates);
