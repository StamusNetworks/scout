import type { SortingState } from '@tanstack/react-table';

export const serializeSorting = (sorting: SortingState): string | undefined => {
  if (sorting.length === 0) return undefined;
  return sorting.map(({ id, desc }) => `${desc ? '-' : ''}${id}`).join(',');
};

export const parseSorting = (value: string | undefined): SortingState => {
  if (!value) return [];
  return value.split(',').map((v) => {
    const desc = v[0] === '-';
    const id = desc ? v.slice(1) : v;
    return { id, desc };
  });
};
