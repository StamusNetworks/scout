import { KillChainCounters } from '@/features/hunt/killchain/components/killchain-counters/killchain-counters';
import { ImpactedEntitiesTable } from '@/features/threats/common/molecules/impacted-entities-table/impacted-entities-table';

export const CompromisesEntities = () => {
  return (
    <>
      <KillChainCounters />
      <div className="mb-4" />
      <ImpactedEntitiesTable familyClass="doc" />
    </>
  );
};
