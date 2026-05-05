import { toast } from 'sonner';

import { QueryFiltersRecord } from '@/features/query-filters/constants/query-filter.definition';
import {
  setAlertTags,
  setEventTypes,
  setQueryFilters,
} from '@/features/query-filters/query-filters.store';
import { QFBuilder } from '@/features/query-filters/utils/qf-builder';
import { store } from '@/store/store-instance';

import {
  selectLoadedFilterSetId,
  setLoadedFilterSetId,
} from '../../filter-sets.store';
import { type FilterSet } from '../../model/filter-set';

export const loadFilterSet = (filterSet: FilterSet) => {
  const loadedFilterSetId = selectLoadedFilterSetId(store.getState());
  if (loadedFilterSetId === filterSet.id) return;

  const qfBuilder = QFBuilder(QueryFiltersRecord, 'raw');
  if (filterSet.tags) {
    store.dispatch(
      setEventTypes({
        alert: filterSet.tags.alert,
        stamus: filterSet.tags.stamus,
        discovery: filterSet.tags.discovery,
      }),
    );
    store.dispatch(
      setAlertTags({
        relevant: filterSet.tags.relevant,
        informational: filterSet.tags.informational,
        untagged: filterSet.tags.untagged,
      }),
    );
  }

  const newFilters = filterSet.filters.map((filter) =>
    qfBuilder.createFilter(filter.id, filter.value as string, {
      is_wildcarded: filter.id === 'es_filter' ? false : !filter.fullString,
      is_negated: filter.negated,
    }),
  );
  store.dispatch(setQueryFilters(newFilters));
  store.dispatch(setLoadedFilterSetId(filterSet.id));
  toast.success('Filterset applied');
};
