import { useMemo } from 'react';

import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import {
  useGetActiveThreatsQuery,
  useGetThreatFamiliesQuery,
} from '../../api/threats.api';
import { ThreatKind } from '../../model/threat';
import { useThreats } from '../hooks/use-threats';
import { CoverageBlockSkeleton } from '../molecules/coverage-block/coverage-block.skeleton';
import { ThreatBlockView } from '../molecules/coverage-block/threat-block';
import { ThreatGrid } from '../molecules/threat-grid';

export const ThreatsList = ({
  kind,
  searchInput,
}: {
  kind?: ThreatKind;
  searchInput: string;
}) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: threats, isLoading: threatsLoading } = useThreats({ kind });
  const { data: families } = useGetThreatFamiliesQuery({});
  const filteredThreats = useMemo(() => {
    return threats.filter((threat) => {
      if (threat.name.toLowerCase().includes(searchInput.toLowerCase())) {
        return true;
      }
      if (threat.description) {
        return threat.description
          .toLowerCase()
          .includes(searchInput.toLowerCase());
      }
      return false;
    });
  }, [threats, searchInput]);
  const { data: activeThreatData } = useGetActiveThreatsQuery(params);
  if (threatsLoading) {
    return (
      <ThreatGrid>
        {Array.from({ length: 40 }).map((_, i) => (
          <CoverageBlockSkeleton key={i} />
        ))}
      </ThreatGrid>
    );
  }

  if (!filteredThreats) return null;

  return (
    <ThreatGrid>
      {filteredThreats.map((threat) => (
        <ThreatBlockView
          key={threat.id}
          id={threat.id}
          kind={threat.kind}
          name={threat.name}
          isActive={!!activeThreatData?.entities[threat.id]}
          description={threat.description}
          familyName={families?.entities[threat.familyId]?.name}
        />
      ))}
    </ThreatGrid>
  );
};
