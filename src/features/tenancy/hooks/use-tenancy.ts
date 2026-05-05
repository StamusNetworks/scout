import { useAppSelector } from '@/store/store';

import { selectTenancy } from '../state/tenancy.selectors';

/**
 * Returns the full tenancy state (multitenancy flag, current tenant,
 * tenant list). Components only needing the tenant id should prefer
 * `useTenant()`.
 */
export const useTenancy = () => useAppSelector(selectTenancy);
