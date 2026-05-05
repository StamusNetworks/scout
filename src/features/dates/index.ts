/**
 * Public API for the dates bounded context. Owns the active date-range
 * filter (relative / absolute / auto / open) and the persistence + auto
 * window endpoint.
 */

export type { DatesPayload, DatesState, TimeUnit } from './model/dates-state';
export {
  TIME_PRESETS,
  UNITS_IN_MILLISECONDS,
  computeDates,
  formatUnit,
  units,
} from './model/dates-state';

export { useDates } from './hooks/use-dates';
export { useSetDates } from './hooks/use-set-dates';
export { useRefreshDates } from './hooks/use-refresh-dates';
export { usePreviousDates } from './hooks/use-previous-dates';
export { useAutoRange } from './hooks/use-auto-range';
export { useIsAfterStart } from './hooks/use-is-after-start';
