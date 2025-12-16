import { User } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import logo from '@/assets/stamus_s.png';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Badge, BadgeProps } from '@/common/design-system/atoms/ui/badge';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/common/design-system/atoms/ui/navigation-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/design-system/atoms/ui/select';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { cn } from '@/common/lib/utils';
import { getConfig } from '@/config';
import {
  selectIsNavigationOpen,
  setIsNavigationOpen,
} from '@/features/ui/ui-state.slice';
import { useGetCurrentUserQuery } from '@/features/user/auth/api/auth.api';
import { selectTenancy } from '@/features/user/tenancy/tenancy.selector';
import { setTenant, Tenant } from '@/features/user/tenancy/tenancy.slice';
import { routes } from '@/pages/routes.config';
import { useAppDispatch, useAppSelector } from '@/store/store';

export type MenuItem = {
  key: string;
  type: 'link' | 'external';
  url: string;
  title: string;
  icon: React.ReactNode;
  beta?: boolean;
  enterprise?: boolean;
};

export type Submenu = {
  label: string;
  enterprise?: boolean;
  children: MenuItem[];
};

export type MenuProps = {
  menu: Submenu[];
  className?: string;
};

export const Navigation = ({ menu, className }: MenuProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { multitenancy, tenant, tenantsList } = useAppSelector(selectTenancy);
  const isOpen = useAppSelector(selectIsNavigationOpen);
  const { pathname } = useLocation();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'd' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        dispatch(setIsNavigationOpen(!isOpen));
      }
    },
    [isOpen, dispatch],
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const { enterprise } = useFeatureFlags();

  return (
    <NavigationMenu
      className={cn(
        `bg-menu relative h-full flex-none shrink-0 flex-col justify-between overflow-hidden border-r transition-all duration-300 ease-in-out`,
        isOpen ? 'min-w-60' : 'w-0 p-0',
        className,
      )}
    >
      <div className="w-full px-1">
        <Link to={routes.home}>
          <Row className="my-3 items-center gap-1">
            <img
              src={logo}
              alt="logo"
              className="h-8 w-8"
            />
            <span className="text-lg font-black">/</span>
            <span className="text-lg font-light tracking-wide">Clear NDR</span>
          </Row>
        </Link>
        {multitenancy && (
          <div className="mb-5 w-full">
            <Select
              value={tenant?.toString()}
              onValueChange={(value: string) =>
                dispatch(setTenant(parseInt(value)))
              }
            >
              <SelectTrigger className="bg-background h-8 w-full max-w-52">
                <SelectValue placeholder="Select Tenant" />
              </SelectTrigger>
              <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                {tenantsList.map((tenant: Tenant) => (
                  <SelectItem
                    key={tenant.tenantId}
                    value={tenant.tenantId.toString()}
                  >
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex w-full flex-col items-start gap-4">
          {menu
            .filter((subMenu) => (enterprise ? true : !subMenu.enterprise))
            .map((subMenu: Submenu) => (
              <div
                key={`submenu-${subMenu.label}`}
                className="w-full"
              >
                <div className="text-muted-foreground mb-1 ml-1 text-xs font-bold">
                  {subMenu.label.toUpperCase()}
                </div>
                <NavigationMenuList className="mb-4 flex w-full flex-col space-y-1 space-x-0 last:mb-0">
                  {subMenu.children
                    .filter((item) => (enterprise ? true : !item.enterprise))
                    .map((item: MenuItem) => (
                      <NavigationMenuItem
                        key={`item-${item.key}`}
                        className={cn(
                          'hover:bg-primary/5 flex w-full cursor-pointer items-center gap-3 rounded-md p-2 py-1.5',
                          pathname.startsWith(item.url) &&
                            'bg-primary/10 text-primary hover:bg-primary/10',
                        )}
                        onClick={() =>
                          item.type === 'external'
                            ? window.open(item.url)
                            : navigate(item.url)
                        }
                      >
                        <span className="text-menu-foreground/50 text-sm">
                          {item.icon}
                        </span>
                        <span
                          className={cn(
                            'text-foreground/90) text-sm font-medium text-nowrap',
                          )}
                        >
                          {item.title}
                        </span>
                        <Row>
                          {item.beta && (
                            <Tag className="bg-lime-200 text-lime-900">
                              Beta
                            </Tag>
                          )}
                          {!enterprise && item.enterprise && (
                            <Tag variant="secondary">Enterprise</Tag>
                          )}
                        </Row>
                      </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
              </div>
            ))}
        </div>
      </div>
      <Footer />
    </NavigationMenu>
  );
};

const Tag = ({ children, className, ...props }: BadgeProps) => (
  <Badge
    className={cn('px-1 py-0 shadow-none', className)}
    {...props}
  >
    {children}
  </Badge>
);

const Footer = () => {
  const { data } = useGetCurrentUserQuery();

  return (
    <Row className="mb-2 w-full items-center gap-3 px-4">
      <div className="border-primary/50 flex size-9 items-center justify-center rounded-full border">
        <User className="size-5" />
      </div>
      <Column>
        <p>{data?.username}</p>
        <Row className="-mt-1 items-center gap-2">
          <Button
            variant="link"
            className="h-3 p-0 text-xs"
            onClick={() => window.open(getConfig()?.apiUrl + '/accounts/edit/')}
          >
            Settings
          </Button>
          <p className="text-foreground/50">{' | '}</p>
          <Button
            variant="link"
            className="h-3 p-0 text-xs"
            onClick={() =>
              (window.location.href = getConfig()?.apiUrl + '/accounts/logout/')
            }
          >
            Log Out
          </Button>
        </Row>
      </Column>
    </Row>
  );
};
