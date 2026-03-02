import { SortingState, Updater } from '@tanstack/react-table';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';

import { parseAsSorting, serializeSorting } from './sorting-parser';

// Local state version
export const useSortingState = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  return useMemo(
    () => [sorting, setSorting, serializeSorting(sorting)],
    [sorting, setSorting],
  );
};

// nuqs (URL state) version
export const useSortingUrlState = (): [
  SortingState,
  (updater: Updater<SortingState>) => void,
  string | undefined,
] => {
  const [sorting, setSorting] = useQueryState(
    'sort',
    parseAsSorting.withDefault([]),
  );
  const handleSortingUpdate = useCallback(
    (updater: Updater<SortingState>) => {
      const prev = Array.isArray(sorting) ? sorting : [];
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setSorting(next);
    },
    [sorting, setSorting],
  );
  return useMemo(
    () => [
      sorting,
      handleSortingUpdate,
      serializeSorting(sorting) || undefined,
    ],
    [sorting, handleSortingUpdate],
  );
};
