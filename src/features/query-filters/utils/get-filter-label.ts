import { capitalizeAll } from '@/common/lib/strings';

import { QueryFiltersRecord } from '../definitions/query-filter.definitions';

export const getFilterLabel = (key: string) => {
  const filterDef = QueryFiltersRecord[key];
  return (
    filterDef?.label ??
    capitalizeAll(key.replaceAll('_', ' ').replaceAll('.', ' '))
  );
};

export const getFilterValue = (key: string, value: string | number) => {
  const filterDef = QueryFiltersRecord[key];
  if (!filterDef) return value;
  return filterDef.toDisplayValue?.(value as never) || value;
};
