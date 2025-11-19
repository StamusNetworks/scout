import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { enableTags } from '@/features/hunt/filtering/query-filters/use-cases/enable-tags';
import {
  useGetThreatByIdQuery,
  useGetThreatFamiliesQuery,
} from '@/features/hunt/threats/api/threats.api';
import { routes } from '@/pages/routes.config';
import { useAppDispatch } from '@/store/store';

import {
  useGetKillChainCountersByThreatIdQuery,
  useGetKillChainCountersQuery,
} from '../../../entities/api/entities.api';
import { useKillChainCounters } from '../../../entities/api/hooks/useKillChainCounters';
import { replaceFilters } from '../../../filtering/query-filters/store/query-filters.slice';
import { killChainsConfig } from '../../killchain';
import { KillChainCountersTemplate } from './killchain-counters.template';

export const KillChainCounters = ({ className }: { className?: string }) => {
  const { data, isFetching } = useKillChainCounters();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleClick = useCallback(
    (killchain: keyof typeof killChainsConfig) => {
      enableTags(dispatch);
      dispatch(
        replaceFilters([{ key: 'stamus.kill_chain', value: killchain }]),
      );
      navigate(routes.explorer);
    },
    [dispatch, navigate],
  );

  return (
    <KillChainCountersTemplate
      data={data}
      className={className}
      onKCClick={handleClick}
      isLoading={isFetching}
    />
  );
};

export const KillChainCountersByThreatId = ({
  threatId,
  className,
}: {
  className?: string;
  threatId: string;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data, isFetching } = useGetKillChainCountersByThreatIdQuery({
    ...params,
    threat_id: threatId,
  });

  const { data: currThreat } = useGetThreatByIdQuery({
    tenant: params.tenant,
    threatId,
  });

  const handleClick = useCallback(
    (killchain: keyof typeof killChainsConfig) => {
      enableTags(dispatch);
      dispatch(
        replaceFilters([
          { key: 'stamus.kill_chain', value: killchain },
          { key: 'stamus.threat_name', value: currThreat?.name || '' },
        ]),
      );
      navigate(routes.explorer);
    },
    [currThreat, dispatch, navigate],
  );

  return (
    <KillChainCountersTemplate
      data={data}
      className={className}
      onKCClick={handleClick}
      isLoading={isFetching}
    />
  );
};

export const KillChainCountersByFamilyId = ({
  familyId,
  className,
}: {
  className?: string;
  familyId: string;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isFetching } = useGetKillChainCountersQuery({
    ...params,
    family_id: familyId,
  });

  const { data: currThreatFamily } = useGetThreatFamiliesQuery(
    {
      tenant: params.tenant,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.entities[parseInt(familyId!)],
      }),
    },
  );
  const handleClick = useCallback(
    (killchain: keyof typeof killChainsConfig) => {
      enableTags(dispatch);
      dispatch(
        replaceFilters([
          { key: 'stamus.kill_chain', value: killchain },
          { key: 'stamus.family_name', value: currThreatFamily?.name || '' },
        ]),
      );
      navigate(routes.explorer);
    },
    [currThreatFamily, dispatch, navigate],
  );

  return (
    <KillChainCountersTemplate
      data={data}
      className={className}
      onKCClick={handleClick}
      isLoading={isFetching}
    />
  );
};
