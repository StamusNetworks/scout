import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

import { SuppressFilterAction } from '../../../model/filter-action';

type SuppressModalState = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  filterAction: SuppressFilterAction | undefined;
};

const initialState: SuppressModalState = {
  isOpen: false,
  mode: 'create',
  filterAction: undefined,
};

export const createEditSuppressModalSlice = createSlice({
  name: 'createEditSuppressModal',
  initialState,
  reducers: {
    openSuppressModal: (
      state,
      action: PayloadAction<
        | { mode: 'create'; filterAction?: SuppressFilterAction }
        | { mode: 'edit'; filterAction: SuppressFilterAction }
      >,
    ) => {
      state.mode = action.payload.mode;
      state.isOpen = true;
      state.filterAction = action.payload?.filterAction;
    },
    closeSuppressModal: (state) => {
      state.isOpen = false;
      state.mode = 'create';
      state.filterAction = undefined;
    },
  },
});

export const { openSuppressModal, closeSuppressModal } =
  createEditSuppressModalSlice.actions;

export const createEditSuppressModalInitialState = initialState;

export const selectSuppressModal = (state: RootState) =>
  state.modals.createEditSuppressModal;
