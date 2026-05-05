import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ImpactedEntitiesTable } from '@/features/threats/components/impacted-entities-table/impacted-entities-table';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/family/$familyId/',
)({
  component: () => (
    <PageBoundary key="pv-family-default">
      <PolicyViolationFamilyEntitiesTab />
    </PageBoundary>
  ),
});

function PolicyViolationFamilyEntitiesTab() {
  const { familyId } = useParams({ strict: false }) as { familyId: string };
  return (
    <ImpactedEntitiesTable
      familyId={parseInt(familyId)}
      kind="policyViolation"
    />
  );
}
