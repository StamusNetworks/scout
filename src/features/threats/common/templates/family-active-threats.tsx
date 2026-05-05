import { values } from 'ramda';

import { Row } from '@/common/design-system/atoms/layout/row';
import {
  ScrollArea,
  ScrollBar,
} from '@/common/design-system/atoms/ui/scroll-area';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetActiveThreatsQuery } from '../../api/threats.api';
import { useCombinedThreats } from '../hooks/use-combined-threats';
import { ActiveThreatBlockView } from '../molecules/coverage-block/active-threat-block';
import { CoverageBlockSkeleton } from '../molecules/coverage-block/coverage-block.skeleton';

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
    <ScrollArea
      type="always"
      className="mt-6 w-full overflow-auto pb-2.5"
    >
      <div className="p-1">
        <Row className="gap-4 [&_a]:w-64">
          {values(activeThreats.entities).map((threat) => (
            <ActiveThreatBlockView
              key={threat.id}
              id={threat.id}
              kind={threats.entities[threat.id]?.kind ?? 'compromise'}
              name={threat.name}
              description={threat.description}
              victims={threat.assets.victims}
              victimsNew={threat.assets.newVictims}
            />
          ))}
        </Row>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
