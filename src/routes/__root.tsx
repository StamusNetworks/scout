import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useMemo } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  SidebarInset,
  SidebarProvider,
} from '@/common/design-system/atoms/ui/sidebar';
import { AppSidebar } from '@/common/design-system/layouts/components/navigation/app-sidebar';
import { defaultMenu } from '@/common/design-system/layouts/components/navigation/navigation.config';
import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import {
  Header,
  Modals,
  useGlobalKeyboardShortcuts,
} from '@/features/app-shell';
import {
  selectIsSidebarOpen,
  setIsSidebarOpen,
} from '@/features/app-shell/state/ui-state.slice';
import { FiltersSideBar } from '@/features/query-filters/components/filters-sidebar/filters-sidebar';
import { useSystemSettings } from '@/features/settings';
import type { AppStore } from '@/store/store';
import { useAppDispatch, useAppSelector } from '@/store/store';

export interface RouterContext {
  store: AppStore;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const dispatch = useAppDispatch();
  const { enterprise } = useFeatureFlags();
  const isFiltersOpen = useAppSelector(selectIsSidebarOpen);
  useGlobalKeyboardShortcuts();

  const { data: systemSettings } = useSystemSettings();

  const menu = useMemo(
    () => defaultMenu(systemSettings!, enterprise),
    [systemSettings, enterprise],
  );

  return (
    <>
      <BreadcrumbProvider>
        <SidebarProvider>
          <Modals />
          <AppSidebar menu={menu} />
          <SidebarInset className="border">
            <div className="relative flex h-full flex-col overflow-hidden">
              <Header />
              <Row className="h-full gap-0 overflow-clip">
                <div
                  id="expandable-portal-wrapper"
                  className="empty:hidden"
                />
                <div className="relative grow">
                  <Button
                    className="absolute top-[6px] right-0 z-50 -translate-x-2"
                    onClick={() => dispatch(setIsSidebarOpen(!isFiltersOpen))}
                    variant="ghost"
                    size="icon"
                  >
                    {isFiltersOpen ? <PanelRightClose /> : <PanelRightOpen />}
                  </Button>
                  <Outlet />
                </div>
                <FiltersSideBar />
              </Row>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </BreadcrumbProvider>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
