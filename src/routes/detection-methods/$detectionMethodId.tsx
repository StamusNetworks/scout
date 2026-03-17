import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Page, PageContainer } from '@/common/design-system/atoms/page';
import { SignaturesTable } from '@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table';

export const Route = createFileRoute('/detection-methods/$detectionMethodId')({
  component: () => (
    <PageBoundary key="detection-method-by-id">
      <DetectionMethodDetailPage />
    </PageBoundary>
  ),
});

function DetectionMethodDetailPage() {
  return (
    <Page>
      <PageContainer>
        <SignaturesTable />
      </PageContainer>
    </Page>
  );
}
