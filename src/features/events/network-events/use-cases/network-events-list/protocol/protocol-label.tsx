import { FilterLabel } from '@/features/query-filters/components/filters-sidebar/filter-label';

export const ProtocolLabel = ({ query_key }: { query_key: string }) => (
  <FilterLabel
    query_key={query_key}
    className="text-xs"
  />
);
