import { useMemo } from 'react';

import { selectTenant } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector } from '@/store/store';

import {
  useGetCustomThreatsQuery,
  useGetSTIThreatsQuery,
} from '../threats.api';

export const useThreat = (pk?: number) => {
  const tenant = useAppSelector(selectTenant);
  const { data: allThreats, isLoading: STILoading } = useGetSTIThreatsQuery();
  const { data: customThreats, isLoading: customLoading } =
    useGetCustomThreatsQuery({ tenant });

  return useMemo(
    () =>
      pk === undefined
        ? {
            data: undefined,
            isLoading: STILoading || customLoading,
          }
        : {
            data: allThreats?.entities[pk] || customThreats?.entities[pk],
            isLoading: STILoading || customLoading,
          },
    [allThreats, customThreats, pk, STILoading, customLoading],
  );
};
