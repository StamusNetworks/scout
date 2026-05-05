import type { RootState } from '@/store/store';

export const selectPermissions = (state: RootState) => ({
  permissions: state.auth.permissions,
});
