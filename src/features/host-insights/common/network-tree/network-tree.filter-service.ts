import { QueryFilterState } from '@/features/filtering/filters/query-filters/query-filter.model';
import {
  updateOrCreateByRole,
  updateQueryFilter,
} from '@/features/filtering/filters/query-filters/query-filters.store';
import { store } from '@/store/store-instance';

export const NetworkTreeFilterService = {
  addFilter: (value: string) => {
    const netFilters = store
      .getState()
      .filters.queryFilters.queryFilters.filter(
        (f: QueryFilterState) => f.key === 'host_id.net_info.agg',
      );
    netFilters
      .filter(
        (f: QueryFilterState) => !f.is_suspended && f.role !== 'attack_surface',
      )
      .forEach((f) => {
        store.dispatch(updateQueryFilter({ ...f, is_suspended: true }));
      });

    if (value === 'Undefined Network') {
      store.dispatch(
        updateOrCreateByRole({
          key: 'host_id.net_info.agg',
          value: '*',
          options: {
            is_negated: true,
            is_wildcarded: true,
            is_suspended: false,
            role: 'attack_surface',
          },
        }),
      );
    } else {
      store.dispatch(
        updateOrCreateByRole({
          key: 'host_id.net_info.agg',
          value,
          options: {
            is_negated: false,
            is_wildcarded: value.includes('*'),
            is_suspended: false,
            role: 'attack_surface',
          },
        }),
      );
    }
  },
  clearFilter: () => {
    const networkDefFilters = store
      .getState()
      .filters.queryFilters.queryFilters.filter(
        (f: QueryFilterState) => f.key === 'host_id.net_info.agg',
      );
    networkDefFilters
      .filter((f: QueryFilterState) => !f.is_suspended)
      .forEach((f: QueryFilterState) => {
        store.dispatch(
          store.dispatch(updateQueryFilter({ ...f, is_suspended: true })),
        );
      });
  },
  clearFilterNonAttackSurface: () => {
    const networkDefFilters = store
      .getState()
      .filters.queryFilters.queryFilters.filter(
        (f: QueryFilterState) =>
          f.key === 'host_id.net_info.agg' && f.role !== 'attack_surface',
      );
    networkDefFilters
      .filter((f: QueryFilterState) => !f.is_suspended)
      .forEach((f: QueryFilterState) => {
        store.dispatch(
          store.dispatch(updateQueryFilter({ ...f, is_suspended: true })),
        );
      });
  },
};
