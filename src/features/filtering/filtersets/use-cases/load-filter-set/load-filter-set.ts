import { toast } from 'sonner';

import { QueryFiltersRecord } from '@/features/filtering/filters/query-filters/constants/query-filter.definition';
import {
  setAlertTags,
  setEventTypes,
  setQueryFilters,
} from '@/features/filtering/filters/query-filters/query-filters.store';
import { QFBuilder } from '@/features/filtering/filters/query-filters/utils/qf-builder';
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
  if (loadedFilterSetId === filterSet.id) return;

  const qfBuilder = QFBuilder(QueryFiltersRecord, 'raw');
  const persistedTags = getTagsFromFilterSet(filterSet);
  if (persistedTags) {
    // Wire shape uses `alerts/sightings`; translate to domain `alert/discovery`.
    store.dispatch(
      setEventTypes({
        alert: persistedTags.alerts,
        stamus: persistedTags.stamus,
        discovery: persistedTags.sightings,
      }),
    );
    store.dispatch(
      setAlertTags({
        relevant: persistedTags.relevant,
        informational: persistedTags.informational,
        untagged: persistedTags.untagged,
      }),
    );
  }

  const persistedFilters = getFiltersFromFilterSet(filterSet);
  const newFilters = (persistedFilters ?? []).map((filter) =>
    qfBuilder.createFilter(filter.id, filter.value as string, {
      is_wildcarded: filter.id === 'es_filter' ? false : !filter.fullString,
      is_negated: filter.negated,
    }),
  );
  store.dispatch(setQueryFilters(newFilters));
  store.dispatch(setLoadedFilterSetId(filterSet.id));
  toast.success('Filterset applied');
};
