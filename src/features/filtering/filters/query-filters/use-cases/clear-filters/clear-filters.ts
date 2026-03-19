import { useCallback } from 'react';
import { toast } from 'sonner';

import { useQueryFiltersRepository } from '../../query-filters.repository';

export function useClearFilters(): () => void {
  const repo = useQueryFiltersRepository();

  return useCallback(() => {
    repo.clear();
    toast.success('Cleared all filters');
  }, [repo]);
}
