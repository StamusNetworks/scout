import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { routes } from '@/pages/routes.config';

import {
  useGetKillChainCountersByThreatIdQuery,
  useGetKillChainCountersQuery,
} from '../../../entities/api/entities.api';
import { useKillChainCounters } from '../../../entities/api/hooks/useKillChainCounters';
import { killChainsConfig } from '../../killchain';
import { KillChainCountersTemplate } from './killchain-counters.template';

export const KillChainCounters = ({ className }: { className?: string }) => {
  const { data, isFetching } = useKillChainCounters();
  const navigate = useNavigate();

  const handleClick = useCallback(
    (killchain: keyof typeof killChainsConfig) => {
      navigate(routes.threats_compromises_entities + '?killchain=' + killchain);
    },
    [navigate],
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
  const navigate = useNavigate();
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const { data, isFetching } = useGetKillChainCountersByThreatIdQuery({
    ...params,
    threat_id: threatId,
  });

  const handleClick = useCallback(
    (killchain: keyof typeof killChainsConfig) => {
      navigate(
        routes.threats_coverage_threat.replace(':threatId', threatId) +
          '?killchain=' +
          killchain,
      );
    },
    [threatId, navigate],
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
  const navigate = useNavigate();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isFetching } = useGetKillChainCountersQuery({
    ...params,
    family_id: familyId,
  });

  const handleClick = useCallback(
    (killchain: keyof typeof killChainsConfig) => {
      navigate(
        routes.threats_coverage_family.replace(':familyId', familyId) +
          '?killchain=' +
          killchain,
      );
    },
    [familyId, navigate],
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
