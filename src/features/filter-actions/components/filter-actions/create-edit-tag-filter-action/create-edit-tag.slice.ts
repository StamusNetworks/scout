import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

import {
  TagAndKeepFilterAction,
  TagFilterAction,
} from '../../../model/filter-action';

type TagOrKeepFilterAction = TagFilterAction | TagAndKeepFilterAction;

type TagModalState = {
  isOpen: boolean;
  keep: boolean;
  mode: 'create' | 'edit';
  filterAction: TagOrKeepFilterAction | undefined;
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
            filterAction?: TagOrKeepFilterAction;
          }
        | {
            mode: 'edit';
            filterAction: TagOrKeepFilterAction;
            keep: boolean;
          }
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
