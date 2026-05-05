/**
 * Public API for the tenancy bounded context. Owns the active-tenant
 * concept and the tenants list. Cross-feature consumers must import
 * from this barrel only.
 */

export type { Tenant } from './model/tenant';

export { useTenant } from './hooks/use-tenant';
export { useTenancy } from './hooks/use-tenancy';
export { useTenantsList } from './hooks/use-tenants-list';
export { useSetTenant } from './hooks/use-set-tenant';
export { useFetchTenantsList } from './hooks/use-fetch-tenants-list';
