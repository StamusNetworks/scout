import type { RootState } from '@/store/store';

export const selectTenancy = (state: RootState) => state.filters.tenancy;

export const selectTenantsList = (state: RootState) =>
  state.filters.tenancy.tenantsList;

/**
 * The currently active tenant id, or `undefined` when multi-tenancy is
 * off (single-tenant deployments). Components asking "which tenant am I
 * scoped to?" should consume this and not the raw slice.
 */
export const selectTenant = (state: RootState) => {
  const tenancy = selectTenancy(state);

  if (tenancy.multitenancy) {
    return tenancy.tenant;
  }

  return undefined;
};
