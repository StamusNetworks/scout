import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VisibilityState } from '@tanstack/react-table';

import { RootState } from '@/store/store';

export type TableId = string;

export type TablePreferencesEntry = {
  columnOrder: string[];
  defaultColumnOrder: string[];
  columnVisibility: VisibilityState;
  defaultColumnVisibility: VisibilityState;
};

export type TablePreferencesState = Record<TableId, TablePreferencesEntry>;

export const normalizeColumnOrder = (
  defaultOrder: string[],
  persistedOrder: string[],
) => {
  const defaultSet = new Set(defaultOrder);
  const seen = new Set<string>();

  const filtered: string[] = [];
  for (const id of persistedOrder) {
    if (!defaultSet.has(id)) {
      continue;
    }
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    filtered.push(id);
  }

  const missing = defaultOrder.filter((id) => !seen.has(id));
  return [...filtered, ...missing];
};

export const normalizeColumnVisibility = ({
  columnIds,
  defaultVisibility,
  persistedVisibility,
}: {
  columnIds: string[];
  defaultVisibility: VisibilityState;
  persistedVisibility: VisibilityState;
}) => {
  const normalized: VisibilityState = {};
  const allowedIds = new Set(columnIds);

  for (const id of columnIds) {
    normalized[id] = defaultVisibility[id] ?? true;
  }

  for (const [id, isVisible] of Object.entries(persistedVisibility)) {
    if (!allowedIds.has(id)) {
      continue;
    }
    normalized[id] = isVisible;
  }

  return normalized;
};

const initialState: TablePreferencesState = {};

type RegisterTablePayload = {
  tableId: TableId;
  defaultColumnOrder: string[];
  defaultColumnVisibility?: VisibilityState;
};

type SetColumnOrderPayload = {
  tableId: TableId;
  order: string[];
};

type SetColumnVisibilityPayload = {
  tableId: TableId;
  visibility: VisibilityState;
};

export const tablePreferencesSlice = createSlice({
  name: 'tablePreferences',
  initialState,
  reducers: {
    registerTable: (state, action: PayloadAction<RegisterTablePayload>) => {
      const {
        tableId,
        defaultColumnOrder,
        defaultColumnVisibility = {},
      } = action.payload;

      const existing = state[tableId];
      if (!existing) {
        state[tableId] = {
          defaultColumnOrder,
          columnOrder: defaultColumnOrder,
          defaultColumnVisibility,
          columnVisibility: normalizeColumnVisibility({
            columnIds: defaultColumnOrder,
            defaultVisibility: defaultColumnVisibility,
            persistedVisibility: {},
          }),
        };
        return;
      }

      // If persisted, we normalize the order in case of new columns or removed columns
      existing.defaultColumnOrder = defaultColumnOrder;
      existing.columnOrder = normalizeColumnOrder(
        defaultColumnOrder,
        existing.columnOrder,
      );
      // If persisted, we normalize the visibility in case of new columns or removed columns
      existing.defaultColumnVisibility = defaultColumnVisibility;
      existing.columnVisibility = normalizeColumnVisibility({
        columnIds: defaultColumnOrder,
        defaultVisibility: defaultColumnVisibility,
        persistedVisibility: existing.columnVisibility,
      });
    },
    setColumnOrder: (state, action: PayloadAction<SetColumnOrderPayload>) => {
      const { tableId, order } = action.payload;

      const existing = state[tableId];
      if (!existing) {
        return;
      }
      existing.columnOrder = normalizeColumnOrder(
        existing.defaultColumnOrder,
        order,
      );
    },
    setColumnVisibility: (
      state,
      action: PayloadAction<SetColumnVisibilityPayload>,
    ) => {
      const { tableId, visibility } = action.payload;
      const existing = state[tableId];
      if (!existing) {
        return;
      }

      existing.columnVisibility = normalizeColumnVisibility({
        columnIds: existing.defaultColumnOrder,
        defaultVisibility: existing.defaultColumnVisibility,
        persistedVisibility: visibility,
      });
    },
    resetColumnOrder: (state, action: PayloadAction<TableId>) => {
      const tableId = action.payload;
      const existing = state[tableId];
      if (!existing) {
        return;
      }

      existing.columnOrder = existing.defaultColumnOrder;
    },
    resetColumnVisibility: (state, action: PayloadAction<TableId>) => {
      const tableId = action.payload;
      const existing = state[tableId];
      if (!existing) {
        return;
      }

      existing.columnVisibility = normalizeColumnVisibility({
        columnIds: existing.defaultColumnOrder,
        defaultVisibility: existing.defaultColumnVisibility,
        persistedVisibility: {},
      });
    },
  },
});

export const {
  registerTable,
  setColumnOrder,
  resetColumnOrder,
  setColumnVisibility,
  resetColumnVisibility,
} = tablePreferencesSlice.actions;

export const tablePreferencesInitialState = initialState;

export const selectTablePreferencesState = (state: RootState) =>
  state.tablePreferences;

export const selectTablePreferencesEntry = (
  state: RootState,
  tableId: TableId,
) => selectTablePreferencesState(state)[tableId];

export const selectColumnOrder = (state: RootState, tableId: TableId) => {
  const entry = selectTablePreferencesEntry(state, tableId);
  if (!entry) {
    return [];
  }
  return normalizeColumnOrder(entry.defaultColumnOrder, entry.columnOrder);
};

export const selectRawColumnOrder = (state: RootState, tableId: TableId) => {
  const entry = selectTablePreferencesEntry(state, tableId);
  if (!entry) {
    return [];
  }
  return entry.columnOrder;
};

export const selectColumnVisibility = (state: RootState, tableId: TableId) => {
  const entry = selectTablePreferencesEntry(state, tableId);
  if (!entry) {
    return {};
  }

  return normalizeColumnVisibility({
    columnIds: entry.defaultColumnOrder,
    defaultVisibility: entry.defaultColumnVisibility,
    persistedVisibility: entry.columnVisibility,
  });
};

export const selectRawColumnVisibility = (
  state: RootState,
  tableId: TableId,
) => {
  const entry = selectTablePreferencesEntry(state, tableId);
  if (!entry) {
    return {};
  }
  return entry.columnVisibility;
};
