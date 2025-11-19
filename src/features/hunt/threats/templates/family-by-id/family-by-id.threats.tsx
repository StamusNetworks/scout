import { useParams } from 'react-router-dom';

import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetActiveThreatsQuery } from '@/features/hunt/threats/api/threats.api';
import { CoverageBlockSkeleton } from '@/features/hunt/threats/components/coverage-block/coverage-block.skeleton';
import { ThreatBlockView } from '@/features/hunt/threats/components/coverage-block/threat-block';
import { ThreatGrid } from '@/features/hunt/threats/components/threat-grid';
import { useThreats } from '@/features/hunt/threats/hooks/use-threats';

export const ThreatFamilyThreatsList = () => {
  const { familyId } = useParams();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: threats, isLoading } = useThreats({
    family_id: parseInt(familyId || ''),
  });
  const { data: activeThreatData } = useGetActiveThreatsQuery(params);

  if (isLoading) {
    return (
      <ThreatGrid>
        {Array.from({ length: 10 }).map((_, i) => (
          <CoverageBlockSkeleton key={i} />
        ))}
      </ThreatGrid>
    );
  }
  return (
    <>
      <OutletBreadcrumb>
        {threats[0].family_class === 'doc' ? 'Threats' : 'Policy Violations'}
      </OutletBreadcrumb>
      <ThreatGrid>
        {threats.map((threat) => (
          <ThreatBlockView
            key={threat.pk}
            id={threat.pk}
            familyClass={threat.family_class}
            name={threat.name}
            description={threat.description}
            isActive={!!activeThreatData?.entities[threat.pk]}
          />
        ))}
      </ThreatGrid>
    </>
  );
};
