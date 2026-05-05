import { useCallback } from 'react';

import { useAppDispatch } from '@/store/store';

import { refreshRange } from '../state/dates.slice';

/**
 * Returns a stable refresher for the active relative window. Only
 * meaningful when the current mode is `from` (relative); other modes
 * are no-ops at the slice.
 */
export const useRefreshDates = () => {
  const dispatch = useAppDispatch();
  return useCallback(() => dispatch(refreshRange()), [dispatch]);
};
