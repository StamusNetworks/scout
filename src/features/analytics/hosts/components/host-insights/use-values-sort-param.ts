import { parseAsStringLiteral, useQueryState } from 'nuqs';

export type HostsValuesSort =
  | 'first-seen-asc'
  | 'first-seen-desc'
  | 'last-seen-asc'
  | 'last-seen-desc';

const sortOptions: HostsValuesSort[] = [
  'first-seen-asc',
  'first-seen-desc',
  'last-seen-asc',
  'last-seen-desc',
];

export const useValuesSortParam = () =>
  useQueryState(
    'values_sort',
    parseAsStringLiteral(sortOptions).withDefault('last-seen-desc'),
  );
