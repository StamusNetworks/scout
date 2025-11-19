import { values } from 'ramda';

import { Row } from '@/common/design-system/atoms/layout/row';
import {
  ScrollArea,
  ScrollBar,
} from '@/common/design-system/atoms/ui/scroll-area';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetActiveThreatsQuery } from '../api/threats.api';
import { ActiveThreatBlockView } from '../components/coverage-block/active-threat-block';
import { CoverageBlockSkeleton } from '../components/coverage-block/coverage-block.skeleton';
import { useCombinedThreats } from '../hooks/use-combined-threats';

export const FamilyActiveThreats = ({ familyId }: { familyId: number }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: activeThreats, isLoading: activeThreatsLoading } =
    useGetActiveThreatsQuery({ ...params, family_id: familyId });
  const { data: threats } = useCombinedThreats();

  if (activeThreatsLoading) {
    return (
      <Row className="gap-2 [&_>_div]:w-64">
        {Array.from({ length: 4 }).map((_, i) => (
          <CoverageBlockSkeleton key={i} />
        ))}
      </Row>
    );
  }

  if (!activeThreats?.ids.length || !threats) return null;

  return (
    <ScrollArea className="mt-6 w-full overflow-auto pb-2.5">
      <div className="p-1">
        <Row className="gap-4 [&_a]:w-64">
          {values(activeThreats.entities).map((threat) => (
            <ActiveThreatBlockView
              key={threat.pk}
              id={threat.pk}
              familyClass={threats.entities[threat.pk]?.family_class}
              name={threat.name}
              tooltip={threat.description}
              victims={threat.nb_assets?.nb_victim}
              victimsNew={threat.nb_assets?.nb_new_victim}
            />
          ))}
        </Row>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
