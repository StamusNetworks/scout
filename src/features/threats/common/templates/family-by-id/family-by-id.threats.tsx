import { useParams } from '@tanstack/react-router';

import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetActiveThreatsQuery } from '../../../api/threats.api';
import { useThreats } from '../../hooks/use-threats';
import { CoverageBlockSkeleton } from '../../molecules/coverage-block/coverage-block.skeleton';
import { ThreatBlockView } from '../../molecules/coverage-block/threat-block';
import { ThreatGrid } from '../../molecules/threat-grid';

export const ThreatFamilyThreatsList = () => {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
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
