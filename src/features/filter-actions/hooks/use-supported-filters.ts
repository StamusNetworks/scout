import { useMemo } from 'react';

import { useQueryFiltersDefinitions } from '@/features/query-filters/hooks/use-filters-definitions';

import { getSupportedFilterKeys } from '../model/supported-filters';

export const useSupportedFilters = () => {
  const filterDefs = useQueryFiltersDefinitions();
  return useMemo(() => getSupportedFilterKeys(filterDefs), [filterDefs]);
};
