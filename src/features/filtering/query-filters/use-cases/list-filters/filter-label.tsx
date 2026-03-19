import { Label } from '@/common/design-system/atoms/ui/label';
import { capitalizeAll } from '@/common/lib/strings';

import { QueryFiltersRecord } from '../../constants/query-filter.definition';

interface FilterLabelProps {
  query_key: string;
  className?: string;
}

export const FilterLabel = ({ query_key, className }: FilterLabelProps) => (
  <Label className={className}>
    {QueryFiltersRecord[query_key]?.label ??
      capitalizeAll(query_key.split('.').join(' '))}
  </Label>
);
