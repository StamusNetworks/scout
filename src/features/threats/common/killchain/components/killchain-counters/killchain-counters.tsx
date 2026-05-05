import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';

import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import {
  useGetKillChainCountersByThreatIdQuery,
  useGetKillChainCountersQuery,
} from '@/features/threats/api/entities.api';
import { useKillChainCounters } from '@/features/threats/hooks/use-kill-chain-counters';

import { killChainsConfig } from '../../killchain';
import { KillChainCountersTemplate } from './killchain-counters.template';

export const KillChainCounters = ({ className }: { className?: string }) => {
  const { data, isFetching } = useKillChainCounters();
  const navigate = useNavigate();

  const handleClick = useCallback(
    (killchain: keyof typeof killChainsConfig) => {
      navigate({ to: '/threats/compromises/entities?killchain=' + killchain });
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
      navigate({
        to: `/threats/coverage/threat/${threatId}?killchain=${killchain}`,
      });
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
      navigate({
        to: `/threats/coverage/family/${familyId}?killchain=${killchain}`,
      });
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
