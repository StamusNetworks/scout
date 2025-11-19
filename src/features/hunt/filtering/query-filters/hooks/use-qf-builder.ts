import { useAppSelector } from '@/store/store';

import { selectQfilterBuilder } from '../store/query-filters.selector';

export function useQFBuilder() {
  return useAppSelector(selectQfilterBuilder);
}
