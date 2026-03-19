import { useMemo } from 'react';

import { selectTenant } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector } from '@/store/store';

export type TenantRepository = {
  get(): number | undefined;
};

export function useTenantRepository(): TenantRepository {
  const tenant = useAppSelector(selectTenant);

  return useMemo(
    () => ({
      get: () => tenant,
    }),
    [tenant],
  );
}
