import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

import { ThreatFilterAction } from '../../../model/filter-action';
import { openSuppressModal } from '../create-edit-suppress-filter-action/create-edit-suppress.slice';
import { openTagModal } from '../create-edit-tag-filter-action/create-edit-tag.slice';
import { openThresholdModal } from '../create-edit-threshold-filter-filter-action/create-edit-threshold.slice';

type DeclarationModalState = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  filterAction: ThreatFilterAction | undefined;
};

const initialState: DeclarationModalState = {
  isOpen: false,
  mode: 'create',
  filterAction: undefined,
};

export const createEditDeclarationModalSlice = createSlice({
  name: 'createEditDeclarationModal',
  initialState,
  reducers: {
    openDeclarationModal: (
      state,
      action: PayloadAction<
        | { mode: 'create'; filterAction?: ThreatFilterAction }
        | { mode: 'edit'; filterAction: ThreatFilterAction }
      >,
    ) => {
      state.mode = action.payload.mode;
      state.isOpen = true;
      state.filterAction = action.payload.filterAction;
    },
    closeDeclarationModal: (state) => {
      state.isOpen = false;
      state.mode = 'create';
      state.filterAction = undefined;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(openThresholdModal, (state) => {
      state.isOpen = false;
    });
    builder.addCase(openSuppressModal, (state) => {
      state.isOpen = false;
    });
    builder.addCase(openTagModal, (state) => {
      state.isOpen = false;
    });
  },
});

export const { openDeclarationModal, closeDeclarationModal } =
  createEditDeclarationModalSlice.actions;

export const createEditDeclarationModalInitialState = initialState;

export const selectDeclarationModal = (state: RootState) =>
  state.modals.createEditDeclarationModal;
