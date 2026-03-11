import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { CompromisesPage } from '@/pages/threats/compromises';

export const Route = createFileRoute('/_enterprise/threats/compromises')({
  component: () => (
    <PageBoundary key="threats-compromises">
      <CompromisesPage />
    </PageBoundary>
  ),
});
