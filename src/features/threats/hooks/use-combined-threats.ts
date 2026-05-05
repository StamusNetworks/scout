import { useMemo } from 'react';

import { useTenant } from '@/features/tenancy';

import {
  useGetCustomThreatsQuery,
  useGetSTIThreatsQuery,
} from '../api/threats.api';

export const useCombinedThreats = () => {
  const tenant = useTenant();
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
