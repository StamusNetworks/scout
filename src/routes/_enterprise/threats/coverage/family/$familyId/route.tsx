import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { ThreatFamilyById } from '@/features/threats/common/templates/family-by-id/family-by-id';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId',
)({
  component: () => (
    <PageBoundary key="threat-family-by-id">
      <OutletBreadcrumb link="/threats/coverage">Coverage</OutletBreadcrumb>
      <ThreatFamilyById />
    </PageBoundary>
  ),
});
