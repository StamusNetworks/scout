import { useGetTenantsListQuery } from '../api/tenancy.api';

/**
 * Triggers the tenants-list fetch and exposes its loading state. The
 * tenancy slice listens to the same endpoint via `extraReducers` and
 * populates `tenantsList` / sets the active tenant from localStorage.
 *
 * Most callers want `useTenantsList()` instead; this hook is for the
 * app loader, which needs to gate rendering on the fetch.
 */
export const useFetchTenantsList = (options?: {
  refetchOnFocus?: boolean;
  refetchOnReconnect?: boolean;
}) => useGetTenantsListQuery(undefined, options);
