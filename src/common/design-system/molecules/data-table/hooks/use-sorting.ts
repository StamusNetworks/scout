import type { SortingState, Updater } from '@tanstack/react-table';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';

import { parseSorting, serializeSorting } from './sorting-parser';

// Local state version
export const useSortingState = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  return useMemo(
    () => [sorting, setSorting, serializeSorting(sorting)],
    [sorting, setSorting],
  );
};

// nuqs (URL state) version — still uses nuqs for non-migrated pages
export const useSortingUrlState = (): [
  SortingState,
  (updater: Updater<SortingState>) => void,
  string | undefined,
] => {
  const [rawSort, setRawSort] = useQueryState('sort');
  const sorting = parseSorting(rawSort ?? undefined);

  const handleSortingUpdate = useCallback(
    (updater: Updater<SortingState>) => {
      const prev = sorting;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setRawSort(serializeSorting(next) ?? null);
    },
    [sorting, setRawSort],
  );

  return useMemo(
    () => [sorting, handleSortingUpdate, serializeSorting(sorting)],
    [sorting, handleSortingUpdate],
  );
};
