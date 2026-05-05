import { RootState } from '@/store/store';

export const selectFilterActionModal = (state: RootState) =>
  state.modals.filterActionModal;
