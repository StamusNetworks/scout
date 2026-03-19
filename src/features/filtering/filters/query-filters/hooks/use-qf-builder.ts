import { useAppSelector } from '@/store/store';

import { selectQfilterBuilder } from '../query-filters.selectors';

export function useQFBuilder() {
  return useAppSelector(selectQfilterBuilder);
}
