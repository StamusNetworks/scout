import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

import { TagFilterAction } from '../../../model/filter-action.schema';

type TagModalState = {
  isOpen: boolean;
  keep: boolean;
  mode: 'create' | 'edit';
  filterAction: TagFilterAction | undefined;
};

const initialState: TagModalState = {
  isOpen: false,
  keep: false,
  mode: 'create',
  filterAction: undefined,
};

export const createEditTagModalSlice = createSlice({
  name: 'createEditTagModal',
  initialState,
  reducers: {
    openTagModal: (
      state,
      action: PayloadAction<
        | {
            mode: 'create';
            keep: boolean;
            filterAction?: TagFilterAction;
          }
        | { mode: 'edit'; filterAction: TagFilterAction; keep: boolean }
      >,
    ) => {
      state.keep = action.payload.keep;
      state.mode = action.payload.mode;
      state.isOpen = true;
      state.filterAction = action.payload.filterAction;
    },
    closeTagModal: (state) => {
      state.isOpen = false;
      state.mode = 'create';
      state.filterAction = undefined;
    },
  },
});

export const { openTagModal, closeTagModal } = createEditTagModalSlice.actions;

export const createEditTagModalInitialState = initialState;

export const selectTagModal = (state: RootState) =>
  state.modals.createEditTagModal;
