import { useAppSelector } from '@/store/store';

import { selectIsAfterStart } from '../state/dates.selectors';

/**
 * Returns true when `date` falls after the active date window's
 * start. Used to badge "new" items relative to the picked range.
 */
export const useIsAfterStart = (date: Date) =>
  useAppSelector(selectIsAfterStart(date));
