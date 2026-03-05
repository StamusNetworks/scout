import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { ThreatsTimeline } from '@/features/hunt/timeline/components/timeline/timeline';

export const ThreatsTimelinePage = () => (
  <Page>
    <OutletBreadcrumb>Timeline</OutletBreadcrumb>
    <TogglePageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Threats Timeline</PageTitle>
          <PageDescription>
            Visualize threats activity over time to identify patterns and trends
            in your environment.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <ThreatsTimeline />
    </TogglePageContainer>
  </Page>
);
