import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageContainer,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { DetectionMethodsTable } from '@/features/detection-methods/use-cases/detection-methods-list/entities/detection-methods-table';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-hits'),
  with_alerts: z.boolean().default(true),
});

export const Route = createFileRoute('/detection-methods/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary>
      <DetectionMethodsPage />
    </PageBoundary>
  ),
});

function DetectionMethodsPage() {
  usePageTitle('Detection Methods');
  const search = Route.useSearch();
  const tanstackNavigate = Route.useNavigate();
  const navigate = (opts: {
    search: (prev: Record<string, unknown>) => Record<string, unknown>;
    replace?: boolean;
  }) => tanstackNavigate(opts as Parameters<typeof tanstackNavigate>[0]);

  return (
    <>
      <OutletBreadcrumb>Detection Methods</OutletBreadcrumb>
      <Page>
        <PageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Detection Methods</PageTitle>
              <PageDescription>
                Explore and investigate your detection logic in depth,
                understanding how network threats are identified, analyzed, and
                contextualized, to help you enhance detection capabilities and
                accelerate security investigations within your environment.
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>
          <DetectionMethodsTable
            search={search}
            navigate={navigate}
          />
        </PageContainer>
      </Page>
    </>
  );
}
