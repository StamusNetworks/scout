import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { ImpactedEntitiesTable } from '@/features/hunt/entities/components/impacted-entities-table/impacted-entities-table';
import { KillChainCounters } from '@/features/hunt/killchain/components/killchain-counters/killchain-counters';

export const ThreatsImpactedEntities = () => {
  return (
    <>
      <OutletBreadcrumb link="/threats/compromises/entities">
        Entities
      </OutletBreadcrumb>
      <KillChainCounters />
      <div className="mb-4" />
      <ImpactedEntitiesTable familyClass="doc" />
    </>
  );
};
