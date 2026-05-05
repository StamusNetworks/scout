/**
 * Public API for the dates bounded context. Owns the active date-range
 * filter (relative / absolute / auto / open) and the persistence + auto
 * window endpoint.
 */

export type { DatesPayload, DatesState, TimeUnit } from './model/dates-state';
export {
  TIME_PRESETS,
  UNITS_IN_MILLISECONDS,
  formatUnit,
  units,
} from './model/dates-state';

export { useDates } from './hooks/use-dates';
export { useSetDates } from './hooks/use-set-dates';
export { useRefreshDates } from './hooks/use-refresh-dates';
export { usePreviousDates } from './hooks/use-previous-dates';
export { useAutoRange } from './hooks/use-auto-range';

/**
 * Pure helpers exposed for non-React contexts (curried selectors,
 * route loaders, qfilter builders). Most callers should use
 * `useDates()` and derive within the React tree.
 */
export {
  computeDates,
  selectDates,
  selectIsAfterStart,
} from './state/dates.selectors';
