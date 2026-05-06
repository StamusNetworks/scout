import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from '@/common/design-system/atoms/page';
import {
  Tabs,
  TabsList,
  TabsTriggerLink,
} from '@/common/design-system/atoms/ui/pillTabs';
import { TogglePageContainer } from '@/features/app-shell';
import { IndicatorsDopv } from '@/features/operational-center';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/violations',
)({
  component: PolicyViolationsLayout,
});

function PolicyViolationsLayout() {
  const { pathname } = useLocation();
  return (
    <Page>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Policy Violations</PageTitle>
            <PageDescription>
              Gain a comprehensive, real-time overview of active and historical
              Declaration of Policy Violations® in your environment. Use
              filtering to investigate policy violations, assess impact, explore
              relationships, empowering confident security decision-making and
              rapid remediation.
            </PageDescription>
          </PageHeaderContent>
          <IndicatorsDopv />
        </PageHeader>
        <Tabs value={pathname}>
          <TabsList>
            <TabsTriggerLink value="/policy-violations/violations">
              Entities
            </TabsTriggerLink>
            <TabsTriggerLink value="/policy-violations/violations/graph">
              Graph
            </TabsTriggerLink>
          </TabsList>
        </Tabs>
        <div className="mt-2">
          <Outlet />
        </div>
      </TogglePageContainer>
    </Page>
  );
}
