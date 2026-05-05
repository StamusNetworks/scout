import { useMemo } from 'react';

import { useTenant } from '@/features/tenancy';

import {
  useGetCustomThreatsQuery,
  useGetSTIThreatsQuery,
} from '../../api/threats.api';

export const useThreat = (pk?: number) => {
  const tenant = useTenant();
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
