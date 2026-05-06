import { useTenant } from '@/features/tenancy';

import {
  useGetCustomThreatsQuery,
  useGetSTIThreatsQuery,
} from '../api/threats.api';
import { mergeThreatCollections } from '../model/threat-merge';

export const useCombinedThreats = () => {
  const tenant = useTenant();
  const { data: stiThreats, isLoading: stiLoading } =
    useGetSTIThreatsQuery(undefined);
  const { data: customThreats, isLoading: customLoading } =
    useGetCustomThreatsQuery({ tenant });

  return {
    data: mergeThreatCollections(stiThreats, customThreats),
    isLoading: stiLoading || customLoading,
  };
};
