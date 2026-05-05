import type { RootState } from '@/store/store';

export const selectIsEnterprise = (state: RootState) =>
  state.settings.enterprise;
