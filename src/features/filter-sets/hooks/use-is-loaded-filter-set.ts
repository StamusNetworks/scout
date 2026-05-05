import { useAppSelector } from '@/store/store';

import { selectLoadedFilterSetId } from '../state/filter-sets.slice';

/**
 * Returns true when `id` matches the currently-loaded filter set —
 * used by the list/sidebar UIs to highlight the active row.
 */
export const useIsLoadedFilterSet = (id: number) => {
  const loadedFilterSetId = useAppSelector(selectLoadedFilterSetId);
  return loadedFilterSetId === id;
};
