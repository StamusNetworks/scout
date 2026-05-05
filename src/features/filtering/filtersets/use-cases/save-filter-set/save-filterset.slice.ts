import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { QueryFilterState } from '@/features/query-filters/query-filter.model';
import { RootState } from '@/store/store';

type SaveFilterSetModalState = {
  isOpen: boolean;
  mode: 'create' | 'fromFilterAction';
  filters?: QueryFilterState[] | undefined;
};

const initialState: SaveFilterSetModalState = {
  isOpen: false,
  mode: 'create',
  filters: undefined,
};

export const saveFilterSetModalSlice = createSlice({
  name: 'saveFilterSetModal',
  initialState,
  reducers: {
    openSaveFilterSetModal: (
      state,
      action: PayloadAction<
        | {
            mode: 'fromFilterAction';
            filters: QueryFilterState[];
          }
        | undefined
      >,
    ) => {
      state.isOpen = true;
      state.mode =
        action.payload?.mode === 'fromFilterAction'
          ? 'fromFilterAction'
          : 'create';
      state.filters = action.payload?.filters;
    },
    closeSaveFilterSetModal: (state) => {
      state.isOpen = false;
      state.mode = 'create';
      state.filters = undefined;
    },
  },
});

export const { openSaveFilterSetModal, closeSaveFilterSetModal } =
  saveFilterSetModalSlice.actions;

export const saveFilterSetModalInitialState = initialState;

export const selectSaveFilterSetModal = (state: RootState) =>
  state.modals.saveFilterSetModal;
