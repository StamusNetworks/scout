import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ImpactedEntitiesTable } from '@/features/threats';
import { KillChainCountersByFamilyId } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId/',
)({
  component: () => (
    <PageBoundary key="threat-family-default">
      <ThreatFamilyEntitiesTab />
    </PageBoundary>
  ),
});

function ThreatFamilyEntitiesTab() {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
  return (
    <>
      <KillChainCountersByFamilyId
        className="mb-6"
        familyId={familyId}
      />
      <ImpactedEntitiesTable
        familyId={parseInt(familyId)}
        kind="compromise"
      />
    </>
  );
}
