import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { ThreatFamilyByIdPage } from '@/pages/threats/coverage/family';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId',
)({
  component: () => (
    <PageBoundary key="threat-family-by-id">
      <OutletBreadcrumb link="/threats/coverage">Coverage</OutletBreadcrumb>
      <ThreatFamilyByIdPage />
    </PageBoundary>
  ),
});
