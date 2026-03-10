import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { CoveragePage } from '@/features/hunt/threats/templates/coverage';

export const PolicyViolationsCoveragePage = () => (
  <Page>
    <OutletBreadcrumb>Coverage</OutletBreadcrumb>
    <TogglePageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Coverage</PageTitle>
          <PageDescription>
            Review the coverage of policy violation detection methods and
            families in your environment.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <CoveragePage familyClass="dopv" />
    </TogglePageContainer>
  </Page>
);
