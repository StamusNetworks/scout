import { FilterLabel } from '@/features/filtering/query-filters/use-cases/list-filters/filter-label';

export const ProtocolLabel = ({ query_key }: { query_key: string }) => (
  <FilterLabel
    query_key={query_key}
    className="text-xs"
  />
);
