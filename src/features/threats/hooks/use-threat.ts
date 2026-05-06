import { useTenant } from '@/features/tenancy';

import {
  useGetCustomThreatsQuery,
  useGetSTIThreatsQuery,
} from '../api/threats.api';

export const useThreat = (id?: number) => {
  const tenant = useTenant();
  const { data: stiThreats, isLoading: stiLoading } = useGetSTIThreatsQuery();
  const { data: customThreats, isLoading: customLoading } =
    useGetCustomThreatsQuery({ tenant });

  const isLoading = stiLoading || customLoading;
  if (id === undefined) return { data: undefined, isLoading };

  return {
    data: stiThreats?.entities[id] ?? customThreats?.entities[id],
    isLoading,
  };
};
