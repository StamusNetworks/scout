import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Column } from '@/common/design-system/atoms/layout/column';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useThreatById } from '@/features/threats';
import { ImpactedEntitiesTable } from '@/features/threats';
import { KillChainCountersByThreatId } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/threat/$threatId/',
)({
  component: () => (
    <PageBoundary key="threat-by-id-index">
      <ThreatEntitiesTab />
    </PageBoundary>
  ),
});

function ThreatEntitiesTab() {
  const { threatId } = useParams({ strict: false }) as { threatId: string };
  const { tenant } = useGlobalQueryParams(['tenant']);
  const { data: threat } = useThreatById({ threatId, tenant });

  if (!threat) return null;

  return (
    <Column className="mt-6">
      {threat.kind === 'compromise' && (
        <div className="mb-6">
          <KillChainCountersByThreatId threatId={threatId} />
        </div>
      )}
      <ImpactedEntitiesTable
        threatId={threat.id}
        kind="compromise"
      />
    </Column>
  );
}
