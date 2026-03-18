import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
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
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { usePageTitle } from '@/common/lib/use-page-title';
import { DiscoveredHosts } from '@/features/analytics/hosts/components/discovered-hosts/discovered-hosts';
import { HomeNetPicker } from '@/features/analytics/hosts/components/home-net-picker/home-net-picker';

const searchSchema = z.object({
  in_home_net: z.enum(['true', 'false', 'all']).default('all'),
});

export const Route = createFileRoute('/_enterprise/attack-surface')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="attack-surface">
      <AttackSurfaceLayout />
    </PageBoundary>
  ),
});

function AttackSurfaceLayout() {
  usePageTitle('Attack Surface');
  const search = Route.useSearch();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  return (
    <>
      <OutletBreadcrumb>Attack Surface</OutletBreadcrumb>
      <Page>
        <PageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Attack Surface</PageTitle>
              <PageDescription>
                Visualize and explore your network&apos;s assets in real time.
                Gain context and discover insights to reduce risk, uncover
                hidden connections, and drive confident security decisions with
                seamless transitions between visual analytics and detailed
                inventory data.
              </PageDescription>
            </PageHeaderContent>
            <HomeNetPicker
              value={search.in_home_net}
              onChange={(v) =>
                navigate({
                  search: (prev: Record<string, unknown>) => ({
                    ...prev,
                    in_home_net: v,
                  }),
                } as Parameters<typeof navigate>[0])
              }
            />
          </PageHeader>
          <DiscoveredHosts />
          <Tabs value={pathname}>
            <TabsList>
              <TabsTrigger
                value="/attack-surface"
                asChild
              >
                <Link
                  to="/attack-surface"
                  search={(prev: Record<string, unknown>) => prev}
                >
                  Visualisation
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value="/attack-surface/inventory"
                asChild
              >
                <Link
                  to="/attack-surface/inventory"
                  search={(prev: Record<string, unknown>) => prev}
                >
                  Inventory
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-4">
            <Outlet />
          </div>
        </PageContainer>
      </Page>
    </>
  );
}
