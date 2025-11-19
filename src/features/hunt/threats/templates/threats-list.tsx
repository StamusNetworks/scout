import { useMemo } from 'react';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetActiveThreatsQuery } from '../api/threats.api';
import { CoverageBlockSkeleton } from '../components/coverage-block/coverage-block.skeleton';
import { ThreatBlockView } from '../components/coverage-block/threat-block';
import { ThreatGrid } from '../components/threat-grid';
import { useThreats } from '../hooks/use-threats';

export const ThreatsList = ({
  familyClass,
  searchInput,
}: {
  familyClass: 'all' | 'doc' | 'dopv';
  searchInput: string;
}) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: threats, isLoading: threatsLoading } = useThreats(
    familyClass === 'all' ? {} : { family_class: familyClass },
  );
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
          key={threat.pk}
          id={threat.pk}
          familyClass={threat.family_class}
          name={threat.name}
          isActive={!!activeThreatData?.entities[threat.pk]}
          description={threat.description}
        />
      ))}
    </ThreatGrid>
  );
};
