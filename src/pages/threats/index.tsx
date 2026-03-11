import { Outlet, useLocation } from '@tanstack/react-router';

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
import { IndicatorsDoc } from '@/features/hunt/operational-center/components/indicators/docdopv.indicators';

export const ThreatsPage = () => {
  const { pathname } = useLocation();
  return (
    <Page>
      <OutletBreadcrumb>Threats</OutletBreadcrumb>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Threats</PageTitle>
            <PageDescription>
              Gain a comprehensive, real-time overview of active and historical
              Declarations of Compromise™ in your environment. Use filtering and
              visualization tools to investigate compromises, assess impact,
              explore relationships, empowering confident security
              decision-making and rapid incident response.
            </PageDescription>
          </PageHeaderContent>
          <IndicatorsDoc />
        </PageHeader>
        <Tabs value={pathname}>
          <TabsList>
            <TabsTriggerLink value="/threats/compromises/incidents">
              Incidents
            </TabsTriggerLink>
            <TabsTriggerLink value="/threats/compromises/entities">
              Entities
            </TabsTriggerLink>
            <TabsTriggerLink value="/threats/timeline">
              Timeline
            </TabsTriggerLink>
            <TabsTriggerLink value="/threats/compromises/graph">
              Graph
            </TabsTriggerLink>
            <TabsTriggerLink value="/threats/coverage">
              Coverage
            </TabsTriggerLink>
            <TabsTriggerLink value="/threats/compromises/attack-flow">
              Attack Flow
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
