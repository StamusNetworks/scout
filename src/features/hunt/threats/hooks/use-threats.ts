import { values } from 'ramda';
import { useMemo } from 'react';

import { selectTenant } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector } from '@/store/store';

import {
  useGetCustomThreatsQuery,
  useGetSTIThreatsQuery,
} from '../api/threats.api';

interface ThreatsHookParams {
  family_class?: 'doc' | 'dopv';
  family_id?: number;
}
export const useThreats = ({ family_class, family_id }: ThreatsHookParams) => {
  const tenant = useAppSelector(selectTenant);
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
    if (!family_class && !family_id) return all;
    const filteredByClass = all.filter((threat) =>
      family_class ? threat.family_class === family_class : true,
    );
    return filteredByClass.filter((threat) => {
      if (!family_id) return true;
      return threat.family === family_id;
    });
  }, [all, family_class, family_id]);

  return {
    data: filtered,
    isLoading: STILoading || customLoading,
  };
};
