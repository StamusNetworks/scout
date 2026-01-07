import {
  ActionCreatorWithPayload,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Updater } from '@tanstack/react-table';

import { store } from '@/app/App';
import { columns } from '@/features/hunt/events/components/events-table/events.columns';
import { RootState } from '@/store/store';

interface EventsPageTableState {
  columnsOrder: string[];
  defaultColumnsOrder: string[];
}

const getInitialState = (
  defaultColumnsOrder: string[],
): EventsPageTableState => ({
  columnsOrder: defaultColumnsOrder,
  defaultColumnsOrder,
});

interface CreateTableSliceProps {
  name: string;
  defaultColumnsOrder: string[];
}

export const createTableSlice = ({
  name,
  defaultColumnsOrder,
}: CreateTableSliceProps) => {
  return createSlice({
    name,
    initialState: getInitialState(defaultColumnsOrder),
    reducers: {
      setColumnOrder: (state, action: PayloadAction<string[]>) => {
        state.columnsOrder = action.payload;
      },
      resetColumnOrder: (state) => {
        state.columnsOrder = state.defaultColumnsOrder;
      },
    },
  });
};

export const getColumnsUpdater =
  (
    setColumnOrder: ActionCreatorWithPayload<
      string[],
      `${string}/setColumnOrder`
    >,
  ) =>
  (columnsOrder: string[]) =>
  (updater: Updater<string[]>) => {
    const nextColumnsOrder =
      typeof updater === 'function'
        ? (updater as (old: string[]) => string[])(columnsOrder)
        : updater;

    store.dispatch(setColumnOrder(nextColumnsOrder));
  };

export const eventsPageTableStateSlice = createTableSlice({
  name: 'eventsPageTable',
  defaultColumnsOrder: columns.map((col) => col.id!),
});

export const { setColumnOrder, resetColumnOrder } =
  eventsPageTableStateSlice.actions;

export const selectEventsPageTableState = (state: RootState) =>
  state.pages.events.table;

export const selectColumnsOrder = (state: RootState) =>
  selectEventsPageTableState(state).columnsOrder;

export const getHandleColumnsOrderChange = getColumnsUpdater(setColumnOrder);
