import { useCallback } from 'react';

import { useAppDispatch } from '@/store/store';

import { setTenant } from '../state/tenancy.slice';

/**
 * Returns a stable setter for the active tenant. Use from UI controls
 * (tenant picker) and post-share state restoration.
 */
export const useSetTenant = () => {
  const dispatch = useAppDispatch();
  return useCallback(
    (tenantId: number) => dispatch(setTenant(tenantId)),
    [dispatch],
  );
};
