import { useCallback } from 'react';

import { showFilterToast } from '../utils/filter-toast';
import { useQueryFilters } from './use-query-filters';
import { useSetQueryFilters } from './use-set-query-filters';

export function useDeleteFilter(): (filterId: string) => void {
  const filters = useQueryFilters();
  const setFilters = useSetQueryFilters();

  return useCallback(
    (filterId: string) => {
      const target = filters.find((f) => f.id === filterId);
      setFilters(filters.filter((f) => f.id !== filterId));
      if (target) showFilterToast('deleted', target);
    },
    [filters, setFilters],
  );
}
