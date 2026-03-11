import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  SidebarInset,
  SidebarProvider,
} from '@/common/design-system/atoms/ui/sidebar';
import { Header } from '@/common/design-system/layouts/components/header/header';
import { Modals } from '@/common/design-system/layouts/components/modals';
import { AppSidebar } from '@/common/design-system/layouts/components/navigation/app-sidebar';
import { defaultMenu } from '@/common/design-system/layouts/components/navigation/navigation.config';
import { BreadcrumbProvider } from '@/common/design-system/molecules/breadcrumbs';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { FiltersSideBar } from '@/features/hunt/filtering/query-filters/components/filters-side-bar';
import {
  selectIsSidebarOpen,
  setIsSidebarOpen,
  setOpenModal,
} from '@/features/ui/ui-state.slice';
import { useGetSystemSettingsQuery } from '@/features/user/settings/settings.api';
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

  useEffect(() => {
    const keyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          dispatch(setOpenModal('globalCommand'));
        }
        if (e.key === 'l') {
          e.preventDefault();
          dispatch(setOpenModal('addFilterCommand'));
        }
        if (e.key === 'o') {
          e.preventDefault();
          dispatch(setOpenModal('addEsFilter'));
        }
      }
      const activeElement = document.activeElement;
      const isTyping =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true' ||
        activeElement?.getAttribute('role') === 'textbox';

      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        dispatch(setOpenModal('globalCommand'));
      }
    };
    document.addEventListener('keydown', keyPress);
    return () => {
      document.removeEventListener('keydown', keyPress);
    };
  }, [dispatch]);

  const { data: systemSettings } = useGetSystemSettingsQuery();

  const menu = useMemo(() => {
    return defaultMenu(systemSettings!, enterprise);
  }, [systemSettings, enterprise]);

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
