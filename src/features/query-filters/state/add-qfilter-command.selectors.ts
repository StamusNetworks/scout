import { RootState } from '@/store/store';

export const selectFilterCommand = (state: RootState) =>
  state.modals.addFiltersCommand;

export const selectFilterCommandSearch = (state: RootState) =>
  selectFilterCommand(state).search;

export const selectFilterCommandFilter = (state: RootState) =>
  selectFilterCommand(state).filter;

export const selectFilterCommandStep = (state: RootState) =>
  selectFilterCommand(state).step;

export const selectFilterCommandNegated = (state: RootState) =>
  selectFilterCommand(state).negated;
