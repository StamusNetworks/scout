import { values } from 'ramda';
import { useMemo } from 'react';

import { useTenant } from '@/features/tenancy';

import {
  useGetCustomThreatsQuery,
  useGetSTIThreatsQuery,
} from '../api/threats.api';
import { ThreatKind } from '../model/threat';

interface ThreatsHookParams {
  kind?: ThreatKind;
  familyId?: number;
}
export const useThreats = ({ kind, familyId }: ThreatsHookParams) => {
  const tenant = useTenant();
  const { data: STIThreats, isLoading: STILoading } =
    useGetSTIThreatsQuery(undefined);
  const { data: customThreats, isLoading: customLoading } =
    useGetCustomThreatsQuery({ tenant });

  const all = useMemo(() => {
    return [
      ...values(STIThreats?.entities || []),
      ...values(customThreats?.entities || []),
    ];
  }, [STIThreats, customThreats]);

  const filtered = useMemo(() => {
    if (!kind && !familyId) return all;
    const filteredByKind = all.filter((threat) =>
      kind ? threat.kind === kind : true,
    );
    return filteredByKind.filter((threat) => {
      if (!familyId) return true;
      return threat.familyId === familyId;
    });
  }, [all, kind, familyId]);

  return {
    data: filtered,
    isLoading: STILoading || customLoading,
  };
};
