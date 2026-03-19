import { parseAsStringLiteral, useQueryState } from 'nuqs';

export const useHomeNetParam = () =>
  useQueryState(
    'in_home_net',
    parseAsStringLiteral(['true', 'false', 'all']).withDefault('all'),
  );
