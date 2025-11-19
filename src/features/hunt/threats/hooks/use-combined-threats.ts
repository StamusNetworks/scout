import { useMemo } from 'react';

import { selectTenant } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector } from '@/store/store';

import {
  useGetCustomThreatsQuery,
  useGetSTIThreatsQuery,
} from '../api/threats.api';

export const useCombinedThreats = () => {
  const tenant = useAppSelector(selectTenant);
  const { data: STIThreats, isLoading: STILoading } =
    useGetSTIThreatsQuery(undefined);
  const { data: customThreats, isLoading: customLoading } =
    useGetCustomThreatsQuery({ tenant });

  return useMemo(
    () => ({
      data: {
        ids: STIThreats?.ids.concat(customThreats?.ids || []) || [],
        entities: {
          ...STIThreats?.entities,
          ...customThreats?.entities,
        },
      },
      isLoading: STILoading || customLoading,
    }),
    [STILoading, customLoading, STIThreats, customThreats],
  );
};
