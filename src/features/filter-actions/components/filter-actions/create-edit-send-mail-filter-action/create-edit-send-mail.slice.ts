import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

import { SendMailFilterAction } from '../../../model/filter-action';

type SendMailModalState = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  filterAction: SendMailFilterAction | undefined;
};

const initialState: SendMailModalState = {
  isOpen: false,
  mode: 'create',
  filterAction: undefined,
};

export const createEditSendMailModalSlice = createSlice({
  name: 'createEditSendMailModal',
  initialState,
  reducers: {
    openSendMailModal: (
      state,
      action: PayloadAction<
        | {
            mode: 'create';
            filterAction?: SendMailFilterAction;
          }
        | { mode: 'edit'; filterAction: SendMailFilterAction }
      >,
    ) => {
      state.mode = action.payload.mode;
      state.isOpen = true;
      state.filterAction = action.payload.filterAction;
    },
    closeSendMailModal: (state) => {
      state.isOpen = false;
      state.mode = 'create';
      state.filterAction = undefined;
    },
  },
});

export const { openSendMailModal, closeSendMailModal } =
  createEditSendMailModalSlice.actions;

export const createEditSendMailModalInitialState = initialState;

export const selectSendMailModal = (state: RootState) =>
  state.modals.createEditSendMailModal;
