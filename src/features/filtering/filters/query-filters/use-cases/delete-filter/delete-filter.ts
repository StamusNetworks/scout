import { useCallback } from 'react';

import { useQueryFiltersRepository } from '../../query-filters.repository';
import { showFilterToast } from '../../utils/filter-toast';

export function useDeleteFilter(): (filterId: string) => void {
  const repo = useQueryFiltersRepository();

  return useCallback(
    (filterId: string) => {
      const filters = repo.getAll();
      const target = filters.find((f) => f.id === filterId);
      repo.set(filters.filter((f) => f.id !== filterId));
      if (target) showFilterToast('deleted', target);
    },
    [repo],
  );
}
