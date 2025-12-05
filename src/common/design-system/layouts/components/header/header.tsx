import { ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useCallback } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/common/design-system/atoms/ui/navigation-menu';
import {
  BreadcrumbsOutlet,
  OutletBreadcrumb,
} from '@/common/design-system/molecules/breadcrumbs';
import { getShortcutDisplay } from '@/common/lib/platform';
import { NewsFeedModal } from '@/features/marketing/components/news-modal';
import { disableHelp, selectHelpState } from '@/features/ui/help/help.slice';
import { ThemeSelector } from '@/features/ui/theming/themeSelector';
import {
  selectIsNavigationOpen,
  setIsNavigationOpen,
  setOpenModal,
} from '@/features/ui/ui-state.slice';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { DatesPicker } from '../dates-picker';
import { HelpMenu } from '../help-menu';
import { ReloadButton } from '../reload-button';

export const Header = () => {
  const dispatch = useAppDispatch();
  const { highlightGlobalCommands } = useAppSelector(selectHelpState);
  const handleOpenGlobalCommands = useCallback(() => {
    if (highlightGlobalCommands) {
      dispatch(disableHelp('highlightGlobalCommands'));
    }
    dispatch(setOpenModal('globalCommand'));
  }, [dispatch, highlightGlobalCommands]);
  return (
    <Row className="bg-primary-muted h-12 w-full shrink-0 items-center justify-between border-b px-2">
      <Row className="items-center">
        <NavigationToggler />
        <div className="bg-border mr-4 ml-2 h-4 w-px" />
        <BreadcrumbsOutlet />
        <OutletBreadcrumb>Home</OutletBreadcrumb>
      </Row>
      <NavigationMenu className="z-20 px-0">
        <NavigationMenuList>
          <NavigationMenuItem>
            <ReloadButton />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <DatesPicker />
          </NavigationMenuItem>
          <NavigationMenuItem asChild>
            <Button
              variant="ghost"
              className="flex items-center"
              onClick={handleOpenGlobalCommands}
              highlight={highlightGlobalCommands}
            >
              <Row className="mr-2 items-center">
                <ChevronRight className="mr-1" />
                Commands
              </Row>
              <span className="text-muted-foreground rounded-sm border px-1 text-sm">
                {getShortcutDisplay('K')}
              </span>
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <HelpMenu />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NewsFeedModal />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <ThemeSelector />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Row>
  );
};

const NavigationToggler = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsNavigationOpen);
  return (
    <Button
      onClick={() => {
        dispatch(setIsNavigationOpen(!isOpen));
      }}
      variant="ghost"
      size="icon"
    >
      {isOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
    </Button>
  );
};
