import { useMemo } from 'react';

import { useTenant } from '@/features/tenancy';

import {
  useGetCustomThreatsQuery,
  useGetSTIThreatsQuery,
} from '../../api/threats.api';

export const useThreat = (id?: number) => {
  const tenant = useTenant();
  const { data: allThreats, isLoading: STILoading } = useGetSTIThreatsQuery();
  const { data: customThreats, isLoading: customLoading } =
    useGetCustomThreatsQuery({ tenant });

  return useMemo(
    () =>
      id === undefined
        ? {
            data: undefined,
            isLoading: STILoading || customLoading,
          }
        : {
            data: allThreats?.entities[id] || customThreats?.entities[id],
            isLoading: STILoading || customLoading,
          },
    [allThreats, customThreats, id, STILoading, customLoading],
  );
};
