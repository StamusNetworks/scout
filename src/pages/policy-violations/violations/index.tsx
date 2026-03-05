import { Outlet, useLocation } from 'react-router-dom';

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
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { TogglePageContainer } from '@/common/design-system/molecules/toggle-container';
import { IndicatorsDopv } from '@/features/hunt/operational-center/components/indicators/docdopv.indicators';
import { routes } from '@/pages/routes.config';

export const ViolationsPage = () => {
  const { pathname } = useLocation();
  return (
    <Page>
      <OutletBreadcrumb>Policy Violations</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Policy Violations</PageTitle>
            <PageDescription>
              Gain a comprehensive, real-time overview of active and historical
              Declaration of Policy Violations™ in your environment. Use
              filtering to investigate policy violations, assess impact, explore
              relationships, empowering confident security decision-making and
              rapid remediation.
            </PageDescription>
          </PageHeaderContent>
          <IndicatorsDopv />
        </PageHeader>
        <Tabs value={pathname}>
          <TabsList>
            <TabsTriggerLink value={routes.policy_violations_violations}>
              Entities
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.policy_violations_violations_graph}>
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
};
