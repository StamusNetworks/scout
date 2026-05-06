import { ChevronRight, GalleryHorizontal } from 'lucide-react';
import { useCallback } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/common/design-system/atoms/ui/navigation-menu';
import { SidebarTrigger } from '@/common/design-system/atoms/ui/sidebar';
import { BreadcrumbsOutlet } from '@/common/design-system/molecules/breadcrumbs';
import { getShortcutDisplay } from '@/common/lib/platform';
import { useDisableHelp, useHelpState } from '@/features/help';
import { NewsFeedModal } from '@/features/marketing';
import { ShareButton } from '@/features/share';
import { ThemeSelector } from '@/features/theming';
import { useAppDispatch, useAppSelector } from '@/store/store';

import { useGlobalCommandModal } from '../../hooks/use-global-command-modal';
import {
  selectWithPageContainer,
  setWithPageContainer,
} from '../../state/ui-state.slice';
import { DatesPicker } from '../dates-picker/dates-picker';
import { HelpMenu } from '../help-menu/help-menu';
import { ReloadButton } from '../reload-button/reload-button';

export const Header = () => {
  const disableHelp = useDisableHelp();
  const { highlightGlobalCommands } = useHelpState();
  const globalCommandModal = useGlobalCommandModal();
  const handleOpenGlobalCommands = useCallback(() => {
    if (highlightGlobalCommands) {
      disableHelp('highlightGlobalCommands');
    }
    globalCommandModal.open();
  }, [globalCommandModal, disableHelp, highlightGlobalCommands]);
  return (
    <Row className="bg-primary-muted h-12 w-full shrink-0 items-center justify-between border-b px-2">
      <Row className="min-w-0 flex-1 items-center">
        <SidebarTrigger />
        <div className="bg-border mr-4 ml-2 h-4 w-px" />
        <BreadcrumbsOutlet />
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
              size="sm"
              className="flex items-center"
              onClick={handleOpenGlobalCommands}
              highlight={highlightGlobalCommands}
            >
              <ChevronRight />
              Commands
              <span className="text-muted-foreground ml-1 rounded-sm border px-1 text-sm">
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
          <NavigationMenuItem>
            <PageContainerSelector />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <ShareButton />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </Row>
  );
};

const PageContainerSelector = () => {
  const dispatch = useAppDispatch();
  const withPageContainer = useAppSelector(selectWithPageContainer);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => dispatch(setWithPageContainer(!withPageContainer))}
    >
      <GalleryHorizontal />
    </Button>
  );
};
