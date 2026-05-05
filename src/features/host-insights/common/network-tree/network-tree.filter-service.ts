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
      !f.is_suspended &&
      f.role !== 'attack_surface'
        ? { ...f, is_suspended: true }
        : f,
    );
    const newFilter =
      value === 'Undefined Network'
        ? qfBuilder.createFilter('host_id.net_info.agg', '*', {
            is_negated: true,
            is_wildcarded: true,
            is_suspended: false,
            role: 'attack_surface',
          })
        : qfBuilder.createFilter('host_id.net_info.agg', value, {
            is_negated: false,
            is_wildcarded: value.includes('*'),
            is_suspended: false,
            role: 'attack_surface',
          });
    updated = applyUpsertByRole(updated, newFilter);
    store.dispatch(setQueryFilters(updated));
  },
  clearFilter: () => {
    const filters = store.getState().filters.queryFilters.queryFilters;
    const updated = filters.map((f: QueryFilterState) =>
      f.key === 'host_id.net_info.agg' && !f.is_suspended
        ? { ...f, is_suspended: true }
        : f,
    );
    store.dispatch(setQueryFilters(updated));
  },
  clearFilterNonAttackSurface: () => {
    const filters = store.getState().filters.queryFilters.queryFilters;
    const updated = filters.map((f: QueryFilterState) =>
      f.key === 'host_id.net_info.agg' &&
      f.role !== 'attack_surface' &&
      !f.is_suspended
        ? { ...f, is_suspended: true }
        : f,
    );
    store.dispatch(setQueryFilters(updated));
  },
};
