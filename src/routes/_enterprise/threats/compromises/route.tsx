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
} from '@/common/design-system/atoms/ui/pill-tabs';
import { TogglePageContainer } from '@/features/app-shell';
import { IndicatorsDoc } from '@/features/operational-center';

export const Route = createFileRoute('/_enterprise/threats/compromises')({
  component: CompromisesLayout,
});

function CompromisesLayout() {
  const { pathname } = useLocation();
  return (
    <Page>
      <TogglePageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Threats</PageTitle>
            <PageDescription>
              Gain a comprehensive, real-time overview of active and historical
              Declarations of Compromise® in your environment. Use filtering and
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
            <TabsTriggerLink value="/threats/compromises/graph">
              Graph
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
}
