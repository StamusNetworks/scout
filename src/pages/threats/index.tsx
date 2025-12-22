import { Outlet, useLocation } from 'react-router-dom';

import {
  Page,
  PageContainer,
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
import { IndicatorsDoc } from '@/features/hunt/operational-center/components/indicators/docdopv.indicators';

import { routes } from '../routes.config';

export const ThreatsPage = () => {
  const { pathname } = useLocation();
  return (
    <Page>
      <OutletBreadcrumb>Threats</OutletBreadcrumb>
      <PageContainer>
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
            <TabsTriggerLink value={routes.threats}>Entities</TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_timeline}>
              Timeline
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_graph}>
              Graph
            </TabsTriggerLink>
            <TabsTriggerLink value={routes.threats_coverage}>
              Coverage
            </TabsTriggerLink>
          </TabsList>
        </Tabs>
        <div className="mt-2">
          <Outlet />
        </div>
      </PageContainer>
    </Page>
  );
};
