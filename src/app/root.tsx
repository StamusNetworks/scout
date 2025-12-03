import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { FiltersSideBar } from '@/features/hunt/filtering/query-filters/components/filters-side-bar';
import {
  selectIsSidebarOpen,
  setIsSidebarOpen,
  setOpenModal,
} from '@/features/ui/ui-state.slice';
import { useGetSystemSettingsQuery } from '@/features/user/settings/settings.api';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { Header } from '../common/design-system/layouts/components/header/header';
import { Modals } from '../common/design-system/layouts/components/modals';
import { Navigation } from '../common/design-system/layouts/components/navigation';
import { defaultMenu } from '../common/design-system/layouts/components/navigation/navigation.config';
import { routes } from '../pages/routes.config';

export const Root = () => {
  const dispatch = useAppDispatch();

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
      }

      // Only trigger '/' shortcut if not typing in an input field. document.activeElement is used to check the currently focused element.
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
    return defaultMenu(routes, systemSettings!);
  }, [systemSettings]);

  return (
    <div className="relative flex h-screen w-screen max-w-screen">
      <Modals />
      <Navigation menu={menu} />
      <div className="relative flex h-screen w-full flex-col overflow-hidden">
        <Header />
        <Row className="h-full gap-0 overflow-clip">
          <div
            id="expandable-portal-wrapper"
            className="empty:hidden"
          />
          <div className="relative grow">
            <Button
              className={`absolute top-[6px] right-0 z-50 -translate-x-2`}
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
    </div>
  );
};
