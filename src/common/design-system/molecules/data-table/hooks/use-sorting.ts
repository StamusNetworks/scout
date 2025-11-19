import { SortingState, Updater } from '@tanstack/react-table';
import { createParser, useQueryState } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';

// Local state version
export const useSortingState = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  return useMemo(
    () => [sorting, setSorting, serialize(sorting)],
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
    () => [sorting, handleSortingUpdate, serialize(sorting) || undefined],
    [sorting, handleSortingUpdate],
  );
};

const serialize = (sorting: SortingState) =>
  sorting.map(({ id, desc }) => `${desc ? '-' : ''}${id}`).join(',');

const parseAsSorting = createParser({
  parse(value: string) {
    return value
      .split(',')
      .map((v) => ({ id: v.replace('-', ''), desc: v[0] === '-' }));
  },
  serialize,
});
