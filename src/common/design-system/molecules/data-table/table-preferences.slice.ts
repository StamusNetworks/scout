import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

export type TableId = string;

export type TablePreferencesEntry = {
  columnOrder: string[];
  defaultColumnOrder: string[];
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

const initialState: TablePreferencesState = {};

type RegisterTablePayload = {
  tableId: TableId;
  defaultColumnOrder: string[];
};

type SetColumnOrderPayload = {
  tableId: TableId;
  order: string[];
};

export const tablePreferencesSlice = createSlice({
  name: 'tablePreferences',
  initialState,
  reducers: {
    registerTable: (state, action: PayloadAction<RegisterTablePayload>) => {
      const { tableId, defaultColumnOrder } = action.payload;

      const existing = state[tableId];
      if (!existing) {
        state[tableId] = {
          defaultColumnOrder,
          columnOrder: defaultColumnOrder,
        };
        return;
      }

      existing.defaultColumnOrder = defaultColumnOrder;
      existing.columnOrder = normalizeColumnOrder(
        defaultColumnOrder,
        existing.columnOrder,
      );
    },
    setColumnOrder: (state, action: PayloadAction<SetColumnOrderPayload>) => {
      const { tableId, order } = action.payload;

      const existing = state[tableId];
      if (!existing) {
        state[tableId] = {
          defaultColumnOrder: order,
          columnOrder: order,
        };
        return;
      }

      existing.columnOrder = order;
    },
    resetColumnOrder: (state, action: PayloadAction<TableId>) => {
      const tableId = action.payload;
      const existing = state[tableId];
      if (!existing) {
        return;
      }

      existing.columnOrder = existing.defaultColumnOrder;
    },
  },
});

export const { registerTable, setColumnOrder, resetColumnOrder } =
  tablePreferencesSlice.actions;

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
