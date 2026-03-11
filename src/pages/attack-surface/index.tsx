import { Link, Outlet, useLocation } from '@tanstack/react-router';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { DiscoveredHosts } from '@/features/analytics/hosts/components/discovered-hosts/discovered-hosts';
import { HomeNetPicker } from '@/features/analytics/hosts/components/home-net-picker/home-net-picker';


export const AttackSurface = () => {
  usePageTitle('Attack Surface');
  const pathname = useLocation().pathname;
  return (
    <>
      <OutletBreadcrumb>Attack Surface</OutletBreadcrumb>
      <DefaultPage
        title="Attack Surface"
        description="Visualize and explore your network’s assets in real time. Gain context and discover insights to reduce risk, uncover hidden connections, and drive confident security decisions with seamless transitions between visual analytics and detailed inventory data."
        actions={<HomeNetPicker />}
      >
        <DiscoveredHosts />
        <Tabs value={pathname}>
          <TabsList>
            <TabsTrigger
              value="/attack-surface"
              asChild
            >
              <Link to="/attack-surface">Visualisation</Link>
            </TabsTrigger>
            <TabsTrigger
              value="/attack-surface/inventory"
              asChild
            >
              <Link to="/attack-surface/inventory">Inventory</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Outlet />
      </DefaultPage>
    </>
  );
};
