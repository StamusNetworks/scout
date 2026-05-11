import { useMemo } from 'react';

import {
  buildSignatureParams,
  type SignatureParams,
} from '../builders/build-signature-params';
import { QueryFilterState } from '../model/query-filter';
import { useQueryFilters } from './use-query-filters';

export function useBuildSignatureFilter(
  extra?: QueryFilterState[],
): SignatureParams | undefined {
  const queryFilters = useQueryFilters();

  return useMemo(() => {
    const filters = [...queryFilters, ...(extra || [])];
    return buildSignatureParams(filters);
  }, [queryFilters, extra]);
}
