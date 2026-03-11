import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { VolumetryPage } from '@/pages/volumetry';

export const Route = createFileRoute('/_enterprise/volumetry')({
  component: () => (
    <PageBoundary key="volumetry">
      <VolumetryPage />
    </PageBoundary>
  ),
});
