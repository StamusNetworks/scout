import { Updater, VisibilityState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  registerTable,
  resetColumnOrder,
  resetColumnVisibility,
  selectTablePreferencesEntry,
  setColumnOrder,
  setColumnVisibility,
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

const areVisibilityStatesEqual = (a: VisibilityState, b: VisibilityState) => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
};

type UseTablePreferencesProps = {
  tableId: TableId;
  columns: {
    id: string;
    visible?: boolean;
  }[];
};

export const useTablePreferences = ({
  tableId,
  columns,
}: UseTablePreferencesProps) => {
  const dispatch = useAppDispatch();

  const defaultColumnOrder = useMemo(
    () => columns.map((col) => col.id),
    [columns],
  );
  const defaultColumnVisibility = useMemo(
    () =>
      Object.fromEntries(
        columns.map((col) => [col.id!, col.visible !== false]),
      ),
    [columns],
  );

  const defaultOrderKey = useMemo(
    () => defaultColumnOrder.join('|'),
    [defaultColumnOrder],
  );

  useEffect(() => {
    dispatch(
      registerTable({ tableId, defaultColumnOrder, defaultColumnVisibility }),
    );
  }, [
    dispatch,
    tableId,
    defaultOrderKey,
    defaultColumnOrder,
    defaultColumnVisibility,
  ]);

  const entry = useAppSelector((state) =>
    selectTablePreferencesEntry(state, tableId),
  );

  const columnOrder = entry?.columnOrder ?? defaultColumnOrder;
  const columnVisibility = entry?.columnVisibility ?? defaultColumnVisibility;
  const normalizedDefaultColumnOrder =
    entry?.defaultColumnOrder ?? defaultColumnOrder;
  const normalizedDefaultColumnVisibility =
    entry?.defaultColumnVisibility ?? defaultColumnVisibility;

  const canReset = useMemo(() => {
    if (!entry) {
      return false;
    }

    const hasCustomOrder = !areArraysEqual(
      columnOrder,
      normalizedDefaultColumnOrder,
    );
    const hasCustomVisibility = !areVisibilityStatesEqual(
      columnVisibility,
      normalizedDefaultColumnVisibility,
    );

    return hasCustomOrder || hasCustomVisibility;
  }, [
    entry,
    columnOrder,
    normalizedDefaultColumnOrder,
    columnVisibility,
    normalizedDefaultColumnVisibility,
  ]);

  const handleClickReset = useCallback(() => {
    dispatch(
      registerTable({ tableId, defaultColumnOrder, defaultColumnVisibility }),
    );
    dispatch(resetColumnOrder(tableId));
    dispatch(resetColumnVisibility(tableId));
  }, [dispatch, tableId, defaultColumnOrder, defaultColumnVisibility]);

  const handleColumnOrderChange = useCallback(
    (updater: Updater<string[]>) => {
      const nextOrder =
        typeof updater === 'function'
          ? (updater as (old: string[]) => string[])(columnOrder)
          : updater;

      dispatch(setColumnOrder({ tableId, order: nextOrder }));
    },
    [dispatch, columnOrder, tableId],
  );

  const handleColumnVisibilityChange = useCallback(
    (updater: Updater<VisibilityState>) => {
      const nextVisibility =
        typeof updater === 'function'
          ? (updater as (old: VisibilityState) => VisibilityState)(
              columnVisibility,
            )
          : updater;

      dispatch(setColumnVisibility({ tableId, visibility: nextVisibility }));
    },
    [dispatch, columnVisibility, tableId],
  );

  return {
    columnOrder,
    onColumnOrderChange: handleColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    canReset,
    onClickReset: handleClickReset,
  };
};
