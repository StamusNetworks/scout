import { useCallback } from 'react';

import { useAppDispatch } from '@/store/store';

import type { DatesPayload } from '../model/dates-state';
import { setDates } from '../state/dates.slice';

/**
 * Returns a stable setter for the active dates window. Dispatches the
 * `setDates` action; persistence to localStorage is handled by the slice.
 */
export const useSetDates = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (payload: DatesPayload) => dispatch(setDates(payload)),
    [dispatch],
  );
};
