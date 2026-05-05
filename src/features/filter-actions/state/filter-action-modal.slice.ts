import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  SendMailFilterAction,
  SuppressFilterAction,
  TagAndKeepFilterAction,
  TagFilterAction,
  ThreatFilterAction,
  ThresholdFilterAction,
} from '../model/filter-action';

export type FilterActionModalMode = 'create' | 'edit';

export type FilterActionModalState =
  | { kind: 'closed' }
  | {
      kind: 'declaration';
      mode: FilterActionModalMode;
      filterAction: ThreatFilterAction | undefined;
    }
  | {
      kind: 'suppress';
      mode: FilterActionModalMode;
      filterAction: SuppressFilterAction | undefined;
    }
  | {
      kind: 'tag';
      mode: FilterActionModalMode;
      keep: boolean;
      filterAction: TagFilterAction | TagAndKeepFilterAction | undefined;
    }
  | {
      kind: 'threshold';
      mode: FilterActionModalMode;
      filterAction: ThresholdFilterAction | undefined;
    }
  | {
      kind: 'sendMail';
      mode: FilterActionModalMode;
      filterAction: SendMailFilterAction | undefined;
    };

export type OpenFilterActionModalPayload = Exclude<
  FilterActionModalState,
  { kind: 'closed' }
>;

const initialState: FilterActionModalState = { kind: 'closed' };

export const filterActionModalSlice = createSlice({
  name: 'filterActionModal',
  initialState: initialState as FilterActionModalState,
  reducers: {
    openFilterActionModal: (
      _state,
      action: PayloadAction<OpenFilterActionModalPayload>,
    ) => action.payload,
    closeFilterActionModal: () => ({ kind: 'closed' as const }),
  },
});

export const { openFilterActionModal, closeFilterActionModal } =
  filterActionModalSlice.actions;

export const filterActionModalInitialState = initialState;
