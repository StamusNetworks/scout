import { KillChainCounters } from '../../common/killchain/components/killchain-counters/killchain-counters';
import { ImpactedEntitiesTable } from '../../common/molecules/impacted-entities-table/impacted-entities-table';
import { ThreatKind } from '../../model/threat';

type Props = { kind: ThreatKind };

/**
 * Aggregate "entities" view for a threat kind. Shows kill chain counters
 * for compromises (where they're meaningful) and the impacted entities
 * table for both kinds.
 */
export const ThreatEntitiesOverview = ({ kind }: Props) => (
  <>
    {kind === 'compromise' && (
      <>
        <KillChainCounters />
        <div className="mb-4" />
      </>
    )}
    <ImpactedEntitiesTable kind={kind} />
  </>
);
