import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

import { ThresholdFilterAction } from '../../../model/filter-action.schema';

type ThresholdModalState = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  filterAction: ThresholdFilterAction | undefined;
};

const initialState: ThresholdModalState = {
  isOpen: false,
  mode: 'create',
  filterAction: undefined,
};

export const createEditThresholdModalSlice = createSlice({
  name: 'createEditThresholdModal',
  initialState,
  reducers: {
    openThresholdModal: (
      state,
      action: PayloadAction<
        | {
            mode: 'create';
            filterAction?: ThresholdFilterAction;
          }
        | { mode: 'edit'; filterAction: ThresholdFilterAction }
      >,
    ) => {
      state.mode = action.payload.mode;
      state.isOpen = true;
      state.filterAction = action.payload.filterAction;
    },
    closeThresholdModal: (state) => {
      state.isOpen = false;
      state.mode = 'create';
      state.filterAction = undefined;
    },
  },
});

export const { openThresholdModal, closeThresholdModal } =
  createEditThresholdModalSlice.actions;

export const createEditThresholdModalInitialState = initialState;

export const selectThresholdModal = (state: RootState) =>
  state.modals.createEditThresholdModal;
