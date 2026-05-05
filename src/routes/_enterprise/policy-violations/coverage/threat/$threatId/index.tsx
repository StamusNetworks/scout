import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Column } from '@/common/design-system/atoms/layout/column';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useThreatById } from '@/features/threats';
import { ImpactedEntitiesTable } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/threat/$threatId/',
)({
  component: () => (
    <PageBoundary key="pv-by-id-index">
      <PolicyViolationEntitiesTab />
    </PageBoundary>
  ),
});

function PolicyViolationEntitiesTab() {
  const { threatId } = useParams({ strict: false }) as { threatId: string };
  const { tenant } = useGlobalQueryParams(['tenant']);
  const { data: threat } = useThreatById({ threatId, tenant });

  if (!threat) return null;

  return (
    <Column className="mt-6">
      <ImpactedEntitiesTable
        threatId={threat.id}
        kind="policyViolation"
      />
    </Column>
  );
}
