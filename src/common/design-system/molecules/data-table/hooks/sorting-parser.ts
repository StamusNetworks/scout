import { SortingState } from '@tanstack/react-table';
import { createParser } from 'nuqs';

export const serializeSorting = (sorting: SortingState) =>
  sorting.map(({ id, desc }) => `${desc ? '-' : ''}${id}`).join(',');

export const parseAsSorting = createParser({
  parse(value: string) {
    return value.split(',').map((v) => {
      const desc = v[0] === '-';
      const id = desc ? v.slice(1) : v;
      return { id, desc };
    });
  },
  serialize: serializeSorting,
});
