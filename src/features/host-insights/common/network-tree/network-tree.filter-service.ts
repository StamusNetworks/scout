import { QFBuilder } from '@/features/query-filters/builders/qf-builder';
import { QueryFiltersRecord } from '@/features/query-filters/definitions/query-filter.definitions';
import { QueryFilterState } from '@/features/query-filters/model/query-filter';
import { setQueryFilters } from '@/features/query-filters/state/query-filters.slice';
import { applyUpsertByRole } from '@/features/query-filters/utils/suspension-rules';
import { store } from '@/store/store-instance';

const qfBuilder = QFBuilder(QueryFiltersRecord, 'raw');

export const NetworkTreeFilterService = {
  addFilter: (value: string) => {
    const filters = store.getState().filters.queryFilters.queryFilters;
    let updated = filters.map((f: QueryFilterState) =>
      f.key === 'host_id.net_info.agg' &&
      !f.isSuspended &&
      f.role !== 'attack_surface'
        ? { ...f, isSuspended: true }
        : f,
    );
    const newFilter =
      value === 'Undefined Network'
        ? qfBuilder.createFilter('host_id.net_info.agg', '*', {
            isNegated: true,
            isWildcarded: true,
            isSuspended: false,
            role: 'attack_surface',
          })
        : qfBuilder.createFilter('host_id.net_info.agg', value, {
            isNegated: false,
            isWildcarded: value.includes('*'),
            isSuspended: false,
            role: 'attack_surface',
          });
    updated = applyUpsertByRole(updated, newFilter);
    store.dispatch(setQueryFilters(updated));
  },
  clearFilter: () => {
    const filters = store.getState().filters.queryFilters.queryFilters;
    const updated = filters.map((f: QueryFilterState) =>
      f.key === 'host_id.net_info.agg' && !f.isSuspended
        ? { ...f, isSuspended: true }
        : f,
    );
    store.dispatch(setQueryFilters(updated));
  },
  clearFilterNonAttackSurface: () => {
    const filters = store.getState().filters.queryFilters.queryFilters;
    const updated = filters.map((f: QueryFilterState) =>
      f.key === 'host_id.net_info.agg' &&
      f.role !== 'attack_surface' &&
      !f.isSuspended
        ? { ...f, isSuspended: true }
        : f,
    );
    store.dispatch(setQueryFilters(updated));
  },
};
