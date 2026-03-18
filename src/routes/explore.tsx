import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';

export const Route = createFileRoute('/explore')({
  component: () => (
    <PageBoundary key="explore">
      <Page>
        <PageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Explore</PageTitle>
            </PageHeaderContent>
          </PageHeader>
          <Tabs>
            <TabsTrigger value="threats">Raw</TabsTrigger>
            <TabsList>
              <TabsContent value="threats"></TabsContent>
            </TabsList>
          </Tabs>
        </PageContainer>
      </Page>
    </PageBoundary>
  ),
});
