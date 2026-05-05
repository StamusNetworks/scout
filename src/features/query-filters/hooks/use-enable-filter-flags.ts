import { useCallback } from 'react';

import { useAppDispatch } from '@/store/store';

import { defaultFilterFlags, type FilterFlags } from '../model/filter-flags';
import {
  setAlertTags,
  setEventTypes,
  setNovelty,
} from '../state/query-filters.slice';

const applyOverrides = (overrides?: Partial<FilterFlags>): FilterFlags => ({
  eventTypes: { ...defaultFilterFlags.eventTypes, ...overrides?.eventTypes },
  alertTags: { ...defaultFilterFlags.alertTags, ...overrides?.alertTags },
  novelty:
    overrides?.novelty !== undefined
      ? overrides.novelty
      : defaultFilterFlags.novelty,
});

export const useEnableFilterFlags = () => {
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
