import { toast } from 'sonner';

import {
  addQueryFilter,
  clearQueryFilters,
  updateTagFilters,
} from '@/features/filtering/query-filters/store/query-filters.slice';
import { store } from '@/store/store-instance';

import {
  getFiltersFromFilterSet,
  getTagsFromFilterSet,
  QueryFilterSet,
} from '../../filterset.model';
import {
  selectLoadedFilterSetId,
  setLoadedFilterSetId,
} from '../../filtersets.store';

export const loadFilterSet = (filterSet: QueryFilterSet) => {
  const loadedFilterSetId = selectLoadedFilterSetId(store.getState());
  if (loadedFilterSetId === filterSet.id) {
    return;
  }

  store.dispatch(clearQueryFilters());
  const globalFilter = getTagsFromFilterSet(filterSet);
  if (globalFilter) {
    store.dispatch(
      updateTagFilters({
        stamus: globalFilter.stamus,
        alert: globalFilter.alerts,
        discovery: globalFilter.sightings,
        informational: globalFilter.informational,
        relevant: globalFilter.relevant,
        untagged: globalFilter.untagged,
      }),
    );
  }
  getFiltersFromFilterSet(filterSet)?.forEach((filter) => {
    store.dispatch(
      addQueryFilter({
        key: filter.id,
        value: filter.value as string,
        options: {
          is_wildcarded: filter.id === 'es_filter' ? false : !filter.fullString,
          is_negated: filter.negated,
        },
      }),
    );
  });
  store.dispatch(setLoadedFilterSetId(filterSet.id));
  toast.success('Filterset applied');
};
