import { useMemo } from 'react';

import {
  buildSignatureParams,
  type SignatureParams,
} from '../builders/build-signature-params';
import { QueryFilterState } from '../model/query-filter';
import { useQueryFiltersRepository } from '../state/query-filters.repository';

export function useBuildSignatureFilter(
  extra?: QueryFilterState[],
): SignatureParams | undefined {
  const repo = useQueryFiltersRepository();

  return useMemo(() => {
    const queryFilters = repo.getAll();
    const filters = [...queryFilters, ...(extra || [])];
    return buildSignatureParams(filters);
  }, [repo, extra]);
}
