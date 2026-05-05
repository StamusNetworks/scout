import { useCallback } from 'react';

import {
  defaultFilterFlags,
  type FilterFlags,
} from '@/features/query-filters/filter-flags.model';
import {
  setAlertTags,
  setEventTypes,
  setNovelty,
} from '@/features/query-filters/query-filters.store';
import { useAppDispatch } from '@/store/store';
import { store } from '@/store/store-instance';

const applyOverrides = (overrides?: Partial<FilterFlags>): FilterFlags => ({
  eventTypes: { ...defaultFilterFlags.eventTypes, ...overrides?.eventTypes },
  alertTags: { ...defaultFilterFlags.alertTags, ...overrides?.alertTags },
  novelty:
    overrides?.novelty !== undefined
      ? overrides.novelty
      : defaultFilterFlags.novelty,
});

export const enableTags = (overrides?: Partial<FilterFlags>) => {
  const flags = applyOverrides(overrides);
  store.dispatch(setEventTypes(flags.eventTypes));
  store.dispatch(setAlertTags(flags.alertTags));
  store.dispatch(setNovelty(flags.novelty));
};

export const useEnableTags = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (overrides?: Partial<FilterFlags>) => {
      const flags = applyOverrides(overrides);
      dispatch(setEventTypes(flags.eventTypes));
      dispatch(setAlertTags(flags.alertTags));
      dispatch(setNovelty(flags.novelty));
    },
    [dispatch],
  );
};
