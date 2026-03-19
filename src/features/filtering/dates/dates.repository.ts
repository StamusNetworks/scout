import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import type { DatesPayload, DatesState } from './dates.model';
import { selectDates } from './dates.selectors';
import { refreshRange, setDates } from './dates.store';

export type DatesRepository = {
  getAll(): DatesState;
  set(payload: DatesPayload): void;
  refresh(): void;
};

export function useDatesRepository(): DatesRepository {
  const dates = useAppSelector(selectDates);
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      getAll: () => dates,
      set: (payload: DatesPayload) => dispatch(setDates(payload)),
      refresh: () => dispatch(refreshRange()),
    }),
    [dates, dispatch],
  );
}
