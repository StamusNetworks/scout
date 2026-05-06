import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '@/store/store';

export type QfilterModalKind = 'closed' | 'addFilter' | 'addEsFilter';

type QfilterModalState = { kind: QfilterModalKind };

const initialState: QfilterModalState = { kind: 'closed' };

export const qfilterModalSlice = createSlice({
  name: 'qfilterModal',
  initialState,
  reducers: {
    openAddFilter: (state) => {
      state.kind = 'addFilter';
    },
    openAddEsFilter: (state) => {
      state.kind = 'addEsFilter';
    },
    closeQfilterModal: (state) => {
      state.kind = 'closed';
    },
  },
});

export const { openAddFilter, openAddEsFilter, closeQfilterModal } =
  qfilterModalSlice.actions;

export const qfilterModalInitialState = initialState;

export const selectQfilterModalKind = (state: RootState) =>
  state.modals.qfilterModal.kind;
