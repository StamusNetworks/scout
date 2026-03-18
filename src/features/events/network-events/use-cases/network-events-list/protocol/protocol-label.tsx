import { FilterLabel } from '@/features/hunt/filtering/query-filters/components/filter-label';

export const ProtocolLabel = ({ query_key }: { query_key: string }) => (
  <FilterLabel
    query_key={query_key}
    className="text-xs"
  />
);
