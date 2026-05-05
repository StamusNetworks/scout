import { useAppSelector } from '@/store/store';

import {
  selectAlertTagFlags,
  selectAlertTagFlagsParams,
  selectEventTypeFlags,
  selectEventTypeFlagsParams,
  selectFilterFlags,
  selectGatedFilterFlags,
  selectNovelty,
  selectQueryFilters,
} from '../state/query-filters.selectors';

/**
 * Active query filters (flat list, including suspended). Public hook
 * around `selectQueryFilters` for cross-feature consumers; the slice
 * stays internal.
 */
export const useQueryFilters = () => useAppSelector(selectQueryFilters);

/** Combined flag bag (event types + alert tags + novelty), un-gated. */
export const useFilterFlags = () => useAppSelector(selectFilterFlags);

/**
 * Flag bag gated by Enterprise mode. Returns `null` outside Enterprise
 * — callers can skip flag-dependent UI in that case.
 */
export const useGatedFilterFlags = () => useAppSelector(selectGatedFilterFlags);

export const useEventTypeFlags = () => useAppSelector(selectEventTypeFlags);
export const useEventTypeFlagsParams = () =>
  useAppSelector(selectEventTypeFlagsParams);

export const useAlertTagFlags = () => useAppSelector(selectAlertTagFlags);
export const useAlertTagFlagsParams = () =>
  useAppSelector(selectAlertTagFlagsParams);

export const useNovelty = () => useAppSelector(selectNovelty);
