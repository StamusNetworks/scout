import { useAppSelector } from '@/store/store';

import { selectQfilterBuilder } from '../state/query-filters.selectors';

export function useQFBuilder() {
  return useAppSelector(selectQfilterBuilder);
}
