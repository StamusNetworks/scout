import { Updater } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  normalizeColumnOrder,
  registerTable,
  selectRawColumnOrder,
  selectTablePreferencesEntry,
  setColumnOrder,
  TableId,
} from '../table-preferences.slice';

const areArraysEqual = (a: string[], b: string[]) => {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

type UseTableColumnOrderProps = {
  tableId: TableId;
  defaultColumnOrder: string[];
};

export const useTableColumnOrder = ({
  tableId,
  defaultColumnOrder,
}: UseTableColumnOrderProps) => {
  const dispatch = useAppDispatch();

  const defaultOrderKey = useMemo(
    () => defaultColumnOrder.join('|'),
    [defaultColumnOrder],
  );

  useEffect(() => {
    dispatch(registerTable({ tableId, defaultColumnOrder }));
  }, [dispatch, tableId, defaultOrderKey, defaultColumnOrder]);

  const entry = useAppSelector((state) =>
    selectTablePreferencesEntry(state, tableId),
  );
  const rawColumnOrder = useAppSelector((state) =>
    selectRawColumnOrder(state, tableId),
  );

  const normalizedColumnOrder = useMemo(() => {
    const defaultOrder = entry?.defaultColumnOrder ?? defaultColumnOrder;
    const persisted = entry ? rawColumnOrder : defaultColumnOrder;
    return normalizeColumnOrder(defaultOrder, persisted);
  }, [defaultColumnOrder, entry, rawColumnOrder]);

  useEffect(() => {
    if (!entry) {
      return;
    }
    if (areArraysEqual(rawColumnOrder, normalizedColumnOrder)) {
      return;
    }
    dispatch(setColumnOrder({ tableId, order: normalizedColumnOrder }));
  }, [dispatch, entry, rawColumnOrder, normalizedColumnOrder, tableId]);

  const handleColumnOrderChange = useCallback(
    (updater: Updater<string[]>) => {
      const nextOrder =
        typeof updater === 'function'
          ? (updater as (old: string[]) => string[])(normalizedColumnOrder)
          : updater;

      dispatch(setColumnOrder({ tableId, order: nextOrder }));
    },
    [dispatch, normalizedColumnOrder, tableId],
  );

  return {
    columnOrder: normalizedColumnOrder,
    onColumnOrderChange: handleColumnOrderChange,
  };
};
