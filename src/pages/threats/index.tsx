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
import { IndicatorsDoc } from '@/features/hunt/operational-center/components/indicators/docdopv.indicators';

import { routes } from '../routes.config';

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
            <TabsTriggerLink value={routes.threats_compromises_incidents}>
              Incidents
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_compromises_entities}>
              Entities
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_timeline}>
              Timeline
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_compromises_graph}>
              Graph
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_coverage}>
              Coverage
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_compromises_attack_flow}>
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
