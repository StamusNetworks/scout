import { useAppSelector } from '@/store/store';

import { selectTenant } from '../state/tenancy.selectors';

/**
 * Returns the currently active tenant id, or `undefined` on single-tenant
 * deployments. The canonical hook for tenant-scoping a query.
 */
export const useTenant = () => useAppSelector(selectTenant);
