import { useAppSelector } from '@/store/store';

import { selectTenantsList } from '../state/tenancy.selectors';

export const useTenantsList = () => useAppSelector(selectTenantsList);
