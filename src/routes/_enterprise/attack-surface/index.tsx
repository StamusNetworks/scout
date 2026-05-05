import { createFileRoute, useSearch } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { NetworkTreeSunburst } from '@/features/host-insights';

export const Route = createFileRoute('/_enterprise/attack-surface/')({
  component: () => (
    <PageBoundary key="attack-surface-visualisation">
      <AttackSurfaceVisualisationPage />
    </PageBoundary>
  ),
});

function AttackSurfaceVisualisationPage() {
  const parentSearch = useSearch({ from: '/_enterprise/attack-surface' });
  return <NetworkTreeSunburst inHomeNetwork={parentSearch.in_home_net} />;
}
