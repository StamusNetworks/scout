import { FilterCategory } from '../definitions/query-filter.config';

const HOST_FOCUSED = [
  FilterCategory.HOST,
  FilterCategory.EVENT,
  FilterCategory.SIGNATURE,
  FilterCategory.HISTORY,
] as const;

const SIGNATURE_FOCUSED = [
  FilterCategory.SIGNATURE,
  FilterCategory.EVENT,
  FilterCategory.HOST,
  FilterCategory.HISTORY,
] as const;

const EVENT_FOCUSED = [
  FilterCategory.EVENT,
  FilterCategory.HOST,
  FilterCategory.SIGNATURE,
  FilterCategory.HISTORY,
] as const;

export const getCategoryOrderForPath = (
  pathname: string,
): readonly FilterCategory[] => {
  if (pathname.includes('/attack-surface') || pathname.includes('/hosts')) {
    return HOST_FOCUSED;
  }
  if (pathname.includes('/detection-methods')) {
    return SIGNATURE_FOCUSED;
  }
  return EVENT_FOCUSED;
};
