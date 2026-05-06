import type { DateRange } from '@/common/fetching/fetching.types';

export const computePreviousRange = (range: {
  from: number;
  to: number;
}): Required<DateRange> => {
  const interval = range.to - range.from;
  return {
    from: range.from - interval,
    to: range.from,
  };
};
