import { Updater, VisibilityState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import {
  normalizeColumnOrder,
  normalizeColumnVisibility,
  registerTable,
  resetColumnOrder,
  resetColumnVisibility,
  selectRawColumnOrder,
  selectRawColumnVisibility,
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
  const rawColumnOrder = useAppSelector((state) =>
    selectRawColumnOrder(state, tableId),
  );
  const rawColumnVisibility = useAppSelector((state) =>
    selectRawColumnVisibility(state, tableId),
  );

  const normalizedColumnOrder = useMemo(() => {
    const defaultOrder = entry?.defaultColumnOrder ?? defaultColumnOrder;
    const persisted = entry ? rawColumnOrder : defaultColumnOrder;
    return normalizeColumnOrder(defaultOrder, persisted);
  }, [defaultColumnOrder, entry, rawColumnOrder]);

  const normalizedColumnVisibility = useMemo(() => {
    const columnIds = entry?.defaultColumnOrder ?? defaultColumnOrder;
    const defaults = entry?.defaultColumnVisibility ?? defaultColumnVisibility;
    const persisted = entry ? rawColumnVisibility : {};
    return normalizeColumnVisibility({
      columnIds,
      defaultVisibility: defaults,
      persistedVisibility: persisted,
    });
  }, [defaultColumnOrder, defaultColumnVisibility, entry, rawColumnVisibility]);

  const normalizedDefaultColumnVisibility = useMemo(() => {
    return normalizeColumnVisibility({
      columnIds: defaultColumnOrder,
      defaultVisibility: defaultColumnVisibility,
      persistedVisibility: {},
    });
  }, [defaultColumnOrder, defaultColumnVisibility]);

  const canReset = useMemo(() => {
    if (!entry) {
      return false;
    }

    const hasCustomOrder = !areArraysEqual(
      normalizedColumnOrder,
      defaultColumnOrder,
    );
    const hasCustomVisibility = !areVisibilityStatesEqual(
      normalizedColumnVisibility,
      normalizedDefaultColumnVisibility,
    );

    return hasCustomOrder || hasCustomVisibility;
  }, [
    defaultColumnOrder,
    entry,
    normalizedColumnOrder,
    normalizedColumnVisibility,
    normalizedDefaultColumnVisibility,
  ]);

  const handleClickReset = useCallback(() => {
    dispatch(
      registerTable({ tableId, defaultColumnOrder, defaultColumnVisibility }),
    );
    dispatch(resetColumnOrder(tableId));
    dispatch(resetColumnVisibility(tableId));
  }, [dispatch, tableId, defaultColumnOrder, defaultColumnVisibility]);

  useEffect(() => {
    if (!entry) {
      return;
    }
    if (areArraysEqual(rawColumnOrder, normalizedColumnOrder)) {
      return;
    }
    dispatch(setColumnOrder({ tableId, order: normalizedColumnOrder }));
  }, [dispatch, entry, rawColumnOrder, normalizedColumnOrder, tableId]);

  useEffect(() => {
    if (!entry) {
      return;
    }

    if (
      areVisibilityStatesEqual(rawColumnVisibility, normalizedColumnVisibility)
    ) {
      return;
    }

    dispatch(
      setColumnVisibility({ tableId, visibility: normalizedColumnVisibility }),
    );
  }, [
    dispatch,
    entry,
    rawColumnVisibility,
    normalizedColumnVisibility,
    tableId,
  ]);

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

  const handleColumnVisibilityChange = useCallback(
    (updater: Updater<VisibilityState>) => {
      const nextVisibility =
        typeof updater === 'function'
          ? (updater as (old: VisibilityState) => VisibilityState)(
              normalizedColumnVisibility,
            )
          : updater;

      dispatch(setColumnVisibility({ tableId, visibility: nextVisibility }));
    },
    [dispatch, normalizedColumnVisibility, tableId],
  );

  return {
    columnOrder: normalizedColumnOrder,
    onColumnOrderChange: handleColumnOrderChange,
    columnVisibility: normalizedColumnVisibility,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    canReset,
    onClickReset: handleClickReset,
  };
};
