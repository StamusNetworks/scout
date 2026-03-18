import { startsWithOneOf } from '@/common/lib/strings';
import { FilterCategory } from '@/features/filtering/query-filters/constants/query-filter.config';
import { useQueryFiltersDefinitions } from '@/features/filtering/query-filters/hooks/use-filters-definitions';
import { useQFBuilder } from '@/features/filtering/query-filters/hooks/use-qf-builder';
import { selectQueryFilters } from '@/features/filtering/query-filters/store/query-filters.selector';
import { useAppSelector } from '@/store/store';

const NETWORK_EVENTS_BASE_FILTER =
  '(flow_id:* AND NOT event_type:(alert OR stamus OR discovery))';

/**
 * Builds the qfilter string for network events queries.
 *
 * Takes the global Redux query filters, keeps only event-scoped filters
 * that are not alert/stamus/discovery-prefixed, serialises them with
 * QFBuilder and combines with the base network events filter.
 */
export function useNetworkEventsQfilter(): string {
  const filters = useAppSelector(selectQueryFilters);
  const QFBuilder = useQFBuilder();
  const definitions = useQueryFiltersDefinitions();

  const qfilter = QFBuilder.toQFString(
    filters.filter(
      (f) =>
        !f.is_suspended &&
        definitions[f.key]?.category === FilterCategory.EVENT &&
        !startsWithOneOf(f.key, ['alert.', 'stamus.', 'discovery.']),
    ),
  );

  return `${NETWORK_EVENTS_BASE_FILTER} ${qfilter ? `AND ${qfilter}` : ''}`.trim();
}
