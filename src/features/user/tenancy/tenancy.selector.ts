import { RootState } from '@/store/store';

export const selectTenancy = (state: RootState) => state.filters.tenancy;

export const selectTenantsList = (state: RootState) =>
  state.filters.tenancy.tenantsList;

export const selectTenant = (state: RootState) => {
  const tenancy = selectTenancy(state);

  if (tenancy.multitenancy) {
    return tenancy.tenant;
  }

  return undefined;
};
