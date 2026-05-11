import { useCallback } from 'react';
import { toast } from 'sonner';

import { useAppDispatch } from '@/store/store';

import { clearQueryFilters } from '../state/query-filters.slice';

/**
 * Drop every query filter. Toasts "Cleared all filters" by default; pass
 * `{ showToast: false }` for programmatic clears where a toast would be
 * misleading (e.g. deeplink hydration).
 */
export function useClearQueryFilters(): (options?: {
  showToast?: boolean;
}) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    ({ showToast = true }: { showToast?: boolean } = {}) => {
      dispatch(clearQueryFilters());
      if (showToast) {
        toast.success('Cleared all filters');
      }
    },
    [dispatch],
  );
}
